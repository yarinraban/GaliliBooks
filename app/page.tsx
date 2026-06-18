export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";

const GRADES = [
  { id: "10", label: "שכבה י׳", color: "from-blue-400 to-blue-600" },
  { id: "11", label: 'שכבה י״א', color: "from-purple-400 to-purple-600" },
  { id: "12", label: 'שכבה י״ב', color: "from-rose-400 to-rose-600" },
];

const HEBREW_YEARS: Record<string, string> = {
  "2025": 'תשפ״ה', "2026": 'תשפ״ו', "2027": 'תשפ״ז',
  "2028": 'תשפ״ח', "2029": 'תשפ״ט', "2030": 'תש״צ',
};

export default async function HomePage() {
  const setting = await prisma.setting.findUnique({ where: { key: "activeYear" } });
  const activeYear = setting ? parseInt(setting.value) : new Date().getFullYear();
  const hebrewYear = HEBREW_YEARS[String(activeYear)] ?? String(activeYear);

  const counts = await Promise.all(
    GRADES.map(async (g) => {
      const count = await prisma.book.count({ where: { grade: g.id, year: activeYear } });
      return { grade: g.id, count };
    })
  );
  const countMap = Object.fromEntries(counts.map((c) => [c.grade, c.count]));

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">📚 רשימות ספרים</h1>
        <p className="text-gray-500 text-lg">שנת לימודים {hebrewYear}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
        {GRADES.map((grade) => (
          <Link
            key={grade.id}
            href={`/grade/${grade.id}`}
            className={`bg-gradient-to-br ${grade.color} text-white rounded-2xl p-8 text-center shadow-lg hover:scale-105 transition-transform cursor-pointer`}
          >
            <div className="text-5xl mb-3">📖</div>
            <h2 className="text-2xl font-bold">{grade.label}</h2>
            {countMap[grade.id] > 0 ? (
              <p className="mt-2 text-white/80 text-sm">{countMap[grade.id]} ספרים</p>
            ) : (
              <p className="mt-2 text-white/60 text-sm">אין ספרים עדיין</p>
            )}
          </Link>
        ))}
      </div>

      <Link href="/admin" className="mt-16 text-gray-400 hover:text-gray-600 text-sm underline transition-colors">
        ממשק ניהול
      </Link>
    </main>
  );
}
