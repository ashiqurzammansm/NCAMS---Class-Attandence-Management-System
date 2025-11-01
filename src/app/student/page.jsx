'use client';
import Shell from '@/components/Shell';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { getRole } from '@/lib/clientAuth';

export default function StudentPage() {
    const [allowed, setAllowed] = useState(false);
    const [me, setMe] = useState(null);
    const [semester, setSemester] = useState(''); // auto-filled after load
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        const r = getRole();
        if (r === 'student') setAllowed(true);
        else if (r === 'institute_admin') window.location.replace('/admin');
        else if (r === 'teacher') window.location.replace('/teacher');
        else window.location.replace('/');
    }, []);

    useEffect(() => {
        if (!allowed) return;
        const t = localStorage.getItem('token');
        if (t) axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
        (async () => {
            const meRes = await fetch('/api/auth/me').then(r => r.json());
            if (meRes?.ok) setMe(meRes.user);

            // first call w/out query to get default semester from API
            const res = await fetch('/api/student-attendance/me').then(r => r.json());
            if (res?.semester) setSemester(res.semester);
            setSummary(res);
        })();
    }, [allowed]);

    useEffect(() => {
        if (!allowed || !semester) return;
        (async () => {
            const res = await fetch(`/api/student-attendance/me?semester=${encodeURIComponent(semester)}`).then(r => r.json());
            setSummary(res);
        })();
    }, [semester, allowed]);

    if (!allowed) return null;

    return (
        <Shell>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold">Student Dashboard</h1>
                    <p className="opacity-80">Welcome{me?.name ? `, ${me.name}` : ''}!</p>
                </div>

                <div className="card space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">My Attendance (Semester)</h2>
                        <select value={semester} onChange={e => setSemester(e.target.value)} className="px-3 py-2 rounded-xl bg-white/10">
                            {/* common semester names; API filters by whatever you select */}
                            <option value={semester || ''}>{semester || 'Select semester'}</option>
                            <option>Fall-2025</option><option>Spring-2026</option><option>Summer-2026</option>
                        </select>
                    </div>

                    {summary ? (
                        <>
                            <div className="opacity-90">
                                {summary.semester} — Total: {summary.total}, Present: {summary.present}, Late: {summary.late}, Excused: {summary.excused}, Absent: {summary.absent} — Overall: <b>{summary.percent}%</b>
                            </div>
                            <ul className="mt-2 space-y-1 opacity-90 max-h-64 overflow-auto pr-2">
                                {summary.rows?.slice(0, 60).map((r, i) => (
                                    <li key={i}>{r.date} — <b>{r.status}</b></li>
                                ))}
                            </ul>
                        </>
                    ) : <div className="opacity-70">No records.</div>}
                </div>
            </div>
        </Shell>
    );
}
