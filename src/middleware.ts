import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  const isProtected = path.startsWith('/home') ||
    path.startsWith('/workout') ||
    path.startsWith('/exercises') ||
    path.startsWith('/programs') ||
    path.startsWith('/progress') ||
    path.startsWith('/coach') ||
    path.startsWith('/profile')

  const isAuthPage = path.startsWith('/login') || path.startsWith('/onboarding')

  // NextAuth v5 stores session token in these cookies
  const sessionToken =
    req.cookies.get('next-auth.session-token')?.value ??
    req.cookies.get('__Secure-next-auth.session-token')?.value

  const isLoggedIn = !!sessionToken

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/home', req.url))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|icons|manifest.json|favicon.ico).*)'],
}
