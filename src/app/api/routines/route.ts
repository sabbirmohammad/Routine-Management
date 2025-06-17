import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List routines with optional filtering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId") || undefined;
    const roomId = searchParams.get("roomId") || undefined;
    const dayOfWeek = searchParams.get("dayOfWeek") || undefined;
    const courseId = searchParams.get("courseId") || undefined;
    const sectionId = searchParams.get("sectionId") || undefined;

    const where: any = {};
    if (teacherId) where.teacherId = teacherId;
    if (roomId) where.roomId = roomId;
    if (dayOfWeek) where.dayOfWeek = Number(dayOfWeek);
    if (courseId) where.courseId = courseId;
    if (sectionId) where.sectionId = sectionId;

    const routines = await prisma.routine.findMany({
      where,
      include: {
        course: true,
        teacher: true,
        room: true,
        timeSlot: true,
        section: {
          include: {
            batch: true,
          },
        },
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { timeSlot: { startTime: "asc" } },
      ],
    });
    return NextResponse.json(routines);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch routines" }, { status: 500 });
  }
}

// POST: Create a new routine
export async function POST(req: NextRequest) {
  try {
    const { courseId, teacherId, roomId, timeSlotId, dayOfWeek, sectionId } = await req.json();
    if (!courseId || !teacherId || !roomId || !timeSlotId || dayOfWeek === undefined || !sectionId) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    const routine = await prisma.routine.create({
      data: { courseId, teacherId, roomId, timeSlotId, dayOfWeek, sectionId },
    });
    return NextResponse.json(routine);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create routine" }, { status: 500 });
  }
} 