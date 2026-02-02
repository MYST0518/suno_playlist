import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 再生数トップ10を取得 (降順)
        const topTracks = await kv.zrevrange('suno_ranking', 0, 9, { withScores: true });

        const ranking = [];

        // topTracks は [id1, score1, id2, score2, ...] の形式
        for (let i = 0; i < topTracks.length; i += 2) {
            const id = topTracks[i];
            const score = topTracks[i + 1];

            // 各曲の詳細情報を取得
            const metadata = await kv.hgetall(`track:${id}`);
            if (metadata) {
                ranking.push({
                    ...metadata,
                    playCount: score
                });
            }
        }

        return res.status(200).json(ranking);
    } catch (error) {
        console.error('KV Error:', error);
        return res.status(500).json({ error: 'Failed to fetch ranking' });
    }
}
