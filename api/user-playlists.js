// Vercel Serverless Function: Get User Playlists
// Retrieves all playlists associated with a user UID

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { uid } = req.query;

        if (!uid) {
            return res.status(400).json({ error: 'UID is required' });
        }

        const userKey = `user:${uid}:playlists`;
        const playlists = await kv.get(userKey) || [];

        return res.status(200).json(playlists);

    } catch (error) {
        console.error('Fetch user playlists error:', error);
        return res.status(500).json({
            error: 'Failed to fetch cloud data',
            message: error.message
        });
    }
}
