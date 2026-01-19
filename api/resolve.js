// Vercel Serverless Function: Resolve Short Link
// Resolves SUNO short links to full UUID

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
        return res.status(400).json({ error: 'Short ID required' });
    }

    try {
        const result = await resolveShortLink(id);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Short link resolve error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}

// Resolve short link to full UUID
async function resolveShortLink(shortId) {
    const url = `https://suno.com/s/${shortId}`;

    try {
        // Use fetch with redirect follow and timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
            method: 'GET',
            redirect: 'manual', // Don't follow redirects automatically
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        clearTimeout(timeoutId);

        // Check for redirect
        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get('location');
            if (location) {
                // Extract UUID from redirected URL
                const uuidMatch = location.match(/\/song\/([a-f0-9-]{36})/i);
                if (uuidMatch) {
                    return { uuid: uuidMatch[1] };
                }
            }
        }

        // If no redirect, try to get UUID from page content
        const html = await response.text();
        const uuidMatch = html.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
        if (uuidMatch) {
            return { uuid: uuidMatch[1] };
        }

        return {
            uuid: null,
            error: 'UUID not found'
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            return {
                uuid: null,
                error: 'Timeout'
            };
        }
        return {
            uuid: null,
            error: error.message
        };
    }
}
