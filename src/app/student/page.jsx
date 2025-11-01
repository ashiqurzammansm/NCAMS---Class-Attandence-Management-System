'use client';
import Shell from '@/components/Shell';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { getRole } from '@/lib/clientAuth';

export default function StudentPage() {
    const [allowed, setAllowed] = useState(false);
    const [me, setMe] = useState(null);

    const [semester, setSemester] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
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

            // initial load for default semester
            const res = await fetch('/api/student-attendance/me').then(r => r.json());
            if (res?.semester) setSemester(res.semester);
            setSummary(res);
        })();
    }, [allowed]);

    const refresh = async () => {
        const qs = new URLSearchParams();
        if (semester) qs.set('semester', semester);
        const res = await fetch('/api/student-attendance/me?' + qs.toString()).then(r => r.json());
        setSummary(res);
    };

    const exportCsv = () => {
        const qs = new URLSearchParams();
        if (semester) qs.set('semester', semester);
        if (dateFrom) qs.set('dateFrom', dateFrom);
        if (dateTo) qs.set('dateTo', dateTo);
        window.location.href = '/api/student-attendance/me/export?' + qs.toString();
    };

    const printPage = () => window.print();

    useEffect(() => { if (allowed && semester) refresh(); }, [semester]); // eslint-disable-line

    if (!allowed) return null;

    return (
        <Shell>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold">Student Dashboard</h1>
                    <p className="opacity-80">Welcome{me?.name ? `, ${me.name}` : ''}!</p>
                </div>

                <div className="card space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
                        <div className="flex items-center gap-2">
                            <label className="opacity-80 text-sm">Semester</label>
                            <select value={semester} onChange={e => setSemester(e.target.value)} className="px-3 py-2 rounded-xl bg-white/10">
                                <option value={semester || ''}>{semester || 'Select semester'}</option>
                                <option>Fall-2025</option><option>Spring-2026</option><option>Summer-2026</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="opacity-80 text-sm">From</label>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 rounded-xl bg-white/10" />
                            <label className="opacity-80 text-sm">To</label>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 rounded-xl bg-white/10" />
                            <button className="btn" onClick={exportCsv}>Export CSV</button>
                            <button className="btn btn-primary" onClick={printPage}>Print</button>
                        </div>
                    </div>

                    {summary ? (
                        <>
                            <div className="opacity-90">
                                {summary.semester} — Total: {summary.total}, Present: {summary.present}, Late: {summary.late}, Excused: {summary.excused}, Absent: {summary.absent} — Overall: <b>{summary.percent}%</b>
                            </div>
                            <ul className="mt-2 space-y-1 opacity-90 max-h-96 overflow-auto pr-2 print:max-h-none">
                                {summary.rows?.filter(r => {
                                    // client-side date filter for the list (export uses server filter)
                                    if (dateFrom && r.date < dateFrom) return false;
                                    if (dateTo && r.date > dateTo) return false;
                                    return true;
                                }).map((r, i) => (
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
