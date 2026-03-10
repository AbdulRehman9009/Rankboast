import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";

export const middleware = withAuth(
  function middleware(req: NextRequest) {
    return;
  },
  {
    callbacks: {
      authorized({ token, req }) {
        // This is called for every request on protected routes
        // If token exists, the user is authenticated

        // Check if the route is protected
        const protectedPaths = ["/dashboard", "/competitors", "/audit"];
        const isProtectedPath = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path));

        if (isProtectedPath) {
          return !!token; 
        }

        return true; 
      },
    },
    pages: {
      signIn: "/auth/signin",
      error: "/auth/signin",
    },
  }
);


export const config = {
  matcher: [
    "/dashboard/:path*",
    "/competitors/:path*",
    "/audit/:path*",
    "/api/protected/:path*",
  ],
};
