import { ELO_HIERARCHY, LANES, LANE_CHAMPIONS, Lane } from "./constants";
import { getChampionImageUrl, getLatestVersion, getChampionsData } from "./datadragon";
import { getBlacklist, saveBlacklist, getMatchHistory, saveMatchHistory, updatePlayerHistory, upsertPlayer } from "./db";
import {
    GameState, PlayerKey, TournamentPhase, SeriesFormat,
    Champion, BlacklistEntry, PickEntry, MatchRecord
} from "@/types";

function createInitialState(): GameState {
    return {
        setup_complete: false,
        player_a: "",
        player_b: "",
        elo_a: "Ferro IV",
        elo_b: "Ferro IV",
        pdl_a: 0,
        pdl_b: 0,
        tournament_phase: "Groups",
        series_format: "MD2",
        series_score: { A: 0, B: 0 },
        start_player: null,
        lower_elo_player: null,
        current_action_player: null,
        announce_turn_player: null,
        banned_lanes: [],
        selected_lane: null,
        drawn_champions: [],
        choice_made: false,
        pick_order_chooser: null,
        side_chooser: null,
        first_picker: null,
        picks: {},
        side_choice_complete: false,
        game1_sides: {},
        announced_champions: { A: [], B: [] },
        knockout_bans: [],
        global_blacklist: [],
        match_history: [],
        version: "15.24.1"
    };
}

class GameManager {
    state: GameState;
    championsData: Record<string, { name: string; id: string }> = {};

    constructor() {
        this.state = createInitialState();
    }

    async initialize(): Promise<void> {
        this.state.version = await getLatestVersion();
        this.championsData = await getChampionsData(this.state.version);
        this.state.global_blacklist = await getBlacklist();
        this.state.match_history = await getMatchHistory();
    }

    async setupGame(
        p1: string, e1: string, pdl1: number,
        p2: string, e2: string, pdl2: number,
        phase: TournamentPhase = "Groups",
        series: SeriesFormat = "MD2",
        announceFirst?: string
    ): Promise<void> {
        this.state.player_a = p1;
        this.state.elo_a = e1;
        this.state.pdl_a = pdl1;
        this.state.player_b = p2;
        this.state.elo_b = e2;
        this.state.pdl_b = pdl2;
        this.state.tournament_phase = phase;
        this.state.series_format = series;

        // Knockout announce start
        if (phase === "Knockout" && announceFirst) {
            this.state.announce_turn_player = announceFirst === p1 ? "A" : "B";
        }

        // Calculate starter (Higher Elo starts banning)
        const valA = ELO_HIERARCHY[e1] || 0;
        const valB = ELO_HIERARCHY[e2] || 0;

        let starter: PlayerKey;
        let lower: PlayerKey;

        if (valA > valB) {
            starter = "A";
            lower = "B";
        } else if (valB > valA) {
            starter = "B";
            lower = "A";
        } else {
            // Tie: use PDL
            if (pdl1 > pdl2) {
                starter = "A";
                lower = "B";
            } else if (pdl2 > pdl1) {
                starter = "B";
                lower = "A";
            } else {
                // Random
                starter = Math.random() > 0.5 ? "A" : "B";
                lower = starter === "A" ? "B" : "A";
            }
        }

        this.state.start_player = starter;
        this.state.lower_elo_player = lower;
        this.state.current_action_player = starter;
        this.state.setup_complete = true;

        // Register players
        await upsertPlayer({ name: p1, elo: e1, pdl: pdl1 });
        await upsertPlayer({ name: p2, elo: e2, pdl: pdl2 });
    }

    banLane(lane: Lane): void {
        if (!this.state.banned_lanes.includes(lane)) {
            this.state.banned_lanes.push(lane);
            this.state.current_action_player =
                this.state.current_action_player === "A" ? "B" : "A";

            if (this.state.banned_lanes.length === 4) {
                const remaining = LANES.find(l => !this.state.banned_lanes.includes(l));
                this.state.selected_lane = remaining || null;
            }
        }
    }

    async drawChampions(): Promise<void> {
        if (this.state.tournament_phase === "Knockout") return;

        const lane = this.state.selected_lane;
        if (!lane) return;

        const candidates = LANE_CHAMPIONS[lane] || [];
        const blacklistNames = this.state.global_blacklist.map(x => x.name);
        let available = candidates.filter(c => !blacklistNames.includes(c));

        // Pool refill logic
        if (available.length < 4) {
            const p1 = this.state.player_a;
            const p2 = this.state.player_b;
            const p1History = new Set<string>();
            const p2History = new Set<string>();

            for (const m of this.state.match_history) {
                if (m.phase === "Groups") {
                    const involvedP1 = m.player_a === p1 || m.player_b === p1;
                    const involvedP2 = m.player_a === p2 || m.player_b === p2;

                    for (const key of ["game_1", "game_2"] as const) {
                        const game = m[key] as PickEntry | undefined;
                        if (game && "champion" in game) {
                            if (involvedP1) p1History.add(game.champion);
                            if (involvedP2) p2History.add(game.champion);
                        }
                    }
                }
            }

            const relevantBans = new Set([...p1History, ...p2History]);
            available = candidates.filter(c => !relevantBans.has(c));

            if (available.length < 4) {
                available = candidates;
            }
        }

        const drawnNames = available.length >= 4
            ? this.shuffleArray(available).slice(0, 4)
            : available;

        this.state.drawn_champions = drawnNames.map(name => ({
            name,
            image: getChampionImageUrl(name, this.state.version, this.championsData)
        }));
    }

