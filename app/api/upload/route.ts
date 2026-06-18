import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseExcel } from "@/lib/parseUpload";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const grade = formData.get("grade") as string;
  const year = parseInt(formData.get("year") as string);
  const preview = formData.get("preview") === "true";

  if (!file || !grade || !year) {
    return NextResponse.json({ error: "חסרים שדות" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const books = parseExcel(buffer);

  if (preview) {
    return NextResponse.json({ books });
  }

  // Replace existing books for this grade+year
  await prisma.book.deleteMany({ where: { grade, year } });
  const created = await prisma.book.createMany({
    data: books.map((b, i) => ({ ...b, grade, year, order: i })),
  });

  return NextResponse.json({ count: created.count });
}
