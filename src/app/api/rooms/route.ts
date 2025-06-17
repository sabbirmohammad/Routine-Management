import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List rooms (with optional search)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const rooms = await prisma.room.findMany({
    where: {
      OR: [
        { number: { contains: search, mode: "insensitive" } },
      ],
    },
    orderBy: { number: "asc" },
  });
  return NextResponse.json(rooms);
}

// POST: Add a new room
export async function POST(req: NextRequest) {
  const { number, capacity, isAvailable } = await req.json();
  if (!number) {
    return NextResponse.json({ error: "Room number is required." }, { status: 400 });
  }
  const room = await prisma.room.create({ data: { number, capacity: capacity ? Number(capacity) : null, isAvailable: isAvailable !== false } });
  return NextResponse.json(room);
}

// PUT and DELETE will be handled in /api/rooms/[id]/route.ts 