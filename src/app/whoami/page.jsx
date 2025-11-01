'use client';
import { useEffect, useState } from 'react';

export default function WhoAmI() {
    const [serverView, setServerView] = useState(null);
    const [headerView, setHeaderView] = useState(null);

    useEffect(() => {
        // 1) Server sees cookie (normal case)
        fetch('/api/auth/me')
            .then(r => r.json())
            .then(setServerView)
            .catch(() => setServerView({ ok:false, error:'fetch failed' }));

        // 2) Also test Authorization header using localStorage token
        try {
            const t = localStorage.getItem('token') || '';
            fetch('/api/auth/me', { headers: { Authorization: `Bearer ${t}` } })
                .then(r => r.json())
                .then(setHeaderView)
                .catch(() => setHeaderView({ ok:false, error:'fetch failed' }));
        } catch {
            setHeaderView({ ok:false, error:'no localStorage' });
        }
    }, []);

    return (
        <div className="min-h-screen grid place-items-center p-6">
            <div className="glass w-full max-w-2xl rounded-3xl p-8 space-y-6">
                <h1 className="text-2xl font-bold">Who am I?</h1>
                <div>
                    <div className="text-sm opacity-80">Server (cookie):</div>
                    <pre className="bg-black/30 p-3 rounded-xl overflow-auto text-sm">
            {JSON.stringify(serverView, null, 2)}
          </pre>
                </div>
                <div>
                    <div className="text-sm opacity-80">Server (Authorization header):</div>
                    <pre className="bg-black/30 p-3 rounded-xl overflow-auto text-sm">
            {JSON.stringify(headerView, null, 2)}
          </pre>
                </div>
            </div>
        </div>
    );
}
