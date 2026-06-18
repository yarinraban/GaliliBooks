"use client";

import { useState } from "react";
import Link from "next/link";

interface ParsedBook {
  subject: string;
  title: string;
  author: string;
  publisher: string;
  isbn?: string;
  notes?: string;
  mandatory: boolean;
}

const GRADES = [
  { id: "10", label: "שכבה י׳" },
  { id: "11", label: 'שכבה י״א' },
  { id: "12", label: 'שכבה י״ב' },
];

export default function UploadPage() {
  const [grade, setGrade] = useState("10");
  const [year, setYear] = useState(new Date().getFullYear());
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedBook[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handlePreview() {
    if (!file) return;
    setLoading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("grade", grade);
    fd.append("year", String(year));
    fd.append("preview", "true");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreview(data.books);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!file) return;
    setLoading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("grade", grade);
    fd.append("year", String(year));
    fd.append("preview", "false");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">הרשימה הועלתה בהצלחה!</h2>
          <p className="text-gray-500 mb-6">הספרים נשמרו ב-DB</p>
          <div className="flex gap-3 justify-center">
            <Link href="/admin" className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700">
              חזרה לניהול
            </Link>
            <button
              onClick={() => { setSuccess(false); setPreview(null); setFile(null); }}
              className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50"
            >
              העלה עוד
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700">←</Link>
          <h1 className="text-xl font-bold text-gray-900">העלאת רשימת ספרים</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-8">
        <div className="bg-white rounded-xl border p-6 shadow-sm mb-6">
          <h2 className="font-bold text-gray-700 mb-4">הגדרות</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שכבה</label>
              <select
                value={grade}
                onChange={(e) => { setGrade(e.target.value); setPreview(null); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {GRADES.map((g) => (
                  <option key={g.id} value={g.id}>{g.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שנת לימודים</label>
              <input
                type="number"
                value={year}
                onChange={(e) => { setYear(parseInt(e.target.value)); setPreview(null); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm mb-6">
          <h2 className="font-bold text-gray-700 mb-2">קובץ Excel / Word</h2>
          <p className="text-sm text-gray-500 mb-2">
            עמודות נדרשות: <strong>מקצוע, שם הספר, מחבר, הוצאה</strong> (אופציונלי: ISBN, הערות, חובה/רשות)
          </p>
          <a
            href="/api/template"
            download="template_booklist.xlsx"
            className="inline-block mb-4 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100"
          >
            📥 הורד תבנית Excel מוכנה למילוי
          </a>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => { setFile(e.target.files?.[0] ?? null); setPreview(null); }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {file && (
            <p className="mt-2 text-sm text-green-600">✓ {file.name}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 text-sm">
            {error}
          </div>
        )}

        {!preview ? (
          <button
            onClick={handlePreview}
            disabled={!file || loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "מעבד..." : "תצוגה מקדימה"}
          </button>
        ) : (
          <>
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-4">
              <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
                <span className="font-bold text-gray-800">תצוגה מקדימה – {preview.length} ספרים</span>
                <span className="text-sm text-amber-600 font-medium">⚠️ שמירה תמחק ספרים קיימים לשכבה זו</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["מקצוע", "שם הספר", "מחבר", "הוצאה", "חובה"].map((h) => (
                        <th key={h} className="text-right p-2 border-b text-gray-600 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((b, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-2">{b.subject}</td>
                        <td className="p-2 font-medium">{b.title}</td>
                        <td className="p-2 text-gray-600">{b.author}</td>
                        <td className="p-2 text-gray-600">{b.publisher}</td>
                        <td className="p-2 text-center">{b.mandatory ? "✓" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "שומר..." : "✓ אישור – שמור רשימה"}
              </button>
              <button
                onClick={() => setPreview(null)}
                className="px-5 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                ביטול
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
