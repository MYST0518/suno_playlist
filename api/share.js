// Vercel Serverless Function: Share Playlist Page
// Returns dynamic HTML with OGP tags for X/Twitter

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(404).send('Playlist ID required');
    }

    try {
        // Fetch playlist from KV
        const uuidsString = await kv.get(`playlist:${id}`);
        if (!uuidsString) {
            return res.status(404).send('Playlist not found');
        }

        const uuids = uuidsString.split(',');
        if (uuids.length === 0) {
            return res.status(404).send('Empty playlist');
        }

        // Fetch metadata for the first song for OGP
        const firstUuid = uuids[0];
        const metadata = await fetchSunoMetadata(firstUuid);

        // Render the dynamic HTML
        const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>${metadata.title} - SUNO 共有プレーヤー</title>
    
    <!-- OGP Tags -->
    <meta property="og:title" content="「${metadata.title}」をあなたに 🌸">
    <meta property="og:description" content="by ${metadata.artist} | Music Gift Station で心温まる音楽のプレゼント">
    <meta property="og:image" content="${metadata.thumbnail}">
    <meta name="twitter:card" content="summary_large_image">
    <meta property="og:type" content="music.song">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --accent: #e8729a;
            --accent-soft: rgba(232, 114, 154, 0.1);
            --text-main: #4a3228;
            --text-sub: #7a5c50;
            --bg-gradient: linear-gradient(135deg, #fce4ec, #fff3e0, #fff9c4);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: 'Inter', 'Noto Sans JP', sans-serif;
            background: var(--bg-gradient);
            background-attachment: fixed;
            color: var(--text-main);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
            overflow: hidden;
        }

        .bg-orbs {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            z-index: -1; pointer-events: none;
        }
        .orb {
            position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4;
            animation: float 20s infinite alternate ease-in-out;
        }
        .orb-1 { width: 300px; height: 300px; background: #fce4ec; top: -50px; right: -50px; }
        .orb-2 { width: 250px; height: 250px; background: #fff3e0; bottom: -50px; left: -50px; animation-delay: -5s; }

        @keyframes float {
            from { transform: translate(0, 0); }
            to { transform: translate(30px, 30px); }
        }

        .card {
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 32px;
            padding: 40px 30px;
            width: 100%;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.05);
            z-index: 10;
        }

        .vinyl-container {
            position: relative;
            width: 240px;
            height: 240px;
            margin: 0 auto 30px;
            perspective: 1000px;
        }

        .vinyl {
            width: 100%; height: 100%;
            border-radius: 50%;
            background: conic-gradient(from 0deg, #fce4ec, #f8bbd0, #fce4ec, #fff3e0, #fce4ec);
            box-shadow: 0 15px 45px rgba(232, 114, 154, 0.2);
            transition: transform 0.8s cubic-bezier(0.17, 0.67, 0.83, 0.67);
            display: flex; align-items: center; justify-content: center;
            position: relative;
            overflow: hidden;
        }

        .vinyl.spinning {
            animation: spin 4s linear infinite;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        img.thumb {
            width: 100%; height: 100%; object-fit: cover;
            border-radius: 50%;
            opacity: 0.9;
            transition: opacity 0.5s;
        }

        .vinyl-center {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 60px; height: 60px;
            background: rgba(255,255,255,0.9);
            border-radius: 50%;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
            display: flex; align-items: center; justify-content: center;
            font-size: 1.5rem;
        }

        h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 8px; color: var(--text-main); }
        .artist { color: var(--text-sub); font-size: 0.95rem; margin-bottom: 24px; }

        .controls { display: flex; align-items: center; justify-content: center; gap: 24px; margin-bottom: 30px; }
        
        .play-btn {
            width: 80px; height: 80px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #e8729a, #f4a0b5);
            color: white;
            font-size: 2rem;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 8px 25px rgba(232, 114, 154, 0.3);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .play-btn:hover { transform: scale(1.05); box-shadow: 0 10px 30px rgba(232, 114, 154, 0.4); }
        .play-btn:active { transform: scale(0.95); }

        .nav-btn {
            width: 48px; height: 48px;
            border-radius: 50%;
            border: 1px solid var(--accent);
            background: white;
            color: var(--accent);
            cursor: pointer;
            transition: all 0.2s;
            display: flex; align-items: center; justify-content: center;
        }
        .nav-btn:hover { background: var(--accent-soft); }

        .progress-container { width: 100%; margin-bottom: 20px; }
        .progress-bar {
            width: 100%; height: 6px; background: rgba(0,0,0,0.05);
            border-radius: 3px; cursor: pointer; position: relative;
        }
        .progress-fill {
            height: 100%; width: 0%; background: var(--accent);
            border-radius: 3px; transition: width 0.1s linear;
        }

        .gift-msg { font-size: 0.85rem; color: var(--text-sub); margin-top: 20px; font-style: italic; }
        .app-link {
            display: block; margin-top: 32px;
            text-decoration: none; color: var(--accent);
            font-size: 0.85rem; font-weight: 500;
        }

        .waveform {
            display: flex; align-items: flex-end; justify-content: center;
            gap: 3px; height: 20px; margin-bottom: 20px;
            opacity: 0; transition: opacity 0.3s;
        }
        .waveform.active { opacity: 1; }
        .wave-bar {
            width: 3px; border-radius: 2px;
            background: var(--accent);
            animation: wave 1.2s ease-in-out infinite alternate;
        }
        @keyframes wave { from { height: 4px; } to { height: 20px; } }
    </style>
</head>
<body>
    <div class="bg-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
    </div>

    <div class="card">
        <div class="vinyl-container">
            <div id="vinyl" class="vinyl">
                <img id="thumb" class="thumb" src="${metadata.thumbnail}" alt="Cover">
                <div class="vinyl-center">🌸</div>
            </div>
        </div>

        <h1 id="title">${metadata.title}</h1>
        <p id="artist" class="artist">${metadata.artist}</p>

        <div class="waveform" id="waveform">
            <div class="wave-bar" style="animation-delay: 0s"></div>
            <div class="wave-bar" style="animation-delay: 0.2s"></div>
            <div class="wave-bar" style="animation-delay: 0.4s"></div>
            <div class="wave-bar" style="animation-delay: 0.1s"></div>
            <div class="wave-bar" style="animation-delay: 0.3s"></div>
            <div class="wave-bar" style="animation-delay: 0s"></div>
        </div>

        <div class="progress-container">
            <div class="progress-bar" id="progress-bar">
                <div id="progress-fill" class="progress-fill"></div>
            </div>
        </div>

        <div class="controls">
            ${uuids.length > 1 ? '<button id="prev-btn" class="nav-btn">⏮</button>' : ''}
            <button id="play-btn" class="play-btn">▶</button>
            ${uuids.length > 1 ? '<button id="next-btn" class="nav-btn">⏭</button>' : ''}
        </div>

        <p class="gift-msg">💐 あなたへ、音楽の贈り物</p>
        
        <a href="/p/${id}" class="app-link">🎧 SUNO Playlist アプリで聴く</a>
    </div>

    <audio id="audio"></audio>

    <script>
        const uuids = ${JSON.stringify(uuids)};
        let currentIndex = 0;
        const audio = document.getElementById('audio');
        const playBtn = document.getElementById('play-btn');
        const vinyl = document.getElementById('vinyl');
        const waveform = document.getElementById('waveform');
        const progressFill = document.getElementById('progress-fill');
        const progressBar = document.getElementById('progress-bar');
        
        const titleEl = document.getElementById('title');
        const artistEl = document.getElementById('artist');
        const thumbEl = document.getElementById('thumb');
        
        const firstMetadata = ${JSON.stringify(metadata)};
        let isPlaying = false;

        function loadTrack(index) {
            if (index < 0 || index >= uuids.length) return;
            currentIndex = index;
            const uuid = uuids[currentIndex];
            
            audio.src = 'https://cdn1.suno.ai/' + uuid + '.mp3';
            progressFill.style.width = '0%';
            
            if (currentIndex === 0) {
                titleEl.textContent = firstMetadata.title;
                artistEl.textContent = firstMetadata.artist;
                thumbEl.src = firstMetadata.thumbnail;
            } else {
                fetch('/api/metadata?uuid=' + uuid)
                    .then(res => res.json())
                    .then(data => {
                        if (uuids[currentIndex] === uuid) {
                            titleEl.textContent = data.title;
                            artistEl.textContent = data.artist;
                            thumbEl.src = data.thumbnail;
                        }
                    });
            }
            if (isPlaying) audio.play();
        }

        playBtn.addEventListener('click', () => {
            if (isPlaying) {
                audio.pause();
                playBtn.textContent = '▶';
                vinyl.classList.remove('spinning');
                waveform.classList.remove('active');
            } else {
                audio.play();
                playBtn.textContent = '⏸';
                vinyl.classList.add('spinning');
                waveform.classList.add('active');
            }
            isPlaying = !isPlaying;
        });

        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                progressFill.style.width = (audio.currentTime / audio.duration * 100) + '%';
            }
        });

        progressBar.addEventListener('click', (e) => {
            if (audio.duration) {
                const rect = progressBar.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                audio.currentTime = pos * audio.duration;
            }
        });

        audio.addEventListener('ended', () => {
            if (currentIndex < uuids.length - 1) {
                loadTrack(currentIndex + 1);
            } else {
                isPlaying = false;
                playBtn.textContent = '▶';
                vinyl.classList.remove('spinning');
                waveform.classList.remove('active');
            }
        });

        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        if (prevBtn) prevBtn.addEventListener('click', () => loadTrack(currentIndex - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => loadTrack(currentIndex + 1));

        loadTrack(0);
    </script>
</body>
</html>
        `;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=3600');
        res.status(200).send(html);

    } catch (error) {
        console.error('Share share error:', error);
        res.status(500).send('Internal Server Error');
    }
}

// Inline duplicate of metadata fetch logic to avoid Vercel internal import issues
async function fetchSunoMetadata(uuid) {
    const url = \`https://suno.com/embed/\${uuid}\`;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0 Safari/537.36'
            }
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            return { title: 'Suno Track', artist: 'Unknown', thumbnail: \`https://cdn1.suno.ai/image_\${uuid}.png\` };
        }

        const data = await response.text();
        const ogTitleMatch = data.match(/property="og:title"\s+content="([^"]+)"/i) || data.match(/content="([^"]+)"\s+property="og:title"/i);
        const ogDescMatch = data.match(/property="og:description"\s+content="([^"]+)"/i);
        const ogImageMatch = data.match(/property="og:image"\s+content="([^"]+)"/i) || data.match(/content="([^"]+)"\s+property="og:image"/i);

        let title = ogTitleMatch ? ogTitleMatch[1] : 'Unknown Title';
        let artist = 'Suno Artist';
        if (ogDescMatch && ogDescMatch[1].includes('by ')) {
            const match = ogDescMatch[1].match(/by (.*?)(?:\\s+|$)/i);
            if (match) artist = match[1].split('(')[0].trim();
        }
        
        let thumbnail = ogImageMatch ? ogImageMatch[1] : \`https://cdn1.suno.ai/image_\${uuid}.png\`;

        // Decode HTML
        title = title.replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"');
        artist = artist.replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"');

        return { title, artist, thumbnail };
    } catch {
        return { title: 'Suno Track', artist: 'Unknown', thumbnail: \`https://cdn1.suno.ai/image_\${uuid}.png\` };
    }
}
