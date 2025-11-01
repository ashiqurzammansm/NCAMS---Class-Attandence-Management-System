'use client';
import Shell from '@/components/Shell';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { getRole } from '@/lib/clientAuth';

export default function TeacherPage() {
    const [allowed, setAllowed] = useState(false);

    // student taking
    const [roster, setRoster] = useState([]);
    const [date, setDate] = useState(() => new Date().toISOString().slice(0,10)); // YYYY-MM-DD
    const [semesterForExport, setSemesterForExport] = useState('');

    // self summary
    const [month, setMonth] = useState(() => new Date().toISOString().slice(0,7)); // YYYY-MM
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selfSummary, setSelfSummary] = useState(null);

    // create student
    const [sName, setSName] = useState('');
    const [sEmail, setSEmail] = useState('');
    const [sPass, setSPass] = useState('');
    const [sId, setSId] = useState(''); // will be suggested
    const [sSem, setSSem] = useState('Fall-2025');

    useEffect(() => {
        const r = getRole();
        if (r === 'teacher') setAllowed(true);
        else if (r === 'institute_admin') window.location.replace('/admin');
        else if (r === 'student') window.location.replace('/student');
        else window.location.replace('/');
    }, []);

    const authAxios = () => {
        const t = localStorage.getItem('token');
        if (t) axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    };

    const loadRoster = async () => {
        authAxios();
        const { data: students } = await axios.get('/api/students');
        setRoster(students.map(s => ({ id: s.studentId, name: s.name, semester: s.semester })));
    };

    useEffect(() => {
        if (!allowed) return;
        authAxios();
        loadRoster();

        (async () => {
            const { data } = await axios.get(`/api/teacher-attendance/me?month=${month}`);
            setSelfSummary(data);
        })().catch(()=>{});
    }, [allowed, month]);

    const mark = (id, status) => setRoster(r => r.map(s => (s.id === id ? { ...s, status } : s)));
    const markAll = (st) => setRoster(r => r.map(s => ({ ...s, status: st })));

    const save = async () => {
        if (!date) return alert('Pick a date first!');
        try {
            authAxios();
            await axios.post('/api/attendance/students', {
                date,
                rows: roster.map(s => ({ studentId: s.id, status: s.status || 'absent' })),
            });
            alert('Saved!');
        } catch (e) {
            if (e?.response?.status === 409) {
                alert(`Duplicate! Already recorded for ${date}: ${e.response.data.duplicates.join(', ')}`);
            } else {
                alert('Error saving.');
            }
        }
    };

    const createStudent = async (e) => {
        e.preventDefault();
        try {
            authAxios();
            await axios.post('/api/users/students', {
                name: sName, email: sEmail, password: sPass, studentId: sId, semester: sSem
            });
            setSName(''); setSEmail(''); setSPass(''); setSId('');
            await loadRoster();
            alert('Student created!');
        } catch (err) {
            const msg = err?.response?.data?.message || 'Create student failed.';
            alert(msg);
        }
    };

    const deleteStudent = async (studentId) => {
        if (!confirm('Delete this student user and all their attendance?')) return;
        try {
            authAxios();
            await axios.delete(`/api/users/students/${studentId}`);
            await loadRoster();
            alert('Deleted.');
        } catch {
            alert('Delete failed.');
        }
    };

    const suggestSID = async () => {
        try {
            authAxios();
            const { data } = await axios.get('/api/users/students/next-student-id');
            if (data?.ok && data?.next) setSId(data.next);
            else alert(data?.message || 'Could not suggest Student ID.');
        } catch {
            alert('Suggestion failed.');
        }
    };

    const exportSelfCsv = () => {
        const qs = new URLSearchParams();
        if (dateFrom) qs.set('dateFrom', dateFrom);
        if (dateTo) qs.set('dateTo', dateTo);
        window.location.href = '/api/teacher-attendance/me/export?' + qs.toString();
    };

    const exportStudentsCsv = () => {
        const qs = new URLSearchParams();
        if (semesterForExport) qs.set('semester', semesterForExport);
        if (dateFrom) qs.set('dateFrom', dateFrom);
        if (dateTo) qs.set('dateTo', dateTo);
        window.location.href = '/api/attendance/students/export?' + qs.toString();
    };

    const printPage = () => window.print();

    if (!allowed) return null;

    return (
        <Shell>
            <div className="space-y-8">
                <div><h1 className="text-3xl md:text-4xl font-bold">Teacher</h1></div>

                {/* Create Student Login */}
                <div className="card space-y-4">
                    <h2 className="text-xl font-semibold">Create Student Login</h2>
                    <form onSubmit={createStudent} className="grid md:grid-cols-6 gap-3">
                        <input placeholder="Student Name" value={sName} onChange={e => setSName(e.target.value)} />
                        <input placeholder="Student Email" value={sEmail} onChange={e => setSEmail(e.target.value)} />
                        <div className="flex gap-2 md:col-span-2">
                            <input
                                placeholder="Student ID (SID00001)"
                                value={sId}
                                onChange={e => setSId((e.target.value || '').toUpperCase())}
                                className="flex-1"
                            />
                            <button className="btn" type="button" onClick={suggestSID}>Suggest ID</button>
                        </div>
                        <select value={sSem} onChange={e => setSSem(e.target.value)}>
                            <option>Fall-2025</option><option>Spring-2026</option><option>Summer-2026</option>
                        </select>
                        <input type="password" placeholder="Password" value={sPass} onChange={e => setSPass(e.target.value)} />
                        <button className="btn btn-primary" type="submit">Create Student</button>
                    </form>
                    <p className="text-xs opacity-70">
                        Student ID must match <b>SID00001</b> pattern. Use <i>Suggest ID</i> to auto-fill the next available one.
                    </p>
                </div>

                {/* Take Students' Attendance */}
                <div className="card space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Take Students’ Attendance</h2>
                        <div className="flex items-center gap-2">
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 rounded-xl bg-white/10" />
                            <button className="btn" onClick={() => markAll('present')}>All Present</button>
                            <button className="btn" onClick={() => markAll('absent')}>All Absent</button>
                            <button className="btn btn-primary" onClick={save}>Save</button>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        {roster.map(s => (
                            <div key={s.id} className="flex items-center justify-between glass rounded-2xl px-4 py-3">
                                <div>
                                    <div className="font-medium">{s.name}</div>
                                    <div className="opacity-70 text-sm">{s.semester} • {s.id}</div>
                                </div>
                                <div className="space-x-2">
                                    {['present','late','excused','absent'].map(st => (
                                        <button key={st} onClick={() => mark(s.id, st)} className={`btn ${s.status===st?'btn-primary':'bg-white/10'}`}>{st}</button>
                                    ))}
                                    <button className="btn bg-red-600/80 hover:bg-red-600" onClick={() => deleteStudent(s.id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* My Attendance (Month + Filters) */}
                <div className="card space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-semibold">My Attendance (Month)</h2>
                            <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="px-3 py-2 rounded-xl bg-white/10" />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="opacity-80 text-sm">From</label>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 rounded-xl bg-white/10" />
                            <label className="opacity-80 text-sm">To</label>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 rounded-xl bg-white/10" />
                            <button className="btn" onClick={exportSelfCsv}>Export My CSV</button>
                            <button className="btn" onClick={exportStudentsCsv}>Export Students CSV</button>
                            <select value={semesterForExport} onChange={e => setSemesterForExport(e.target.value)} className="px-3 py-2 rounded-xl bg-white/10">
                                <option value="">(All Semesters)</option>
                                <option>Fall-2025</option><option>Spring-2026</option><option>Summer-2026</option>
                            </select>
                            <button className="btn btn-primary" onClick={printPage}>Print</button>
                        </div>
                    </div>

                    {selfSummary ? (
                        <>
                            <div className="opacity-90">
                                {selfSummary.month} — Total: {selfSummary.total}, Present: {selfSummary.present}, Late: {selfSummary.late}, Excused: {selfSummary.excused}, Absent: {selfSummary.absent} — Overall: <b>{selfSummary.percent}%</b>
                            </div>
                            <ul className="mt-2 space-y-1 opacity-90 max-h-64 overflow-auto pr-2 print:max-h-none">
                                {selfSummary.rows
                                    ?.filter(r => {
                                        if (dateFrom && r.date < dateFrom) return false;
                                        if (dateTo && r.date > dateTo) return false;
                                        return true;
                                    })
                                    .slice(0, 300)
                                    .map((r, i) => (
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
