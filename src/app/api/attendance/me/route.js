export const runtime = 'nodejs';

import { dbConnect } from '@/lib/db';
import Attendance from '@/lib/models/Attendance';
import Student from '@/lib/models/Student';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
    const user = getUserFromRequest(request);
    if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    if (user.role !== 'student') {
        return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }

    await dbConnect();

    // Map user -> studentId (demo: email local-part + "-demo")
    const emailLocal = (user.email || '').split('@')[0] || 'student';
    const studentId = `${emailLocal}-demo`;

    // Find the student's semester (from Student collection)
    const student = await Student.findOne({ studentId }).lean();
    const semester = student?.semester || 'Unknown';

    // Pull attendance rows for this studentId
    const rows = await Attendance.find({ studentId }).lean();

    // Compute semester-wise summary (simple example: current semester only)
    const total = rows.length || 0;
    const present = rows.filter(r => r.status === 'present').length;
    const late = rows.filter(r => r.status === 'late').length;
    const excused = rows.filter(r => r.status === 'excused').length;
    const absent = rows.filter(r => r.status === 'absent').length;
    const percent = total ? Math.round((present / total) * 100) : 0;

    return new Response(JSON.stringify({
        studentId,
        semester,
        total, present, late, excused, absent, percent,
        rows
    }), { status: 200 });
}
