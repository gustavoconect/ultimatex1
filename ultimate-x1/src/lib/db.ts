import { supabaseAdmin } from "./supabase";
import { BlacklistEntry, MatchRecord, Player } from "@/types";

// ============ PLAYERS ============

export async function getPlayers(): Promise<Record<string, Player>> {
    const { data, error } = await supabaseAdmin
        .from("players")
        .select("*");

    if (error) {
        console.error("Supabase Read Error (Players):", error);
        return {};
    }

    const players: Record<string, Player> = {};
    for (const row of data || []) {
        players[row.name] = {
            name: row.name,
            elo: row.elo,
            pdl: row.pdl,
            wins: row.wins || 0,
            losses: row.losses || 0,
            history: row.history || []
        };
    }
    return players;
}

export async function upsertPlayer(player: Partial<Player> & { name: string }): Promise<void> {
    const { error } = await supabaseAdmin
        .from("players")
        .upsert({
            name: player.name,
            elo: player.elo,
            pdl: player.pdl,
            wins: player.wins || 0,
            losses: player.losses || 0,
            history: player.history || []
        });

    if (error) {
        console.error("Supabase Write Error (Players):", error);
    }
}

export async function deletePlayer(name: string): Promise<void> {
    const { error } = await supabaseAdmin
        .from("players")
        .delete()
        .eq("name", name);

    if (error) {
        console.error("Supabase Delete Error (Players):", error);
    }
}

export async function updatePlayerHistory(name: string, champion: string): Promise<void> {
    const players = await getPlayers();
    if (players[name]) {
        const history = [...players[name].history, champion];
        await supabaseAdmin
            .from("players")
            .update({ history })
            .eq("name", name);
    }
}

// ============ MATCH HISTORY ============

export async function getMatchHistory(): Promise<MatchRecord[]> {
    const { data, error } = await supabaseAdmin
        .from("match_history")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error("Supabase Read Error (History):", error);
        return [];
    }

    return (data || []).map(row => row.data as MatchRecord).filter(Boolean);
}

export async function saveMatchHistory(history: MatchRecord[]): Promise<void> {
    const rows = history.map(match => ({
        id: match.id,
        data: match
    }));

    const { error } = await supabaseAdmin
        .from("match_history")
        .upsert(rows);

    if (error) {
        console.error("Supabase Write Error (History):", error);
    }
}

// ============ BLACKLIST ============

export async function getBlacklist(): Promise<BlacklistEntry[]> {
    const { data, error } = await supabaseAdmin
        .from("blacklist")
        .select("*");

    if (error) {
        console.error("Supabase Read Error (Blacklist):", error);
        return [];
    }

    return data || [];
}

export async function saveBlacklist(blacklist: BlacklistEntry[]): Promise<void> {
    // Clear existing
    await supabaseAdmin.from("blacklist").delete().neq("name", "");

    if (blacklist.length > 0) {
        const { error } = await supabaseAdmin
            .from("blacklist")
            .upsert(blacklist);

        if (error) {
            console.error("Supabase Write Error (Blacklist):", error);
        }
    }
}

// ============ CLEAR ALL ============

export async function clearAllData(): Promise<void> {
    // Clear match history
    await supabaseAdmin.from("match_history").delete().gt("id", -1);

    // Clear blacklist
    await supabaseAdmin.from("blacklist").delete().neq("name", "");

    // Reset player histories
    const players = await getPlayers();
    for (const name of Object.keys(players)) {
        await supabaseAdmin
            .from("players")
            .update({ history: [] })
            .eq("name", name);
    }
}
