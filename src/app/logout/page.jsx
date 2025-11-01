'use client';
import { useEffect, useState } from 'react';

export default function LogoutPage() {
    const [done, setDone] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                // 1) tell server to clear the HttpOnly cookie
                await fetch('/api/auth/logout', { method: 'POST' });

                // 2) clear client-side storage
                try { localStorage.removeItem('token'); } catch {}
                try { document.cookie = 'token=; Path=/; Max-Age=0; SameSite=Lax'; } catch {}

                setDone(true);
                // 3) send back to login
                setTimeout(() => (window.location.href = '/'), 500);
            } catch {
                // even if it errors, still send to login
                window.location.href = '/';
            }
        })();
    }, []);

    return (
        <div className="min-h-screen grid place-items-center p-6">
            <div className="glass w-full max-w-md rounded-3xl p-8 space-y-3">
                <h1 className="text-2xl font-bold">Logging out…</h1>
                <p className="opacity-80">
                    {done ? 'All cleared! Redirecting…' : 'Please wait a moment.'}
                </p>
            </div>
        </div>
    );
}
