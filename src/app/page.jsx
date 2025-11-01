'use client';
import { useState } from 'react';
import axios from 'axios';

export default function Home() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post('/api/auth/login', { email, password });

            // Store token so middleware & APIs can see it
            localStorage.setItem('token', data.token);
            try { document.cookie = `token=${data.token}; Path=/; SameSite=Lax`; } catch {}

            const role = data.user.role;
            if (role === 'institute_admin') window.location.href = '/admin';
            else if (role === 'teacher') window.location.href = '/teacher';
            else window.location.href = '/student';
        } catch (e) {
            alert('❌ Login failed! Please check your email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid place-items-center p-4">
            <div className="glass w-full max-w-md rounded-3xl p-8 space-y-6">
                <h1 className="text-3xl font-bold">Super easy school attendance system</h1>
                <p className="opacity-80 text-sm">
                    Please sign in with your email and password to continue.
                </p>
                <form onSubmit={onSubmit} className="space-y-4">
                    <input
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                    />
                    <button className="btn btn-primary w-full" disabled={loading} type="submit">
                        {loading ? 'Loading...' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
}
