// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT: Update a section
export async function PUT(req: NextRequest, context) {
  const { id } = context.params;
  const data = await req.json();
  const section = await prisma.section.update({ where: { id }, data });
  return NextResponse.json(section);
}

// DELETE: Delete a section
export async function DELETE(req: NextRequest, context) {
  const { id } = context.params;
  await prisma.section.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 