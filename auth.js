// ===================================
//    Auth Manager (Firebase v8 Compatible)
// ===================================
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.onUserChanged = null;
        this._firebaseAvailable = false;
        try {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                this._firebaseAvailable = true;
            }
        } catch (e) {
            console.warn('[Auth] Firebase not available:', e.message);
        }
    }
    init() {
        if (!this._firebaseAvailable) {
            console.warn('[Auth] Firebase unavailable — auth features disabled.');
            this._updateUI(null);
            return;
        }
        try {
            firebase.auth().onAuthStateChanged((user) => {
                this.currentUser = user;
                this._updateUI(user);
                if (typeof this.onUserChanged === 'function') {
                    try { this.onUserChanged(user); } catch (e) { console.error('[Auth] onUserChanged error:', e); }
                }
            });
        } catch (e) {
            console.error('[Auth] onAuthStateChanged setup failed:', e);
            this._updateUI(null);
        }
    }
    async loginWithGoogle() {
        if (!this._firebaseAvailable) { console.warn('[Auth] Firebase unavailable.'); return; }
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await firebase.auth().signInWithPopup(provider);
        } catch (e) {
            console.error('[Auth] Google login error:', e);
            if (e.code !== 'auth/popup-closed-by-user') alert('ログインに失敗しました: ' + (e.message || e.code));
        }
    }
    async logout() {
        if (!this._firebaseAvailable) return;
        try { await firebase.auth().signOut(); } catch (e) { console.error('[Auth] Logout error:', e); }
    }
    getCurrentUser() { return this.currentUser; }
    setExternalUser(userData) {
        if (!userData || !userData.uid) return;
        this.currentUser = { uid: userData.uid, displayName: userData.name || 'User', photoURL: userData.photo || null, email: null };
        this._updateUI(this.currentUser);
        if (typeof this.onUserChanged === 'function') { try { this.onUserChanged(this.currentUser); } catch (e) {} }
    }
    _updateUI(user) {
        const userBtn = document.getElementById('userBtn');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const userInfo = document.getElementById('userInfo');
        const loginOptions = document.getElementById('loginOptions');
        const logoutOption = document.getElementById('logoutOption');
        if (!userBtn) return;
        if (user) {
            if (userAvatar) { userAvatar.src = user.photoURL || ''; userAvatar.style.display = user.photoURL ? 'block' : 'none'; }
            if (userName) userName.textContent = user.displayName || 'User';
            if (userInfo) userInfo.style.display = 'flex';
            if (loginOptions) loginOptions.style.display = 'none';
            if (logoutOption) logoutOption.style.display = 'flex';
            userBtn.title = user.displayName || 'ログイン中';
        } else {
            if (userAvatar) { userAvatar.src = ''; userAvatar.style.display = 'none'; }
            if (userName) userName.textContent = '';
            if (userInfo) userInfo.style.display = 'none';
            if (loginOptions) loginOptions.style.display = 'flex';
            if (logoutOption) logoutOption.style.display = 'none';
            userBtn.title = 'ログイン';
        }
    }
}
