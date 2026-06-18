import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Fetch CSRF token server-side for the sign-out form (no client JS needed)
  let csrfToken = "";
  if (session) {
    try {
      const url = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
      const res = await fetch(`${url}/api/auth/csrf`);
      const data = await res.json();
      csrfToken = data.csrfToken ?? "";
    } catch {}
  }

  return (
    <div>
      {session && (
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between print:hidden">
          <span className="text-xs text-gray-400">ממשק ניהול</span>
          <div className="flex items-center gap-3">
            {session.user?.email && (
              <span className="text-xs text-gray-500 hidden sm:block">{session.user.email}</span>
            )}
            <form method="POST" action="/api/auth/signout">
              <input type="hidden" name="csrfToken" value={csrfToken} />
              <input type="hidden" name="callbackUrl" value="/admin/login" />
              <button
                type="submit"
                className="text-xs text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                יציאה
              </button>
            </form>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
