// Vercel Serverless Function: Metadata
// Fetches SUNO song metadata from embed page

// Use node-fetch for Vercel serverless environment
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { uuid } = req.query;

    if (!uuid) {
        return res.status(400).json({ error: 'UUID required' });
    }

    try {
        const metadata = await fetchSunoMetadata(uuid);
        return res.status(200).json(metadata);
    } catch (error) {
        console.error('Metadata fetch error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}

// Fetch metadata from SUNO embed page
async function fetchSunoMetadata(uuid) {
    const url = `https://suno.com/embed/${uuid}`;

    try {
        // Use fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return {
                title: null,
                artist: null,
                error: `HTTP ${response.status}`
            };
        }

        const html = await response.text();

        // Extract title from the page
        const titleMatch = html.match(/<title>([^<]+)<\/title>/);
        if (titleMatch) {
            const fullTitle = titleMatch[1];
            // Title format: "Song Name by Artist | Suno"
            const parts = fullTitle.split(' by ');
            if (parts.length >= 2) {
                const songName = parts[0].trim();
                const artistPart = parts[1].split(' | ')[0].trim();
                return { title: songName, artist: artistPart };
            }
            return {
                title: fullTitle.split(' | ')[0].trim(),
                artist: 'SUNO'
            };
        }

        return {
            title: null,
            artist: null,
            error: 'No metadata found'
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            return {
                title: null,
                artist: null,
                error: 'Timeout'
            };
        }
        return {
            title: null,
            artist: null,
            error: error.message
        };
    }
}
