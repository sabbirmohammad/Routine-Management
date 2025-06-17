// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, context) {
  const { id } = context.params;
  const semester = await prisma.semester.findUnique({
    where: { id },
    include: { routines: true },
  });
  if (!semester) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(semester);
}

export async function PUT(req: NextRequest, context) {
  const { id } = context.params;
  const data = await req.json();
  const semester = await prisma.semester.update({ where: { id }, data });
  return NextResponse.json(semester);
}

export async function DELETE(req: NextRequest, context) {
  const { id } = context.params;
  await prisma.semester.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 