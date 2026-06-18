import * as XLSX from "xlsx";

export interface ParsedBook {
  subject: string;
  title: string;
  author: string;
  publisher: string;
  isbn?: string;
  notes?: string;
  level?: string;
  mandatory: boolean;
}

// Expected Excel column headers (Hebrew)
const COL_MAP: Record<string, keyof ParsedBook> = {
  מקצוע: "subject",
  "שם הספר": "title",
  מחבר: "author",
  הוצאה: "publisher",
  "מק\"ט / ISBN": "isbn",
  isbn: "isbn",
  הערות: "notes",
  "רמה": "level",
  "רמת לימוד": "level",
  "כיתה": "level",
  "חובה/רשות": "mandatory",
};

export function parseExcel(buffer: Buffer): ParsedBook[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
  });

  return rows
    .filter((row) => Object.values(row).some((v) => v !== ""))
    .map((row) => {
      const book: Partial<ParsedBook> = { mandatory: true };
      for (const [col, field] of Object.entries(COL_MAP)) {
        const val = row[col]?.toString().trim();
        if (!val) continue;
        if (field === "mandatory") {
          book.mandatory = !["רשות", "אופציונלי", "לא חובה"].includes(val);
        } else {
          (book as Record<string, unknown>)[field] = val;
        }
      }
      return {
        subject: book.subject ?? "",
        title: book.title ?? "",
        author: book.author ?? "",
        publisher: book.publisher ?? "",
        isbn: book.isbn,
        notes: book.notes,
        level: book.level,
        mandatory: book.mandatory ?? true,
      };
    })
    .filter((b) => b.title);
}
