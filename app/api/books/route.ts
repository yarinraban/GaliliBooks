import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const grade = searchParams.get("grade");
  const year = searchParams.get("year");

  const books = await prisma.book.findMany({
    where: {
      ...(grade ? { grade } : {}),
      ...(year ? { year: parseInt(year) } : {}),
    },
    orderBy: [{ subject: "asc" }, { order: "asc" }],
  });

  return NextResponse.json(books);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const book = await prisma.book.create({ data });
  return NextResponse.json(book, { status: 201 });
}
