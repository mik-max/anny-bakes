import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Only admin and sign-in routes run through Clerk — the storefront stays untouched.
export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) await auth.protect();
}, { signInUrl: "/sign-in" });

export const config = {
  matcher: ["/admin/:path*", "/sign-in/:path*"],
};
