export const runtime = 'nodejs';

import { dbConnect } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import Student from '@/lib/models/Student';

function pad(n) {
    return String(n).padStart(5, '0'); // 00001
}

// GET /api/users/students/next-student-id
export async function GET(request) {
    const me = getUserFromRequest(request);
    if (!me) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    if (me.role !== 'teacher' && me.role !== 'institute_admin') {
        return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }

    await dbConnect();

    const rows = await Student.find(
        { studentId: { $regex: /^SID\d{5}$/ } },
        { studentId: 1 }
    ).lean();

    let maxNum = 0;
    for (const s of rows) {
        const num = parseInt((s.studentId || '').slice(3), 10);
        if (!Number.isNaN(num) && num > maxNum) maxNum = num;
    }

    // propose next; simple loop to avoid rare race/gaps
    for (let n = maxNum + 1; n <= maxNum + 20; n++) {
        const candidate = `SID${pad(n)}`;
        const exists = await Student.exists({ studentId: candidate });
        if (!exists) {
            return new Response(JSON.stringify({ ok: true, next: candidate }), { status: 200 });
        }
    }

    return new Response(JSON.stringify({ ok: false, message: 'Could not compute next ID. Try again.' }), { status: 500 });
}
