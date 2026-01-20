// Vercel Serverless Function: Save Playlist
// Saves playlist data to Vercel KV and returns short ID

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { uuids } = req.body;

        if (!uuids || !Array.isArray(uuids) || uuids.length === 0) {
            return res.status(400).json({ error: 'Invalid playlist data' });
        }

        // Generate short ID (6 characters: alphanumeric)
        const shortId = generateShortId();

        // Save to Vercel KV (expire after 30 days)
        const expirySeconds = 30 * 24 * 60 * 60; // 30 days
        await kv.set(`playlist:${shortId}`, uuids.join(','), {
            ex: expirySeconds
        });

        // Optional: Track creation count
        await kv.incr('stats:total_playlists');

        return res.status(200).json({
            id: shortId,
            url: `/p/${shortId}`
        });
    } catch (error) {
        console.error('Save playlist error:', error);
        return res.status(500).json({
            error: 'Failed to save playlist',
            message: error.message
        });
    }
}

// Generate a random 6-character alphanumeric ID
function generateShortId() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
