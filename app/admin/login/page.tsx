interface Props {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { error, callbackUrl } = await searchParams;
  const redirectTo = callbackUrl ?? "/admin";
  const googleSignInUrl = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(redirectTo)}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
        <div className="text-4xl mb-4">📚</div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">ממשק ניהול</h1>
        <p className="text-sm text-gray-500 mb-6">רשימות ספרים – גלילי</p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error === "AccessDenied"
              ? "כתובת האימייל אינה מורשית לגשת לממשק הניהול."
              : "שגיאה בכניסה. נסה שוב."}
          </div>
        )}

        <a
          href={googleSignInUrl}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z" />
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.76-2.7.76-2.08 0-3.84-1.4-4.47-3.29H1.87v2.07A8 8 0 0 0 8.98 17Z" />
            <path fill="#FBBC05" d="M4.51 10.52A4.8 4.8 0 0 1 4.26 9c0-.53.09-1.04.25-1.52V5.41H1.87A8 8 0 0 0 .98 9c0 1.29.31 2.51.89 3.59l2.64-2.07Z" />
            <path fill="#EA4335" d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 8.98 1a8 8 0 0 0-7.11 4.41l2.64 2.07c.63-1.89 2.39-3.9 4.47-3.9Z" />
          </svg>
          כניסה עם Google
        </a>

        <p className="mt-6 text-xs text-gray-400">
          הגישה מוגבלת לצוות בית הספר בלבד
        </p>
      </div>
    </div>
  );
}
