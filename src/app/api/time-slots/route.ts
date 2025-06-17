import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List time slots (with optional search)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const slots = await prisma.timeSlot.findMany({
    where: search
      ? {
          OR: [
            { startTime: { equals: search } },
            { endTime: { equals: search } },
          ],
        }
      : {},
    orderBy: { startTime: "asc" },
  });
  return NextResponse.json(slots);
}

function toTodayISOString(time: string) {
  // time: "HH:mm"
  const [hours, minutes] = time.split(":");
  const now = new Date();
  now.setHours(Number(hours), Number(minutes), 0, 0);
  return now.toISOString();
}

// POST: Add a new time slot
export async function POST(req: NextRequest) {
  try {
    const { startTime, endTime } = await req.json();
    if (!startTime || !endTime) {
      return NextResponse.json({ error: "Start and end time are required." }, { status: 400 });
    }
    const startISO = toTodayISOString(startTime);
    const endISO = toTodayISOString(endTime);
    const slot = await prisma.timeSlot.create({ data: { startTime: startISO, endTime: endISO } });
    return NextResponse.json(slot);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to add time slot" },
      { status: 500 }
    );
  }
}

// PUT and DELETE will be handled in /api/time-slots/[id]/route.ts 