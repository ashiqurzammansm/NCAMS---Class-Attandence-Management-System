export const runtime = 'nodejs';

import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
    const user = getUserFromRequest(request);
    if (!user) return new Response(JSON.stringify({ ok:false }), { status: 200 });
    return new Response(JSON.stringify({ ok:true, user }), { status: 200 });
}
