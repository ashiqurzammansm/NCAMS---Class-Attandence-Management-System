import jwt from 'jsonwebtoken';

export const sign = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });

export const verify = (token) =>
    jwt.verify(token, process.env.JWT_SECRET || 'dev');

export function getTokenFromRequest(request) {
    try {
        const auth = request.headers.get('authorization') || '';
        if (auth.startsWith('Bearer ')) return auth.slice(7);
        const cookie = request.headers.get('cookie') || '';
        const parts = cookie.split(';').map(s => s.trim());
        for (const p of parts) if (p.toLowerCase().startsWith('token=')) return p.substring(6);
    } catch {}
    return null;
}

export function getUserFromRequest(request) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) return null;
        return verify(token);
    } catch {
        return null;
    }
}
