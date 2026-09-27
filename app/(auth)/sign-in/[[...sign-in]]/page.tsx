import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAF6F0] px-6">
      <div className="mb-8 text-center">
        <p className="mb-1 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
          Admin Access
        </p>
        <h1 className="font-sans text-3xl font-semibold text-stone-900">Anny Bakes</h1>
      </div>

      {/* Sign-up is invite-only (Clerk "Restricted" mode), so no sign-up link */}
      <SignIn fallbackRedirectUrl="/admin" withSignUp={false} />
    </main>
  );
}
