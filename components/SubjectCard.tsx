"use client";

import { useState, useEffect, useCallback } from "react";

export interface Book {
  id: number;
  subject: string;
  title: string;
  author: string;
  publisher: string;
  notes?: string | null;
  level?: string | null;
  coverUrl?: string | null;
  mandatory: boolean;
}

export type Status = "none" | "bought" | "skip";

function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl leading-none hover:text-gray-300"
        aria-label="סגור"
      >
        ×
      </button>
    </div>
  );
}

export function getStatus(storageKey: string, bookId: number): Status {
  if (typeof window === "undefined") return "none";
  try {
    const store: Record<number, Status> = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    return store[bookId] ?? "none";
  } catch {
    return "none";
  }
}

export function setStatusInStorage(storageKey: string, bookId: number, status: Status) {
  try {
    const store: Record<number, Status> = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    if (status === "none") delete store[bookId];
    else store[bookId] = status;
    localStorage.setItem(storageKey, JSON.stringify(store));
  } catch {}
}

function BookRow({
  book,
  storageKey,
  onStatusChange,
}: {
  book: Book;
  storageKey: string;
  onStatusChange: () => void;
}) {
  const [status, setStatus] = useState<Status>("none");
  const [expanded, setExpanded] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const closeLightbox = useCallback(() => setLightbox(false), []);

  useEffect(() => {
    setStatus(getStatus(storageKey, book.id));
  }, [book.id, storageKey]);

  function toggle(next: Status) {
    const newStatus = status === next ? "none" : next;
    setStatusInStorage(storageKey, book.id, newStatus);
    setStatus(newStatus);
    onStatusChange();
  }

  const notes = book.notes ?? "";
  const lines = notes.split("\n").filter(Boolean);
  const preview = lines.slice(0, 3).join("\n");
  const hasMore = lines.length > 3;

  return (
    <div
      className={`flex gap-3 px-4 py-3 transition-colors ${
        status === "bought"
          ? "bg-green-50"
          : status === "skip"
          ? "bg-gray-50"
          : "bg-white"
      }`}
    >
      {/* תמונת שער */}
      {book.coverUrl && (
        <>
          {lightbox && <ImageLightbox src={book.coverUrl} alt={book.title} onClose={closeLightbox} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={book.coverUrl}
            alt={book.title}
            onClick={() => setLightbox(true)}
            className={`h-16 w-12 object-cover rounded border border-gray-200 shrink-0 self-start mt-0.5 cursor-pointer hover:opacity-80 transition-opacity ${status === "skip" ? "opacity-40" : ""}`}
          />
        </>
      )}

      {/* רמה + חובה/רשות */}
      <div className="flex flex-col gap-1 items-start shrink-0 w-24 pt-0.5">
        {book.level && (
          <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded-full font-medium leading-tight">
            {book.level}
          </span>
        )}
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            book.mandatory
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {book.mandatory ? "חובה" : "רשות"}
        </span>
      </div>

      {/* תוכן */}
      <div className={`flex-1 min-w-0 ${status === "skip" ? "opacity-50" : ""}`}>
        {notes ? (
          <>
            <pre
              className={`text-xs whitespace-pre-wrap font-sans leading-relaxed text-gray-700 ${
                status === "skip" ? "line-through" : ""
              }`}
            >
              {expanded || !hasMore ? notes : preview + "..."}
            </pre>
            {hasMore && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1 text-xs text-indigo-500 hover:text-indigo-700 print:hidden"
              >
                {expanded ? "▲ פחות" : "▼ קרא עוד"}
              </button>
            )}
          </>
        ) : (
          <span className="text-xs text-gray-400 italic">אין הנחיות</span>
        )}
        {book.publisher && (
          <p className="text-[11px] text-gray-400 mt-1">{book.publisher}</p>
        )}
      </div>

      {/* כפתורי סטטוס */}
      <div className="flex flex-col gap-1.5 items-center shrink-0 print:hidden">
        <button
          onClick={() => toggle("bought")}
          title="קניתי"
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
            status === "bought"
              ? "bg-green-500 border-green-500 text-white shadow"
              : "border-gray-300 text-gray-300 hover:border-green-400 hover:text-green-400"
          }`}
        >
          ✓
        </button>
        <button
          onClick={() => toggle("skip")}
          title="לא צריך"
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
            status === "skip"
              ? "bg-gray-400 border-gray-400 text-white shadow"
              : "border-gray-300 text-gray-300 hover:border-gray-400 hover:text-gray-400"
          }`}
        >
          ✕
        </button>
        <span className="text-[9px] text-gray-400 text-center leading-tight h-3">
          {status === "bought" ? "קניתי" : status === "skip" ? "לא צריך" : ""}
        </span>
      </div>
    </div>
  );
}

interface SubjectCardProps {
  subject: string;
  books: Book[];
  storageKey: string;
  onStatusChange: () => void;
}

export default function SubjectCard({
  subject,
  books,
  storageKey,
  onStatusChange,
}: SubjectCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print:shadow-none print:border-gray-300 print:break-inside-avoid">
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center gap-2">
        <h3 className="font-bold text-gray-800 text-sm">{subject}</h3>
        <span className="text-xs text-gray-400">
          {books.length > 1 ? `${books.length} פריטים` : ""}
        </span>
      </div>
      <div className="divide-y divide-gray-100">
        {books.map((book) => (
          <BookRow
            key={book.id}
            book={book}
            storageKey={storageKey}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
}
