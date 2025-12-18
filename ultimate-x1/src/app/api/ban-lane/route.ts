import { gameManager } from "@/lib/game-manager";
import { BanLaneRequest } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body: BanLaneRequest = await request.json();

    gameManager.banLane(body.lane);

    return NextResponse.json(gameManager.state);
}
