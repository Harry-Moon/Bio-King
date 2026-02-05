import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Routes qui ne nécessitent pas d'authentification
  const publicPaths = ['/login', '/signup'];
  const apiPaths = ['/api/']; // Toutes les routes API sont gérées en interne

  const isPublicPath = publicPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  const isApiPath = apiPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  // Les routes API sont gérées en interne (pas de middleware auth)
  if (isApiPath) {
    return res;
  }

  // Si page publique, laisser passer
  if (isPublicPath) {
    // Si déjà connecté sur /login ou /signup, rediriger vers dashboard
    if (
      session &&
      (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return res;
  }

  // Si pas de session sur page privée, rediriger vers login
  if (!session) {
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
