import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List teachers (with optional search)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const teachers = await prisma.teacher.findMany({
    where: {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { initial: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(teachers);
}

// POST: Add a new teacher
export async function POST(req: NextRequest) {
  const { name, initial, department } = await req.json();
  if (!name || !initial) {
    return NextResponse.json({ error: "Name and initial are required." }, { status: 400 });
  }
  const teacher = await prisma.teacher.create({ data: { name, initial, department } });
  return NextResponse.json(teacher);
}

// PUT and DELETE will be handled in /api/teachers/[id]/route.ts 