// ===================================
//    Internationalization Manager
// ===================================
class I18nManager {
    constructor() {
        // Hide splash screen safely
        try {
            if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.SplashScreen) {
                window.Capacitor.Plugins.SplashScreen.hide();
            }
        } catch (e) {
            console.warn('Could not hide splash screen:', e.message);
        }
        this.LANG_KEY = 'suno_language';
        this.translations = window.translations || {};
        this.currentLang = this.detectLanguage();
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
            // Guard: Do not overwrite the dynamic track count number
            if (element.id === 'trackCount') return;

            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);

            // Update element text
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }

            // Also update title attribute if it exists
            if (element.hasAttribute('title')) {
                element.setAttribute('title', translation);
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
                logo: '🐈‍⬛',
                play: '🐾',
                pause: '⏸',
                shuffle: '🔀',
                previous: '⏮',
                next: '⏭',
                repeat: '🔁',
                repeatOne: '🔂',
                volume: '🔊',
                mute: '🔇'
            },
            sunny: {
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
            },
            sakura: {
                logo: '🌸',
                play: '🐾',
                pause: '😽',
                shuffle: '🐈',
                previous: '⏮',
                next: '⏭',
                repeat: '🔄',
                repeatOne: '🤍',
                volume: '😺',
                mute: '😿'
            },
            cyber: {
                logo: '🤖',
                play: '🐾',
                pause: '⚡',
                shuffle: '🔌',
                previous: '⏮',
                next: '⏭',
                repeat: '🔁',
                repeatOne: '💾',
                volume: '🔈',
                mute: '🔇'
            },
            tuxedo: {
                logo: '🤵',
                play: '🐾',
                pause: '🦉',
                shuffle: '🌌',
                previous: '⏮',
                next: '⏭',
                repeat: '🔁',
                repeatOne: '🌃',
                volume: '🔈',
                mute: '🔇'
            },
            oddeye: {
                logo: '👁️',
                play: '🐾',
                pause: '🌿',
                shuffle: '🍃',
                previous: '⏮',
                next: '⏭',
                repeat: '🔁',
                repeatOne: '🌱',
                volume: '🔈',
                mute: '🔇'
            }
        };
    }

    // Detect user's theme preference
    detectTheme() {
        // Priority: LocalStorage > Default (default)
        const stored = localStorage.getItem(this.THEME_KEY);
        const validThemes = ['default', 'sunny', 'sakura', 'cyber', 'tuxedo', 'oddeye'];
        if (stored && validThemes.includes(stored)) {
            return stored;
        }
        return 'default';
    }

    // Set theme
    setTheme(theme) {
        const validThemes = ['default', 'sunny', 'sakura', 'cyber', 'tuxedo', 'oddeye'];
        if (!validThemes.includes(theme)) {
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

        if (this.currentTheme && this.currentTheme !== 'default') {
            html.setAttribute('data-theme', this.currentTheme);
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
        const mascotImg = document.getElementById('mascotImg');
        if (mascotImg) {
            const theme = this.currentTheme || 'default';
            const bgMap = {
                default: 'luna_anime.png',
                sunny: 'sunny_anime.png',
                sakura: 'sakura_anime.png',
                cyber: 'cyber_anime.png',
                tuxedo: 'tuxedo_anime.png',
                oddeye: 'oddeye_anime.png'
            };
            mascotImg.src = bgMap[theme] || 'luna_anime.png';
        }

        // Play/Pause/Shuffle/Repeat are managed by SUNOPlaylist class
        if (window.sunoPlaylist) {
            window.sunoPlaylist.updateControlIcons();
        }
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
        this.LIKED_TRACKS_KEY = 'suno_liked_tracks';
        this.SAVED_KEY = 'suno_saved_playlists';
        this.MAX_RECENT = 10;
        this.db = firebase.firestore();
    }

    async saveToCloud(playlistObj) {
        const user = window.authManager?.getCurrentUser();
        if (!user) return null;

        try {
            const data = {
                ...playlistObj,
                userId: user.uid,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            await this.db.collection('playlists').doc(playlistObj.id).set(data, { merge: true });
            console.log('[CloudStore] Saved to Firestore:', playlistObj.id);
            return true;
        } catch (e) {
            console.error('[CloudStore] Save error:', e);
            return false;
        }
    }

    async getCloudPlaylists() {
        const user = window.authManager?.getCurrentUser();
        if (!user) return [];

        try {
            const snapshot = await this.db.collection('playlists')
                .where('userId', '==', user.uid)
                .orderBy('timestamp', 'desc')
                .get();
            return snapshot.docs.map(doc => doc.data());
        } catch (e) {
            console.error('[CloudStore] Fetch error:', e);
            return [];
        }
    }

    async deleteFromCloud(playlistId) {
        try {
            await this.db.collection('playlists').doc(playlistId).delete();
            return true;
        } catch (e) {
            return false;
        }
    }

    // Get all saved playlists
    getSavedPlaylists() {
        try {
            const data = localStorage.getItem(this.SAVED_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading saved playlists:', error);
            return [];
        }
    }

    async saveNamedPlaylist(name, playlist) {
        if (playlist.length === 0) return null;

        try {
            const saved = this.getSavedPlaylists();
            const playlistObj = {
                id: 'saved_' + Date.now(),
                name: name,
                timestamp: new Date().toISOString(),
                trackCount: playlist.length,
                tracks: playlist.map(t => ({
                    uuid: t.uuid,
                    title: t.title,
                    artist: t.artist,
                    thumbnail: t.thumbnail || null
                })),
                firstTrack: playlist[0].title
            };

            saved.unshift(playlistObj);
            localStorage.setItem(this.SAVED_KEY, JSON.stringify(saved));

            // Cloud Sync
            if (window.authManager?.getCurrentUser()) {
                await this.saveToCloud(playlistObj);
            }

            return playlistObj.id;
        } catch (error) {
            console.error('Error saving named playlist:', error);
            return null;
        }
    }

    async deleteSavedPlaylist(playlistId) {
        try {
            const saved = this.getSavedPlaylists();
            const filtered = saved.filter(p => p.id !== playlistId);
            localStorage.setItem(this.SAVED_KEY, JSON.stringify(filtered));

            // Cloud Sync
            if (window.authManager?.getCurrentUser()) {
                await this.deleteFromCloud(playlistId);
            }

            return true;
        } catch (error) {
            return false;
        }
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
                    artist: t.artist,
                    thumbnail: t.thumbnail || null
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
                    artist: t.artist,
                    thumbnail: t.thumbnail || null
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

    // Liked tracks (individual)
    getLikedTracks() {
        try {
            const liked = localStorage.getItem(this.LIKED_TRACKS_KEY);
            return liked ? JSON.parse(liked) : [];
        } catch (e) {
            return [];
        }
    }

    toggleTrackLike(uuid) {
        try {
            const liked = this.getLikedTracks();
            const index = liked.indexOf(uuid);
            if (index >= 0) {
                liked.splice(index, 1);
            } else {
                liked.push(uuid);
            }
            localStorage.setItem(this.LIKED_TRACKS_KEY, JSON.stringify(liked));
            return index < 0;
        } catch (e) {
            return false;
        }
    }

    isTrackLiked(uuid) {
        return this.getLikedTracks().includes(uuid);
    }
}

class SUNOPlaylist {
    constructor() {
        this.playlist = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.playbackTimer = null;
        this.recordedTracks = new Set();
        this.vBars = [];
        this.originalPlaylist = [];
        this.loadingStates = new Map();
        this.searchQuery = '';

        // API Base configuration for different environments
        const hostname = window.location.hostname;
        const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
        const isVercel = hostname.includes('vercel.app');
        const isCapacitor = !!window.Capacitor;

        if (isVercel || (isLocalHost && !isCapacitor)) {
            this.apiBase = '';
        } else if (isCapacitor) {
            this.apiBase = 'https://suno-playlist.vercel.app';
        } else {
            this.apiBase = 'http://localhost:3000';
        }

        console.log('[System] App Initializing v5. Host:', hostname);
        this.checkApiConnectivity();

        this.safeInitElements();
        this.setupVisualizer();

        if (window.authManager) {
            window.authManager.onUserChanged = (user) => {
                try {
                    this.handleUserChanged(user);
                } catch (e) {
                    console.error("[App] handleUserChanged failure:", e);
                }
            };
        }

        if (this.elements.title) {
            // Already set version suffix if needed, but keeping it simple
        }

        // Loading state
        this.loadingStates = new Map();

        // Error tracking
        this.isOffline = !navigator.onLine;

        // Playback modes
        this.shuffleMode = false;
        this.repeatMode = 'none'; // 'none', 'all', 'one'
        this.originalPlaylist = [];

        // Storage
        try {
            this.storage = new PlaylistStorage();
        } catch (e) {
            console.error("[App] Storage init failure:", e);
        }

        // Drag and drop state
        this.draggedIndex = null;

        try {
            this.init();
        } catch (e) {
            console.error("[App] init() failed:", e);
        }
        this.setupDeepLinkListener();
        this.setupCapacitorListeners();
    }

    setupCapacitorListeners() {
        if (!window.Capacitor) return;

        // Handle Android Back Button
        try {
            const { App } = window.Capacitor.Plugins;
            if (App) {
                App.addListener('backButton', () => {
                    // Close modals if open
                    const activeModals = document.querySelectorAll('.modal.active, .modal[style*="display: block"]');
                    if (activeModals.length > 0) {
                        activeModals.forEach(m => {
                            m.style.display = 'none';
                            m.classList.remove('active');
                        });
                        return;
                    }

                    // Otherwise, minimize the app
                    App.minimizeApp();
                });
            }
        } catch (e) {
            console.warn('[System] Could not init BackButton listener:', e);
        }

        // Keyboard handling (if needed for layout shifts)
        try {
            const { Keyboard } = window.Capacitor.Plugins;
            if (Keyboard) {
                Keyboard.addListener('keyboardWillShow', () => {
                    document.body.classList.add('keyboard-open');
                });
                Keyboard.addListener('keyboardWillHide', () => {
                    document.body.classList.remove('keyboard-open');
                });
            }
        } catch (e) {
            console.warn('[System] Could not init Keyboard listener:', e);
        }
    }

    safeInitElements() {
        const getEl = (id) => {
            const el = document.getElementById(id);
            if (!el) console.warn(`[App] Element not found: #${id}`);
            return el;
        };

        this.elements = {
            audioPlayer: getEl('audioPlayer'),
            trackTitle: getEl('trackTitle'),
            trackArtist: getEl('trackArtist'),
            playBtn: getEl('playBtn'),
            prevBtn: getEl('prevBtn'),
            nextBtn: getEl('nextBtn'),
            progressBar: getEl('progressBar'),
            progress: getEl('progress'),
            currentTime: getEl('currentTime'),
            duration: getEl('duration'),
            playlistContainer: getEl('playlist'), // Id is 'playlist' in HTML
            loadBtn: getEl('loadBtn'),
            linksInput: getEl('linksInput'),
            clearBtn: getEl('clearBtn'),
            shareBtn: getEl('shareBtn'),
            shareTwitter: getEl('shareTwitter'),
            shareLine: getEl('shareLine'),
            shareFacebook: getEl('shareFacebook'),
            shareCopy: getEl('shareCopy'),
            shareDropdown: getEl('shareDropdown'),
            volumeSlider: getEl('volumeSlider'),
            shuffleBtn: getEl('shuffleBtn'),
            repeatBtn: getEl('repeatBtn'),
            shuffleIcon: getEl('shuffleIcon'),
            repeatIcon: getEl('repeatIcon'),
            playIcon: getEl('playIcon'),
            importBtn: getEl('importBtn'),
            importFile: getEl('importFile'),
            downloadBtn: getEl('downloadBtn'),
            saveNamedBtn: getEl('saveNamedBtn'),
            libraryOpenBtn: getEl('libraryOpenBtn'),
            historyBtn: getEl('historyBtn'),
            historyModal: getEl('historyModal'),
            historyList: getEl('historyList'),
            closeHistoryBtn: getEl('closeHistoryBtn'),
            modalTabs: document.querySelectorAll('.modal-tab'),
            helpModal: getEl('helpModal'),
            helpContent: getEl('helpContent'),
            closeHelpBtn: getEl('closeHelpBtn'),
            toggleInputBtn: getEl('toggleInputBtn'),
            toggleInputIcon: getEl('toggleInputIcon'),
            inputContent: getEl('inputContent'),
            seekBackBtn: getEl('seekBackBtn'),
            seekForwardBtn: getEl('seekForwardBtn'),
            rankingBtn: getEl('rankingBtn'),
            rankingModal: getEl('rankingModal'),
            rankingList: getEl('rankingList'),
            closeRankingBtn: getEl('closeRankingBtn'),
            shareTrackBtn: getEl('shareTrackBtn'),
            pasteAndAddBtn: getEl('loadBtn'),
            openSunoBtn: getEl('openSunoLink'), // HTML uses openSunoLink
            lyricsBtn: getEl('lyricsBtn'),
            lyricsContainer: getEl('lyricsContainer'),
            lyricsContent: getEl('lyricsContent'),
            closeLyricsBtn: getEl('closeLyricsBtn'),
            playlistSearch: getEl('playlistSearch'),
            debugToggleBtn: getEl('debugToggleBtn'),
            debugLog: getEl('debugLog'),
            title: document.querySelector('.app-title') || document.querySelector('.glass-text'),
            trendingSection: getEl('trendingSection'),
            trendingList: getEl('trendingList'),
            welcomeMessage: getEl('welcomeMessage'),
            mascotImg: getEl('mascotImg'),
            userBtn: getEl('userBtn'),
            userDropdown: getEl('userDropdown'),
            userInfo: getEl('userInfo'),
            userAvatar: getEl('userAvatar'),
            userName: getEl('userName'),
            loginOptions: getEl('loginOptions'),
            googleLogin: getEl('googleLogin'),
            logoutOption: getEl('logoutOption'),
            visualizer: getEl('visualizer'),
            playerThumb: getEl('playerThumb'),
            albumPlaceholder: getEl('albumPlaceholder'),
            lyricsBtn: getEl('lyricsBtn'),
            lyricsContainer: getEl('lyricsContainer'),
            lyricsContent: getEl('lyricsContent'),
            trackCount: getEl('trackCount'),
            offlineBanner: getEl('offlineBanner'),
            toast: getEl('toast'),
            cancelLoadingBtn: getEl('cancelLoadingBtn')
        };
    }

    setupVisualizer() {
        if (!this.elements.visualizer) return;
        this.elements.visualizer.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            const bar = document.createElement('div');
            bar.className = 'v-bar';
            this.elements.visualizer.appendChild(bar);
            this.vBars.push(bar);
        }
    }

    animateVisualizer() {
        if (!this.isPlaying) {
            this.elements.visualizer?.classList.remove('active');
            this.elements.albumPlaceholder?.classList.add('show');
            document.querySelector('.album-art')?.classList.remove('playing');
            return;
        }

        this.elements.visualizer?.classList.add('active');
        document.querySelector('.album-art')?.classList.add('playing');

        if (this.vBars && this.vBars.length > 0) {
            this.vBars.forEach(bar => {
                const height = 20 + Math.random() * 60;
                bar.style.height = `${height}%`;
            });
        }

        if (this.isPlaying) {
            requestAnimationFrame(() => this.animateVisualizer());
        }
    }

    setupDeepLinkListener() {
        console.log('[System] Initializing Deep Link Listener...');
        let lastLinkTime = 0;

        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
            window.Capacitor.Plugins.App.addListener('appUrlOpen', async (data) => {
                const now = Date.now();
                if (now - lastLinkTime < 1000) return;
                lastLinkTime = now;

                if (window.Capacitor.Plugins.Browser) {
                    try { await window.Capacitor.Plugins.Browser.close(); } catch (e) { }
                }

                // Parse parameters from the deep link
                const url = new URL(data.url);
                const params = url.searchParams;
                if (params.has('uid')) {
                    const userData = {
                        uid: params.get('uid'),
                        name: params.get('name'),
                        photo: params.get('photo')
                    };
                    window.authManager.setExternalUser(userData);
                }
            });
        }
    }

    init() {
        // One-time cache wipe: clear stale meta cache from previous scraper versions
        const CACHE_VERSION = 4;
        try {
            const currentVersion = parseInt(localStorage.getItem('suno_cache_ver') || '0');
            if (currentVersion < CACHE_VERSION) {
                let cleared = 0;
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('meta_')) keysToRemove.push(key);
                }
                keysToRemove.forEach(k => { localStorage.removeItem(k); cleared++; });
                localStorage.setItem('suno_cache_ver', String(CACHE_VERSION));
                console.log(`[Cache] Cleared ${cleared} stale meta cache entries (v${currentVersion} → v${CACHE_VERSION})`);
            }
        } catch (e) { console.warn('[Cache] Wipe failed:', e); }

        // Event Listeners
        this.elements.loadBtn.addEventListener('click', () => this.handlePasteAndAdd());
        this.elements.toggleInputBtn?.addEventListener('click', () => this.toggleInputSection());
        this.elements.shareBtn?.addEventListener('click', () => this.toggleShareDropdown());
        this.elements.shareTwitter?.addEventListener('click', () => this.shareToTwitter());
        this.elements.shareLine?.addEventListener('click', () => this.shareToLine());
        this.elements.shareFacebook?.addEventListener('click', () => this.shareToFacebook());
        this.elements.shareCopy?.addEventListener('click', () => this.copyShareUrl());
        this.elements.shareTrackBtn?.addEventListener('click', () => this.shareSingleTrack());
        this.elements.lyricsBtn?.addEventListener('click', () => this.toggleLyrics());
        this.elements.closeLyricsBtn?.addEventListener('click', () => {
            if (this.elements.lyricsContainer) this.elements.lyricsContainer.style.display = 'none';
        });

        // Search listener
        this.elements.playlistSearch?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase().trim();
            this.renderPlaylist(true);
        });
        this.elements.playBtn.addEventListener('click', () => this.togglePlay());
        this.elements.prevBtn.addEventListener('click', () => this.playPrevious());
        this.elements.nextBtn.addEventListener('click', () => this.playNext());
        this.elements.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.elements.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        this.elements.seekBackBtn?.addEventListener('click', () => this.seekRelative(-5));
        this.elements.seekForwardBtn?.addEventListener('click', () => this.seekRelative(5));
        this.elements.clearBtn.addEventListener('click', () => this.clearPlaylist());
        this.elements.importBtn?.addEventListener('click', () => this.triggerImport());
        this.elements.importFile?.addEventListener('change', (e) => this.importPlaylist(e));
        this.elements.downloadBtn?.addEventListener('click', () => this.downloadPlaylist());
        this.elements.saveNamedBtn?.addEventListener('click', () => this.handleSaveNamedPlaylist());
        this.elements.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.elements.progressBar.addEventListener('click', (e) => this.seek(e));
        this.elements.rankingBtn?.addEventListener('click', () => this.toggleRankingModal());
        document.getElementById('debugToggleBtn')?.addEventListener('click', () => {
            const debugLog = document.getElementById('debugLog');
            if (debugLog) {
                const isVisible = debugLog.style.display === 'block';
                debugLog.style.display = isVisible ? 'none' : 'block';
            }
        });

        this.elements.userBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.elements.userDropdown?.classList.toggle('show');
        });

        this.elements.googleLogin?.addEventListener('click', () => {
            window.authManager.loginWithGoogle();
        });

        this.elements.logoutOption?.addEventListener('click', () => {
            window.authManager.logout();
        });


        // Re-add click listener as fallback/safety for the main link
        this.elements.openSunoBtn?.addEventListener('click', (e) => {
            const href = this.elements.openSunoBtn.getAttribute('href');
            if (!href || href === '#' || href.includes('javascript:')) {
                e.preventDefault();
                this.openInSuno();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.share-container')) {
                this.elements.shareDropdown?.classList.remove('show');
            }
        });

        // Drag and Drop initialization will happen in renderPlaylist

        // Audio Events
        this.elements.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.elements.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
        this.elements.audioPlayer.addEventListener('error', (e) => this.handleError(e));

        // Modal and UI events
        if (this.elements.cancelLoadingBtn) {
            this.elements.cancelLoadingBtn.addEventListener('click', () => {
                this.showLoadingProgress(false);
                this.logDebug('Loading cancelled by user');
            });
        }

        // Double click Title to toggle debug log
        document.querySelector('h1').addEventListener('dblclick', () => {
            if (!this.elements.debugLog) return;
            const isVisible = this.elements.debugLog.style.display === 'block';
            this.elements.debugLog.style.display = isVisible ? 'none' : 'block';
            this.logDebug('Debug Log toggled');
        });

        // Handle language changes
        window.addEventListener('languageChanged', () => {
            this.renderPlaylist(true); // Re-render playlist to update track numbers and potentially titles
            if (this.playlist[this.currentIndex]) this.updateNowPlaying(); // Update now playing info if a track is active
        });

        this.elements.audioPlayer.addEventListener('ended', () => {
            if (this.repeatMode === 'one') {
                this.play();
            } else {
                this.playNext();
            }
        });
        // (duplicate listeners removed — already registered above)

        // Listen for theme changes to update icons
        window.addEventListener('themeChanged', () => this.updateControlIcons());

        // Set initial volume
        if (this.elements.audioPlayer) {
            this.elements.audioPlayer.volume = 0.8;
        }

        // Setup offline detection
        this.setupOfflineDetection();

        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Check URL for shared playlist
        this.loadFromURL();

        // Collapse input section if this is a shared playlist
        this.checkAndCollapseIfShared();

        // History button event listeners
        this.elements.historyBtn.addEventListener('click', () => this.toggleHistoryModal());
        this.elements.libraryOpenBtn?.addEventListener('click', () => {
            if (!this.elements.historyModal.classList.contains('show')) {
                this.toggleHistoryModal('saved');
            }
        });
        this.elements.closeHistoryBtn.addEventListener('click', () => this.toggleHistoryModal());

        this.elements.modalTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchLibraryTab(tab.getAttribute('data-tab'));
            });
        });
        this.elements.closeRankingBtn?.addEventListener('click', () => this.toggleRankingModal());

        this.elements.historyModal.addEventListener('click', (e) => {
            if (e.target === this.elements.historyModal) {
                this.toggleHistoryModal();
            }
        });

        this.elements.rankingModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.rankingModal) {
                this.toggleRankingModal();
            }
        });

        // Load trending
        this.fetchTrending();
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

        // Show banner if offline
        setTimeout(async () => {
            this.isOffline = !navigator.onLine;
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

    // Check if input field is focused
    isInputFocused() {
        const active = document.activeElement;
        return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
    }

    // Setup Drag and Drop with SortableJS for robust mobile support
    setupDragAndDrop() {
        const container = this.elements.playlistContainer;
        if (!container) return;

        // Destroy existing instance if any (though usually not needed)
        if (this.sortableInstance) {
            this.sortableInstance.destroy();
        }

        this.sortableInstance = new Sortable(container, {
            animation: 150,
            handle: '.drag-handle',
            draggable: '.track-item',
            ghostClass: 'dragging',
            onStart: () => {
                this.draggedIndex = 0; // Just to trigger the guard in renderPlaylist
                container.classList.add('is-dragging');
            },
            onEnd: (evt) => {
                this.draggedIndex = null;
                container.classList.remove('is-dragging');
                if (evt.oldIndex !== evt.newIndex) {
                    this.reorderPlaylist(evt.oldIndex, evt.newIndex);
                }
            }
        });
    }

    // Reorder tracks in the playlist
    reorderPlaylist(fromIndex, toIndex) {
        try {
            if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;

            const currentPlaylist = [...this.playlist];
            const currentPlayingTrack = currentPlaylist[this.currentIndex];
            const currentUuid = currentPlayingTrack ? currentPlayingTrack.uuid : null;

            const movedTrack = currentPlaylist.splice(fromIndex, 1)[0];
            currentPlaylist.splice(toIndex, 0, movedTrack);

            this.playlist = currentPlaylist;
            this.originalPlaylist = [...currentPlaylist];

            if (currentUuid) {
                const newIndex = this.playlist.findIndex(t => t.uuid === currentUuid);
                if (newIndex !== -1) {
                    this.currentIndex = newIndex;
                }
            }

            this.renderPlaylist(true);
            this.updateNowPlaying();
            this.updateURL();
            this.autoSave();
            this.syncInputToPlaylist();
            this.showToast('順序を入れ替えました', 'success');

        } catch (error) {
            console.error('[DnD] Error during reorder:', error);
            this.renderPlaylist(true);
        }
    }

    // Sync textarea links
    syncInputToPlaylist() {
        const urls = this.playlist.map(t => `https://suno.com/song/${t.uuid}`);
        this.elements.linksInput.value = urls.join('\n');
    }

    // Load playlist from URL parameters
    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        const compressed = params.get('p') || params.get('tracks');
        if (compressed) {
            try {
                let uuids = [];
                // Check if it's compressed or legacy
                if (params.get('p')) {
                    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
                    uuids = decompressed.split(',');
                } else {
                    uuids = compressed.split(',');
                }

                if (uuids.length > 0) {
                    const urls = uuids.map(uuid => `https://suno.com/song/${uuid}`);
                    this.elements.linksInput.value = urls.join('\n');
                    setTimeout(() => this.loadPlaylist(), 500);
                }
            } catch (error) {
                console.error('Failed to load URL playlist:', error);
            }
        }
    }

    extractUUID(url) {
        if (!url) return null;
        // Simple search for UUID pattern anywhere in the string
        const match = url.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
        return match ? match[0] : null;
    }

    async fetchSongMetadata(uuid, retries = 1) {
        for (let attempt = 0; attempt < retries; attempt++) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

            try {
                // Use proxy if available, otherwise try direct (though direct likely fails CORS/403)
                const baseUrl = this.apiBase || '';
                const response = await fetch(`${baseUrl}/api/metadata?uuid=${uuid}`, { signal: controller.signal });
                clearTimeout(timeoutId);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();

                // Check for explicit NOT_FOUND error from server
                if (data.error === 'NOT_FOUND') {
                    return {
                        uuid,
                        title: `[Unavailable] ${uuid.substring(0, 4)}`,
                        artist: 'Track Deleted or Private',
                        thumbnail: null,
                        unavailable: true
                    };
                }

                // Construct metadata object
                const meta = {
                    title: data.title || `Track ${uuid.substring(0, 4)}`,
                    artist: data.artist || 'SUNO',
                    thumbnail: data.thumbnail,
                    lyrics: data.lyrics || data.metadata?.prompt || '',
                    unavailable: false
                };

                // Respect metadata thumbnail if already provided
                const apiBase = this.apiBase || '';
                if (meta.thumbnail) {
                    if (meta.thumbnail.startsWith('/')) {
                        meta.thumbnail = `${apiBase}${meta.thumbnail}`;
                    } else if (meta.thumbnail.includes('suno.ai') || meta.thumbnail.includes('suno.com')) {
                        meta.thumbnail = `${apiBase}/api/image?id=${uuid}&url=${encodeURIComponent(meta.thumbnail)}`;
                    }
                } else {
                    meta.thumbnail = `${apiBase}/api/image?id=${uuid}`;
                }

                return meta;
            } catch (error) {
                clearTimeout(timeoutId);
                console.warn(`Metadata attempt ${attempt + 1} failed for ${uuid}:`, error.message);
                if (attempt === retries - 1) {
                    return {
                        title: 'Track ' + uuid.substring(0, 4),
                        artist: 'SUNO',
                        thumbnail: `${this.apiBase}/api/image?id=${uuid}`,
                        error: error.message
                    };
                }
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
    }

    async resolveShortLink(shortId) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
        try {
            const response = await fetch(`${this.apiBase}/api/resolve?id=${shortId}`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return data.uuid || null;
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Resolve error:', error);
            return null;
        }
    }

    async resolvePlaylist(playlistId) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout
        try {
            console.log('Resolving playlist:', playlistId);
            const response = await fetch(`${this.apiBase}/api/playlist?id=${playlistId}`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return data.tracks || [];
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Playlist resolve error:', error);
            return [];
        }
    }

    async loadPlaylist() {
        this.logDebug('--- Action: Load Metadata (Smart Update) ---');
        const text = this.elements.linksInput.value.trim();
        if (!text) return;

        this.showToast(window.i18n.t('toastLoading'));
        this.showLoadingProgress(true);
        this.logDebug(`Input length: ${text.length} chars`);

        // Better split to handle spreadsheets and text blocks (Newlines, Tabs, Commas, or Spaces)
        const items = text.split(/[\n\r\t, ]+/).map(l => l.trim()).filter(l => l);

        // Phase 1: Fast UUID extraction (parallel short link resolution)
        const extractedTracks = [];
        let hasNetworkError = false;

        // Separate items into: direct UUIDs, short links, playlist URLs
        const directItems = [];
        const shortLinkItems = [];
        const playlistItems = [];

        for (const item of items) {
            const isSunoRelated = item.includes('suno.com') || item.includes('s.suno.ai');
            const isPureUuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(item);

            if (!isSunoRelated && !isPureUuid) continue;

            // Skip profile URLs, non-song pages, and other non-playable URLs
            if (item.includes('/@') || item.includes('/account') || item.includes('/settings') ||
                item.includes('/create') || item.includes('/explore') || item.includes('/trending')) continue;

            if (item.includes('/playlist/')) {
                playlistItems.push(item);
            } else if (!this.extractUUID(item) && (item.includes('/s/') || item.includes('s.suno.ai/'))) {
                shortLinkItems.push(item);
            } else {
                directItems.push(item);
            }
        }

        // Process direct UUIDs immediately (no network needed)
        for (const item of directItems) {
            const uuid = this.extractUUID(item);
            if (uuid) {
                extractedTracks.push({ uuid });
            }
            // Items without extractable UUID are silently skipped (e.g. profile URLs)
        }

        // Resolve short links in parallel
        if (shortLinkItems.length > 0) {
            const shortResults = await Promise.allSettled(shortLinkItems.map(async (item) => {
                const shortMatch = item.match(/(?:\/s\/|s\.suno\.ai\/)([a-zA-Z0-9]+)/);
                if (shortMatch) {
                    return await this.resolveShortLink(shortMatch[1]);
                }
                return null;
            }));
            for (const result of shortResults) {
                if (result.status === 'fulfilled' && result.value) {
                    extractedTracks.push({ uuid: result.value });
                } else if (result.status === 'rejected') {
                    hasNetworkError = true;
                }
            }
        }

        // Resolve playlist URLs in parallel
        if (playlistItems.length > 0) {
            const playlistResults = await Promise.allSettled(playlistItems.map(async (item) => {
                const playlistId = this.extractUUID(item);
                if (playlistId) {
                    return await this.resolvePlaylist(playlistId);
                }
                return [];
            }));
            for (const result of playlistResults) {
                if (result.status === 'fulfilled' && result.value) {
                    result.value.forEach(u => extractedTracks.push({ uuid: u }));
                }
            }
        }

        if (extractedTracks.length === 0) {
            if (hasNetworkError) {
                this.showToast(`${window.i18n.t('metaNoNetwork') || 'Network Error'} (${this.apiBase})🐾`, 'error');
            } else {
                this.showToast(window.i18n.t('errorPlaylistNotFound') || 'No valid links found🐾', 'error');
            }
            this.showLoadingProgress(false);
            return;
        }

        // Phase 2: Fast merge using Map (O(n) instead of O(n²))
        const oldPlaylist = [...this.playlist];
        const oldCurrentUuid = this.playlist[this.currentIndex]?.uuid;
        const oldMap = new Map(oldPlaylist.map(t => [t.uuid, t]));

        const newPlaylist = extractedTracks.map((item, idx) => {
            const existing = oldMap.get(item.uuid);
            if (existing) return existing;
            const mp3Url = this.apiBase ? `${this.apiBase}/api/audio?id=${item.uuid}` : `https://cdn1.suno.ai/${item.uuid}.mp3`;
            return {
                uuid: item.uuid,
                mp3Url,
                title: `Track ${idx + 1}`,
                artist: 'Loading...',
                thumbnail: this.apiBase ? `${this.apiBase}/api/image?id=${item.uuid}` : null,
                isLiked: this.storage.isTrackLiked(item.uuid),
                error: null,
                unavailable: false
            };
        });

        this.playlist = newPlaylist;

        // Phase 3: Transition current index + auto-play
        let needsLoad = false;

        // If the playlist content is mostly new (not just reloading same list), start from top
        const newUuids = new Set(newPlaylist.map(t => t.uuid));
        const oldUuids = new Set(oldPlaylist.map(t => t.uuid));
        const overlapCount = [...newUuids].filter(u => oldUuids.has(u)).length;
        const isMostlyNew = overlapCount < newPlaylist.length * 0.5; // Less than 50% overlap = new playlist

        if (oldCurrentUuid && !isMostlyNew) {
            // Reloading same/similar playlist - preserve position
            const currentInNew = this.playlist.findIndex(t => t.uuid === oldCurrentUuid);
            if (currentInNew !== -1) {
                this.currentIndex = currentInNew;
            } else {
                this.currentIndex = 0;
                needsLoad = true;
            }
        } else {
            // New playlist loaded - always start from the top
            this.currentIndex = 0;
            needsLoad = true;
        }

        this.renderPlaylist();

        if (needsLoad) {
            this.loadTrack(this.currentIndex);
            this.play(); // Auto-play immediately
        } else {
            this.updateNowPlaying();
        }

        // Phase 4: Fast batch metadata fetch
        const tracksToFetch = this.playlist.filter(t => t.artist === 'Loading...' || t.artist === 'Fetch Error' || !t.thumbnail);

        if (tracksToFetch.length > 0) {
            const startTime = performance.now();
            this.showToast(`Fetching info for ${tracksToFetch.length} tracks... 🐾`);

            // Step 1: Check localStorage cache first
            const uncachedTracks = [];
            for (const track of tracksToFetch) {
                const cached = this.getMetaCache(track.uuid);
                if (cached) {
                    track.title = this.decodeHtmlEntities(cached.title || track.title);
                    track.artist = this.decodeHtmlEntities(cached.artist || 'Suno');
                    track.thumbnail = cached.thumbnail || track.thumbnail;
                    track.lyrics = cached.lyrics || null;
                    track.unavailable = cached.unavailable || false;
                    this.loadingStates.set(track.uuid, 'loaded');
                } else {
                    uncachedTracks.push(track);
                }
            }

            // Render with cached data immediately
            if (tracksToFetch.length !== uncachedTracks.length) {
                this.renderPlaylist(true);
                this.updateNowPlaying();
            }

            // Step 2: Batch fetch uncached tracks
            if (uncachedTracks.length > 0) {
                try {
                    await this.fetchBatchMetadata(uncachedTracks);
                } catch (e) {
                    console.warn('[Batch] Batch fetch failed, falling back to individual:', e);
                    // Fallback: individual fetch with high concurrency
                    await Promise.all(uncachedTracks.map(async (track) => {
                        try {
                            const meta = await this.fetchSongMetadata(track.uuid);
                            if (meta && meta.title) {
                                track.title = this.decodeHtmlEntities(meta.title);
                                track.artist = this.decodeHtmlEntities(meta.artist);
                                track.thumbnail = meta.thumbnail;
                                track.lyrics = meta.lyrics || null;
                                track.unavailable = meta.unavailable || false;
                                this.setMetaCache(track.uuid, meta);
                                this.loadingStates.set(track.uuid, 'loaded');
                            } else {
                                track.artist = 'Unknown';
                                this.loadingStates.set(track.uuid, 'error');
                            }
                        } catch (e) {
                            track.artist = 'Fetch Error';
                            this.loadingStates.set(track.uuid, 'error');
                        }
                    }));
                }

                this.renderPlaylist(true);
                this.updateNowPlaying();
            }

            const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
            console.log(`[Perf] Metadata fetch completed in ${elapsed}s for ${tracksToFetch.length} tracks`);
        }

        this.showToast('Load complete! 🐾');
        this.showLoadingProgress(false);

        this.updateURL();
        this.autoSave();
    }

    // Batch fetch metadata for multiple tracks at once
    async fetchBatchMetadata(tracks) {
        const BATCH_SIZE = 20;
        for (let i = 0; i < tracks.length; i += BATCH_SIZE) {
            const batch = tracks.slice(i, i + BATCH_SIZE);
            const uuids = batch.map(t => t.uuid).join(',');
            const baseUrl = this.apiBase || '';

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s for batch

            try {
                const response = await fetch(`${baseUrl}/api/metadata/batch?uuids=${uuids}`, { signal: controller.signal });
                clearTimeout(timeoutId);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const results = await response.json();

                results.forEach((meta, idx) => {
                    const track = batch[idx];
                    if (meta && (meta.title || meta.error === 'NOT_FOUND')) {
                        if (meta.error === 'NOT_FOUND') {
                            track.title = `[Unavailable] ${track.uuid.substring(0, 4)}`;
                            track.artist = 'Track Deleted or Private';
                            track.unavailable = true;
                        } else {
                            track.title = this.decodeHtmlEntities(meta.title);
                            track.artist = this.decodeHtmlEntities(meta.artist || 'Suno');
                            track.lyrics = meta.lyrics || null;
                            track.unavailable = false;
                            // Fix thumbnail URL
                            if (meta.thumbnail) {
                                const apiBase = this.apiBase || '';
                                if (meta.thumbnail.startsWith('/')) {
                                    track.thumbnail = `${apiBase}${meta.thumbnail}`;
                                } else if (meta.thumbnail.includes('suno.ai') || meta.thumbnail.includes('suno.com')) {
                                    track.thumbnail = `${apiBase}/api/image?id=${track.uuid}&url=${encodeURIComponent(meta.thumbnail)}`;
                                } else {
                                    track.thumbnail = meta.thumbnail;
                                }
                            } else {
                                track.thumbnail = `${this.apiBase || ''}/api/image?id=${track.uuid}`;
                            }
                        }
                        this.setMetaCache(track.uuid, meta);
                        this.loadingStates.set(track.uuid, 'loaded');
                    } else {
                        track.artist = 'Unknown';
                        this.loadingStates.set(track.uuid, 'error');
                    }
                });

                // Render after each batch for progressive updates
                this.renderPlaylist(true);
                this.updateNowPlaying();
            } catch (e) {
                clearTimeout(timeoutId);
                throw e; // Let caller handle fallback
            }
        }
    }

    getThumbnailUrl(thumb) {
        if (!thumb) return null;
        if (thumb.startsWith('/')) {
            if (this.apiBase) return `${this.apiBase}${thumb}`;
            const m = thumb.match(/url=([^&]+)/);
            if (m) return decodeURIComponent(m[1]);
            return null;
        }
        return thumb;
    }

    // localStorage metadata cache helpers
    getMetaCache(uuid) {
        try {
            const key = `meta_${uuid}`;
            const cached = localStorage.getItem(key);
            if (cached) {
                const data = JSON.parse(cached);
                // Expire after 24 hours
                if (Date.now() - data._ts < 86400000) {
                    // v2: Also invalidate if thumbnail is missing/placeholder-only
                    const thumb = data.thumbnail || '';
                    const hasRealThumb = thumb.includes('url=') || thumb.includes('cdn');
                    if (data.title && data.title !== 'Loading...' && hasRealThumb) {
                        return data;
                    }
                    // Stale data — missing proper thumbnail or title
                    localStorage.removeItem(key);
                    return null;
                }
                localStorage.removeItem(key);
            }
        } catch (e) { /* ignore */ }
        return null;
    }

    setMetaCache(uuid, meta) {
        try {
            const key = `meta_${uuid}`;
            localStorage.setItem(key, JSON.stringify({ ...meta, _ts: Date.now() }));
        } catch (e) { /* localStorage full, ignore */ }
    }

    async checkApiConnectivity() {
        console.log('Starting connectivity check...');
        const targets = [
            'http://miyashitasusumunoMacBook-Pro.local:3000',
            'http://192.168.3.6:3000',
            'http://192.168.0.103:3000',
            'http://192.168.1.10:3000',
            'http://127.0.0.1:3000',
            'http://localhost:3000'
        ];

        for (const target of targets) {
            try {
                console.log(`Testing target: ${target}`);
                const controller = new AbortController();
                const tid = setTimeout(() => controller.abort(), 2000);
                const res = await fetch(`${target}/api/health`, { signal: controller.signal });
                clearTimeout(tid);
                if (res.ok) {
                    console.log('SUCCESS: API Reachable at:', target);
                    this.apiBase = target;
                    this.showToast(`Connected to server🐾`, 'success');
                    return true;
                }
            } catch (e) {
                console.warn(`Target ${target} failed:`, e.message);
            }
        }
        console.error('ALL API TARGETS FAILED');
        this.showToast('Server connection failed. Using fallback mode.🐾', 'warning');
        return false;
    }

    updateURL() {
        if (this.playlist.length === 0) return;
        const uuids = this.playlist.map(t => t.uuid).join(',');
        const compressed = LZString.compressToEncodedURIComponent(uuids);
        window.history.replaceState({}, '', `${window.location.pathname}?p=${compressed}`);
    }

    toggleInputSection() {
        const content = this.elements.inputContent;
        const icon = this.elements.toggleInputIcon;
        const btn = this.elements.toggleInputBtn;

        if (content.style.display === 'none') {
            // 展開
            content.style.display = 'block';
            icon.textContent = '▲';
            btn.title = '折りたたむ';
        } else {
            // 折りたたむ
            content.style.display = 'none';
            icon.textContent = '▼';
            btn.title = '展開する';
        }
    }

    checkAndCollapseIfShared() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('p')) {
            // 共有リンクの場合、デフォルトで閉じる
            this.elements.inputContent.style.display = 'none';
            this.elements.toggleInputIcon.textContent = '▼';
            this.elements.toggleInputBtn.title = '展開する';
        }
    }

    toggleShareDropdown() {
        this.elements.shareDropdown?.classList.toggle('show');
    }

    async getShareUrl() {
        const uuids = this.playlist.map(t => t.uuid).join(',');
        return `${window.location.origin}${window.location.pathname}?p=${LZString.compressToEncodedURIComponent(uuids)}`;
    }

    async shareToTwitter() {
        const url = await this.getShareUrl();
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent('🎵 Check out this playlist!')}`, '_blank');
        this.elements.shareDropdown?.classList.remove('show'); // 自動で閉じる
    }
    async shareToLine() {
        const url = await this.getShareUrl();
        window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`, '_blank');
        this.elements.shareDropdown?.classList.remove('show'); // 自動で閉じる
    }
    async shareToFacebook() {
        const url = await this.getShareUrl();
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        this.elements.shareDropdown?.classList.remove('show'); // 自動で閉じる
    }
    async copyShareUrl() {
        const url = await this.getShareUrl();
        await navigator.clipboard.writeText(url);
        this.showToast('Copied!');
        this.elements.shareDropdown?.classList.remove('show');
    }

    async shareSingleTrack() {
        const track = this.playlist[this.currentIndex];
        if (!track || !track.uuid) return;

        const url = `${window.location.origin}/share/${track.uuid}`;
        
        const shareData = {
            title: track.title,
            text: `🎵 Check out this song: ${track.title} by ${track.artist}`,
            url: url
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.url);
                this.showToast(window.i18n.t('toastSongCopied'));
            }
        } catch (err) {
            console.error('Share failed:', err);
        }
    }

    renderPlaylist(ignoreGuard = false) {
        if (!ignoreGuard && this.draggedIndex !== null) return;
        this.elements.trackCount.textContent = this.playlist.length;

        // Filter based on search query
        const filtered = this.playlist.map((track, originalIndex) => ({ track, originalIndex }))
            .filter(item => {
                const query = this.searchQuery.toLowerCase();
                if (!query) return true;
                const t = item.track;
                return (t.title && t.title.toLowerCase().includes(query)) ||
                    (t.artist && t.artist.toLowerCase().includes(query));
            });

        const currentTheme = window.themeManager ? window.themeManager.currentTheme : 'default';
        const bgMap = {
            default: 'luna_anime.png',
            sunny: 'sunny_anime.png',
            sakura: 'sakura_anime.png',
            cyber: 'cyber_anime.png',
            tuxedo: 'tuxedo_anime.png',
            oddeye: 'oddeye_anime.png'
        };

        const placeholder = bgMap[currentTheme] || 'luna_anime.png';

        if (filtered.length === 0 && this.playlist.length > 0) {
            this.elements.playlistContainer.innerHTML = `<div class="empty-state" style="padding: 20px; text-align: center; opacity: 0.7;">No results for "${this.searchQuery}"</div>`;
            return;
        }

        this.elements.playlistContainer.innerHTML = filtered.map(item => {
            const track = item.track;
            const index = item.originalIndex;
            const thumbUrl = this.getThumbnailUrl(track.thumbnail);
            const thumbnail = thumbUrl ? `<img src="${thumbUrl}" class="track-thumb" loading="lazy">` : `<img src="${placeholder}" class="track-thumb placeholder-thumb">`;
            const isLiked = this.storage.isTrackLiked(track.uuid);
            const isActive = index === this.currentIndex;
            const isUnavailable = track.unavailable === true;
            return `
                <div class="track-item ${isActive ? 'active' : ''} ${isActive && this.isPlaying ? 'playing' : ''} ${isUnavailable ? 'unavailable' : ''}" data-index="${index}">
                    <span class="drag-handle"><i data-lucide="grip-vertical"></i></span>
                <div class="track-thumb-container">
                    ${thumbnail}
                </div>
                    <div class="track-detail">
                        <div class="track-name">${this.escapeHtml(track.title)}</div>
                        <div class="track-author">${this.escapeHtml(track.artist)}</div>
                    </div>
                    ${isActive ? `
                    <div class="playing-indicator">
                        <div class="bar"></div>
                        <div class="bar"></div>
                        <div class="bar"></div>
                    </div>` : ''}
                    <div class="track-actions">
                        <button class="track-action-btn heart-btn ${isLiked ? 'active' : ''}" title="Like">
                            <i data-lucide="heart" class="${isLiked ? 'fill-current' : ''}"></i>
                        </button>
                        <button class="track-action-btn copy-btn" title="Copy URL">
                            <i data-lucide="copy"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Inject icons
        if (window.lucide) {
            window.lucide.createIcons();
        }

        this.elements.playlistContainer.querySelectorAll('.track-item').forEach(item => {
            const index = parseInt(item.dataset.index);
            const track = this.playlist[index];

            // Item click to play
            item.addEventListener('click', (e) => {
                if (e.target.closest('.drag-handle') || e.target.closest('.track-actions')) return;
                this.loadTrack(index);
                this.play();
            });

            // Heart button
            item.querySelector('.heart-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const liked = this.storage.toggleTrackLike(track.uuid);
                track.isLiked = liked;
                e.currentTarget.classList.toggle('active', liked);

                const icon = e.currentTarget.querySelector('i');
                if (icon) icon.classList.toggle('fill-current', liked);

                this.showToast(liked ? window.i18n.t('toastTrackLiked') : window.i18n.t('toastTrackUnliked'));
            });

            // Copy button
            item.querySelector('.copy-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                const url = `https://suno.com/song/${track.uuid}`;
                try {
                    await navigator.clipboard.writeText(url);
                    this.showToast(window.i18n.t('toastSongCopied'));
                } catch (err) {
                    this.showToast('Failed to copy', 'error');
                }
            });
        });

        // Ensure drag and drop are setup for the new DOM elements
        this.setupDragAndDrop();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    decodeHtmlEntities(text) {
        if (!text) return '';
        const txt = document.createElement("textarea");
        txt.innerHTML = text;
        return txt.value;
    }

    updateNowPlaying() {
        const track = this.playlist[this.currentIndex];
        if (track) {
            this.elements.trackTitle.textContent = track.title;
            this.elements.trackArtist.textContent = track.artist;

            // Update album art
            const theme = window.themeManager ? window.themeManager.currentTheme : 'default';
            const bgMap = {
                default: 'luna_anime.png',
                sunny: 'sunny_anime.png',
                sakura: 'sakura_anime.png',
                cyber: 'cyber_anime.png',
                tuxedo: 'tuxedo_anime.png',
                oddeye: 'oddeye_anime.png'
            };
            const placeholder = bgMap[theme] || 'luna_anime.png';

            if (this.elements.playerThumb) {
                const rawThumb = track.thumbnail || track.imageUrl || track.image_url;
                const thumbUrl = this.getThumbnailUrl(rawThumb);
                if (thumbUrl) {
                    this.elements.playerThumb.src = thumbUrl;
                    this.elements.playerThumb.style.display = 'block';
                    if (this.elements.albumPlaceholder) this.elements.albumPlaceholder.style.display = 'none';
                } else {
                    this.elements.playerThumb.style.display = 'none';
                    if (this.elements.albumPlaceholder) this.elements.albumPlaceholder.style.display = 'block';
                }
                this.elements.playerThumb.onerror = () => { this.elements.playerThumb.src = placeholder; };
            }

            // Reset lyrics
            if (this.elements.lyricsContainer) {
                this.elements.lyricsContainer.style.display = 'none';
                if (track.lyrics) {
                    this.elements.lyricsContent.innerHTML = track.lyrics.replace(/\n/g, '<br>');
                } else {
                    this.elements.lyricsContent.textContent = 'No lyrics available';
                }
            }
        }

        // Update Suno Link (Main Button)
        if (this.elements.openSunoBtn) {
            if (track.uuid) {
                const url = `https://suno.com/song/${track.uuid}`;
                this.elements.openSunoBtn.href = url;
                this.elements.openSunoBtn.style.display = 'flex';
                // Fallback for some browsers: ensure it opens in new tab
                this.elements.openSunoBtn.setAttribute('target', '_blank');
                this.elements.openSunoBtn.setAttribute('rel', 'noopener noreferrer');
                if (this.elements.shareTrackBtn) this.elements.shareTrackBtn.style.display = 'flex';
            } else {
                this.elements.openSunoBtn.style.display = 'none';
                if (this.elements.shareTrackBtn) this.elements.shareTrackBtn.style.display = 'none';
            }
        }
    }
    // Background update removed - clashes with themes


    toggleLyrics() {
        if (!this.elements.lyricsContainer || !this.elements.lyricsContent) return;
        const isHidden = this.elements.lyricsContainer.style.display === 'none';

        if (isHidden) {
            const track = this.playlist[this.currentIndex];
            if (track && track.lyrics) {
                this.elements.lyricsContent.innerHTML = track.lyrics.replace(/\n/g, '<br>');
            } else {
                this.elements.lyricsContent.textContent = 'No lyrics available';
            }
            this.elements.lyricsContainer.style.display = 'flex';
        } else {
            this.elements.lyricsContainer.style.display = 'none';
        }
    }

    openInSuno(uuid) {
        const id = uuid || (this.playlist[this.currentIndex] ? this.playlist[this.currentIndex].uuid : null);
        if (!id) return;
        const url = `https://suno.com/song/${id}`;
        window.open(url, '_blank');
    }

    loadTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;
        this.currentIndex = index;
        this.elements.audioPlayer.src = this.playlist[index].mp3Url;
        this.updateNowPlaying();
        this.resetPlaybackTimer();
        this.renderPlaylist();
    }

    resetPlaybackTimer() {
        if (this.playbackTimer) {
            clearTimeout(this.playbackTimer);
            this.playbackTimer = null;
        }
    }

    togglePlay() { this.isPlaying ? this.pause() : this.play(); }
    play() {
        if (this.playlist.length === 0) return;
        this.elements.audioPlayer.play().then(() => {
            this.isPlaying = true;
            this.updateControlIcons();
            this.updateProgress();
            this.animateVisualizer();

            // 10秒以上再生されたらカウント
            this.resetPlaybackTimer();
            this.playbackTimer = setTimeout(() => {
                // this.recordTrackPlay(this.playlist[this.currentIndex]); // Removed cloud interaction
            }, 10000);
        });
    }
    pause() {
        this.elements.audioPlayer.pause();
        this.isPlaying = false;
        this.updateControlIcons();
        this.resetPlaybackTimer(); // 一時停止したらカウント中断
        this.animateVisualizer(); // Will stop animation due to isPlaying=false
    }

    playNext() {
        if (this.playlist.length === 0) return;

        let nextIndex = this.currentIndex + 1;
        if (nextIndex >= this.playlist.length) {
            if (this.repeatMode === 'all') {
                nextIndex = 0;
            } else {
                return;
            }
        }

        this.loadTrack(nextIndex);
        if (this.isPlaying) this.play();
    }
    playPrevious() {
        if (this.playlist.length === 0) return;

        let prevIndex = this.currentIndex - 1;
        if (prevIndex < 0) {
            if (this.repeatMode === 'all') {
                prevIndex = this.playlist.length - 1;
            } else {
                return;
            }
        }

        this.loadTrack(prevIndex);
        if (this.isPlaying) this.play();
    }

    setVolume(v) {
        this.elements.audioPlayer.volume = v / 100;
        // Update slider background to show filled portion
        const percentage = v;
        this.elements.volumeSlider.style.background = `linear-gradient(to right, 
            var(--accent-primary) 0%, 
            var(--accent-primary) ${percentage}%, 
            rgba(255, 255, 255, 0.2) ${percentage}%, 
            rgba(255, 255, 255, 0.2) 100%)`;
    }
    seek(e) {
        const rect = this.elements.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.elements.audioPlayer.currentTime = percent * this.elements.audioPlayer.duration;
    }
    seekRelative(s) {
        this.elements.audioPlayer.currentTime += s;
        this.updateProgress();
    }
    toggleMute() { this.elements.audioPlayer.muted = !this.elements.audioPlayer.muted; }

    toggleShuffle() {
        const wasPlaying = this.isPlaying;
        this.shuffleMode = !this.shuffleMode;
        if (this.shuffleMode) {
            this.originalPlaylist = [...this.playlist];
            this.playlist.sort(() => Math.random() - 0.5);
        } else {
            this.playlist = [...this.originalPlaylist];
        }
        this.currentIndex = 0;
        this.renderPlaylist();
        this.loadTrack(0);
        if (wasPlaying) {
            this.play();
        }
    }

    toggleRepeat() {
        const modes = ['none', 'all', 'one'];
        this.repeatMode = modes[(modes.indexOf(this.repeatMode) + 1) % modes.length];
        this.showToast(this.repeatMode);
    }

    clearPlaylist() {
        if (confirm('Clear?')) {
            this.playlist = [];
            this.renderPlaylist();
        }
    }

    handleSaveNamedPlaylist() {
        if (this.playlist.length === 0) {
            this.showToast(window.i18n.t('errorEmpty'), 'error');
            return;
        }
        const name = prompt(window.i18n.t('playlistNamePrompt'), '');
        if (name) {
            this.storage.saveNamedPlaylist(name, this.playlist);
            this.showToast(window.i18n.t('playlistSaved'));
            const activeTab = document.querySelector('.modal-tab.active')?.getAttribute('data-tab') || 'saved';
            this.renderLibrary(activeTab); // Refresh history if open
        }
    }

    triggerImport() { this.elements.importFile.click(); }
    updateProgress() {
        if (!this.elements.audioPlayer.duration) return;
        const p = (this.elements.audioPlayer.currentTime / this.elements.audioPlayer.duration) * 100;
        this.elements.progress.style.width = `${p}%`;
        this.elements.currentTime.textContent = this.formatTime(this.elements.audioPlayer.currentTime);
    }

    updateDuration() {
        if (!this.elements.audioPlayer.duration) return;
        this.elements.duration.textContent = this.formatTime(this.elements.audioPlayer.duration);
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    handleError(e) {
        const currentTrack = this.playlist[this.currentIndex];
        if (!currentTrack) { this.playNext(); return; }

        // Retry logic: try alternative audio URLs before giving up
        if (!currentTrack._retryCount) currentTrack._retryCount = 0;
        currentTrack._retryCount++;

        const apiBase = this.apiBase || '';
        const uuid = currentTrack.uuid;

        // Build fallback URLs
        const fallbacks = [
            `${apiBase}/api/audio?id=${uuid}`,
            `https://cdn1.suno.ai/${uuid}.mp3`,
            `https://cdn2.suno.ai/${uuid}.mp3`
        ];

        // Filter out the current (failed) URL and already-tried URLs
        const currentSrc = this.elements.audioPlayer.src;
        const nextUrl = fallbacks.find(u => {
            // Normalize URLs for comparison
            const full = u.startsWith('http') ? u : `${location.origin}${u}`;
            return !currentSrc.includes(u) && !currentSrc.includes(encodeURIComponent(u));
        });

        if (nextUrl && currentTrack._retryCount <= 3) {
            console.log(`[Audio] Retry ${currentTrack._retryCount} for ${currentTrack.title}: ${nextUrl}`);
            this.elements.audioPlayer.src = nextUrl;
            if (this.isPlaying) {
                this.elements.audioPlayer.play().catch(() => { });
            }
            return;
        }

        // All retries exhausted — mark unavailable and skip
        console.warn(`[Audio] All retries failed for: ${currentTrack.title}`);
        currentTrack.unavailable = true;
        this.renderPlaylist(true);
        this.showToast(`Skipping unavailable track: ${currentTrack.title} 🐾`, 'error');
        this.playNext();
    }
    showLoadingProgress(show) {
        if (this.elements.loadingProgress) {
            this.elements.loadingProgress.style.display = show ? 'block' : 'none';
        }
        if (this.elements.loadingOverlay) {
            if (show) {
                this.elements.loadingOverlay.classList.add('show');
                this.elements.loadingOverlay.style.display = 'flex';
            } else {
                this.elements.loadingOverlay.classList.remove('show');
                this.elements.loadingOverlay.style.display = 'none';
            }
        }
    }

    logDebug(msg) {
        console.log(`[DEBUG] ${msg}`);
        if (this.elements.debugLog) {
            const time = new Date().toLocaleTimeString();
            this.elements.debugLog.innerHTML += `<div>[${time}] ${msg}</div>`;
            this.elements.debugLog.scrollTop = this.elements.debugLog.scrollHeight;
        }
    }
    showToast(m, type = 'default') {
        this.elements.toast.textContent = m;
        this.elements.toast.className = `toast show ${type}`;
        setTimeout(() => this.elements.toast.classList.remove('show'), 3000);
    }
    autoSave() { this.storage.saveCurrent(this.playlist); }
    restoreLastPlaylist() {
        // Don't restore if URL has any playlist data
        const path = window.location.pathname;
        const params = new URLSearchParams(window.location.search);

        // Skip if:
        // 1. Short URL format (/p/abc123)
        // 2. Compressed URL format (?p=...)
        // 3. Legacy format (?tracks=...)
        if (path.startsWith('/p/') || params.get('p') || params.get('tracks')) {
            console.log('Skipping restore: URL contains playlist data');
            return;
        }

        const c = this.storage.getCurrent();
        if (c && c.tracks.length > 0) {
            this.elements.linksInput.value = c.tracks.map(t => `https://suno.com/song/${t.uuid}`).join('\n');
            this.loadPlaylist();
        }
    }
    toggleHistoryModal(initialTab = 'saved') {
        if (!this.elements.historyModal) return;
        const isShowing = this.elements.historyModal.classList.toggle('show');
        if (isShowing) {
            this.switchLibraryTab(initialTab);
        }
    }

    switchLibraryTab(tab) {
        this.elements.modalTabs.forEach(t => {
            t.classList.toggle('active', t.getAttribute('data-tab') === tab);
        });
        this.renderLibrary(tab);
    }

    handleUserChanged(user) {
        if (user) {
            console.log('[Auth] User logged in:', user.displayName);
            this.elements.userInfo.style.display = 'flex';
            this.elements.userName.textContent = user.displayName;
            this.elements.userAvatar.src = user.photoURL || '';
            this.elements.loginOptions.style.display = 'none';
            this.elements.logoutOption.style.display = 'block';
            document.getElementById('cloudTabBtn').style.display = 'block';
            this.showToast(`Welcome, ${user.displayName}!`);
        } else {
            console.log('[Auth] User logged out');
            this.elements.userInfo.style.display = 'none';
            this.elements.loginOptions.style.display = 'block';
            this.elements.logoutOption.style.display = 'none';
            document.getElementById('cloudTabBtn').style.display = 'none';
            if (this.currentLibraryTab === 'cloud') this.switchLibraryTab('saved');
        }
    }

    renderLibrary(tab = 'saved') {
        if (!this.elements.historyList) return;
        this.currentLibraryTab = tab;

        const saved = this.storage.getSavedPlaylists();
        const recent = this.storage.getRecentPlaylists();
        const favorites = this.storage.getFavorites();

        this.elements.historyList.innerHTML = '';

        if (tab === 'saved') {
            if (saved.length === 0) {
                this.elements.historyList.innerHTML = `<div class="history-empty">${window.i18n.t('historyEmpty')}</div>`;
                return;
            }
            saved.forEach(p => this.createHistoryItem(p, 'saved'));
        } else if (tab === 'cloud') {
            this.elements.historyList.innerHTML = '<div class="loader-small"></div>';
            this.storage.getCloudPlaylists().then(cloudPlaylists => {
                this.elements.historyList.innerHTML = '';
                if (cloudPlaylists.length === 0) {
                    this.elements.historyList.innerHTML = `<div class="history-empty">クラウドに保存されたプレイリストはありません</div>`;
                    return;
                }
                cloudPlaylists.forEach(p => this.createHistoryItem(p, 'cloud'));
            });
        } else {
            // Recent Tab (Recent + Favorites)
            if (recent.length === 0 && favorites.length === 0) {
                this.elements.historyList.innerHTML = `<div class="history-empty">${window.i18n.t('historyEmpty')}</div>`;
                return;
            }

            // Favorites Section
            if (favorites.length > 0) {
                const favHeader = document.createElement('h3');
                favHeader.textContent = window.i18n.t('historyFavorites');
                this.elements.historyList.appendChild(favHeader);
                favorites.forEach(p => this.createHistoryItem(p, 'favorite'));
            }

            // Recent Section
            if (recent.length > 0) {
                const recentHeader = document.createElement('h3');
                recentHeader.textContent = window.i18n.t('historyRecent');
                this.elements.historyList.appendChild(recentHeader);
                recent.forEach(p => this.createHistoryItem(p, 'recent'));
            }
        }
    }

    createHistoryItem(playlist, type) {
        const item = document.createElement('div');
        item.className = 'history-item';
        const date = new Date(playlist.timestamp).toLocaleDateString();
        const isFav = type === 'favorite' || this.storage.isFavorite(playlist.id);

        const coverImg = playlist.coverUrl || (playlist.tracks && playlist.tracks.length > 0 ? (playlist.tracks[0].imageUrl || playlist.tracks[0].image_url) : '');

        item.innerHTML = `
            <div class="history-info">
                <div class="history-thumbnail">
                    ${coverImg ? `<img src="${coverImg}" alt="cover" loading="lazy">` : `<div class="thumb-empty"><i data-lucide="music"></i></div>`}
                </div>
                <div class="history-details">
                    <div class="history-name">${playlist.name || playlist.firstTrack || 'Playlist'}</div>
                    <div class="history-meta">${date} • ${playlist.trackCount}${window.i18n.t('trackCount')}</div>
                </div>
            </div>
            <div class="history-actions">
                ${type !== 'saved' ? `<button class="icon-btn-sm fav-btn ${isFav ? 'active' : ''}" title="${window.i18n.t('historyFavorite')}"><i data-lucide="star"></i></button>` : ''}
                <button class="icon-btn-sm delete-btn" title="${window.i18n.t('historyDelete')}"><i data-lucide="trash-2"></i></button>
                <button class="primary-btn-sm load-btn">${window.i18n.t('historyLoad')}</button>
            </div>
        `;

        // Load
        item.querySelector('.load-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const apiBase = this.apiBase || '';
            this.playlist = playlist.tracks.map(t => {
                // Try to restore thumbnail from saved data or localStorage cache
                let thumbnail = t.thumbnail || null;
                if (!thumbnail) {
                    const cached = this.getMetaCache(t.uuid);
                    if (cached && cached.thumbnail) {
                        thumbnail = cached.thumbnail;
                    } else {
                        thumbnail = apiBase ? `${apiBase}/api/image?id=${t.uuid}` : null;
                    }
                }
                // Fix relative thumbnail URLs
                thumbnail = this.getThumbnailUrl(thumbnail);
                return {
                    uuid: t.uuid,
                    title: t.title,
                    artist: t.artist,
                    mp3Url: apiBase ? `${apiBase}/api/audio?id=${t.uuid}` : `https://cdn1.suno.ai/${t.uuid}.mp3`,
                    thumbnail: thumbnail,
                    isLiked: this.storage.isTrackLiked(t.uuid),
                    unavailable: false
                };
            });
            this.renderPlaylist(true);
            this.loadTrack(0);
            this.play();
            this.toggleHistoryModal();
            this.updateURL();

            // Re-fetch metadata for tracks missing thumbnails
            const missingMeta = this.playlist.filter(t => !t.thumbnail || t.thumbnail.includes('/api/image?id='));
            if (missingMeta.length > 0) {
                this.fetchBatchMetadata(missingMeta).then(() => {
                    this.renderPlaylist(true);
                    this.updateNowPlaying();
                }).catch(() => { });
            }
        });

        // Favorite
        if (type !== 'saved') {
            item.querySelector('.fav-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const added = this.storage.toggleFavorite(playlist.id);
                this.showToast(added ? window.i18n.t('toastFavoriteAdded') : window.i18n.t('toastFavoriteRemoved'));
                const activeTab = document.querySelector('.modal-tab.active')?.getAttribute('data-tab') || 'recent';
                this.renderLibrary(activeTab);
            });
        }

        // Delete
        item.querySelector('.delete-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm(window.i18n.t('confirmDelete') || 'Delete this playlist?')) {
                let success = true;
                if (type === 'saved') {
                    await this.storage.deleteSavedPlaylist(playlist.id);
                } else if (type === 'cloud') {
                    await this.storage.deleteFromCloud(playlist.id);
                } else {
                    this.storage.deletePlaylist(playlist.id);
                }

                this.showToast(window.i18n.t('toastDeleteSuccess') || 'Deleted!');
                this.renderLibrary(this.currentLibraryTab || 'saved');
            }
        });

        this.elements.historyList.appendChild(item);
    }
    updateControlIcons() {
        // Toggle Play/Pause icon
        const playBtn = this.elements.playBtn;
        if (playBtn) {
            playBtn.innerHTML = this.isPlaying
                ? '<i data-lucide="pause"></i>'
                : '<i data-lucide="play"></i>';
        }

        // Sync playing indicator in playlist
        const activeItem = this.elements.playlistContainer.querySelector('.track-item.active');
        if (activeItem) {
            activeItem.classList.toggle('playing', this.isPlaying);
            if (this.isPlaying && !activeItem.querySelector('.playing-indicator')) {
                this.renderPlaylist();
            }
        }

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    toggleRankingModal() {
        if (!this.elements.rankingModal) return;
        const isVisible = this.elements.rankingModal.classList.contains('show');
        if (!isVisible) {
            this.elements.rankingModal.classList.add('show');
            this.fetchRanking();
        } else {
            this.elements.rankingModal.classList.remove('show');
        }
    }

    async fetchRanking() {
        if (!this.elements.rankingList) return;

        this.elements.rankingList.innerHTML = `<div class="loading-ranking">${window.i18n.t('toastLoading')}</div>`;

        try {
            const db = firebase.firestore();
            const snapshot = await db.collection('track_stats')
                .orderBy('play_count', 'desc')
                .limit(20)
                .get();

            const ranking = snapshot.docs.map(doc => ({
                uuid: doc.id,
                ...doc.data()
            }));

            this.renderRanking(ranking);
        } catch (error) {
            console.error('Ranking fetch error:', error);
            this.elements.rankingList.innerHTML = `<div class="loading-ranking">${window.i18n.t('rankingError')}</div>`;
        }
    }

    renderRanking(ranking) {
        if (!ranking || ranking.length === 0) {
            this.elements.rankingList.innerHTML = `<div class="loading-ranking">${window.i18n.t('rankingEmpty')}</div>`;
            return;
        }

        this.elements.rankingList.innerHTML = '';
        ranking.forEach((track, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;
            let medal = rank;
            if (rank === 1) medal = '1';
            if (rank === 2) medal = '2';
            if (rank === 3) medal = '3';

            const theme = window.themeManager ? window.themeManager.currentTheme : 'default';
            const bgMap = {
                default: 'luna_anime.png',
                sunny: 'sunny_anime.png',
                sakura: 'sakura_anime.png',
                cyber: 'cyber_anime.png',
                tuxedo: 'tuxedo_anime.png',
                oddeye: 'oddeye_anime.png'
            };
            const placeholder = bgMap[theme] || 'luna_anime.png';

            const item = document.createElement('div');
            item.className = `ranking-card ${isTop3 ? 'top-' + rank : ''}`;
            item.innerHTML = `
                <div class="ranking-rank">${medal}</div>
                <img src="${track.artwork || track.thumbnail || ''}" class="ranking-thumb" onerror="this.src='${placeholder}'">
                <div class="ranking-info">
                    <div class="ranking-name">${this.escapeHtml(track.title)}</div>
                    <div class="ranking-meta">
                        <span>${this.escapeHtml(track.artist)}</span>
                        <span class="ranking-plays">
                            <i data-lucide="headphones" style="width:12px;height:12px;"></i>
                            ${track.playCount} ${window.i18n.t('rankingPlays')}
                        </span>
                    </div>
                </div>
                <i data-lucide="chevron-right" style="opacity:0.3"></i>
            `;
            item.addEventListener('click', () => {
                try {
                    const urlObj = new URL(track.url || window.location.href);
                    const p = urlObj.searchParams.get('p');
                    if (p) {
                        this.loadFromURL(p);
                    } else {
                        this.elements.linksInput.value = `https://suno.com/song/${track.id || track.uuid}`;
                        this.loadPlaylist();
                    }
                } catch (e) {
                    console.error('Ranking navigation error:', e);
                }
                this.toggleRankingModal();
            });
            this.elements.rankingList.appendChild(item);
        });

        if (window.lucide) window.lucide.createIcons();
    }

    async fetchTrending() {
        if (!this.elements.trendingList) return;
        try {
            const db = firebase.firestore();
            const snapshot = await db.collection('trending')
                .orderBy('order', 'asc')
                .get();

            const items = snapshot.docs.map(doc => doc.data());
            if (items.length > 0) {
                this.renderTrending(items);
                if (this.elements.trendingSection) this.elements.trendingSection.style.display = 'block';
            } else {
                if (this.elements.trendingSection) this.elements.trendingSection.style.display = 'none';
            }
        } catch (error) {
            console.error('Trending fetch error:', error);
            if (this.elements.trendingSection) this.elements.trendingSection.style.display = 'none';
        }
    }

    renderTrending(items) {
        if (!this.elements.trendingList) return;
        this.elements.trendingList.innerHTML = '';

        items.forEach(item => {
            const theme = window.themeManager ? window.themeManager.currentTheme : 'default';
            const bgMap = {
                default: 'luna_anime.png',
                sunny: 'sunny_anime.png',
                sakura: 'sakura_anime.png',
                cyber: 'cyber_anime.png',
                tuxedo: 'tuxedo_anime.png',
                oddeye: 'oddeye_anime.png'
            };
            const placeholder = bgMap[theme] || 'luna_anime.png';

            const card = document.createElement('div');
            card.className = 'trending-card';
            card.innerHTML = `
                <div class="trending-badge">HOT</div>
                <img src="${item.thumbnail}" class="trending-thumb" onerror="this.src='${placeholder}'">
                <div class="trending-info">
                    <div class="trending-name">${this.escapeHtml(item.title)}</div>
                    <div class="trending-meta">
                        <i data-lucide="user" style="width:10px;height:10px;"></i>
                        <span>${this.escapeHtml(item.artist)}</span>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                this.elements.linksInput.value = `https://suno.com/song/${item.uuid}`;
                this.loadPlaylist();
            });
            this.elements.trendingList.appendChild(card);
        });
    }
    async getClipboardText() {
        try {
            // Capacitor native clipboard (most reliable on iOS)
            if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Clipboard) {
                const result = await window.Capacitor.Plugins.Clipboard.read();
                return result && result.value ? result.value : '';
            }
            // Web clipboard API - requires user gesture & permission
            if (navigator.clipboard && navigator.clipboard.readText) {
                return await navigator.clipboard.readText();
            }
        } catch (err) {
            // Silently ignore — AbortError & NotSupportedError are expected on iOS
            console.warn('[Clipboard] Read skipped:', err.name || err.message);
        }
        return '';
    }

    async handlePasteAndAdd() {
        let text = this.elements.linksInput.value.trim();

        // If input is empty, try to read from clipboard
        if (!text) {
            text = await this.getClipboardText();
            if (text && (text.includes('suno.com') || text.includes('s.suno.ai'))) {
                this.elements.linksInput.value = text;
                this.showToast('リンクを読み込みました 🐾');
            } else {
                // Nothing in input or clipboard — just load whatever is there
                this.loadPlaylist();
                return;
            }
        }

        this.loadPlaylist();
    }

    async checkClipboardForSunoLink() {
        if (this.elements.linksInput.value.trim() !== '') return;
        const text = await this.getClipboardText();
        if (text && (text.includes('suno.com/song/') || text.includes('s.suno.ai/'))) {
            if (confirm(window.i18n.t('clipboardDetected'))) {
                this.elements.linksInput.value = text;
                this.loadPlaylist();
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("[System] DOMContentLoaded. Booting SUNO CAT PLAYER...");

    try {
        window.i18n = new I18nManager();
        window.i18n.updateDOM();
        console.log("[System] I18n Ready");
    } catch (e) { console.error("I18n Init Error:", e); }

    try {
        window.themeManager = new ThemeManager();
        window.themeManager.init();
        console.log("[System] Theme Ready");
    } catch (e) { console.error("Theme Init Error:", e); }

    try {
        window.authManager = new AuthManager();
        window.authManager.init();
        console.log("[System] Auth Ready");
    } catch (e) { console.error("Auth Init Error:", e); }

    // Check for Deep Link Callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('uid')) {
        const userData = {
            uid: urlParams.get('uid'),
            name: urlParams.get('name'),
            photo: urlParams.get('photo')
        };
        window.authManager.setExternalUser(userData);
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    try {
        window.sunoPlaylist = new SUNOPlaylist();
        console.log("[System] Main App Ready");
    } catch (e) {
        console.error("Main App Init Error:", e);
        // Emergency cleanup if app fails
        const splash = document.getElementById('splashScreen');
        if (splash) splash.remove();
    }

    if (window.lucide) {
        window.lucide.createIcons();
    }

    // UI Listeners
    const setupUI = () => {
        const mascotImgTrig = document.getElementById('mascotImg');
        const themeDropdown = document.getElementById('themeDropdown');
        if (mascotImgTrig && themeDropdown) {
            mascotImgTrig.addEventListener('click', (e) => {
                e.stopPropagation();
                themeDropdown.classList.toggle('show');
            });
            document.querySelectorAll('.theme-option').forEach(opt => {
                opt.addEventListener('click', () => {
                    window.themeManager.setTheme(opt.dataset.theme);
                    themeDropdown.classList.remove('show');
                });
            });
        }

        const langBtn = document.getElementById('languageBtn');
        const langDropdown = document.getElementById('languageDropdown');
        if (langBtn && langDropdown) {
            langBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                langDropdown.classList.toggle('show');
            });
            document.querySelectorAll('.language-option').forEach(opt => {
                opt.addEventListener('click', () => {
                    window.i18n.setLanguage(opt.dataset.lang);
                    langDropdown.classList.remove('show');
                });
            });
        }
    };
    setupUI();

    // Splash Screen Removal
    const splash = document.getElementById('splashScreen');
    if (splash) {
        setTimeout(() => {
            splash.classList.add('fade-out');
            setTimeout(() => {
                splash.remove();
                const mImg = document.getElementById('mascotImg');
                if (mImg) mImg.style.opacity = '1';
                console.log("[System] Splash removed");
            }, 800);
        }, 1200);
    }
});
