import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List courses (with optional search)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(courses);
}

// POST: Add a new course
export async function POST(req: NextRequest) {
  const { name, code } = await req.json();
  if (!name || !code) {
    return NextResponse.json({ error: "Name and code are required." }, { status: 400 });
  }
  const course = await prisma.course.create({ data: { name, code } });
  return NextResponse.json(course);
}

// PUT and DELETE will be handled in /api/courses/[id]/route.ts 