import { PrismaClient } from "../app/generated/prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  const dataPath = path.join(__dirname, "seed-data.json");
  const { books, settings } = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  console.log(`Seeding ${books.length} books and ${settings.length} settings...`);

  await prisma.book.deleteMany();
  await prisma.setting.deleteMany();

  for (const book of books) {
    const { id, createdAt, ...rest } = book;
    await prisma.book.create({ data: { ...rest, mandatory: Boolean(rest.mandatory) } });
  }

  for (const setting of settings) {
    await prisma.setting.create({ data: setting });
  }

  console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
