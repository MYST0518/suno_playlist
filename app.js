// ===================================
// SUNO Playlist Player - App Logic (Enhanced)
// ===================================

// ===================================
//    Internationalization Manager
// ===================================
class I18nManager {
    constructor() {
        this.LANG_KEY = 'suno_language';
        this.translations = window.translations || {}; // Access from window object
        this.currentLang = this.detectLanguage(); // Then detect language
    }

    // Detect user's language
    detectLanguage() {
        // Priority: LocalStorage > Browser Language > Default (ja)
        const stored = localStorage.getItem(this.LANG_KEY);
        if (stored && this.translations[stored]) {
            return stored;
        }

        // Browser language detection
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0]; // en-US -> en

        // Map to supported languages
        const supported = ['ja', 'en', 'zh', 'ko'];
        if (supported.includes(langCode)) {
            return langCode;
        }

        // Default to Japanese
        return 'ja';
    }

    // Get translation
    t(key) {
        const lang = this.translations[this.currentLang];
        return lang && lang[key] ? lang[key] : key;
    }

    // Set language
    setLanguage(lang) {
        if (!this.translations[lang]) {
            console.error(`Language ${lang} not supported`);
            return;
        }

        this.currentLang = lang;
        localStorage.setItem(this.LANG_KEY, lang);
        this.updateDOM();
    }

    // Update all DOM elements with data-i18n attribute
    updateDOM() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);

            // Update element text
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update document title
        document.title = this.t('appName');

        // Dispatch event for custom updates
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { lang: this.currentLang }
        }));
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLang;
    }
}

// ===================================
//    Theme Manager
// ===================================
class ThemeManager {
    constructor() {
        this.THEME_KEY = 'suno_theme';
        this.currentTheme = this.detectTheme();

        // Icon mapping for different themes
        this.icons = {
            default: {
                logo: '🎵',
                play: '▶',
                pause: '⏸',
                shuffle: '🔀',
                previous: '⏮',
                next: '⏭',
                repeat: '🔁',
                repeatOne: '🔂',
                volume: '🔊',
                mute: '🔇'
            },
            tabby: {
                logo: '🐈',
                play: '🐾',
                pause: '😼',
                shuffle: '🐈',
                previous: '⏮',
                next: '⏭',
                repeat: '🔄',
                repeatOne: '🐱',
                volume: '😺',
                mute: '😿'
            }
        };
    }

    // Detect user's theme preference
    detectTheme() {
        // Priority: LocalStorage > Default (default)
        const stored = localStorage.getItem(this.THEME_KEY);
        if (stored && (stored === 'default' || stored === 'tabby')) {
            return stored;
        }
        return 'default';
    }

    // Set theme
    setTheme(theme) {
        if (theme !== 'default' && theme !== 'tabby') {
            console.error(`Theme ${theme} not supported`);
            return;
        }

        this.currentTheme = theme;
        localStorage.setItem(this.THEME_KEY, theme);
        this.applyTheme();
    }

    // Apply theme to DOM
    applyTheme() {
        const html = document.documentElement;

        if (this.currentTheme === 'tabby') {
            html.setAttribute('data-theme', 'tabby');
        } else {
            html.removeAttribute('data-theme');
        }

        // Update theme-specific icons
        this.updateThemeIcons();

        // Dispatch event for custom updates
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: this.currentTheme }
        }));
    }

    // Get icon based on current theme
    getIcon(name) {
        const themeIcons = this.icons[this.currentTheme] || this.icons.default;
        return themeIcons[name] || this.icons.default[name];
    }

    // Update icons based on theme
    updateThemeIcons() {
        // Update logo
        const logoIcon = document.querySelector('.logo-icon');
        if (logoIcon) logoIcon.textContent = this.getIcon('logo');

        // Update control buttons (that aren't dynamically changed by state)
        const prevBtn = document.querySelector('#prevBtn span');
        if (prevBtn) prevBtn.textContent = this.getIcon('previous');

        const nextBtn = document.querySelector('#nextBtn span');
        if (nextBtn) nextBtn.textContent = this.getIcon('next');

        // Note: Play/Pause/Shuffle/Repeat are managed by SUNOPlaylist class
        // but it will now use getIcon() thanks to the update.
    }

    // Get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Initialize theme on page load
    init() {
        this.applyTheme();
    }
}


// Playlist Storage Manager
class PlaylistStorage {
    constructor() {
        this.STORAGE_KEY = 'suno_playlists';
        this.FAVORITES_KEY = 'suno_favorites';
        this.CURRENT_KEY = 'suno_current';
        this.MAX_RECENT = 10;
    }

    // Get all recent playlists
    getRecentPlaylists() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading recent playlists:', error);
            return [];
        }
    }

    // Save playlist to recent
    savePlaylist(playlist) {
        if (playlist.length === 0) return null;

        try {
            const recent = this.getRecentPlaylists();

            // Create playlist object
            const playlistObj = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                trackCount: playlist.length,
                tracks: playlist.map(t => ({
                    uuid: t.uuid,
                    title: t.title,
                    artist: t.artist
                })),
                firstTrack: playlist[0].title
            };

            // Remove duplicates (same track order)
            const uuids = JSON.stringify(playlistObj.tracks.map(t => t.uuid));
            const filtered = recent.filter(p =>
                JSON.stringify(p.tracks.map(t => t.uuid)) !== uuids
            );

            // Add to beginning
            filtered.unshift(playlistObj);

            // Keep only MAX_RECENT
            const trimmed = filtered.slice(0, this.MAX_RECENT);

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));

            return playlistObj.id;
        } catch (error) {
            console.error('Error saving playlist:', error);
            return null;
        }
    }

    // Save current playlist
    saveCurrent(playlist) {
        if (playlist.length === 0) return;

        try {
            const data = {
                timestamp: new Date().toISOString(),
                tracks: playlist.map(t => ({
                    uuid: t.uuid,
                    title: t.title,
                    artist: t.artist
                }))
            };
            localStorage.setItem(this.CURRENT_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving current playlist:', error);
        }
    }

    // Get current playlist
    getCurrent() {
        try {
            const data = localStorage.getItem(this.CURRENT_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading current playlist:', error);
            return null;
        }
    }

    // Get favorites
    getFavorites() {
        try {
            const data = localStorage.getItem(this.FAVORITES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    // Toggle favorite
    toggleFavorite(playlistId) {
        try {
            const favorites = this.getFavorites();
            const recent = this.getRecentPlaylists();
            const playlist = recent.find(p => p.id === playlistId);

            if (!playlist) return false;

            const index = favorites.findIndex(f => f.id === playlistId);

            if (index >= 0) {
                // Remove from favorites
                favorites.splice(index, 1);
            } else {
                // Add to favorites
                favorites.push({ ...playlist, favorited: true });
            }

            localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
            return index < 0; // Return true if added
        } catch (error) {
            console.error('Error toggling favorite:', error);
            return false;
        }
    }

    // Check if favorited
    isFavorite(playlistId) {
        const favorites = this.getFavorites();
        return favorites.some(f => f.id === playlistId);
    }

    // Delete playlist from recent
    deletePlaylist(playlistId) {
        try {
            const recent = this.getRecentPlaylists();
            const filtered = recent.filter(p => p.id !== playlistId);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));

            // Also remove from favorites if exists
            const favorites = this.getFavorites();
            const filteredFavs = favorites.filter(f => f.id !== playlistId);
            localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(filteredFavs));

            return true;
        } catch (error) {
            console.error('Error deleting playlist:', error);
            return false;
        }
    }

    // Clear all
    clearAll() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.FAVORITES_KEY);
            localStorage.removeItem(this.CURRENT_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }
}

