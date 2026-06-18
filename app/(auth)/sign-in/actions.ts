"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData): Promise<{ error: string } | never> {
  const password = formData.get("password") as string;
  const expected = process.env.ADMIN_PASSWORD ?? "changeme";

  if (!password || password !== expected) {
    return { error: "Incorrect password. Please try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_session", expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  redirect("/admin");
}

export async function signOut(): Promise<never> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/sign-in");
}
