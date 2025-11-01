'use client';

export function getToken() {
    try {
        return localStorage.getItem('token') || '';
    } catch {
        return '';
    }
}

function decodePayload(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')
            .padEnd(Math.ceil(parts[1].length / 4) * 4, '=');
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
}

export function getUserFromToken() {
    const token = getToken();
    if (!token) return null;
    return decodePayload(token);
}

export function getRole() {
    const u = getUserFromToken();
    return u?.role || '';
}