class SUNOPlaylist {
    constructor() {
        this.playlist = [];
        this.currentIndex = 0;
        this.isPlaying = false;

        // DOM Elements
        this.elements = {
            linksInput: document.getElementById('linksInput'),
            loadBtn: document.getElementById('loadBtn'),
            shareBtn: document.getElementById('shareBtn'),
            shareDropdown: document.getElementById('shareDropdown'),
            shareTwitter: document.getElementById('shareTwitter'),
            shareLine: document.getElementById('shareLine'),
            shareFacebook: document.getElementById('shareFacebook'),
            shareCopy: document.getElementById('shareCopy'),
            audioPlayer: document.getElementById('audioPlayer'),
            playBtn: document.getElementById('playBtn'),
            playIcon: document.getElementById('playIcon'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            shuffleBtn: document.getElementById('shuffleBtn'),
            shuffleIcon: document.getElementById('shuffleIcon'),
            repeatBtn: document.getElementById('repeatBtn'),
            repeatIcon: document.getElementById('repeatIcon'),
            clearBtn: document.getElementById('clearBtn'),
            importBtn: document.getElementById('importBtn'),
            importFile: document.getElementById('importFile'),
            downloadBtn: document.getElementById('downloadBtn'),
            progressBar: document.getElementById('progressBar'),
            progress: document.getElementById('progress'),
            currentTime: document.getElementById('currentTime'),
            duration: document.getElementById('duration'),
            volumeSlider: document.getElementById('volumeSlider'),
            trackTitle: document.getElementById('trackTitle'),
            trackArtist: document.getElementById('trackArtist'),
            playlistContainer: document.getElementById('playlist'),
            trackCount: document.getElementById('trackCount'),
            toast: document.getElementById('toast'),
            loadingProgress: document.getElementById('loadingProgress'),
            progressText: document.getElementById('progressText'),
            progressBarFill: document.getElementById('progressBarFill'),
            offlineBanner: document.getElementById('offlineBanner'),
            helpBtn: document.getElementById('helpBtn'),
            helpModal: document.getElementById('helpModal'),
            closeHelpBtn: document.getElementById('closeHelpBtn'),
            historyBtn: document.getElementById('historyBtn'),
            historyModal: document.getElementById('historyModal'),
            historyList: document.getElementById('historyList'),
            closeHistoryBtn: document.getElementById('closeHistoryBtn')
        };

        // Loading state
        this.loadingStates = new Map();

        // Error tracking
        this.isOffline = !navigator.onLine;

        // Playback modes
        this.shuffleMode = false;
        this.repeatMode = 'none'; // 'none', 'all', 'one'
        this.originalPlaylist = [];

        // Storage
        this.storage = new PlaylistStorage();

        // Drag and drop state
        this.draggedIndex = null;

        this.init();
    }

    init() {
        // Event Listeners
        this.elements.loadBtn.addEventListener('click', () => this.loadPlaylist());
        this.elements.shareBtn?.addEventListener('click', () => this.toggleShareDropdown());
        this.elements.shareTwitter?.addEventListener('click', () => this.shareToTwitter());
        this.elements.shareLine?.addEventListener('click', () => this.shareToLine());
        this.elements.shareFacebook?.addEventListener('click', () => this.shareToFacebook());
        this.elements.shareCopy?.addEventListener('click', () => this.copyShareUrl());
        this.elements.playBtn.addEventListener('click', () => this.togglePlay());
        this.elements.prevBtn.addEventListener('click', () => this.playPrevious());
        this.elements.nextBtn.addEventListener('click', () => this.playNext());
        this.elements.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.elements.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        this.elements.clearBtn.addEventListener('click', () => this.clearPlaylist());
        this.elements.importBtn.addEventListener('click', () => this.triggerImport());
        this.elements.importFile.addEventListener('change', (e) => this.importPlaylist(e));
        this.elements.downloadBtn.addEventListener('click', () => this.downloadPlaylist());
        this.elements.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.elements.progressBar.addEventListener('click', (e) => this.seek(e));
        this.elements.helpBtn.addEventListener('click', () => this.toggleHelpModal());
        this.elements.closeHelpBtn.addEventListener('click', () => this.toggleHelpModal());

        // Help modal tab switching
        document.querySelectorAll('.help-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchHelpTab(tabName);
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.share-container')) {
                this.elements.shareDropdown?.classList.remove('show');
            }
        });

        // Close help modal when clicking outside
        this.elements.helpModal.addEventListener('click', (e) => {
            if (e.target === this.elements.helpModal) {
                this.toggleHelpModal();
            }
        });

        // Drag and Drop delegation for playlist
        this.setupDragAndDrop();

        // Audio Events
        this.elements.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.elements.audioPlayer.addEventListener('ended', () => this.playNext());
        this.elements.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
        this.elements.audioPlayer.addEventListener('error', (e) => this.handleError(e));

        // Listen for theme changes to update icons
        window.addEventListener('themeChanged', () => this.updateControlIcons());

        // Set initial volume
        this.elements.audioPlayer.volume = 0.8;

        // Setup offline detection
        this.setupOfflineDetection();

        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Check URL for shared playlist
        this.loadFromURL();

        // History button event listeners
        this.elements.historyBtn.addEventListener('click', () => this.toggleHistoryModal());
        this.elements.closeHistoryBtn.addEventListener('click', () => this.toggleHistoryModal());
        this.elements.historyModal.addEventListener('click', (e) => {
            if (e.target === this.elements.historyModal) {
                this.toggleHistoryModal();
            }
        });

