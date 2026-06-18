import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  const wb = XLSX.utils.book_new();

  const header = ["מקצוע", "שם הספר", "מחבר", "הוצאה", "רמה", "חובה/רשות", "הערות"];
  const examples = [
    ["ספרות", "שחור על גבי לבן", "עמוס עוז", "כתר", "כולם", "חובה", ""],
    ["מתמטיקה", "אלגברה לכיתה י", "ד\"ר כהן", "מטח", "3 יח\"ל", "חובה", "רכישה מרוכזת בתחילת שנה"],
    ["פיזיקה", "מכניקה ניוטונית", "עדי רוזן", "אוניברסיטאי", "4-5 יח\"ל", "רשות", ""],
    ["אנגלית", "High Five", "E.C.B", "E.C.B", "5 points", "חובה", ""],
  ];

  const ws = XLSX.utils.aoa_to_sheet([header, ...examples]);

  ws["!cols"] = [
    { wch: 18 },
    { wch: 30 },
    { wch: 20 },
    { wch: 16 },
    { wch: 14 },
    { wch: 12 },
    { wch: 30 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "ספרים");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="template_booklist.xlsx"',
    },
  });
}
