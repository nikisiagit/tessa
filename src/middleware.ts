import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 1. Force HTTPS in production
    if (
        process.env.NODE_ENV === 'production' &&
        request.headers.get('x-forwarded-proto') !== 'https' &&
        request.nextUrl.protocol === 'http:' &&
        !request.nextUrl.hostname.includes('localhost')
    ) {
        const httpsUrl = request.nextUrl.clone();
        httpsUrl.protocol = 'https:';
        return NextResponse.redirect(httpsUrl, 301);
    }

    // 2. Auth checks
    const isAuth = request.cookies.has('tessa-auth');
    const isLoginPage = request.nextUrl.pathname === '/login';

    if (!isAuth && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isAuth && isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
