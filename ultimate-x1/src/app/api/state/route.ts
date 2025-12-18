import { gameManager } from "@/lib/game-manager";
import { NextResponse } from "next/server";

export async function GET() {
    await gameManager.initialize();
    return NextResponse.json(gameManager.state);
}
