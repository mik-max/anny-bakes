import "server-only";
import { auth } from "@clerk/nextjs/server";

/**
 * Throws unless the request comes from a signed-in admin.
 * Sign-up is invite-only, so every Clerk user is an admin.
 */
export async function requireAdmin(): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
}
