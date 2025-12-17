import React, { useState, useEffect } from 'react';
import api from '../api';
import ChampionCard from './ChampionCard';
import DraftReveal from './DraftReveal';
import { playChampionVoice, playLockSound } from '../SoundManager';

const ChoicePhase = ({ state, onStateUpdate }) => {
    const {
        drawn_champions,
        lower_elo_player,
        player_a,
        player_b,
        choice_made,
        pick_order_chooser,
        side_chooser,
        first_picker,
        picks,
        side_choice_complete,
        game1_sides
    } = state;

    const [showReveal, setShowReveal] = useState(false);

    // Trigger Reveal when side choice is complete (Draft Done)
    useEffect(() => {
        if (side_choice_complete && !showReveal) {
            setShowReveal(true);
        }
    }, [side_choice_complete]);

    const version = state.version || "13.24.1";
    const lowerName = lower_elo_player === "A" ? player_a : player_b;
    const higherName = lower_elo_player === "A" ? player_b : player_a;
    const pickOrderChooserName = pick_order_chooser === "A" ? player_a : player_b;
    const sideChooserName = side_chooser === "A" ? player_a : player_b;
    const firstPickerName = first_picker === "A" ? player_a : player_b;
    const secondPickerName = first_picker === "A" ? player_b : player_a;

    const hasPick1 = picks && picks["Game 1"];
    const hasPick2 = picks && picks["Game 2"];
    const picksComplete = hasPick1 && hasPick2;

    // Phase 1: Lower Elo chooses A or B
    const handleRule6Choice = async (choice) => {
        playLockSound(); // Major transition
        const res = await api.post(`/rule6-choice?choice=${choice}`);
        onStateUpdate(res.data);
    };

    // Phase 2: Pick order chooser decides who picks first
    const handleSetPickOrder = async (firstPicker) => {
        playLockSound(); // Major transition
        const res = await api.post(`/set-pick-order?first_picker=${firstPicker}`);
        onStateUpdate(res.data);
    };

    // Phase 3: Pick champions (Game 1 = first pick, Game 2 = second pick)
    const handlePick = async (game, champName, champImage) => {
        playChampionVoice(champName); // Play champion voice!
        // Use provided image or fallback if missing (legacy support)
        const imgUrl = champImage || `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champName}.png`;
        const playerName = game === "Game 1" ? firstPickerName : secondPickerName;
        const res = await api.post('/pick', { game, champion: champName, image: imgUrl, player: playerName });
        onStateUpdate(res.data);
    };

    // Phase 4: Side chooser picks their side
    const handleSetSide = async (side) => {
        playLockSound();
        const res = await api.post(`/set-map-side?side=${side}`);
        onStateUpdate(res.data);
    };

    // ========== RENDER PHASES ==========

    // Helper to normalize champion object (handle transition from string to object)
    const getChampData = (c) => {
        if (typeof c === 'string') return { name: c, image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c}.png` };
        return c; // { name, image }
    };

    // Phase 1: Choice not made yet
    if (!choice_made) {
        return (
            <div className="p-8 animate-fade-in flex flex-col items-center gap-8">
                <h2 className="text-3xl font-bold font-display tracking-wide">Campeões Sorteados</h2>

                <div className="flex gap-6">
                    {drawn_champions.map(c => {
                        const champ = getChampData(c);
                        return (
                            <div key={champ.name} className="w-40">
                                <ChampionCard
                                    name={champ.name}
                                    image={champ.image}
                                    isSelected={false}
                                    isBanned={false}
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="hex-panel p-8 rounded-2xl text-center max-w-lg">
                    <p className="text-gray-400 mb-2 uppercase tracking-widest text-xs">Decisão de</p>
                    <h3 className="text-2xl font-bold text-hex-gold-300 mb-6 font-display">{lowerName}</h3>
                    <p className="text-gray-300 mb-6">Escolha uma opção:</p>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => handleRule6Choice('pick_order')}
                            className="bg-hex-blue-500 hover:bg-hex-blue-300 text-black py-4 px-6 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg border border-hex-blue-300/50"
                        >
                            (A) Definir Ordem de Pick
                        </button>
                        <button
                            onClick={() => handleRule6Choice('side')}
                            className="bg-hex-magic hover:bg-pink-400 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg border border-hex-magic/50"
                        >
                            (B) Escolher Lado do Mapa
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Phase 2: Pick order not set yet
    if (!first_picker) {
        return (
            <div className="p-8 animate-fade-in flex flex-col items-center gap-8">
                <h2 className="text-3xl font-bold font-display tracking-wide">Campeões Sorteados</h2>

                <div className="flex gap-6">
                    {drawn_champions.map(c => {
                        const champ = getChampData(c);
                        return (
                            <div key={champ.name} className="w-40">
                                <ChampionCard
                                    name={champ.name}
                                    image={champ.image}
                                    isSelected={false}
                                    isBanned={false}
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="hex-panel p-8 rounded-2xl text-center max-w-lg">
                    <p className="text-gray-400 mb-2 uppercase tracking-widest text-xs">Decisão de</p>
                    <h3 className="text-2xl font-bold text-hex-gold-300 mb-6 font-display">{pickOrderChooserName}</h3>
                    <p className="text-gray-300 mb-6">Quem faz o primeiro pick?</p>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => handleSetPickOrder('A')}
                            className="bg-blue-600 hover:bg-blue-500 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all hover:scale-105 border border-blue-400/50"
                        >
                            {player_a}
                        </button>
                        <button
                            onClick={() => handleSetPickOrder('B')}
                            className="bg-red-600 hover:bg-red-500 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all hover:scale-105 border border-red-400/50"
                        >
                            {player_b}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Phase 3: Picks in progress
    if (!picksComplete) {
        const currentGame = !hasPick1 ? "Game 1" : "Game 2";
        const currentPicker = currentGame === "Game 1" ? firstPickerName : secondPickerName;
        const pickerColor = currentGame === "Game 1" ? "text-blue-400" : "text-red-400";

        return (
            <div className="p-8 animate-fade-in flex flex-col items-center gap-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-2 font-display uppercase tracking-widest text-hex-gold-100">Escolha de Campeões</h2>
                    <p className="text-gray-400 uppercase tracking-wider text-sm">
                        Pick de <span className={`font-bold ${pickerColor} text-lg ml-2`}>{currentPicker}</span> <span className="text-xs text-white/30 ml-2">({currentGame})</span>
                    </p>
                </div>

                <div className="flex gap-8 flex-wrap justify-center">
                    {drawn_champions.map(c => {
                        const champ = getChampData(c);
                        const isPicked = (hasPick1 && picks["Game 1"].champion === champ.name) ||
                            (hasPick2 && picks["Game 2"].champion === champ.name);

                        return (
                            <div key={champ.name} className="w-48 flex flex-col items-center gap-4 bg-hex-dark-500/50 p-4 rounded-2xl border border-white/5 hover:border-hex-gold-500/30 transition-all">
                                <ChampionCard
                                    name={champ.name}
                                    image={champ.image}
                                    isSelected={isPicked}
                                    isBanned={false}
                                />
                                {!isPicked && (
                                    <button
                                        onClick={() => handlePick(currentGame, champ.name, champ.image)}
                                        className={`w-full ${currentGame === "Game 1" ? "bg-hex-blue-500 hover:bg-hex-blue-300" : "bg-red-600 hover:bg-red-500"} text-black py-2 px-4 rounded-lg font-bold transition-all hover:scale-105 uppercase tracking-widest text-sm shadow-lg`}
                                    >
                                        Selecionar
                                    </button>
                                )}
                                {isPicked && (
                                    <div className={`py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-widest w-full text-center ${picks["Game 1"]?.champion === champ.name ? "bg-hex-blue-900/50 text-hex-blue-300 border border-hex-blue-500/30" : "bg-red-900/50 text-red-300 border border-red-500/30"}`}>
                                        {picks["Game 1"]?.champion === champ.name ? "Jogo 1" : "Jogo 2"}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Phase 4: Picks complete, side choice pending
    if (!side_choice_complete) {
        return (
            <div className="p-8 animate-fade-in flex flex-col items-center gap-8">
                <h2 className="text-3xl font-bold font-display uppercase tracking-widest">Picks Finalizados!</h2>

                <div className="flex gap-8">
                    <div className="bg-hex-blue-900/20 border border-hex-blue-500/30 p-8 rounded-xl text-center min-w-[200px]">
                        <div className="text-xs font-bold text-hex-blue-300 mb-4 uppercase tracking-widest">JOGO 1 - IDA</div>
                        <div className="relative inline-block">
                            <img src={picks["Game 1"].image} className="w-32 h-32 rounded-full border-4 border-hex-blue-500 shadow-[0_0_20px_rgba(3,151,171,0.4)] mb-4" />
                            <div className="absolute -bottom-3 inset-x-0 bg-hex-dark-500 border border-hex-blue-500 px-2 py-1 text-xs font-bold rounded-full text-hex-blue-300 w-max mx-auto">
                                {firstPickerName}
                            </div>
                        </div>
                        <div className="font-bold text-xl font-display mt-2">{picks["Game 1"].champion}</div>
                    </div>

                    <div className="flex items-center text-4xl text-hex-gold-500 font-display italic">VS</div>

                    <div className="bg-red-900/20 border border-red-500/30 p-8 rounded-xl text-center min-w-[200px]">
                        <div className="text-xs font-bold text-red-400 mb-4 uppercase tracking-widest">JOGO 2 - VOLTA</div>
                        <div className="relative inline-block">
                            <img src={picks["Game 2"].image} className="w-32 h-32 rounded-full border-4 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] mb-4" />
                            <div className="absolute -bottom-3 inset-x-0 bg-hex-dark-500 border border-red-500 px-2 py-1 text-xs font-bold rounded-full text-red-400 w-max mx-auto">
                                {secondPickerName}
                            </div>
                        </div>
                        <div className="font-bold text-xl font-display mt-2">{picks["Game 2"].champion}</div>
                    </div>
                </div>

                <div className="hex-panel p-8 rounded-2xl text-center max-w-lg mt-8">
                    <p className="text-gray-400 mb-2 uppercase tracking-widest text-xs">Decisão de</p>
                    <h3 className="text-2xl font-bold text-hex-gold-300 mb-6 font-display">{sideChooserName}</h3>
                    <p className="text-gray-300 mb-6">Escolha seu lado no Jogo 1:</p>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => handleSetSide('Blue')}
                            className="bg-blue-600 hover:bg-blue-500 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all hover:scale-105 border border-blue-400/50 shadow-lg"
                        >
                            🔵 Blue Side
                        </button>
                        <button
                            onClick={() => handleSetSide('Red')}
                            className="bg-red-600 hover:bg-red-500 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all hover:scale-105 border border-red-400/50 shadow-lg"
                        >
                            🔴 Red Side
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Phase 5: All done - show summary
    const playerASide = game1_sides["A"];
    const playerBSide = game1_sides["B"];

    return (
        <>
            {showReveal && picks && (
                <DraftReveal
                    playerA={firstPickerName}
                    playerB={secondPickerName}
                    champA={picks["Game 1"]}
                    champB={picks["Game 2"]}
                    onDismiss={() => setShowReveal(false)}
                />
            )}

            <div className="p-8 animate-fade-in flex flex-col items-center gap-8">
                <div className="flex justify-between items-center w-full max-w-4xl">
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-hex-gold-100 to-hex-gold-500 font-display uppercase tracking-widest drop-shadow-sm">🎮 Duelo Configurado!</h2>
                    <button
                        onClick={async () => {
                            if (!confirm("Finalizar duelo e salvar no histórico?")) return;
                            await api.post('/reset-duel');
                            window.location.reload();
                        }}
                        className="bg-red-500/10 text-red-400 px-6 py-2 rounded-xl hover:bg-red-500/30 border border-red-500/50 font-bold transition-all uppercase tracking-widest text-xs hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                    >
                        Finalizar Duelo
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
                    {/* Game 1 */}
                    <div className="bg-gradient-to-br from-hex-blue-900/20 to-transparent border border-hex-blue-500/30 p-6 rounded-2xl relative overflow-hidden group hover:border-hex-blue-500/60 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-display text-6xl font-black text-white pointer-events-none group-hover:opacity-20 transition-opacity">01</div>
                        <h3 className="text-xl font-bold text-hex-blue-300 mb-6 text-center uppercase tracking-widest border-b border-hex-blue-500/20 pb-4">JOGO 1 (IDA)</h3>
                        <div className="flex justify-center mb-6">
                            <img src={picks["Game 1"].image} className="w-40 h-40 rounded-full border-4 border-hex-blue-500 shadow-[0_0_30px_rgba(3,151,171,0.3)] animate-float" />
                        </div>
                        <div className="text-center font-bold text-3xl mb-6 font-display text-white">{picks["Game 1"].champion}</div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between bg-black/40 p-3 rounded border border-white/5">
                                <span className="font-bold text-gray-300">{player_a}</span>
                                <span className={`font-bold uppercase tracking-wider ${playerASide === "Blue" ? "text-blue-400" : "text-red-400"}`}>{playerASide} Side</span>
                            </div>
                            <div className="flex justify-between bg-black/40 p-3 rounded border border-white/5">
                                <span className="font-bold text-gray-300">{player_b}</span>
                                <span className={`font-bold uppercase tracking-wider ${playerBSide === "Blue" ? "text-blue-400" : "text-red-400"}`}>{playerBSide === "Blue" ? "Red" : "Blue"} Side</span>
                            </div>
                        </div>
                    </div>

                    {/* Game 2 */}
                    <div className="bg-gradient-to-br from-red-900/20 to-transparent border border-red-500/30 p-6 rounded-2xl relative overflow-hidden group hover:border-red-500/60 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-display text-6xl font-black text-white pointer-events-none group-hover:opacity-20 transition-opacity">02</div>
                        <h3 className="text-xl font-bold text-red-400 mb-6 text-center uppercase tracking-widest border-b border-red-500/20 pb-4">JOGO 2 (VOLTA)</h3>
                        <div className="flex justify-center mb-6">
                            <img src={picks["Game 2"].image} className="w-40 h-40 rounded-full border-4 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-float" style={{ animationDelay: '1s' }} />
                        </div>
                        <div className="text-center font-bold text-3xl mb-6 font-display text-white">{picks["Game 2"].champion}</div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between bg-black/40 p-3 rounded border border-white/5">
                                <span className="font-bold text-gray-300">{player_a}</span>
                                <span className={`font-bold uppercase tracking-wider ${playerASide === "Blue" ? "text-red-400" : "text-blue-400"}`}>{playerASide === "Blue" ? "Red" : "Blue"} Side</span>
                            </div>
                            <div className="flex justify-between bg-black/40 p-3 rounded border border-white/5">
                                <span className="font-bold text-gray-300">{player_b}</span>
                                <span className={`font-bold uppercase tracking-wider ${playerBSide === "Blue" ? "text-red-400" : "text-blue-400"}`}>{playerBSide === "Blue" ? "Red" : "Blue"} Side</span>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-hex-gold-700/50 text-xs mt-4 uppercase tracking-widest">* No Jogo 2, os lados são invertidos automaticamente.</p>
            </div>
        </>
    );
};

export default ChoicePhase;
