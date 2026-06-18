"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import SubjectCard, { Book, getStatus } from "@/components/SubjectCard";
import PrintList from "@/components/PrintList";

const GRADE_LABELS: Record<string, string> = {
  "10": "שכבה י׳",
  "11": 'שכבה י״א',
  "12": 'שכבה י״ב',
};

const GRADE_COLORS: Record<string, string> = {
  "10": "from-blue-500 to-blue-700",
  "11": "from-purple-500 to-purple-700",
  "12": "from-rose-500 to-rose-700",
};

export default function GradePage({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = use(params);
  const storageKey = `status-${grade}`;

  const [books, setBooks] = useState<Book[]>([]);
  const [hebrewYear, setHebrewYear] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("הכל");
  const [counts, setCounts] = useState({ bought: 0, skip: 0 });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => {
        const yr = parseInt(s.activeYear ?? new Date().getFullYear());
        setHebrewYear(s.hebrewYear ?? yr.toString());
        return fetch(`/api/books?grade=${grade}&year=${yr}`);
      })
      .then((r) => r.json())
      .then((data) => {
        setBooks(data);
        setLoading(false);
      });
  }, [grade]);

  const refreshCounts = useCallback(() => {
    let bought = 0, skip = 0;
    for (const book of books) {
      const s = getStatus(storageKey, book.id);
      if (s === "bought") bought++;
      else if (s === "skip") skip++;
    }
    setCounts({ bought, skip });
  }, [books, storageKey]);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  // Group books by subject (preserving order of first appearance)
  const subjectOrder: string[] = [];
  const grouped: Record<string, Book[]> = {};
  for (const book of books) {
    if (!grouped[book.subject]) {
      grouped[book.subject] = [];
      subjectOrder.push(book.subject);
    }
    grouped[book.subject].push(book);
  }

  const subjects = ["הכל", ...subjectOrder];

  const filteredSubjects =
    filter === "הכל"
      ? subjectOrder
      : subjectOrder.filter((s) => s === filter);

  const done = counts.bought + counts.skip;
  const pct = books.length ? Math.round((done / books.length) * 100) : 0;

  return (
    <div className="min-h-screen">
      <header className={`bg-gradient-to-br ${GRADE_COLORS[grade] ?? "from-gray-500 to-gray-700"} text-white p-6 print:hidden`}>
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-white/70 hover:text-white text-sm mb-3 inline-block">← חזרה</Link>
          <h1 className="text-3xl font-bold">{GRADE_LABELS[grade] ?? `שכבה ${grade}`}</h1>
          <p className="text-white/80 mt-1">שנת לימודים {hebrewYear}</p>

          {books.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>
                  {counts.bought > 0 && <span>נרכשו {counts.bought} · </span>}
                  {counts.skip > 0 && <span>לא נדרשים {counts.skip} · </span>}
                  <span className="text-white/70">סה״כ {books.length}</span>
                </span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 bg-white/30 rounded-full">
                <div className="h-2 bg-white rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 print:hidden">
        {subjects.length > 2 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mt-2 mb-4">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === s ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400">טוען ספרים...</div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📭</p>
            <p>אין ספרים לשכבה זו עדיין</p>
            <Link href="/admin/upload" className="mt-4 inline-block text-indigo-500 hover:underline">העלה רשימה →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredSubjects.map((subject) => (
              <SubjectCard
                key={subject}
                subject={subject}
                books={grouped[subject]}
                storageKey={storageKey}
                onStatusChange={refreshCounts}
              />
            ))}
          </div>
        )}
      </div>

      {books.length > 0 && (
        <PrintList books={books} grade={grade} hebrewYear={hebrewYear} storageKey={storageKey} />
      )}
    </div>
  );
}
