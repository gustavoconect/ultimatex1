import React, { useState, useEffect } from 'react';
import api from './api';
import Sidebar from './components/Sidebar';
import SetupPhase from './components/SetupPhase';
import LaneBanPhase from './components/LaneBanPhase';
import ChoicePhase from './components/ChoicePhase';
import KnockoutPhase from './components/KnockoutPhase';
import { initializeSounds, playLockSound, playBanSound, playClickSound, playHoverSound } from './SoundManager';

function App() {
    const [state, setState] = useState(null);

    // Initialize sounds and poll state
    useEffect(() => {
        initializeSounds(); // Preload sounds on app start

        const fetchState = () => {
            api.get(`/state`)
                .then(res => {
                    setState(res.data);
                })
                .catch(err => {
                    console.error("Error fetching state:", err);
                });
        };

        fetchState();
        const interval = setInterval(fetchState, 2000);
        return () => clearInterval(interval);
    }, []);

    if (!state) return (
        <div className="h-screen flex items-center justify-center text-hex-gold-300 bg-hex-dark-300 font-display text-2xl animate-pulse">
            Iniciando Protocolo Hextech...
        </div>
    );

    const handleSetup = (data) => {
        playLockSound(); // Major transition: Iniciar Confronto
        api.post(`/setup`, data)
            .then(res => setState(res.data))
            .catch(err => {
                console.error("Setup Error:", err);
                alert("Erro ao iniciar duelo: " + (err.response?.data?.detail || err.message));
            });
    };

    const handleBan = (lane) => {
        playBanSound();
        api.post(`/ban-lane`, { lane }).then(res => {
            setState(res.data);
            // Play lock sound after 4th ban (lane selected)
            if (res.data.selected_lane) {
                playLockSound();
            }
        });
    };

    const handleDraw = () => {
        playLockSound(); // Major transition: Sortear Campeões
        api.post(`/draw`).then(res => setState(res.data));
    };

    const handleNewDuel = () => {
        playClickSound();
        api.post(`/reset-duel`).then(res => setState(res.data));
    };

    const handleFullReset = () => {
        playClickSound();
        if (confirm("Isso apagará todo o histórico da Blacklist. Tem certeza?")) {
            api.post(`/full-reset`).then(res => setState(res.data));
        }
    };

    // Groups Phase Logic
    const isGroupsPhase = state.tournament_phase === "Groups";
    const showChoicePhase = state.selected_lane && isGroupsPhase;

    return (
        <div className="flex min-h-screen font-outfit text-white selection:bg-hex-gold-700 selection:text-white overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                blacklist={state.global_blacklist}
                history={state.match_history}
                onNewDuel={handleNewDuel}
                onFullReset={handleFullReset}
                tournamentPhase={state.tournament_phase}
                playerA={state.player_a}
                playerB={state.player_b}
                onHover={playHoverSound}
            />

            {/* Main Content */}
            <div className="pl-[22rem] flex-1 p-8 relative z-10">
                {!state.setup_complete && (
                    <SetupPhase onStart={handleSetup} />
                )}

                {/* KNOCKOUT PHASE */}
                {state.setup_complete && state.tournament_phase === "Knockout" && (
                    <KnockoutPhase
                        state={state}
                        onStateUpdate={setState}
                    />
                )}

                {/* GROUPS PHASE FLOW */}
                {state.setup_complete && isGroupsPhase && !state.selected_lane && (
                    <LaneBanPhase
                        bannedLanes={state.banned_lanes}
                        onBan={handleBan}
                        currentPlayer={state.current_action_player}
                        currentPlayerName={state.current_action_player === "A" ? state.player_a : state.player_b}
                    />
                )}

                {showChoicePhase && !state.drawn_champions?.length && (
                    <div className="flex flex-col items-center justify-center h-[70vh] gap-8 animate-scale-in">
                        <div className="text-center space-y-2">
                            <h2 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-hex-gold-100 to-hex-gold-500 drop-shadow-sm">
                                Rota Definida
                            </h2>
                            <div className="text-6xl font-bold text-hex-blue-300 tracking-wider uppercase drop-shadow-[0_0_15px_rgba(10,200,185,0.5)]">
                                {state.selected_lane}
                            </div>
                        </div>

                        <button
                            onClick={handleDraw}
                            onMouseEnter={playHoverSound}
                            className="group relative px-12 py-6 bg-hex-dark-500 border border-hex-gold-500 text-hex-gold-100 text-2xl font-bold uppercase tracking-widest overflow-hidden transition-all hover:text-white hover:border-hex-gold-300 hover:shadow-[0_0_30px_rgba(200,155,60,0.3)] clip-path-hex"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-hex-gold-500/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <span className="relative z-10 flex items-center gap-4">
                                🎲 Iniciar Sorteio
                            </span>
                        </button>
                    </div>
                )}

                {showChoicePhase && state.drawn_champions?.length > 0 && (
                    <ChoicePhase
                        state={state}
                        onStateUpdate={setState}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
