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

// Fetch metadata from SUNO song page
async function fetchSunoMetadata(uuid) {
    const url = `https://suno.com/embed/${uuid}`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
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

        const data = await response.text();

        // Extract Title (OG Title is most reliable)
        const ogTitleMatch = data.match(/property="og:title"\s+content="([^"]+)"/i) ||
            data.match(/content="([^"]+)"\s+property="og:title"/i);
        const twitterTitleMatch = data.match(/name="twitter:title"\s+content="([^"]+)"/i);
        const titleTagMatch = data.match(/<title>([^<]+)<\/title>/i);

        let title = 'Unknown Title';
        if (ogTitleMatch) {
            title = ogTitleMatch[1];
        } else if (twitterTitleMatch) {
            title = twitterTitleMatch[1];
        } else if (titleTagMatch) {
            title = titleTagMatch[1].split(' by ')[0].replace(' | Suno', '').trim();
        }

        // Extract Artist
        const ogDescMatch = data.match(/property="og:description"\s+content="([^"]+)"/i);
        const twitterDescMatch = data.match(/name="twitter:description"\s+content="([^"]+)"/i);

        let artist = 'Suno';
        const artistRegex = /by (.*?)(?:\s+|$)/i;

        if (ogDescMatch && ogDescMatch[1].includes('by ')) {
            const match = ogDescMatch[1].match(artistRegex);
            if (match) artist = match[1].split('(')[0].trim();
        } else if (twitterDescMatch && twitterDescMatch[1].includes('by ')) {
            const match = twitterDescMatch[1].match(artistRegex);
            if (match) artist = match[1].split('(')[0].trim();
        } else if (titleTagMatch) {
            const match = titleTagMatch[1].match(/by (.*?) (?:\||Suno)/i);
            if (match) artist = match[1].trim();
        }

        // Extract Thumbnail
        const ogImageMatch = data.match(/property="og:image"\s+content="([^"]+)"/i) ||
            data.match(/content="([^"]+)"\s+property="og:image"/i);
        const twitterImageMatch = data.match(/name="twitter:image"\s+content="([^"]+)"/i);
        const jsonImageMatch = data.match(/"image_url":"([^"]+)"/i) ||
            data.match(/"imageUrl":"([^"]+)"/i);
        const fallbackThumb = `https://cdn1.suno.ai/image_${uuid}.png`;

        const thumbnail = ogImageMatch ? ogImageMatch[1] :
            (twitterImageMatch ? twitterImageMatch[1] :
                (jsonImageMatch ? jsonImageMatch[1] : fallbackThumb));

        return {
            uuid,
            title: decodeHtml(title),
            artist: decodeHtml(artist),
            thumbnail: thumbnail
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            return { title: null, artist: null, error: 'Timeout' };
        }
        return { title: null, artist: null, error: error.message };
    }
}

// Helper to decode HTML entities in string
function decodeHtml(html) {
    if (!html) return '';
    return html.replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#039;/g, "'")
        .replace(/&apos;/g, "'");
}
