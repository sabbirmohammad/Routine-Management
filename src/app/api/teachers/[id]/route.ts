// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT: Update a teacher
export async function PUT(req: NextRequest, context) {
  const { id } = context.params;
  const { name, initial, department } = await req.json();
  if (!name || !initial) {
    return NextResponse.json({ error: "Name and initial are required." }, { status: 400 });
  }
  const teacher = await prisma.teacher.update({
    where: { id },
    data: { name, initial, department },
  });
  return NextResponse.json(teacher);
}

// DELETE: Delete a teacher
export async function DELETE(req: NextRequest, context) {
  const { id } = context.params;
  await prisma.teacher.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 