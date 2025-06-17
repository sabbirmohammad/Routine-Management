import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List departments
export async function GET(req: NextRequest) {
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(departments);
} 