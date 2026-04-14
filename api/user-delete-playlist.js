// Vercel Serverless Function: Delete User Playlist
// Removes a playlist from a user's collection in Vercel KV

import { kv } from '@vercel/kv';

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
        const { uid, id } = req.body;

        if (!uid || !id) {
            return res.status(400).json({ error: 'Missing UID or Playlist ID' });
        }

        const userKey = `user:${uid}:playlists`;
        const existingPlaylists = await kv.get(userKey) || [];

        const filteredPlaylists = existingPlaylists.filter(p => p.id !== id);

        if (existingPlaylists.length !== filteredPlaylists.length) {
            await kv.set(userKey, filteredPlaylists);
            return res.status(200).json({ success: true, message: 'Deleted from cloud' });
        } else {
            return res.status(404).json({ error: 'Playlist not found in user collection' });
        }

    } catch (error) {
        console.error('User delete playlist error:', error);
        return res.status(500).json({
            error: 'Failed to delete from cloud',
            message: error.message
        });
    }
}
