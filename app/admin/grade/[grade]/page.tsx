"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface Book {
  id: number;
  subject: string;
  title: string;
  author: string;
  publisher: string;
  notes?: string | null;
  level?: string | null;
  mandatory: boolean;
  order: number;
}

const GRADE_LABELS: Record<string, string> = {
  "10": "שכבה י׳",
  "11": 'שכבה י״א',
  "12": 'שכבה י״ב',
};

const HEBREW_YEARS: Record<string, string> = {
  "2025": 'תשפ״ה', "2026": 'תשפ״ו', "2027": 'תשפ״ז',
  "2028": 'תשפ״ח', "2029": 'תשפ״ט', "2030": 'תש״צ',
};

const LEVEL_PRESETS = ["כולם", "3 יח\"ל", "4 יח\"ל", "5 יח\"ל", "מורחב", "5 points", "4 points", "3 points"];

const EMPTY_FORM = { subject: "", title: "", author: "", publisher: "", notes: "", level: "", mandatory: true };

export default function AdminGradePage({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = use(params);

  const [books, setBooks] = useState<Book[]>([]);
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
  const [hebrewYear, setHebrewYear] = useState("");
  const [editing, setEditing] = useState<Book | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => {
        const yr = parseInt(s.activeYear ?? new Date().getFullYear());
        setActiveYear(yr);
        setHebrewYear(HEBREW_YEARS[String(yr)] ?? String(yr));
        return fetch(`/api/books?grade=${grade}&year=${yr}`);
      })
      .then((r) => r.json())
      .then((data) => { setBooks(data); setLoading(false); });
  }, [grade]);

  async function saveEdit() {
    if (!editing) return;
    const res = await fetch(`/api/books/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const updated = await res.json();
    setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setEditing(null);
  }

  async function saveNew() {
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, grade, year: activeYear, order: books.length }),
    });
    const created = await res.json();
    setBooks((prev) => [...prev, created]);
    setAdding(false);
    setForm(EMPTY_FORM);
  }

  async function deleteBook(id: number) {
    if (!confirm("למחוק את הפריט?")) return;
    await fetch(`/api/books/${id}`, { method: "DELETE" });
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  const grouped = books.reduce<Record<string, Book[]>>((acc, b) => {
    if (!acc[b.subject]) acc[b.subject] = [];
    acc[b.subject].push(b);
    return acc;
  }, {});

  function FormFields({ data, onChange }: { data: typeof EMPTY_FORM; onChange: (d: typeof EMPTY_FORM) => void }) {
    return (
      <div className="space-y-3">
        {(["subject", "title", "author", "publisher"] as const).map((field) => (
          <div key={field}>
            <label className="block text-sm text-gray-600 mb-0.5">
              {{ subject: "מקצוע", title: "שם / תיאור", author: "מחבר", publisher: "הוצאה" }[field]}
            </label>
            <input
              value={data[field]}
              onChange={(e) => onChange({ ...data, [field]: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ))}

        {/* רמת לימוד */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">רמת לימוד / כיתה</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {LEVEL_PRESETS.map((preset) => {
              const isSelected = data.level === (preset === "כולם" ? "" : preset);
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChange({ ...data, level: preset === "כולם" ? "" : preset })}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>
          <input
            value={data.level}
            onChange={(e) => onChange({ ...data, level: e.target.value })}
            placeholder="או הקלד רמה חופשית..."
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-0.5">הנחיות / הערות</label>
          <textarea
            value={data.notes}
            onChange={(e) => onChange({ ...data, notes: e.target.value })}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={data.mandatory} onChange={(e) => onChange({ ...data, mandatory: e.target.checked })} />
          ספר חובה
        </label>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700">←</Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{GRADE_LABELS[grade]} – עריכה</h1>
            <p className="text-xs text-gray-400">{hebrewYear}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setAdding(true); setForm(EMPTY_FORM); }}
            className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700"
          >
            + הוסף פריט
          </button>
          <Link href="/admin/upload" className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
            החלף רשימה
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {loading ? (
          <p className="text-center text-gray-400 py-16">טוען...</p>
        ) : books.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="mb-4">אין פריטים לשכבה זו</p>
            <Link href="/admin/upload" className="text-indigo-500 hover:underline">העלה רשימה →</Link>
          </div>
        ) : (
          Object.entries(grouped).map(([subject, subBooks]) => (
            <div key={subject} className="mb-6">
              <h2 className="font-bold text-gray-700 mb-2 px-1">{subject}</h2>
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["כותרת / תיאור", "הוצאה", "חובה", ""].map((h) => (
                        <th key={h} className="text-right p-2 border-b font-medium text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subBooks.map((book) => (
                      <tr key={book.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="font-medium">{book.title}</div>
                          {book.notes && <div className="text-xs text-gray-400 truncate max-w-xs">{book.notes.split("\n")[0]}</div>}
                        </td>
                        <td className="p-2 text-gray-600 text-xs">{book.publisher}</td>
                        <td className="p-2 text-center">{book.mandatory ? "✓" : "—"}</td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <button onClick={() => setEditing({ ...book })} className="text-indigo-500 hover:text-indigo-700 text-xs">✏️</button>
                            <button onClick={() => deleteBook(book.id)} className="text-red-400 hover:text-red-600 text-xs">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Modal עריכה */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">עריכת פריט</h3>
            <FormFields
              data={{ subject: editing.subject, title: editing.title, author: editing.author, publisher: editing.publisher, notes: editing.notes ?? "", level: editing.level ?? "", mandatory: editing.mandatory }}
              onChange={(d) => setEditing({ ...editing, ...d })}
            />
            <div className="flex gap-3 mt-5">
              <button onClick={saveEdit} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium">שמור</button>
              <button onClick={() => setEditing(null)} className="px-4 border border-gray-300 rounded-lg hover:bg-gray-50">ביטול</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal הוספה */}
      {adding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">הוספת פריט חדש</h3>
            <FormFields data={form} onChange={setForm} />
            <div className="flex gap-3 mt-5">
              <button onClick={saveNew} disabled={!form.subject || !form.title} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50">
                + הוסף
              </button>
              <button onClick={() => setAdding(false)} className="px-4 border border-gray-300 rounded-lg hover:bg-gray-50">ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
