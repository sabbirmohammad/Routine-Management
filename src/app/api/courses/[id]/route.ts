// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT: Update a course
export async function PUT(req: NextRequest, context) {
  const { id } = context.params;
  const { name, code } = await req.json();
  if (!name || !code) {
    return NextResponse.json({ error: "Name and code are required." }, { status: 400 });
  }
  const course = await prisma.course.update({
    where: { id },
    data: { name, code },
  });
  return NextResponse.json(course);
}

// DELETE: Delete a course
export async function DELETE(req: NextRequest, context) {
  const { id } = context.params;
  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 