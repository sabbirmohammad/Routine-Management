// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Get a single routine by ID
export async function GET(req: NextRequest, context) {
  const { id } = context.params;
  try {
    const routine = await prisma.routine.findUnique({
      where: { id },
      include: {
        course: true,
        teacher: true,
        room: true,
        timeSlot: true,
        department: true,
        semester: true,
        section: true,
      },
    });
    if (!routine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }
    return NextResponse.json(routine);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch routine" }, { status: 500 });
  }
}

// PUT: Update a routine
export async function PUT(req: NextRequest, context) {
  const { id } = context.params;
  try {
    const { courseId, teacherId, roomId, timeSlotId, dayOfWeek, sectionId } = await req.json();
    if (!courseId || !teacherId || !roomId || !timeSlotId || dayOfWeek === undefined || !sectionId) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    const routine = await prisma.routine.update({
      where: { id },
      data: { courseId, teacherId, roomId, timeSlotId, dayOfWeek, sectionId },
    });
    return NextResponse.json(routine);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update routine" }, { status: 500 });
  }
}

// DELETE: Delete a routine
export async function DELETE(req: NextRequest, context) {
  const { id } = context.params;
  try {
    await prisma.routine.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete routine" }, { status: 500 });
  }
} 