import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id, title, artist, artwork, url } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Missing track ID' });
    }

    try {
        // 使用回数をインクリメント (Sorted Set)
        // 'suno_ranking' というキーで各曲の再生数を管理
        await kv.zincrby('suno_ranking', 1, id);

        // 曲のメタデータを保存（ランキング表示時に使用）
        // HSET で ID をキーに情報を保存
        await kv.hset(`track:${id}`, {
            id,
            title: title || 'Unknown Title',
            artist: artist || 'Unknown Artist',
            artwork: artwork || '',
            url: url || ''
        });

        // 24時間ランキング用（オプション：キーに日付を入れる）
        const today = new Date().toISOString().split('T')[0];
        await kv.zincrby(`suno_ranking:${today}`, 1, id);

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('KV Error:', error);
        return res.status(500).json({ error: 'Failed to record play' });
    }
}
