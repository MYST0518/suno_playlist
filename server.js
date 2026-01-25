// ===================================
// SUNO Playlist Player - Proxy Server
// ===================================
// This server solves CORS issues by fetching SUNO metadata server-side

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// MIME types for static files
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

// Fetch metadata from SUNO embed page
function fetchSunoMetadata(uuid) {
    return new Promise((resolve, reject) => {
        const url = `https://suno.com/embed/${uuid}`;

        // Set timeout
        const timeout = setTimeout(() => {
            console.error('Metadata fetch timeout for:', uuid);
            resolve({ title: null, artist: null, error: 'Timeout' });
        }, 10000); // 10 second timeout

        const req = https.get(url, (res) => {
            let data = '';

            // Handle non-200 status codes
            if (res.statusCode !== 200) {
                clearTimeout(timeout);
                console.error(`HTTP ${res.statusCode} for:`, uuid);
                resolve({ title: null, artist: null, error: `HTTP ${res.statusCode}` });
                return;
            }

            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                clearTimeout(timeout);

                // Extract title from the page
                const titleMatch = data.match(/<title>([^<]+)<\/title>/);
                if (titleMatch) {
                    const fullTitle = titleMatch[1];
                    // Title format: "Song Name by Artist | Suno"
                    const parts = fullTitle.split(' by ');
                    if (parts.length >= 2) {
                        const songName = parts[0].trim();
                        const artistPart = parts[1].split(' | ')[0].trim();
                        resolve({ title: songName, artist: artistPart });
                        return;
                    }
                    resolve({ title: fullTitle.split(' | ')[0].trim(), artist: 'SUNO' });
                    return;
                }
                resolve({ title: null, artist: null, error: 'No metadata found' });
            });
        });

        req.on('error', (err) => {
            clearTimeout(timeout);
            console.error('Fetch error:', err);
            resolve({ title: null, artist: null, error: err.message });
        });

        req.on('timeout', () => {
            clearTimeout(timeout);
            req.destroy();
            resolve({ title: null, artist: null, error: 'Request timeout' });
        });
    });
}

// Resolve short link to full UUID
function resolveShortLink(shortId) {
    return new Promise((resolve, reject) => {
        const url = `https://suno.com/s/${shortId}`;

        // Set timeout
        const timeout = setTimeout(() => {
            console.error('Short link resolve timeout for:', shortId);
            resolve({ uuid: null, error: 'Timeout' });
        }, 10000); // 10 second timeout

        const req = https.get(url, (res) => {
            // Check for redirect
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                clearTimeout(timeout);
                const location = res.headers.location;
                // Extract UUID from redirected URL
                const uuidMatch = location.match(/\/song\/([a-f0-9-]{36})/i);
                if (uuidMatch) {
                    resolve({ uuid: uuidMatch[1] });
                    return;
                }
            }

            // If no redirect, try to get UUID from page content
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                clearTimeout(timeout);
                const uuidMatch = data.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
                if (uuidMatch) {
                    resolve({ uuid: uuidMatch[1] });
                } else {
                    resolve({ uuid: null, error: 'UUID not found' });
                }
            });
        });

        req.on('error', (err) => {
            clearTimeout(timeout);
            console.error('Resolve error:', err);
            resolve({ uuid: null, error: err.message });
        });

        req.on('timeout', () => {
            clearTimeout(timeout);
            req.destroy();
            resolve({ uuid: null, error: 'Request timeout' });
        });
    });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    // API: Get metadata
    if (url.pathname === '/api/metadata') {
        const uuid = url.searchParams.get('uuid');
        if (!uuid) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'UUID required' }));
            return;
        }

        try {
            const metadata = await fetchSunoMetadata(uuid);
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(metadata));
        } catch (error) {
            console.error('API error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: 'Internal server error',
                message: error.message
            }));
        }
        return;
    }

    // API: Resolve short link
    if (url.pathname === '/api/resolve') {
        const shortId = url.searchParams.get('id');
        if (!shortId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Short ID required' }));
            return;
        }

        try {
            const result = await resolveShortLink(shortId);
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(result));
        } catch (error) {
            console.error('API error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: 'Internal server error',
                message: error.message
            }));
        }
        return;
    }

    // Serve static files
    let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
    filePath = path.join(__dirname, filePath);

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║     🎵 SUNO Playlist Player Server 🎵      ║
╠════════════════════════════════════════════╣
║  Server running at:                        ║
║  http://localhost:${PORT}                       ║
║                                            ║
║  Press Ctrl+C to stop                      ║
╚════════════════════════════════════════════╝
    `);
});
