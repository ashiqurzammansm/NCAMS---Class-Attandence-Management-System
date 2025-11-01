export const runtime = 'nodejs';

import { dbConnect } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import User from '@/lib/models/User';

export async function GET(request) {
    const me = getUserFromRequest(request);
    if (!me) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    if (me.role !== 'institute_admin' && me.role !== 'teacher')
        return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });

    await dbConnect();
    const list = await User.find({ role: 'teacher' })
        .select('_id name email facultyId')
        .sort({ name: 1 })
        .lean();

    return new Response(JSON.stringify(list), { status: 200 });
}
