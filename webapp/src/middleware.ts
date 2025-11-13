import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function middleware(req: NextRequest) {
  try {
    const authCookies = await cookies();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/authenticate`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          cookie: authCookies.toString(),
        },
      },
    );

    if (!res.ok) {
      console.warn(
        "Authentication failed:",
        res.status,
        res.statusText,
        authCookies,
      );
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware authentication failed:", error);
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
}

export const config = {
  matcher: ["/documents/:path*", "/templates", "/inbox"],
};
