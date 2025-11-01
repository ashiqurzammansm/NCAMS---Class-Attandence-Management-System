'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import axios from 'axios';
import { getRole } from '@/lib/clientAuth';

export default function AdminPage() {
    const [allowed, setAllowed] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

    // create teacher
    const [tName, setTName] = useState('');
    const [tEmail, setTEmail] = useState('');
    const [tPass, setTPass] = useState('');
    const [tFacultyId, setTFacultyId] = useState(''); // will be suggested

    // export filters
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        const r = getRole();
        if (r === 'institute_admin') setAllowed(true);
        else window.location.href = '/';
    }, []);

    const authAxios = () => {
        const t = localStorage.getItem('token');
        if (t) axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    };

    const loadTeachers = async () => {
        authAxios();
        const { data: list } = await axios.get('/api/teachers');
        setTeachers(
            list.map((t) => ({ id: t._id, name: t.name, email: t.email, facultyId: t.facultyId || '' }))
        );
    };

    useEffect(() => {
        if (!allowed) return;
        authAxios();
        loadTeachers();
    }, [allowed]);

    const mark = (id, status) => setTeachers((r) => r.map((t) => (t.id === id ? { ...t, status } : t)));
    const markAll = (s) => setTeachers((r) => r.map((t) => ({ ...t, status: s })));

    const save = async () => {
        if (!date) return alert('Pick a date first!');
        try {
            authAxios();
            await axios.post('/api/attendance/teachers', {
                date,
                rows: teachers.map((t) => ({ teacherId: t.id, status: t.status || 'absent' })),
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

    const suggestFacultyId = async () => {
        try {
            authAxios();
            const { data } = await axios.get('/api/users/teachers/next-faculty-id');
            if (data?.ok && data?.next) setTFacultyId(data.next);
            else alert(data?.message || 'Could not suggest ID. Try again.');
        } catch {
            alert('Suggestion failed.');
        }
    };

    const createTeacher = async (e) => {
        e.preventDefault();
        try {
            authAxios();
            await axios.post('/api/users/teachers', {
                name: tName,
                email: tEmail,
                password: tPass,
                facultyId: tFacultyId,
            });
            setTName('');
            setTEmail('');
            setTPass('');
            setTFacultyId('');
            await loadTeachers();
            alert('Teacher created!');
        } catch (err) {
            const msg = err?.response?.data?.message || 'Create teacher failed.';
            alert(msg);
        }
    };

    const deleteTeacher = async (id) => {
        if (!confirm('Delete this teacher? This will also delete their attendance.')) return;
        try {
            authAxios();
            await axios.delete(`/api/users/teachers/${id}`);
            await loadTeachers();
            alert('Deleted.');
        } catch {
            alert('Delete failed.');
        }
    };

    const exportTeachersCsv = () => {
        const qs = new URLSearchParams();
        if (dateFrom) qs.set('dateFrom', dateFrom);
        if (dateTo) qs.set('dateTo', dateTo);
        window.location.href = '/api/attendance/teachers/export?' + qs.toString();
    };

    const printPage = () => window.print();

    // Enforce FID format while typing (uppercase + pattern hint)
    const onChangeFacultyId = (v) => {
        const up = (v || '').toUpperCase();
        setTFacultyId(up);
    };

    if (!allowed) return null;

    return (
        <Shell>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold">Admin • Teachers & Attendance</h1>
                </div>

                {/* Create Teacher with Faculty ID (suggested) */}
                <div className="card space-y-4">
                    <h2 className="text-xl font-semibold">Create Teacher User</h2>
                    <form onSubmit={createTeacher} className="grid md:grid-cols-6 gap-3">
                        <input placeholder="Name" value={tName} onChange={(e) => setTName(e.target.value)} />
                        <input placeholder="Email" value={tEmail} onChange={(e) => setTEmail(e.target.value)} />
                        <div className="flex gap-2 md:col-span-2">
                            <input
                                placeholder="Faculty ID (FID00001)"
                                value={tFacultyId}
                                onChange={(e) => onChangeFacultyId(e.target.value)}
                                className="flex-1"
                            />
                            <button className="btn" type="button" onClick={suggestFacultyId}>
                                Suggest ID
                            </button>
                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={tPass}
                            onChange={(e) => setTPass(e.target.value)}
                        />
                        <button className="btn btn-primary" type="submit">
                            Create
                        </button>
                    </form>
                    <p className="text-xs opacity-70">
                        Faculty ID must match <b>FID00001</b> pattern. Use <i>Suggest ID</i> to auto-fill the next
                        available one.
                    </p>
                </div>

                {/* Take Teachers’ Attendance */}
                <div className="card space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Take Teachers’ Attendance</h2>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="px-3 py-2 rounded-xl bg-white/10"
                            />
                            <button className="btn" onClick={() => markAll('present')}>
                                All Present
                            </button>
                            <button className="btn" onClick={() => markAll('absent')}>
                                All Absent
                            </button>
                            <button className="btn btn-primary" onClick={save}>
                                Save
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        {teachers.map((t) => (
                            <div
                                key={t.id}
                                className="flex items-center justify-between glass rounded-2xl px-4 py-3"
                            >
                                <div>
                                    <div className="font-medium">{t.name}</div>
                                    <div className="opacity-70 text-sm">
                                        {t.email}
                                        {t.facultyId ? ` • ${t.facultyId}` : ''}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {['present', 'late', 'excused', 'absent'].map((st) => (
                                        <button
                                            key={st}
                                            onClick={() => mark(t.id, st)}
                                            className={`btn ${t.status === st ? 'btn-primary' : 'bg-white/10'}`}
                                        >
                                            {st}
                                        </button>
                                    ))}
                                    <button
                                        className="btn bg-red-600/80 hover:bg-red-600"
                                        onClick={() => deleteTeacher(t.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Export & Print */}
                <div className="card space-y-3">
                    <div className="flex items-center gap-2">
                        <label className="opacity-80 text-sm">From</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="px-3 py-2 rounded-xl bg-white/10"
                        />
                        <label className="opacity-80 text-sm">To</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="px-3 py-2 rounded-xl bg-white/10"
                        />
                        <button className="btn" onClick={exportTeachersCsv}>
                            Export Teachers CSV
                        </button>
                        <button className="btn btn-primary" onClick={printPage}>
                            Print
                        </button>
                    </div>
                </div>
            </div>
        </Shell>
    );
}
