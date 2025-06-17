import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/courses/:path*",
    "/teachers/:path*",
    "/rooms/:path*",
    "/time-slots/:path*",
    "/routines/:path*",
    "/reports/:path*",
  ],
}; 