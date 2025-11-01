import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error('Please define MONGODB_URI in .env');
}

let cached = global.__mongoose_conn__;
if (!cached) {
    cached = global.__mongoose_conn__ = { conn: null, promise: null };
}

export async function dbConnect() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 8000, // fail fast with clearer error
        };

        if (process.env.NODE_ENV !== 'production') {
            // hide credentials in logs
            const safe = (() => {
                try { return MONGODB_URI.split('@')[1]; } catch { return '***'; }
            })();
            console.log('[mongo] connecting to', safe);
        }

        cached.promise = mongoose.connect(MONGODB_URI, opts)
            .then((m) => {
                if (process.env.NODE_ENV !== 'production') console.log('[mongo] connected');
                return m;
            })
            .catch((err) => {
                console.error('[mongo] connection error:', err?.message || err);
                throw err;
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
