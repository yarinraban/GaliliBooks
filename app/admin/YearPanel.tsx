"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  activeYear: number;
  hebrewYear: string;
  nextYear: number;
  nextHebrewYear: string;
}

export default function AdminYearPanel({ activeYear, hebrewYear, nextYear, nextHebrewYear }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function advanceYear() {
    setLoading(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activeYear: String(nextYear) }),
    });
    setLoading(false);
    setConfirming(false);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <h2 className="font-bold text-gray-800 mb-1">ניהול שנת לימודים</h2>
      <p className="text-sm text-gray-500 mb-4">
        שנה פעילה כעת: <strong className="text-indigo-700">{hebrewYear}</strong> ({activeYear})
      </p>

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="bg-amber-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-amber-600 text-sm"
        >
          🗄️ ארכב שנה נוכחית ועבור ל-{nextHebrewYear}
        </button>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-800 mb-3">
            האתר יעבור להציג ספרים של <strong>{nextHebrewYear}</strong> ({nextYear}).
            הרשימות של {hebrewYear} יישמרו בארכיון ויהיו נגישות דרך ממשק הניהול.
          </p>
          <div className="flex gap-3">
            <button
              onClick={advanceYear}
              disabled={loading}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
            >
              {loading ? "מעדכן..." : `✓ אישור – עבור ל-${nextHebrewYear}`}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3">
        לאחר המעבר, העלה רשימות ספרים חדשות עבור {nextHebrewYear} דרך ״העלה רשימת ספרים״.
      </p>
    </div>
  );
}
