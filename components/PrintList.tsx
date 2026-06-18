"use client";

type Status = "none" | "bought" | "skip";

interface Book {
  id: number;
  title: string;
  author: string;
  publisher: string;
  subject: string;
  notes?: string | null;
  level?: string | null;
  mandatory: boolean;
}

interface PrintListProps {
  books: Book[];
  grade: string;
  hebrewYear: string;
  storageKey: string;
}

const GRADE_LABELS: Record<string, string> = {
  "10": "שכבה י׳",
  "11": 'שכבה י״א',
  "12": 'שכבה י״ב',
};

export default function PrintList({ books, grade, hebrewYear, storageKey }: PrintListProps) {
  function getStore(): Record<number, Status> {
    if (typeof window === "undefined") return {};
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : {};
  }

  function handlePrint() {
    window.print();
  }

  const grouped = books.reduce<Record<string, Book[]>>((acc, b) => {
    if (!acc[b.subject]) acc[b.subject] = [];
    acc[b.subject].push(b);
    return acc;
  }, {});

  const store = getStore();

  return (
    <>
      <button
        onClick={handlePrint}
        className="print:hidden fixed bottom-6 left-6 bg-indigo-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-indigo-700 font-bold text-sm z-50 flex items-center gap-2"
      >
        🖨️ הדפס רשימה
      </button>

      <div className="hidden print:block p-8 font-sans" dir="rtl">
        <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
          <h1 className="text-2xl font-bold">רשימת ספרים – {GRADE_LABELS[grade] ?? `שכבה ${grade}`}</h1>
          <p className="text-gray-600 mt-1">שנת לימודים {hebrewYear}</p>
        </div>

        {Object.entries(grouped).map(([subject, subBooks]) => (
          <div key={subject} className="mb-6">
            <h2 className="text-lg font-bold border-b border-gray-400 mb-2 pb-1">{subject}</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-right p-1 border border-gray-300 w-8">סטטוס</th>
                  <th className="text-right p-1 border border-gray-300 w-20">רמה</th>
                  <th className="text-right p-1 border border-gray-300">ספר / הנחיות</th>
                  <th className="text-right p-1 border border-gray-300 w-12">חובה</th>
                </tr>
              </thead>
              <tbody>
                {subBooks.map((book) => {
                  const s = store[book.id] ?? "none";
                  return (
                    <tr key={book.id} className={s === "skip" ? "bg-gray-100 text-gray-400" : s === "bought" ? "bg-green-50" : ""}>
                      <td className="border border-gray-300 p-1 text-center text-base">
                        {s === "bought" ? "✓" : s === "skip" ? "✕" : "□"}
                      </td>
                      <td className="border border-gray-300 p-1 text-xs text-center">{book.level ?? ""}</td>
                      <td className="border border-gray-300 p-1">
                        {book.notes && (
                          <pre className={`text-xs whitespace-pre-wrap font-sans ${s === "skip" ? "line-through text-gray-400" : "text-gray-700"}`}>{book.notes}</pre>
                        )}
                      </td>
                      <td className="border border-gray-300 p-1 text-center text-xs">
                        {book.mandatory ? "חובה" : "רשות"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

        <p className="text-xs text-gray-400 text-center mt-8">הודפס מאתר רשימות הספרים</p>
      </div>
    </>
  );
}
