import { NextResponse } from 'next/server';

// Read role from JWT cookie "token" (no verify, routing only)
function readRoleFromCookie(req) {
    try {
        const token = req.cookies.get('token')?.value || '';
        if (!token) return '';
        const base64 = token.split('.')[1];
        const json = JSON.parse(Buffer.from(base64.replace(/-/g,'+').replace(/_/g,'/'), 'base64').toString('utf8'));
        return json?.role || '';
    } catch {
        return '';
    }
}

export function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = readRoleFromCookie(req);

    const isPublic =
        pathname === '/' ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.startsWith('/api/auth/login') ||
        pathname.startsWith('/api/auth/logout') ||
        pathname.startsWith('/api/auth/me');

    // Not logged in → only allow public
    if (!role && !isPublic) {
        const url = req.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    // Page-level routing by role
    if (pathname.startsWith('/admin') && role !== 'institute_admin') {
        const url = req.nextUrl.clone();
        url.pathname = role === 'teacher' ? '/teacher' : role === 'student' ? '/student' : '/';
        return NextResponse.redirect(url);
    }
    if (pathname.startsWith('/teacher') && role !== 'teacher') {
        const url = req.nextUrl.clone();
        url.pathname = role === 'institute_admin' ? '/admin' : role === 'student' ? '/student' : '/';
        return NextResponse.redirect(url);
    }
    if (pathname.startsWith('/student') && role !== 'student') {
        const url = req.nextUrl.clone();
        url.pathname = role === 'institute_admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/teacher/:path*', '/student/:path*', '/'],
};
