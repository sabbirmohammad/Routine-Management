// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, context) {
  const { id } = context.params;
  const batch = await prisma.batch.findUnique({
    where: { id },
    include: { sections: { orderBy: { name: "asc" } } },
  });
  if (!batch) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(batch);
}

export async function PUT(req: NextRequest, context) {
  const { id } = context.params;
  const data = await req.json();
  const batch = await prisma.batch.update({ where: { id }, data });
  return NextResponse.json(batch);
}

export async function DELETE(req: NextRequest, context) {
  const { id } = context.params;
  // Delete all sections under this batch first (to avoid FK constraint error)
  await prisma.section.deleteMany({ where: { batchId: id } });
  await prisma.batch.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 