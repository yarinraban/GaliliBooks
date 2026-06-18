import GoogleSignInButton from "./GoogleSignInButton";

interface Props {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { error, callbackUrl } = await searchParams;
  const redirectTo = callbackUrl ?? "/admin";

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

        <GoogleSignInButton callbackUrl={redirectTo} />

        <p className="mt-6 text-xs text-gray-400">
          הגישה מוגבלת לצוות בית הספר בלבד
        </p>
      </div>
    </div>
  );
}