        // Restore last playlist
        setTimeout(() => this.restoreLastPlaylist(), 500);
    }

    // Setup offline detection
    setupOfflineDetection() {
        window.addEventListener('online', () => {
            const message = window.i18n ? window.i18n.t('onlineMessage') : 'Online';
            this.showToast(message, 'success');
            this.isOffline = false;
            if (this.elements.offlineBanner) {
                this.elements.offlineBanner.classList.remove('show');
            }
        });

        window.addEventListener('offline', () => {
            const message = window.i18n ? window.i18n.t('offlineMessage') : 'Offline';
            this.showToast(message, 'error');
            this.isOffline = true;
            if (this.elements.offlineBanner) {
                this.elements.offlineBanner.classList.add('show');
            }
        });

        // Show banner if offline - with a slight delay and a real network check to avoid false positives
        setTimeout(async () => {
            this.isOffline = !navigator.onLine;

            // If the browser says we are offline, double check with a real fetch
            if (this.isOffline) {
                try {
                    const probe = await fetch('/favicon.png', { method: 'HEAD', cache: 'no-store' });
                    if (probe.ok) this.isOffline = false;
                } catch (e) {
                    // Truly offline
                }
            }

            if (this.isOffline && this.elements.offlineBanner) {
                this.elements.offlineBanner.classList.add('show');
            } else if (this.elements.offlineBanner) {
                this.elements.offlineBanner.classList.remove('show');
            }
        }, 3000);
    }

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if user is typing in an input field
            if (this.isInputFocused()) return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlay();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.seekRelative(-5);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.seekRelative(5);
                    break;
                case 'KeyN':
                    e.preventDefault();
                    this.playNext();
                    break;
                case 'KeyP':
                    e.preventDefault();
                    this.playPrevious();
                    break;
                case 'KeyM':
                    e.preventDefault();
                    this.toggleMute();
                    break;
            }
        });
    }

    // Setup Drag and Drop event delegation
    setupDragAndDrop() {
        const container = this.elements.playlistContainer;

        container.addEventListener('dragstart', (e) => {
            const item = e.target.closest('.playlist-item');
            if (!item) return;

            this.draggedIndex = parseInt(item.dataset.index);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', this.draggedIndex.toString());

            // UI feedback
            setTimeout(() => item.classList.add('dragging'), 0);
        });

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            const item = e.target.closest('.playlist-item');
            if (!item || this.draggedIndex === null) return;

            const targetIndex = parseInt(item.dataset.index);
            if (targetIndex !== this.draggedIndex) {
                item.classList.add('drag-over');
            }
        });

        container.addEventListener('dragleave', (e) => {
            const item = e.target.closest('.playlist-item');
            if (item) item.classList.remove('drag-over');
        });

        container.addEventListener('dragend', (e) => {
            const dragging = container.querySelector('.dragging');
            if (dragging) dragging.classList.remove('dragging');
            container.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            this.draggedIndex = null;
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            const item = e.target.closest('.playlist-item');

            let fromIndex = this.draggedIndex;
            if (fromIndex === null) {
                const data = e.dataTransfer.getData('text/plain');
                if (data !== "") fromIndex = parseInt(data);
            }

            if (fromIndex !== null && item) {
                const targetIndex = parseInt(item.dataset.index);
                // Reset draggedIndex BEFORE calling reorderPlaylist so that renderPlaylist can proceed
                this.draggedIndex = null;

                if (targetIndex !== fromIndex) {
                    this.reorderPlaylist(fromIndex, targetIndex);
                }
            }

            // Final cleanup
            container.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            this.draggedIndex = null;
        });
    }

    // Reorder tracks in the playlist array
    reorderPlaylist(fromIndex, toIndex) {
        // Move item in current playlist
        const item = this.playlist.splice(fromIndex, 1)[0];
        this.playlist.splice(toIndex, 0, item);

        // Update originalPlaylist if not in shuffle mode, or even if in shuffle mode 
        // if we want to keep this manual order as the "new" base order.
        if (!this.shuffleMode) {
            this.originalPlaylist = [...this.playlist];
        } else {
            // If in shuffle mode, we probably also want to reflect this in the underlying list
            // but for simplicity, let's update originalPlaylist to match the current manual order
            // when the user wants to keep it.
            this.originalPlaylist = [...this.playlist];
        }

        // Update currentIndex if playing song was moved
        if (this.currentIndex === fromIndex) {
            this.currentIndex = toIndex;
        } else if (fromIndex < this.currentIndex && toIndex >= this.currentIndex) {
            this.currentIndex--;
        } else if (fromIndex > this.currentIndex && toIndex <= this.currentIndex) {
            this.currentIndex++;
        }

        // Re-render
        this.renderPlaylist();

        // Save new order
        this.updateURL();
        this.autoSave();

        // Update input field to match new order (optional but helpful)
        this.syncInputToPlaylist();

        // Show feedback
        this.showToast('順序を入れ替えました', 'success');
    }

    // New helper: Sync textarea links to matches current playlist order
    syncInputToPlaylist() {
        const urls = this.playlist.map(t => `https://suno.com/song/${t.uuid}`);
        this.elements.linksInput.value = urls.join('\n');
    }

    // Check if input field is focused
    isInputFocused() {
        const active = document.activeElement;
        return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
    }

    // Load playlist from URL parameters
    loadFromURL() {
        // Check for short URL format first: /p/abc123
        const path = window.location.pathname;
        if (path.startsWith('/p/')) {
            const shortId = path.substring(3);
            if (shortId) {
                this.loadFromShortUrl(shortId);
                return;
            }
        }

        const params = new URLSearchParams(window.location.search);

        // Try compressed format (fallback: ?p=compressed_string)
        const compressed = params.get('p');
        if (compressed) {
            try {
                // Decompress the playlist data
                const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
                if (decompressed) {
                    const uuids = decompressed.split(',');
                    if (uuids.length > 0) {
                        // Convert UUIDs to full URLs for the input
                        const urls = uuids.map(uuid => `https://suno.com/song/${uuid}`);
                        this.elements.linksInput.value = urls.join('\n');
                        // Auto-load the playlist
                        setTimeout(() => this.loadPlaylist(), 500);
                        return;
                    }
                }
            } catch (error) {
                console.error('Failed to decompress playlist URL:', error);
                this.showToast('URLの展開に失敗しました', 'error');
            }
        }

        // Fallback to legacy format (old format: ?tracks=uuid1,uuid2,...)
        const tracks = params.get('tracks');
        if (tracks) {
            const uuids = tracks.split(',');
            if (uuids.length > 0) {
                // Convert UUIDs to full URLs for the input
                const urls = uuids.map(uuid => `https://suno.com/song/${uuid}`);
                this.elements.linksInput.value = urls.join('\n');
                // Auto-load the playlist
                setTimeout(() => this.loadPlaylist(), 500);
            }
        }
    }

    // Load playlist from short URL (KV-based)
    async loadFromShortUrl(shortId) {
        this.showToast(window.i18n.t('toastLoading'));

        try {
            const response = await fetch(`/api/get-playlist?id=${shortId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    this.showToast('プレイリストが見つかりません', 'error');
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
                return;
            }

            const data = await response.json();

            if (data.uuids && data.uuids.length > 0) {
                // Convert UUIDs to full URLs for the input
                const urls = data.uuids.map(uuid => `https://suno.com/song/${uuid}`);
                this.elements.linksInput.value = urls.join('\n');
                // Auto-load the playlist
                setTimeout(() => this.loadPlaylist(), 500);
            } else {
                this.showToast('プレイリストが空です', 'warning');
            }
        } catch (error) {
            console.error('Failed to load short URL:', error);
            this.showToast('プレイリストの読み込みに失敗しました', 'error');
        }
    }

    // Extract UUID from various SUNO URL formats
    extractUUID(url) {
        // Pattern 1: /song/[UUID]
        const songMatch = url.match(/\/song\/([a-f0-9-]{36})/i);
        if (songMatch) return songMatch[1];

        // Pattern 2: Direct UUID in URL
        const uuidMatch = url.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
        if (uuidMatch) return uuidMatch[1];

        return null;
    }

    // Fetch song metadata from SUNO via proxy server with retry
    async fetchSongMetadata(uuid, retries = 3) {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout

                const response = await fetch(`/api/metadata?uuid=${uuid}`, {
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();

                if (data.error) {
                    // Don't retry for certain errors
                    if (data.error.includes('404') || data.error.includes('No metadata')) {
                        return { title: null, artist: null, error: data.error };
                    }
                    throw new Error(data.error);
                }

                if (data.title) {
                    return { title: data.title, artist: data.artist || 'SUNO', error: null };
                }

                return { title: null, artist: null, error: 'メタデータが見つかりません' };
            } catch (error) {
                console.warn(`Metadata fetch attempt ${attempt + 1} failed:`, error);

                // Don't retry on last attempt
                if (attempt === retries - 1) {
                    const errorMsg = this.getErrorMessage(error, 'メタデータ取得');
                    return { title: null, artist: null, error: errorMsg };
                }

                // Exponential backoff
                await this.wait(1000 * Math.pow(2, attempt));
            }
        }
    }

    // Resolve short link to full UUID via proxy server with retry
    async resolveShortLink(shortId, retries = 3) {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 12000);

                const response = await fetch(`/api/resolve?id=${shortId}`, {
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();

                if (data.error && !data.uuid) {
                    throw new Error(data.error);
                }

                return data.uuid || null;
            } catch (error) {
                console.warn(`Short link resolve attempt ${attempt + 1} failed:`, error);

                if (attempt === retries - 1) {
                    return null;
                }

                await this.wait(1000 * Math.pow(2, attempt));
            }
        }
        return null;
    }

    // Helper: wait for specified milliseconds
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get user-friendly error message
    getErrorMessage(error, context) {
        if (!navigator.onLine || this.isOffline) {
            return window.i18n.t('errorOffline');
        }

        const errorStr = error.toString();

        if (error.name === 'AbortError' || errorStr.includes('aborted')) {
            return `${context}: ${window.i18n.t('metaTimeout')}`;
        }

        if (errorStr.includes('HTTP 404') || errorStr.includes('404')) {
            return `${context}: ${window.i18n.t('metaNotFound')}`;
        }

        if (errorStr.includes('HTTP 403')) {
            return `${context}: Access Denied`;
        }

        if (errorStr.includes('HTTP 5') || errorStr.includes('500')) {
            return `${context}: Server Error`;
        }

        if (errorStr.includes('Timeout')) {
            return `${context}: ${window.i18n.t('metaTimeout')}`;
        }

        if (errorStr.includes('fetch') || errorStr.includes('network')) {
            return `${context}: ${window.i18n.t('metaNoNetwork')}`;
        }

        return `${context}: Error`;
    }

    // Load playlist from input
    async loadPlaylist() {
        const text = this.elements.linksInput.value.trim();
        if (!text) {
            this.showToast(window.i18n.t('errorEmpty'), 'warning');
            return;
        }

        if (this.isOffline) {
            this.showToast(window.i18n.t('errorOffline'), 'error');
            return;
        }

        this.showToast(window.i18n.t('toastLoading'));
        this.showLoadingProgress(true);

        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        this.playlist = [];
        this.loadingStates.clear();

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let uuid = this.extractUUID(line);

            // Handle short links via proxy
            if (!uuid && line.includes('/s/')) {
                const shortMatch = line.match(/\/s\/([a-zA-Z0-9]+)/);
                if (shortMatch) {
                    this.updateProgressBar(i, lines.length, window.i18n.t('metaResolving'));
                    uuid = await this.resolveShortLink(shortMatch[1]);
                    if (!uuid) {
                        console.warn('Failed to resolve short link:', line);
                    }
                }
            }

            if (uuid) {
                this.playlist.push({
                    uuid: uuid,
                    mp3Url: `https://cdn1.suno.ai/${uuid}.mp3`,
                    title: `Track ${this.playlist.length + 1}`,
                    artist: window.i18n.t('toastLoading'),
                    shortId: uuid.slice(0, 8),
                    error: null
                });
                this.loadingStates.set(uuid, 'loading');
            }
        }

        if (this.playlist.length === 0) {
            this.showToast('有効なリンクが見つかりませんでした', 'error');
            this.showLoadingProgress(false);
            return;
        }

        // Render playlist immediately with loading state
        this.renderPlaylist();
        this.loadTrack(0);
        this.updateProgressBar(0, this.playlist.length, 'メタデータを取得中...');

        // Fetch metadata for each track with progress updates
        let loadedCount = 0;
        let errorCount = 0;

        const metadataPromises = this.playlist.map(async (track, index) => {
            const metadata = await this.fetchSongMetadata(track.uuid);

            if (metadata && metadata.error) {
                // Error occurred
                this.playlist[index].title = `Track ${index + 1}`;
                this.playlist[index].artist = 'エラー';
                this.playlist[index].error = metadata.error;
                this.loadingStates.set(track.uuid, 'error');
                errorCount++;
            } else if (metadata && metadata.title) {
                // Success
                this.playlist[index].title = metadata.title;
                this.playlist[index].artist = metadata.artist;
                this.playlist[index].error = null;
                this.loadingStates.set(track.uuid, 'loaded');
            } else {
                // No metadata found
                this.playlist[index].title = `Track ${index + 1}`;
                this.playlist[index].artist = 'SUNO';
                this.playlist[index].error = 'メタデータなし';
                this.loadingStates.set(track.uuid, 'error');
                errorCount++;
            }

            loadedCount++;

            // Update progress
            this.updateProgressBar(loadedCount, this.playlist.length, `メタデータ取得中 (${loadedCount}/${this.playlist.length})`);

            // Re-render to show loaded item
            this.renderPlaylist();
            if (index === 0) {
                this.updateNowPlaying();
            }
        });

        // Wait for all metadata to load
        await Promise.all(metadataPromises);

        // Final update
        const successCount = loadedCount - errorCount;
        if (errorCount > 0) {
            this.showToast(`${successCount}曲を読み込みました (${errorCount}件のエラー)`, 'warning');
        } else {
            this.showToast(`${successCount}曲を読み込みました`, 'success');
        }
        this.showLoadingProgress(false);

        // Update URL for sharing
        this.updateURL();

        // Auto-save playlist to storage
        this.autoSave();
    }

    // Update URL with current playlist for sharing (compressed)
    updateURL() {
        if (this.playlist.length === 0) return;

        const uuids = this.playlist.map(t => t.uuid).join(',');
        // Compress the UUIDs using LZ-String
        const compressed = LZString.compressToEncodedURIComponent(uuids);
        const newUrl = `${window.location.pathname}?p=${compressed}`;
        window.history.replaceState({}, '', newUrl);
    }

    // Toggle share dropdown
    toggleShareDropdown() {
        if (this.playlist.length === 0) {
            this.showToast('プレイリストが空です');
            return;
        }
        this.elements.shareDropdown?.classList.toggle('show');
    }

    // Get share URL (short KV-based URL)
    async getShareUrl() {
        try {
            const uuids = this.playlist.map(t => t.uuid);

            const response = await fetch('/api/save-playlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uuids })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return `${window.location.origin}/p/${data.id}`;
        } catch (error) {
            console.error('Failed to generate short URL:', error);
            // Fallback to compressed URL if API fails
            const uuids = this.playlist.map(t => t.uuid).join(',');
            const compressed = LZString.compressToEncodedURIComponent(uuids);
            return `${window.location.origin}${window.location.pathname}?p=${compressed}`;
        }
    }

    // Get share text
    getShareText() {
        const trackCount = this.playlist.length;
        const firstTrack = this.playlist[0];
        if (trackCount === 1) {
            return `🎵 ${firstTrack.title} - ${firstTrack.artist} を聴いてね！`;
        }
        return `🎵 SUNOプレイリスト ${trackCount}曲を共有！「${firstTrack.title}」ほか`;
    }

    // Share to Twitter/X
    async shareToTwitter() {
        if (this.playlist.length === 0) return;

        this.showToast('短縮URL生成中...');
        const url = await this.getShareUrl();
        const text = this.getShareText();
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

        window.open(twitterUrl, '_blank', 'width=550,height=420');
        this.elements.shareDropdown?.classList.remove('show');
        this.showToast('Xで共有中...');
    }

    // Share to LINE
    async shareToLine() {
        if (this.playlist.length === 0) return;

        this.showToast('短縮URL生成中...');
        const url = await this.getShareUrl();
        const text = this.getShareText();
        const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

        window.open(lineUrl, '_blank', 'width=550,height=420');
        this.elements.shareDropdown?.classList.remove('show');
        this.showToast('LINEで共有中...');
    }

    // Share to Facebook
    async shareToFacebook() {
        if (this.playlist.length === 0) return;

        this.showToast('短縮URL生成中...');
        const url = await this.getShareUrl();
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

        window.open(facebookUrl, '_blank', 'width=550,height=420');
        this.elements.shareDropdown?.classList.remove('show');
        this.showToast('Facebookで共有中...');
    }

    // Copy share URL
    async copyShareUrl() {
        if (this.playlist.length === 0) return;

        this.showToast('短縮URL生成中...');
        const url = await this.getShareUrl();

        try {
            await navigator.clipboard.writeText(url);
            this.showToast('URLをコピーしました！');
        } catch (error) {
            prompt('共有URL:', url);
        }
        this.elements.shareDropdown?.classList.remove('show');
    }

    // Render playlist UI
    renderPlaylist(ignoreGuard = false) {
        // Prevent re-rendering while user is dragging, unless specifically requested
        if (!ignoreGuard && this.draggedIndex !== null) return;

        this.elements.trackCount.textContent = `${this.playlist.length}曲`;

        if (this.playlist.length === 0) {
            this.elements.playlistContainer.innerHTML = `
                <div class="empty-playlist">
                    <span class="empty-icon">🎶</span>
                    <p>プレイリストが空です</p>
                </div>
            `;
            return;
        }

        this.elements.playlistContainer.innerHTML = this.playlist.map((track, index) => {
            const loadingState = this.loadingStates.get(track.uuid) || 'loaded';
            const itemClass = `playlist-item ${index === this.currentIndex ? 'active' : ''} ${loadingState}`;

            let errorIcon = '';
            if (track.error) {
                errorIcon = `<span class="error-icon" title="${this.escapeHtml(track.error)}">⚠</span>`;
            }

            return `
                <div class="${itemClass}" data-index="${index}" draggable="true">
                    <span class="drag-handle">≡</span>
                    <span class="item-number">${index + 1}</span>
                    <div class="item-info">
                        <div class="item-title">
                            ${this.escapeHtml(track.title)}
                            ${loadingState === 'loading' ? '<span class="loading-spinner"></span>' : ''}
                            ${errorIcon}
                        </div>
                        <div class="item-artist">${this.escapeHtml(track.artist)}</div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers
        this.elements.playlistContainer.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Ignore if clicking on drag handle
                if (e.target.closest('.drag-handle')) return;

                const index = parseInt(item.dataset.index);
                this.loadTrack(index);
                this.play();
            });
        });
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Update now playing display
    updateNowPlaying() {
        const track = this.playlist[this.currentIndex];
        if (track) {
            this.elements.trackTitle.textContent = track.title;
            this.elements.trackArtist.textContent = track.artist;
        }
    }

    // Load a specific track
    loadTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;

        this.currentIndex = index;
        const track = this.playlist[index];

        this.elements.audioPlayer.src = track.mp3Url;
        this.elements.trackTitle.textContent = track.title;
        this.elements.trackArtist.textContent = track.artist;

        // Update playlist UI
        this.elements.playlistContainer.querySelectorAll('.playlist-item').forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });

        // Scroll active item into view
        const activeItem = this.elements.playlistContainer.querySelector('.playlist-item.active');
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // Update all control icons based on current theme/state
    updateControlIcons() {
        if (!window.themeManager) return;

        this.elements.playIcon.textContent = this.isPlaying ?
            window.themeManager.getIcon('pause') :
            window.themeManager.getIcon('play');

        this.elements.shuffleIcon.textContent = window.themeManager.getIcon('shuffle');

        this.elements.repeatIcon.textContent = this.repeatMode === 'one' ?
            window.themeManager.getIcon('repeatOne') :
            window.themeManager.getIcon('repeat');

        const volumeIcon = document.querySelector('.volume-icon');
        if (volumeIcon) {
            volumeIcon.textContent = this.elements.audioPlayer.muted ?
                window.themeManager.getIcon('mute') :
                window.themeManager.getIcon('volume');
        }

        this.updateNowPlaying();
    }

    // Play/Pause toggle
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    // Play
    play() {
        if (this.playlist.length === 0) {
            this.showToast('プレイリストが空です');
            return;
        }

        this.elements.audioPlayer.play()
            .then(() => {
                this.isPlaying = true;
                this.elements.playIcon.textContent = window.themeManager.getIcon('pause');
                this.updateNowPlaying();
            })
            .catch(error => {
                console.error('Playback failed:', error);
                this.showToast('再生に失敗しました');
            });
    }

    // Pause
    pause() {
        this.elements.audioPlayer.pause();
        this.isPlaying = false;
        this.elements.playIcon.textContent = window.themeManager.getIcon('play');
        this.updateNowPlaying();
    }

    // Play next track
    playNext() {
        if (this.repeatMode === 'one') {
            // Replay current track
            this.elements.audioPlayer.currentTime = 0;
            this.play();
            return;
        }

        if (this.currentIndex < this.playlist.length - 1) {
            this.loadTrack(this.currentIndex + 1);
            if (this.isPlaying) this.play();
        } else if (this.repeatMode === 'all') {
            // Loop back to first track
            this.loadTrack(0);
            if (this.isPlaying) this.play();
        } else {
            // End of playlist
            this.pause();
            this.showToast('プレイリスト終了');
        }
    }

    // Play previous track
    playPrevious() {
        // If more than 3 seconds into song, restart current song
        if (this.elements.audioPlayer.currentTime > 3) {
            this.elements.audioPlayer.currentTime = 0;
        } else if (this.currentIndex > 0) {
            this.loadTrack(this.currentIndex - 1);
            if (this.isPlaying) this.play();
        }
    }

    // Set volume
    setVolume(value) {
        this.elements.audioPlayer.volume = value / 100;
    }

    // Seek
    seek(e) {
        const rect = this.elements.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.elements.audioPlayer.currentTime = percent * this.elements.audioPlayer.duration;
    }

    // Seek relative (for keyboard shortcuts)
    seekRelative(seconds) {
        const newTime = this.elements.audioPlayer.currentTime + seconds;
        this.elements.audioPlayer.currentTime = Math.max(0, Math.min(newTime, this.elements.audioPlayer.duration || 0));
    }

    // Toggle mute
    toggleMute() {
        this.elements.audioPlayer.muted = !this.elements.audioPlayer.muted;
        const icon = this.elements.audioPlayer.muted ?
            window.themeManager.getIcon('mute') :
            window.themeManager.getIcon('volume');

        const volumeIcon = document.querySelector('.volume-icon');
        if (volumeIcon) volumeIcon.textContent = icon;

        this.showToast(this.elements.audioPlayer.muted ? 'ミュート' : 'ミュート解除');
    }

    // Toggle shuffle
    toggleShuffle() {
        this.shuffleMode = !this.shuffleMode;

        if (this.shuffleMode) {
            // Save original order
            this.originalPlaylist = [...this.playlist];
            // Shuffle playlist (Fisher-Yates algorithm)
            for (let i = this.playlist.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
            }
            this.currentIndex = 0;
            this.renderPlaylist();
            this.loadTrack(0);
            this.updateShuffleButton();
            this.elements.shuffleIcon.textContent = window.themeManager.getIcon('shuffle');
            this.showToast('シャッフルオン', 'success');
        } else {
            // Restore original order
            this.playlist = [...this.originalPlaylist];
            this.currentIndex = 0;
            this.renderPlaylist();
            this.loadTrack(0);
            this.updateShuffleButton();
            this.elements.shuffleIcon.textContent = window.themeManager.getIcon('shuffle');
            this.showToast('シャッフルオフ', 'success');
        }

        this.updateShuffleButton();
    }

    // Update shuffle button
    updateShuffleButton() {
        if (this.shuffleMode) {
            this.elements.shuffleBtn.classList.add('active');
        } else {
            this.elements.shuffleBtn.classList.remove('active');
        }
    }

    // Toggle repeat
    toggleRepeat() {
        const modes = ['none', 'all', 'one'];
        const currentIdx = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIdx + 1) % modes.length];

        const messages = {
            'none': window.i18n.t('repeatNone'),
            'all': window.i18n.t('repeatAll'),
            'one': window.i18n.t('repeatOne')
        };

        const icons = {
            'none': '🔁',
            'all': '🔁',
            'one': '🔂'
        };

        this.elements.repeatIcon.textContent = this.repeatMode === 'one' ?
            window.themeManager.getIcon('repeatOne') :
            window.themeManager.getIcon('repeat');

        this.showToast(messages[this.repeatMode], 'success');
        this.updateRepeatButton();
    }

    // Update repeat button
    updateRepeatButton() {
        if (this.repeatMode === 'none') {
            this.elements.repeatBtn.classList.remove('active');
        } else {
            this.elements.repeatBtn.classList.add('active');
        }
    }

    // Clear playlist
    clearPlaylist() {
        if (this.playlist.length === 0) return;

        if (confirm(window.i18n.t('confirmClear'))) {
            this.playlist = [];
            this.originalPlaylist = [];
            this.loadingStates.clear();
            this.currentIndex = 0;
            this.shuffleMode = false;
            this.repeatMode = 'none';
            this.pause();
            this.elements.audioPlayer.src = '';
            this.elements.trackTitle.textContent = window.i18n.t('appName');
            this.elements.trackArtist.textContent = window.i18n.t('inputPlaceholder');
            this.renderPlaylist();
            this.updateShuffleButton();
            this.updateRepeatButton();
            this.showToast(window.i18n.t('toastPlaylistCleared'), 'success');
        }
    }

    // Trigger file import
    triggerImport() {
        this.elements.importFile.click();
    }

    // Import playlist from JSON file
    async importPlaylist(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Reset file input for reuse
        event.target.value = '';

        if (!file.name.endsWith('.json')) {
            this.showToast(window.i18n.t('errorInvalidJson'), 'error');
            return;
        }

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // Validate JSON structure
            if (!data.tracks || !Array.isArray(data.tracks)) {
                throw new Error('Invalid playlist format');
            }

            if (data.tracks.length === 0) {
                this.showToast(window.i18n.t('errorEmpty'), 'warning');
                return;
            }

            // Validate each track has required fields
            const validTracks = data.tracks.filter(t => t.uuid || t.url);

            if (validTracks.length === 0) {
                throw new Error(window.i18n.t('metaNotFound'));
            }

            // Convert tracks to URLs
            const urls = validTracks.map(track => {
                if (track.uuid) {
                    return `https://suno.com/song/${track.uuid}`;
                } else if (track.url) {
                    return track.url;
                }
            }).filter(url => url);

            // Load the playlist
            this.elements.linksInput.value = urls.join('\n');
            this.showToast(`${validTracks.length} ${window.i18n.t('toastPlaylistImported')}`, 'success');

            // Auto-load the playlist
            setTimeout(() => this.loadPlaylist(), 500);

        } catch (error) {
            console.error('Import error:', error);
            this.showToast(window.i18n.t('errorLoadFailed'), 'error');
        }
    }

    // Download playlist
    downloadPlaylist() {
        if (this.playlist.length === 0) {
            this.showToast(window.i18n.t('errorEmpty'), 'warning');
            return;
        }

        const data = {
            created: new Date().toISOString(),
            trackCount: this.playlist.length,
            tracks: this.playlist.map(t => ({
                uuid: t.uuid,
                title: t.title,
                artist: t.artist,
                url: `https://suno.com/song/${t.uuid}`
            }))
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `suno-playlist-${new Date().getTime()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast(window.i18n.t('toastPlaylistSaved'), 'success');
    }

    // Toggle help modal
    toggleHelpModal() {
        this.elements.helpModal.classList.toggle('show');
    }

    // Switch help tab
    switchHelpTab(tabName) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.help-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.help-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Add active class to clicked tab and corresponding content
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(`${tabName}Tab`);

        if (activeTab && activeContent) {
            activeTab.classList.add('active');
            activeContent.classList.add('active');
        }
    }

    // Update progress bar
    updateProgress() {
        const current = this.elements.audioPlayer.currentTime;
        const duration = this.elements.audioPlayer.duration;

        if (duration) {
            const percent = (current / duration) * 100;
            this.elements.progress.style.width = `${percent}%`;
            this.elements.currentTime.textContent = this.formatTime(current);
        }
    }

    // Update duration display
    updateDuration() {
        const duration = this.elements.audioPlayer.duration;
        this.elements.duration.textContent = this.formatTime(duration);
    }

    // Format time as M:SS
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Handle audio errors
    handleError(e) {
        console.error('Audio error:', e);
        this.showToast('再生エラー: このトラックをスキップします');
        // Auto-skip to next track after 2 seconds
        setTimeout(() => this.playNext(), 2000);
    }

    // Show/hide loading progress bar
    showLoadingProgress(show) {
        if (show) {
            this.elements.loadingProgress.classList.add('show');
        } else {
            setTimeout(() => {
                this.elements.loadingProgress.classList.remove('show');
            }, 500);
        }
    }

    // Update progress bar
    updateProgressBar(current, total, message) {
        const percent = total > 0 ? (current / total) * 100 : 0;
        this.elements.progressBarFill.style.width = `${percent}%`;
        this.elements.progressText.textContent = message || `${current}/${total}`;
    }

    // Show toast notification
    showToast(message, type = 'default') {
        this.elements.toast.textContent = message;
        this.elements.toast.className = 'toast show';

        if (type !== 'default') {
            this.elements.toast.classList.add(type);
        }

        setTimeout(() => {
            this.elements.toast.classList.remove('show');
        }, 3000);
    }

    // ===================================
    // Playlist Persistence Methods
    // ===================================

    // Auto-save current playlist
    autoSave() {
        if (this.playlist.length > 0) {
            this.storage.saveCurrent(this.playlist);
            this.storage.savePlaylist(this.playlist);
        }
    }

    // Restore last playlist on page load
    restoreLastPlaylist() {
        // Don't restore if URL has tracks parameter
        const params = new URLSearchParams(window.location.search);
        if (params.get('tracks')) return;

        const current = this.storage.getCurrent();
        if (current && current.tracks.length > 0) {
            // Ask user if they want to restore
            if (confirm(`前回のプレイリスト（${current.tracks.length}曲）を復元しますか？`)) {
                this.loadFromStorage(current);
            }
        }
    }

    // Load playlist from storage object
    loadFromStorage(playlistObj) {
        this.elements.linksInput.value = playlistObj.tracks
            .map(t => `https://suno.com/song/${t.uuid}`)
            .join('\n');

        this.loadPlaylist();
    }

    // Show playlist history modal
    showPlaylistHistory() {
        const recent = this.storage.getRecentPlaylists();
        const favorites = this.storage.getFavorites();

        if (recent.length === 0 && favorites.length === 0) {
            this.showToast('履歴がありません', 'warning');
            return;
        }

        this.elements.historyModal.classList.add('show');
        this.renderHistory();
    }

    // Render history list
    renderHistory() {
        const recent = this.storage.getRecentPlaylists();
        const favorites = this.storage.getFavorites();

        let html = '';

        if (favorites.length > 0) {
            html += '<div class="history-section"><h4>⭐ お気に入り</h4>';
            html += favorites.map(p => this.renderHistoryItem(p)).join('');
            html += '</div>';
        }

        if (recent.length > 0) {
            html += '<div class="history-section"><h4>📜 最近のプレイリスト</h4>';
            html += recent.map(p => this.renderHistoryItem(p)).join('');
            html += '</div>';
        }

        if (html === '') {
            html = `
                <div class="empty-history">
                    <div class="empty-history-icon">📜</div>
                    <p>履歴がありません</p>
                </div>
            `;
        }

        this.elements.historyList.innerHTML = html;
        this.attachHistoryListeners();
    }

    // Render single history item
    renderHistoryItem(playlist) {
        const isFav = this.storage.isFavorite(playlist.id);
        const date = new Date(playlist.timestamp);
        const timeAgo = this.getTimeAgo(date);

        return `
            <div class="history-item" data-id="${playlist.id}">
                <div class="history-info">
                    <div class="history-title">${this.escapeHtml(playlist.firstTrack)}</div>
                    <div class="history-meta">${playlist.trackCount}曲 · ${timeAgo}</div>
                </div>
                <div class="history-actions">
                    <button class="btn-icon favorite-btn ${isFav ? 'active' : ''}" 
                            data-id="${playlist.id}" title="お気に入り">
                        ${isFav ? '⭐' : '☆'}
                    </button>
                    <button class="btn-icon load-btn" 
                            data-id="${playlist.id}" title="読み込む">
                        📂
                    </button>
                    <button class="btn-icon delete-btn" 
                            data-id="${playlist.id}" title="削除">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    // Get time ago string
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);

        if (seconds < 60) return 'たった今';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}分前`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}時間前`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}日前`;

        return date.toLocaleDateString('ja-JP');
    }

    // Attach event listeners to history items
    attachHistoryListeners() {
        // Favorite button
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const added = this.storage.toggleFavorite(id);
                this.renderHistory();
                this.showToast(added ? 'お気に入りに追加' : 'お気に入りから削除', 'success');
            });
        });

        // Load button
        document.querySelectorAll('.load-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const recent = this.storage.getRecentPlaylists();
                const favorites = this.storage.getFavorites();
                const all = [...recent, ...favorites];
                const playlist = all.find(p => p.id === id);

                if (playlist) {
                    this.elements.historyModal.classList.remove('show');
                    this.loadFromStorage(playlist);
                    this.showToast('プレイリストを読み込みました', 'success');
                }
            });
        });

        // Delete button
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                if (confirm('このプレイリストを削除しますか？')) {
                    this.storage.deletePlaylist(id);
                    this.renderHistory();
                    this.showToast('プレイリストを削除しました', 'success');
                }
            });
        });
    }

    // Toggle history modal
    toggleHistoryModal() {
        if (this.elements.historyModal.classList.contains('show')) {
            this.elements.historyModal.classList.remove('show');
        } else {
            this.showPlaylistHistory();
        }
    }
}

