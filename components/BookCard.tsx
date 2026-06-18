"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface Book {
  id: number;
  title: string;
  author: string;
  publisher: string;
  subject: string;
  isbn?: string | null;
  coverUrl?: string | null;
  notes?: string | null;
  level?: string | null;
  mandatory: boolean;
}

interface BookCardProps {
  book: Book;
  storageKey: string;
}

type Status = "none" | "bought" | "skip";

function getStatus(storageKey: string, bookId: number): Status {
  if (typeof window === "undefined") return "none";
  const data = localStorage.getItem(storageKey);
  const store: Record<number, Status> = data ? JSON.parse(data) : {};
  return store[bookId] ?? "none";
}

function setStatus(storageKey: string, bookId: number, status: Status) {
  const data = localStorage.getItem(storageKey);
  const store: Record<number, Status> = data ? JSON.parse(data) : {};
  if (status === "none") {
    delete store[bookId];
  } else {
    store[bookId] = status;
  }
  localStorage.setItem(storageKey, JSON.stringify(store));
}

export default function BookCard({ book, storageKey }: BookCardProps) {
  const [status, setStatusState] = useState<Status>("none");
  const [expanded, setExpanded] = useState(false);

  const notesLines = book.notes ? book.notes.split("\n") : [];
  const notesPreview = notesLines.slice(0, 3).join("\n");
  const notesHasMore = notesLines.length > 3;

  useEffect(() => {
    setStatusState(getStatus(storageKey, book.id));
  }, [book.id, storageKey]);

  function toggle(next: Status) {
    const newStatus = status === next ? "none" : next;
    setStatus(storageKey, book.id, newStatus);
    setStatusState(newStatus);
  }

  const borderColor =
    status === "bought"
      ? "border-green-400 bg-green-50"
      : status === "skip"
      ? "border-gray-300 bg-gray-50 opacity-70"
      : "border-gray-200 bg-white";

  return (
    <div
      className={`relative rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-md print:shadow-none print:border-gray-300 ${borderColor}`}
    >
      {/* Badge חובה/רשות */}
      <span
        className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${
          book.mandatory ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
        }`}
      >
        {book.mandatory ? "חובה" : "רשות"}
      </span>

      <div className="flex gap-3 p-4">
        {/* תמונת שער */}
        <div className="flex-shrink-0 hidden sm:block">
          {book.coverUrl ? (
            <Image src={book.coverUrl} alt={book.title} width={56} height={78} className="rounded object-cover" />
          ) : (
            <div className="w-14 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded flex items-center justify-center text-indigo-300">
              <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM8 13h8v1H8v-1zm0 3h6v1H8v-1z" />
              </svg>
            </div>
          )}
        </div>

        {/* פרטים */}
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <p className="text-xs text-indigo-600 font-semibold">{book.subject}</p>
            {book.level && (
              <span className="text-xs bg-indigo-50 text-indigo-500 border border-indigo-200 px-1.5 py-0.5 rounded-full font-medium">
                {book.level}
              </span>
            )}
          </div>
          <h3 className={`font-bold text-sm leading-tight mb-1 ${status === "skip" ? "line-through text-gray-400" : "text-gray-900"}`}>
            {book.title}
          </h3>
          {book.author && <p className="text-xs text-gray-600">{book.author}</p>}
          {book.publisher && <p className="text-xs text-gray-500 mb-1">{book.publisher}</p>}

          {notesLines.length > 0 && (
            <div className="mt-1">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed bg-amber-50 border border-amber-100 rounded px-2 py-1.5">
                {expanded || !notesHasMore ? book.notes : notesPreview + "..."}
              </pre>
              {notesHasMore && (
                <button onClick={() => setExpanded(!expanded)} className="mt-1 text-xs text-indigo-500 hover:text-indigo-700 print:hidden">
                  {expanded ? "▲ פחות" : "▼ קרא עוד"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* כפתורי סטטוס */}
        <div className="flex flex-col gap-2 items-center pt-1 print:hidden">
          <button
            onClick={() => toggle("bought")}
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all text-sm font-bold ${
              status === "bought"
                ? "bg-green-500 border-green-500 text-white shadow-md"
                : "border-gray-300 text-gray-300 hover:border-green-400 hover:text-green-400"
            }`}
            title="קניתי"
          >
            ✓
          </button>
          <button
            onClick={() => toggle("skip")}
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all text-xs font-bold leading-tight text-center ${
              status === "skip"
                ? "bg-gray-400 border-gray-400 text-white shadow-md"
                : "border-gray-300 text-gray-300 hover:border-gray-400 hover:text-gray-400"
            }`}
            title="לא צריך"
          >
            ✕
          </button>
          <span className="text-[9px] text-gray-400 text-center leading-tight">
            {status === "bought" ? "קניתי" : status === "skip" ? "לא\nצריך" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
