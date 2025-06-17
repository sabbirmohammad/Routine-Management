import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const includeSections = req.nextUrl.searchParams.get("includeSections") === "1";
  const batches = await prisma.batch.findMany({
    orderBy: { number: "asc" },
    include: includeSections ? { sections: { orderBy: { name: "asc" } } } : undefined,
  });
  return NextResponse.json(batches);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const batch = await prisma.batch.create({ data });
  return NextResponse.json(batch);
} 