import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import path from "path";

function getRawDb() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3");
  const dbPath = path.join(process.cwd(), "dev.db");
  return new Database(dbPath);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const grade = searchParams.get("grade");
  const year = searchParams.get("year");

  const conditions: string[] = [];
  const params: unknown[] = [];
  if (grade) { conditions.push("grade = ?"); params.push(grade); }
  if (year) { conditions.push("year = ?"); params.push(parseInt(year)); }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const db = getRawDb();
  const books = db
    .prepare(`SELECT * FROM Book ${where} ORDER BY subject ASC, "order" ASC`)
    .all(...params);
  db.close();

  return NextResponse.json(books);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const book = await prisma.book.create({ data });
  return NextResponse.json(book, { status: 201 });
}
