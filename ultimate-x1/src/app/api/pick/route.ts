import { gameManager } from "@/lib/game-manager";
import { PickRequest } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body: PickRequest = await request.json();

    await gameManager.pickChampion(body.game, body.champion, body.image, body.player);

    return NextResponse.json(gameManager.state);
}
