export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";
import AdminYearPanel from "./YearPanel";

const GRADES = [
  { id: "10", label: "שכבה י׳" },
  { id: "11", label: 'שכבה י״א' },
  { id: "12", label: 'שכבה י״ב' },
];

const HEBREW_YEARS: Record<string, string> = {
  "2025": 'תשפ״ה', "2026": 'תשפ״ו', "2027": 'תשפ״ז',
  "2028": 'תשפ״ח', "2029": 'תשפ״ט', "2030": 'תש״צ',
};

export default async function AdminPage() {
  const setting = await prisma.setting.findUnique({ where: { key: "activeYear" } });
  const activeYear = setting ? parseInt(setting.value) : new Date().getFullYear();
  const hebrewYear = HEBREW_YEARS[String(activeYear)] ?? String(activeYear);
  const nextYear = activeYear + 1;
  const nextHebrewYear = HEBREW_YEARS[String(nextYear)] ?? String(nextYear);

  const stats = await Promise.all(
    GRADES.map(async (g) => {
      const count = await prisma.book.count({ where: { grade: g.id, year: activeYear } });
      return { ...g, count };
    })
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">ממשק ניהול – רשימות ספרים</h1>
        <Link href="/" className="text-sm text-indigo-600 hover:underline">← צפה באתר</Link>
      </header>

      <main className="max-w-4xl mx-auto p-8 space-y-6">
        {/* כרטיסי שכבות */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((g) => (
            <div key={g.id} className="bg-white rounded-xl border p-5 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-1">{g.label}</h2>
              <p className="text-3xl font-bold text-indigo-600">{g.count}</p>
              <p className="text-xs text-gray-400 mb-3">ספרים – {hebrewYear}</p>
              <Link href={`/admin/grade/${g.id}`} className="text-sm text-indigo-600 hover:underline">
                עריכה →
              </Link>
            </div>
          ))}
        </div>

        {/* פעולות מהירות */}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4">פעולות מהירות</h2>
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <Link href="/admin/upload" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 text-center">
              📤 העלה רשימת ספרים (Excel)
            </Link>
            <a href="/api/template" download="template_booklist.xlsx" className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 text-center">
              📥 הורד תבנית Excel למילוי
            </a>
            {GRADES.map((g) => (
              <Link key={g.id} href={`/grade/${g.id}`} className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-200 text-center text-sm">
                👁️ {g.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ניהול שנת לימודים */}
        <AdminYearPanel
          activeYear={activeYear}
          hebrewYear={hebrewYear}
          nextYear={nextYear}
          nextHebrewYear={nextHebrewYear}
        />
      </main>
    </div>
  );
}
