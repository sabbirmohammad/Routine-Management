import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List batches (no 'semester' model exists)
export async function GET(req: NextRequest) {
  const batches = await prisma.batch.findMany({
    orderBy: { number: "asc" },
  });
  return NextResponse.json(batches);
} 