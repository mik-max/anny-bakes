"use client";

import { useState } from "react";
import { signIn } from "./actions";

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF6F0] px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="mb-1 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            Admin Access
          </p>
          <h1 className="font-sans text-3xl font-semibold text-stone-900">Anny Bakes</h1>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-8 shadow-sm space-y-5">
          <div className="space-y-1.5">
            <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-stone-500">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              placeholder="Enter admin password"
              className="w-full rounded-lg border border-stone-200 px-4 py-3 font-sans text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/20 transition"
            />
          </div>

          {error && (
            <p className="font-sans text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-stone-900 py-3.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-stone-700 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
