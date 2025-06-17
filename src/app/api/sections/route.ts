import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List sections
export async function GET(req: NextRequest) {
  const includeBatch = req.nextUrl.searchParams.get("includeBatch") === "1";
  const sections = await prisma.section.findMany({
    orderBy: { name: "asc" },
    include: includeBatch ? { batch: { select: { id: true, number: true } } } : undefined,
  });
  return NextResponse.json(sections);
}

// POST: Add a new section
export async function POST(req: NextRequest) {
  const data = await req.json();
  const section = await prisma.section.create({ data });
  return NextResponse.json(section);
} 