'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// minimal role getter for nav
function getRole() {
    try {
        const t = localStorage.getItem('token') || '';
        if (!t) return '';
        const payload = JSON.parse(
            atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
        );
        return payload?.role || '';
    } catch {
        return '';
    }
}

function hasToken() {
    try { return !!localStorage.getItem('token'); } catch { return false; }
}

export default function Shell({ children }) {
    const [role, setRole] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setRole(getRole());
    }, []);

    const handleLogout = () => {
        try { localStorage.removeItem('token'); } catch {}
        window.location.assign('/');
    };

    const NavLinks = () => {
        if (role === 'institute_admin') return <Link className="block px-4 py-2 rounded-2xl hover:bg-white/10" href="/admin">Admin</Link>;
        if (role === 'teacher')         return <Link className="block px-4 py-2 rounded-2xl hover:bg-white/10" href="/teacher">Teacher</Link>;
        if (role === 'student')         return <Link className="block px-4 py-2 rounded-2xl hover:bg-white/10" href="/student">Student</Link>;
        return <Link className="block px-4 py-2 rounded-2xl hover:bg-white/10" href="/">Login</Link>;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-900 via-slate-900 to-black text-white">
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/20 border-b border-white/10">
                <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-white/10 grid place-items-center">A</div>
                        <div className="text-lg font-bold">AttendX</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <nav className="flex items-center gap-2 md:hidden">
                            <NavLinks />
                        </nav>
                        {isClient && hasToken() && (
                            <button onClick={handleLogout} className="btn btn-primary rounded-xl" title="Logout">
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex">
                <aside className="hidden md:flex w-64 h-[calc(100vh-64px)] sticky top-[64px] p-6">
                    <div className="glass w-full rounded-3xl p-6 space-y-6">
                        <div className="text-2xl font-bold">Menu</div>
                        <nav className="space-y-2">
                            <NavLinks />
                        </nav>
                        {isClient && hasToken() && (
                            <button onClick={handleLogout} className="btn btn-primary w-full">
                                Logout
                            </button>
                        )}
                    </div>
                </aside>

                <main className="flex-1 p-4 md:p-10">
                    <div className="glass rounded-3xl p-6 md:p-10">{children}</div>
                </main>
            </div>
        </div>
    );
}
