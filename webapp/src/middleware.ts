import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get('access_token')?.value

  console.log("intercepted")
  console.log(accessToken)

  if (!accessToken) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/documents/:path*', '/templates', '/inbox']
}

