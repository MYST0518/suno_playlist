// Vercel Serverless Function: Get Playlist
// Retrieves playlist data from Vercel KV by short ID

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Playlist ID required' });
    }

    try {
        // Get playlist from Vercel KV
        const uuidsString = await kv.get(`playlist:${id}`);

        if (!uuidsString) {
            return res.status(404).json({
                error: 'Playlist not found',
                message: 'This playlist may have expired or never existed'
            });
        }

        // Convert comma-separated string back to array
        const uuids = uuidsString.split(',');

        // Optional: Track view count
        await kv.incr(`stats:views:${id}`);

        return res.status(200).json({
            uuids: uuids,
            count: uuids.length
        });
    } catch (error) {
        console.error('Get playlist error:', error);
        return res.status(500).json({
            error: 'Failed to retrieve playlist',
            message: error.message
        });
    }
}
