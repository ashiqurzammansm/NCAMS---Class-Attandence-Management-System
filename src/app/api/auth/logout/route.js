export const runtime = 'nodejs';

export async function POST() {
    const cookie = [
        'token=',
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        'Max-Age=0',
        process.env.NODE_ENV === 'production' ? 'Secure' : '',
    ].filter(Boolean).join('; ');

    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' },
    });
}
