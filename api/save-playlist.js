// Vercel Serverless Function: Save Playlist
// Saves playlist data to Vercel KV and returns short ID

import { kv } from '@vercel/kv';
import crypto from 'crypto';

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

        // Generate content-based hash for consistent IDs
        const contentHash = generateContentHash(uuids);

        // Check if this exact playlist already exists
        const existingData = await kv.get(`playlist:${contentHash}`);
        if (existingData) {
            // Return existing ID instead of creating duplicate
            return res.status(200).json({
                id: contentHash,
                url: `/p/${contentHash}`,
                existing: true
            });
        }

        // Save to Vercel KV (expire after 30 days)
        const expirySeconds = 30 * 24 * 60 * 60; // 30 days
        const playlistData = uuids.join(',');

        await kv.set(`playlist:${contentHash}`, playlistData, {
            ex: expirySeconds
        });

        // Optional: Track creation count
        await kv.incr('stats:total_playlists');

        return res.status(200).json({
            id: contentHash,
            url: `/p/${contentHash}`,
            existing: false
        });
    } catch (error) {
        console.error('Save playlist error:', error);
        return res.status(500).json({
            error: 'Failed to save playlist',
            message: error.message
        });
    }
}

// Generate a content-based hash (8 characters from SHA256)
// Same playlist content = same ID every time
function generateContentHash(uuids) {
    const content = uuids.join(',');
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    // Take first 8 characters for shorter, readable IDs
    return hash.substring(0, 8);
}
