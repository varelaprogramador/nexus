import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in", "sign-up"]);

export default clerkMiddleware(async (auth, req) => {
  // Any route that is NOT in isPublicRoute will be protected
  if (!isPublicRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files unless explicitly requested
    "/((?!_next|[^?]*\\.(?:html?|css|js(?:on)?|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
