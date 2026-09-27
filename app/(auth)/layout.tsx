import { ClerkProvider } from "@clerk/nextjs";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider signInUrl="/sign-in">{children}</ClerkProvider>;
}
