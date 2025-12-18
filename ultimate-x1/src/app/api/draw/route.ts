import { gameManager } from "@/lib/game-manager";
import { NextResponse } from "next/server";

export async function POST() {
    await gameManager.drawChampions();
    return NextResponse.json(gameManager.state);
}
