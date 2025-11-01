'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import axios from 'axios';
import { getRole } from '@/lib/clientAuth';

export default function AdminPage() {
    const [allowed, setAllowed] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));

    const [tName, setTName] = useState('');
    const [tEmail, setTEmail] = useState('');
    const [tPass, setTPass] = useState('');

    // export filters
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        const r = getRole();
        if (r === 'institute_admin') setAllowed(true);
        else window.location.href = '/';
    }, []);

    useEffect(() => {
        if (!allowed) return;
        const t = localStorage.getItem('token');
        if (t) axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
        (async () => {
            const { data: list } = await axios.get('/api/teachers');
            setTeachers(list.map(t => ({ id: t._id, name: t.name, email: t.email })));
        })();
    }, [allowed]);

    const mark = (id, status) => setTeachers(r => r.map(t => (t.id === id ? { ...t, status } : t)));
    const markAll = (s) => setTeachers(r => r.map(t => ({ ...t, status: s })));

    const save = async () => {
        if (!date) return alert('Pick a date first!');
        try {
            await axios.post('/api/attendance/teachers', {
                date,
                rows: teachers.map(t => ({ teacherId: t.id, status: t.status || 'absent' })),
            });
            alert('Saved!');
        } catch (e) {
            if (e?.response?.status === 409) {
                alert(`Duplicate for ${date}: ${e.response.data.duplicates.join(', ')}`);
            } else {
                alert('Error saving.');
            }
        }
    };

    const createTeacher = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/users/teachers', { name: tName, email: tEmail, password: tPass });
            setTName(''); setTEmail(''); setTPass('');
            const { data: list } = await axios.get('/api/teachers');
            setTeachers(list.map(t => ({ id: t._id, name: t.name, email: t.email })));
            alert('Teacher created!');
        } catch { alert('Create teacher failed.'); }
    };

    const exportTeachersCsv = () => {
        const qs = new URLSearchParams();
        if (dateFrom) qs.set('dateFrom', dateFrom);
        if (dateTo) qs.set('dateTo', dateTo);
        window.location.href = '/api/attendance/teachers/export?' + qs.toString();
    };

    const printPage = () => window.print();

    if (!allowed) return null;

    return (
        <Shell>
            <div className="space-y-8">
                <div><h1 className="text-3xl md:text-4xl font-bold">Admin • Teachers & Attendance</h1></div>

                <div className="card space-y-4">
                    <h2 className="text-xl font-semibold">Create Teacher User</h2>
                    <form onSubmit={createTeacher} className="grid md:grid-cols-4 gap-3">
                        <input placeholder="Name" value={tName} onChange={e => setTName(e.target.value)} />
                        <input placeholder="Email" value={tEmail} onChange={e => setTEmail(e.target.value)} />
                        <input type="password" placeholder="Password" value={tPass} onChange={e => setTPass(e.target.value)} />
                        <button className="btn btn-primary" type="submit">Create</button>
                    </form>
                </div>

                <div className="card space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Take Teachers’ Attendance</h2>
                        <div className="flex items-center gap-2">
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 rounded-xl bg-white/10" />
                            <button className="btn" onClick={() => markAll('present')}>All Present</button>
                            <button className="btn" onClick={() => markAll('absent')}>All Absent</button>
                            <button className="btn btn-primary" onClick={save}>Save</button>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        {teachers.map(t => (
                            <div key={t.id} className="flex items-center justify-between glass rounded-2xl px-4 py-3">
                                <div>
                                    <div className="font-medium">{t.name}</div>
                                    <div className="opacity-70 text-sm">{t.email}</div>
                                </div>
                                <div className="space-x-2">
                                    {['present','late','excused','absent'].map(st => (
                                        <button key={st} onClick={() => mark(t.id, st)} className={`btn ${t.status===st?'btn-primary':'bg-white/10'}`}>{st}</button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Export & Print */}
                <div className="card space-y-3">
                    <div className="flex items-center gap-2">
                        <label className="opacity-80 text-sm">From</label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 rounded-xl bg-white/10" />
                        <label className="opacity-80 text-sm">To</label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 rounded-xl bg-white/10" />
                        <button className="btn" onClick={exportTeachersCsv}>Export Teachers CSV</button>
                        <button className="btn btn-primary" onClick={printPage}>Print</button>
                    </div>
                </div>
            </div>
        </Shell>
    );
}
