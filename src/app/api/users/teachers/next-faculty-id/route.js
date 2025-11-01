export const runtime = 'nodejs';

import { dbConnect } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import User from '@/lib/models/User';

function pad(n) {
    return String(n).padStart(5, '0'); // -> 00001
}

// GET /api/users/teachers/next-faculty-id
export async function GET(request) {
    const me = getUserFromRequest(request);
    if (!me) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    if (me.role !== 'institute_admin') return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });

    await dbConnect();

    // Find all valid FIDs (FID00001 format), get the max number, +1
    const teachers = await User.find(
        { role: 'teacher', facultyId: { $regex: /^FID\d{5}$/ } },
        { facultyId: 1 }
    ).lean();

    let maxNum = 0;
    for (const t of teachers) {
        const num = parseInt(t.facultyId?.slice(3) || '0', 10);
        if (!Number.isNaN(num) && num > maxNum) maxNum = num;
    }

    // Propose the next; also double-check it doesn't exist (rare race)
    let candidateNum = maxNum + 1;
    // in case of race conditions or gaps, loop a few times
    for (let i = 0; i < 10; i++) {
        const candidate = `FID${pad(candidateNum)}`;
        const exists = await User.exists({ facultyId: candidate });
        if (!exists) {
            return new Response(JSON.stringify({ ok: true, next: candidate }), { status: 200 });
        }
        candidateNum++;
    }

    // Fallback if somehow all 10 consecutive were taken right now
    return new Response(JSON.stringify({ ok: false, message: 'Could not compute next ID, try again.' }), { status: 500 });
}