    async pickChampion(game: string, champion: string, image: string, playerName: string): Promise<void> {
        this.state.picks[game] = { champion, player: playerName, image };

        // Add to blacklist (Groups only)
        if (this.state.tournament_phase === "Groups") {
            const exists = this.state.global_blacklist.some(x => x.name === champion);
            if (!exists) {
                this.state.global_blacklist.push({
                    name: champion,
                    image,
                    phase: "Groups",
                    player: playerName
                });
                await saveBlacklist(this.state.global_blacklist);
            }
        }

        // Update history for both players
        await updatePlayerHistory(this.state.player_a, champion);
        await updatePlayerHistory(this.state.player_b, champion);
    }

    makeRule6Choice(choice: "pick_order" | "side"): void {
        const lower = this.state.lower_elo_player!;
        const higher: PlayerKey = lower === "A" ? "B" : "A";

        if (choice === "pick_order") {
            this.state.pick_order_chooser = lower;
            this.state.side_chooser = higher;
        } else {
            this.state.pick_order_chooser = higher;
            this.state.side_chooser = lower;
        }

        this.state.choice_made = true;
    }

    setPickOrder(firstPicker: PlayerKey): void {
        this.state.first_picker = firstPicker;
    }

    setMapSide(side: "Blue" | "Red"): void {
        const chooser = this.state.side_chooser!;
        const other: PlayerKey = chooser === "A" ? "B" : "A";
        const opposite: "Blue" | "Red" = side === "Blue" ? "Red" : "Blue";

        this.state.game1_sides = { [chooser]: side, [other]: opposite };
        this.state.side_choice_complete = true;
    }

    async resetDuel(): Promise<void> {
        const savedBl = this.state.global_blacklist;
        const savedHist = this.state.match_history;
        const version = this.state.version;

        this.state = createInitialState();
        this.state.global_blacklist = savedBl;
        this.state.match_history = savedHist;
        this.state.version = version;
    }

    async archiveCurrentMatch(): Promise<void> {
        if (this.state.picks["Game 1"] && this.state.picks["Game 2"]) {
            const currentIds = this.state.match_history.map(m => m.id || 0);
            const nextId = Math.max(0, ...currentIds) + 1;

            const record: MatchRecord = {
                id: nextId,
                player_a: this.state.player_a,
                player_b: this.state.player_b,
                lane: this.state.selected_lane || undefined,
                phase: this.state.tournament_phase,
                game_1: this.state.picks["Game 1"],
                game_2: this.state.picks["Game 2"]
            };

            this.state.match_history.push(record);
            await saveMatchHistory(this.state.match_history);
        }
    }

    // ========== KNOCKOUT METHODS ==========

    getKnockoutHistory(playerName: string): Set<string> {
        const used = new Set<string>();
        for (const m of this.state.match_history) {
            if (m.phase === "Knockout") {
                if (m.player_a === playerName || m.player_b === playerName) {
                    for (const key of Object.keys(m)) {
                        if (key.startsWith("game_")) {
                            const game = m[key] as PickEntry | undefined;
                            if (game?.champion) {
                                used.add(game.champion);
                            }
                        }
                    }
                }
            }
        }
        return used;
    }

    announceChampion(champion: string, image: string): { error?: string } {
        const playerKey = this.state.announce_turn_player!;
        const playerName = playerKey === "A" ? this.state.player_a : this.state.player_b;

        // Check already announced
        const allAnnounced = [
            ...this.state.announced_champions.A.map(c => c.name),
            ...this.state.announced_champions.B.map(c => c.name)
        ];
        if (allAnnounced.includes(champion)) {
            return { error: "Campeão já anunciado nesta série!" };
        }

        // Check knockout history
        const played = this.getKnockoutHistory(playerName);
        if (played.has(champion)) {
            return { error: `${champion} já foi utilizado no Mata-Mata!` };
        }

        this.state.announced_champions[playerKey].push({ name: champion, image });
        this.state.announce_turn_player = playerKey === "A" ? "B" : "A";

        return {};
    }

    banAnnouncedChampion(champion: string): void {
        if (!this.state.knockout_bans.includes(champion)) {
            this.state.knockout_bans.push(champion);
        }
    }

    async archiveKnockoutSeries(): Promise<void> {
        const currentIds = this.state.match_history.map(m => m.id || 0);
        const nextId = Math.max(0, ...currentIds) + 1;

        const record: MatchRecord = {
            id: nextId,
            player_a: this.state.player_a,
            player_b: this.state.player_b,
            phase: "Knockout",
            format: this.state.series_format,
            score: this.state.series_score
        };

        // Add games
        for (const [game, pick] of Object.entries(this.state.picks)) {
            const key = game.toLowerCase().replace(" ", "_");
            (record as Record<string, unknown>)[key] = pick;
        }

        this.state.match_history.push(record);
        await saveMatchHistory(this.state.match_history);
    }

    getDeciderChampion(): string | null {
        const allChamps = new Set<string>();
        for (const lane of LANES) {
            for (const c of LANE_CHAMPIONS[lane]) {
                allChamps.add(c);
            }
        }

        const used = new Set<string>();
        for (const m of this.state.match_history) {
            if (m.phase === "Knockout") {
                for (const [k, v] of Object.entries(m)) {
                    if (k.startsWith("game_") && typeof v === "object" && v && "champion" in v) {
                        used.add((v as PickEntry).champion);
                    }
                }
            }
        }

        const current = new Set([
            ...this.state.announced_champions.A.map(c => c.name),
            ...this.state.announced_champions.B.map(c => c.name)
        ]);

        const available = [...allChamps].filter(c => !used.has(c) && !current.has(c));
        if (available.length === 0) return null;

        return available[Math.floor(Math.random() * available.length)];
    }

    private shuffleArray<T>(array: T[]): T[] {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
}

// Singleton instance
export const gameManager = new GameManager();
