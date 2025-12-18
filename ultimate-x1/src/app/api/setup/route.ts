import { gameManager } from "@/lib/game-manager";
import { PlayerSetupRequest } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body: PlayerSetupRequest = await request.json();

    await gameManager.initialize();
    await gameManager.setupGame(
        body.player_a, body.elo_a, body.pdl_a,
        body.player_b, body.elo_b, body.pdl_b,
        body.tournament_phase, body.series_format, body.announce_first
    );

    return NextResponse.json(gameManager.state);
}
