// Vercel Serverless Function: User Save Playlist
// Saves playlist to user's collection in Vercel KV

import { kv } from '@vercel/kv';
import crypto from 'crypto';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { uid, name, uuids, coverUrl, description } = req.body;

        if (!uid || !uuids || !Array.isArray(uuids)) {
            return res.status(400).json({ error: 'Missing required data' });
        }

        const content = uuids.join(',');
        const hash = crypto.createHash('sha256').update(content).digest('hex').substring(0, 8);

        // 1. Save to global playlists (for short link support)
        await kv.set(`playlist:${hash}`, content, { ex: 30 * 24 * 60 * 60 });

        // 2. Add to user's collection
        const userKey = `user:${uid}:playlists`;

        let existingPlaylists = await kv.get(userKey) || [];

        const existingIndex = existingPlaylists.findIndex(p => p.id === hash);
        const newPlaylistEntry = {
            id: hash,
            name: name || 'Untitled Playlist',
            coverUrl: coverUrl || '',
            description: description || '',
            timestamp: Date.now(),
            count: uuids.length
        };

        if (existingIndex !== -1) {
            // Update existing entry
            existingPlaylists[existingIndex] = newPlaylistEntry;
        } else {
            // Add to beginning of the list
            existingPlaylists.unshift(newPlaylistEntry);
        }

        // Store modified list
        await kv.set(userKey, existingPlaylists);

        return res.status(200).json({
            success: true,
            id: hash,
            message: existingIndex !== -1 ? 'Updated in collection' : 'Saved to cloud'
        });

    } catch (error) {
        console.error('User save playlist error:', error);
        return res.status(500).json({
            error: 'Failed to save to cloud',
            message: error.message
        });
    }
}
