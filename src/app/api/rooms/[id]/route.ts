// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT: Update a room
export async function PUT(req: NextRequest, context) {
  const { id } = context.params;
  const { number, capacity, isAvailable } = await req.json();
  if (!number) {
    return NextResponse.json({ error: "Room number is required." }, { status: 400 });
  }
  const room = await prisma.room.update({
    where: { id },
    data: { number, capacity: capacity ? Number(capacity) : null, isAvailable },
  });
  return NextResponse.json(room);
}

// DELETE: Delete a room
export async function DELETE(req: NextRequest, context) {
  const { id } = context.params;
  await prisma.room.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 