// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT: Update a time slot
export async function PUT(req: NextRequest, context) {
  const { id } = context.params;
  const { startTime, endTime } = await req.json();
  if (!startTime || !endTime) {
    return NextResponse.json({ error: "Start and end time are required." }, { status: 400 });
  }
  const slot = await prisma.timeSlot.update({
    where: { id },
    data: { startTime, endTime },
  });
  return NextResponse.json(slot);
}

// DELETE: Delete a time slot
export async function DELETE(req: NextRequest, context) {
  const { id } = context.params;
  await prisma.timeSlot.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 