// Main entry point is the integrated DOMContentLoaded listener at the end of the file


// ===================================
//    PWA Service Worker Registration
// ===================================

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('[PWA] Service Worker registered:', registration.scope);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('[PWA] New Service Worker found, installing...');

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'activated') {
                            console.log('[PWA] New Service Worker activated');
                            // Optionally show update notification
                            if (window.sunoPlaylist) {
                                window.sunoPlaylist.showToast('アプリが更新されました', 'success');
                            }
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('[PWA] Service Worker registration failed:', error);
            });
    });
}

// PWA Install Prompt
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('[PWA] beforeinstallprompt event fired');
    // Prevent the mini-infobar from appearing
    e.preventDefault();
    // Store the event for later use
    deferredPrompt = e;

    // Optional: Show custom install button
    // You can add a button in the UI to trigger installation
});

window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    deferredPrompt = null;
    if (window.sunoPlaylist) {
        window.sunoPlaylist.showToast('アプリをインストールしました！', 'success');
    }
});

// Function to trigger PWA install (can be called from a button)
window.installPWA = async () => {
    if (!deferredPrompt) {
        console.log('[PWA] Install prompt not available');
        return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User choice: ${outcome}`);

    // Clear the prompt
    deferredPrompt = null;
};

// ===================================
//    Theme & I18n Initialization
// ===================================

// Apply initial translations, theme, and app on page load
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize i18n FIRST so translations are available for all components
    window.i18n = new I18nManager();
    window.i18n.updateDOM();

    // 2. Initialize Theme Manager
    window.themeManager = new ThemeManager();
    window.themeManager.init();

    // 3. Initialize the main App (must be after i18n and theme)
    window.sunoPlaylist = new SUNOPlaylist();

    // --- Selectors & Dropdowns Event Listeners ---

    // Theme selector
    const themeBtn = document.getElementById('themeBtn');
    const themeDropdown = document.getElementById('themeDropdown');

    if (themeBtn && themeDropdown) {
        themeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            themeDropdown.classList.toggle('show');
            const languageDropdown = document.getElementById('languageDropdown');
            if (languageDropdown) languageDropdown.classList.remove('show');
        });

        document.querySelectorAll('.theme-option').forEach(option => {
            const theme = option.getAttribute('data-theme');
            if (theme === window.themeManager.getCurrentTheme()) option.classList.add('active');

            option.addEventListener('click', () => {
                window.themeManager.setTheme(theme);
                document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                themeDropdown.classList.remove('show');

                if (window.sunoPlaylist) {
                    const themeNames = { default: window.i18n.t('themeDefault'), tabby: window.i18n.t('themeTabby') };
                    window.sunoPlaylist.showToast(themeNames[theme] || theme, 'success');
                }
            });
        });
    }

    // Language selector
    const languageBtn = document.getElementById('languageBtn');
    const languageDropdown = document.getElementById('languageDropdown');

    if (languageBtn && languageDropdown) {
        languageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            languageDropdown.classList.toggle('show');
            if (themeDropdown) themeDropdown.classList.remove('show');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-selector') && languageDropdown) languageDropdown.classList.remove('show');
            if (!e.target.closest('.theme-selector') && themeDropdown) themeDropdown.classList.remove('show');
        });

        document.querySelectorAll('.language-option').forEach(option => {
            const lang = option.getAttribute('data-lang');
            if (lang === window.i18n.getCurrentLanguage()) option.classList.add('active');

            option.addEventListener('click', (e) => {
                window.i18n.setLanguage(lang);
                document.querySelectorAll('.language-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                languageDropdown.classList.remove('show');

                if (window.sunoPlaylist) {
                    const langNames = { ja: '日本語', en: 'English', zh: '中文', ko: '한국어' };
                    window.sunoPlaylist.showToast(langNames[lang], 'success');
                }
            });
        });
    }
});
