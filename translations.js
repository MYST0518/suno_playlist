// Translation data for SUNO Playlist Player
// Supported languages: ja (Japanese), en (English), zh (Chinese Simplified), ko (Korean)

const translations = {
    ja: {
        // App Info
        appName: 'SUNO CAT PLAYER',
        appTitle: 'SUNO Playlist',
        appDescription: 'SUNOのリンクをまとめて連続再生',

        // Tabs
        tabPlaylist: '再生リスト',

        // Input Section

        // Input Section
        inputTitle: 'リンク入力',
        inputPlaceholder: 'SUNOの曲リンク（1行に1曲）または短縮リンク（s.suno.ai/xxxxx）を入力してください',
        loadPlaylistBtn: 'プレイリスト作成',

        // Player Controls
        previous: '前へ',
        play: '再生',
        pause: '一時停止',
        next: '次へ',
        shuffle: 'シャッフル',
        repeat: 'リピート',
        none: 'なし',
        all: '全曲',
        one: '1曲',

        // Playlist
        playlistTitle: 'プレイリスト',
        trackCount: '曲',
        emptyPlaylist: 'プレイリストが空です',

        // Actions
        clear: 'クリア',
        download: 'ダウンロード',
        import: 'インポート',
        share: '共有',
        history: '履歴',
        help: 'ヘルプ',

        // Share Options
        shareTwitter: 'X (Twitter)で共有',
        shareLine: 'LINEで共有',
        shareFacebook: 'Facebookで共有',
        shareCopy: 'URLをコピー',

        // Help Modal
        helpTitle: 'ヘルプ',
        shortcutsTab: 'ショートカット',
        usageTab: '使い方',

        // Keyboard Shortcuts
        keySpace: 'Space',
        keyN: 'N',
        keyP: 'P',
        keyLeft: '←',
        keyRight: '→',
        keyM: 'M',
        actionPlay: '再生/停止',
        actionNext: '次の曲',
        actionPrev: '前の曲',
        actionSeekBack: '5秒戻る',
        actionSeekForward: '5秒進む',
        actionMute: 'ミュート',

        // Usage Guide
        usageCreateTitle: '🎵 プレイリストの作り方',
        usageCreateStep1: 'SUNOの曲URL（suno.com/song/...）や、SNS共有用の短縮リンク（s.suno.ai/...）を貼り付けます。複数曲ある場合は、1行に1曲ずつ入力してください。',
        usageCreateStep2: '「プレイリスト作成」ボタンを押すと、自動的に楽曲名とアーティスト名、サムネイルを取得します',
        usageCreateStep3: 'プレイリストの曲をクリックすると再生が始まります。ドラッグで曲順の入れ替えも可能です',

        usageShareTitle: '🔗 プレイリストを共有',
        usageShareDesc: '作成したプレイリストを短縮URLとして共有できます：',
        usageShareTwitter: 'X (Twitter) でフォロワーに教える',
        usageShareLine: 'LINEのトークルームで共有',
        usageShareFacebook: 'Facebookに投稿してシェア',
        usageShareUrl: 'プレイリスト専用の短縮URLをコピー',

        usageSaveTitle: '💾 データの保存',
        usageSaveDownload: '作成したリストをJSONファイルとして保存（バックアップ）できます',
        usageSaveImport: '保存したJSONファイルを読み込んでプレイリストを復元します',
        usageSaveHistory: '最近作成したリストは履歴（最大10件）に自動保存されます',

        usageFeaturesTitle: '🎮 便利な特長・機能',
        usageFeatureShuffle: '🔀 シャッフル: 楽曲をランダムな順番で再生します',
        usageFeatureRepeat: '🔁 リピート: 全曲/1曲のみ/オフを切り替え可能です',
        usageFeatureFavorite: '⭐ お気に入り: 履歴のリストを星マークで固定できます',

        usageFeatureOpenInSuno: '🔗 SUNO公式サイト: 曲名横の🔗から公式ページを即座に開けます',
        usageFeatureTheme: '🐱 テーマ切替: デフォルトと茶トラ猫テーマを自由に選べます',

        // History Modal
        historyTitle: 'プレイリスト履歴',
        historyFavorites: 'お気に入り',
        historyRecent: '最近の履歴',
        historyEmpty: '履歴がありません',
        historyLoad: '読込',
        historyFavorite: 'お気に入り',
        historyDelete: '削除',

        // Toast Messages
        toastUrlCopied: 'URLをコピーしました！',
        toastPlaylistSaved: 'プレイリストをダウンロードしました',
        toastPlaylistImported: '曲をインポートしました',
        toastPlaylistCleared: 'プレイリストをクリアしました',
        toastFavoriteAdded: 'お気に入りに追加',
        toastFavoriteRemoved: 'お気に入りから削除',
        toastSharing: '共有中...',
        toastGeneratingUrl: '短縮URL生成中...',
        toastLoading: '読み込み中...',
        toastUpdated: 'アプリが更新されました',
        toastInstalled: 'アプリをインストールしました！',

        // Error Messages
        errorEmpty: 'プレイリストが空です',
        errorInvalidJson: 'JSONファイルを選択してください',
        errorLoadFailed: 'ファイルの読み込みに失敗しました',
        errorPlaylistNotFound: 'プレイリストが見つかりません',
        errorOffline: 'オフラインです',

        // Buttons
        close: '閉じる',
        cancel: 'キャンセル',
        ok: 'OK',

        // Language Selector
        language: '言語',
        langJa: '日本語',
        langEn: 'English',
        langZh: '中文',
        langKo: '한국어',

        // Theme Selector
        theme: '🐈ネコを選ぶ',
        themeDefault: 'ルナ（Dark）',
        themeTabby: 'サニー（Light）',
        themeSakura: 'サクラ（Pink）',
        openInSuno: 'SUNO',
        donateSupport: '開発を応援する',
        donateTreat: '🐾 猫におやつをあげる',
        donateWishlist: '🎁 猫におかしをあげる',
        donateSelectTitle: '応援方法を選んでね🐾',

        // System Toasts & Dialogs
        repeatNone: 'リピートオフ',
        repeatAll: '全曲リピート',
        repeatOne: '1曲リピート',
        confirmClear: 'プレイリストをクリアしますか？',
        onlineMessage: 'オンラインに復帰しました',
        offlineMessage: 'オフラインです',
        metaResolving: '短縮リンクを解決中...',
        metaLoading: '読み込み中...',
        metaTimeout: 'タイムアウト',
        metaNotFound: 'トラックが見つかりません',
        metaNoNetwork: 'ネットワークエラー'
    },

    en: {
        // App Info
        appName: 'SUNO CAT PLAYER',
        appTitle: 'SUNO Playlist',
        appDescription: 'Play SUNO music continuously',

        // Tabs
        tabPlaylist: 'Playlist',

        // Input Section

        // Input Section
        inputTitle: 'Add Links',
        inputPlaceholder: 'Paste SUNO song links (one per line) or short links (s.suno.ai/xxxxx)',
        loadPlaylistBtn: 'Create Playlist',

        // Player Controls
        previous: 'Previous',
        play: 'Play',
        pause: 'Pause',
        next: 'Next',
        shuffle: 'Shuffle',
        repeat: 'Repeat',
        none: 'None',
        all: 'All',
        one: 'One',

        // Playlist
        playlistTitle: 'Playlist',
        trackCount: 'tracks',
        emptyPlaylist: 'Playlist is empty',

        // Actions
        clear: 'Clear',
        download: 'Download',
        import: 'Import',
        share: 'Share',
        history: 'History',
        help: 'Help',

        // Share Options
        shareTwitter: 'Share on X (Twitter)',
        shareLine: 'Share on LINE',
        shareFacebook: 'Share on Facebook',
        shareCopy: 'Copy URL',

        // Help Modal
        helpTitle: 'Help',
        shortcutsTab: 'Shortcuts',
        usageTab: 'Usage Guide',

        // Keyboard Shortcuts
        keySpace: 'Space',
        keyN: 'N',
        keyP: 'P',
        keyLeft: '←',
        keyRight: '→',
        keyM: 'M',
        actionPlay: 'Play/Pause',
        actionNext: 'Next Track',
        actionPrev: 'Previous Track',
        actionSeekBack: 'Seek -5s',
        actionSeekForward: 'Seek +5s',
        actionMute: 'Mute',

        // Usage Guide
        usageCreateTitle: '🎵 How to Build Your Playlist',
        usageCreateStep1: 'Paste SUNO song URLs (suno.com/song/...) or social short links (s.suno.ai/...). Enter one link per line if you have multiple songs.',
        usageCreateStep2: 'Click "Create Playlist" to auto-fetch titles, artists, and artworks.',
        usageCreateStep3: 'Click any track to play. You can drag and drop items to reorder your list.',

        usageShareTitle: '🔗 Sharing your Playlist',
        usageShareDesc: 'Share your custom music collection with a shortened URL:',
        usageShareTwitter: 'Share with your followers on X (Twitter)',
        usageShareLine: 'Send via LINE app chat',
        usageShareFacebook: 'Post and share on Facebook',
        usageShareUrl: 'Copy the unique shortened playlist URL',

        usageSaveTitle: '💾 Backup & History',
        usageSaveDownload: 'Save your current playlist as a JSON file for backup.',
        usageSaveImport: 'Import a previously saved JSON file to restore your tracks.',
        usageSaveHistory: 'Your last 10 playlists are automatically saved in history.',

        usageFeaturesTitle: '🎮 Premium Features',
        usageFeatureShuffle: '🔀 Shuffle: Enjoy your songs in a random sequence.',
        usageFeatureRepeat: '🔁 Repeat: Toggle between All, One, or No repeat.',
        usageFeatureFavorite: '⭐ History Favorites: Star playlists in history to keep them.',
        usageFeatureOpenInSuno: '🔗 Open in SUNO: Access the official page directly via the 🔗 button.',
        usageFeatureTheme: '🐱 Themes: Switch between Default and Tabby Cat styles.',

        // History Modal
        historyTitle: 'Playlist History',
        historyFavorites: 'Favorites',
        historyRecent: 'Recent',
        historyEmpty: 'No history',
        historyLoad: 'Load',
        historyFavorite: 'Favorite',
        historyDelete: 'Delete',

        // Toast Messages
        toastUrlCopied: 'URL copied!',
        toastPlaylistSaved: 'Playlist downloaded',
        toastPlaylistImported: 'tracks imported',
        toastPlaylistCleared: 'Playlist cleared',
        toastFavoriteAdded: 'Added to favorites',
        toastFavoriteRemoved: 'Removed from favorites',
        toastSharing: 'Sharing...',
        toastGeneratingUrl: 'Generating short URL...',
        toastLoading: 'Loading...',
        toastUpdated: 'App updated',
        toastInstalled: 'App installed!',
        openInSuno: 'SUNO',
        donateSupport: 'Support Developer',
        donateTreat: '🐾 Buy Cat a Treat',
        donateWishlist: '🎁 Gift for Cats',
        donateSelectTitle: 'Support me🐾',

        // Error Messages
        errorEmpty: 'Playlist is empty',
        errorInvalidJson: 'Please select a JSON file',
        errorLoadFailed: 'Failed to load file',
        errorPlaylistNotFound: 'Playlist not found',
        errorOffline: 'Offline',

        // Buttons
        close: 'Close',
        cancel: 'Cancel',
        ok: 'OK',

        // Language Selector
        language: 'Language',
        langJa: '日本語',
        langEn: 'English',
        langZh: '中文',
        langKo: '한국어',

        // Theme Selector
        theme: '🐈Choose Cat',
        themeDefault: 'Luna (Dark)',
        themeTabby: 'Sunny (Light)',
        themeSakura: 'Sakura (Pink)',

        // System Toasts & Dialogs
        repeatNone: 'Repeat Off',
        repeatAll: 'Repeat All',
        repeatOne: 'Repeat One',
        confirmClear: 'Are you sure you want to clear the playlist?',
        onlineMessage: 'Back online',
        offlineMessage: 'You are offline',
        metaResolving: 'Resolving short link...',
        metaLoading: 'Loading metadata...',
        metaTimeout: 'Timeout',
        metaNotFound: 'Track not found',
        metaNoNetwork: 'Network error'
    },

    zh: {
        // App Info
        appName: 'SUNO 播放列表播放器',
        appTitle: 'SUNO 播放列表',
        appDescription: '连续播放SUNO音乐',

        // Tabs
        tabPlaylist: '播放列表',

        // Input Section

        // Input Section
        inputTitle: '添加链接',
        inputPlaceholder: '粘贴SUNO歌曲链接（每行一首）或短链接（s.suno.ai/xxxxx）',
        loadPlaylistBtn: '创建播放列表',

        // Player Controls
        previous: '上一首',
        play: '播放',
        pause: '暂停',
        next: '下一首',
        shuffle: '随机播放',
        repeat: '重复',
        none: '关闭',
        all: '全部',
        one: '单曲',

        // Playlist
        playlistTitle: '播放列表',
        trackCount: '首',
        emptyPlaylist: '播放列表为空',

        // Actions
        clear: '清空',
        download: '下载',
        import: '导入',
        share: '分享',
        history: '历史',
        help: '帮助',

        // Share Options
        shareTwitter: '分享到 X (Twitter)',
        shareLine: '分享到 LINE',
        shareFacebook: '分享到 Facebook',
        shareCopy: '复制链接',

        // Help Modal
        helpTitle: '帮助',
        shortcutsTab: '快捷键',
        usageTab: '使用指南',

        // Keyboard Shortcuts
        keySpace: 'Space',
        keyN: 'N',
        keyP: 'P',
        keyLeft: '←',
        keyRight: '→',
        keyM: 'M',
        actionPlay: '播放/暂停',
        actionNext: '下一首',
        actionPrev: '上一首',
        actionSeekBack: '后退5秒',
        actionSeekForward: '前进5秒',
        actionMute: '静音',

        // Usage Guide
        usageCreateTitle: '🎵 制作播放列表',
        usageCreateStep1: '将 SUNO 歌曲完整链接 (suno.com/song/...) 或社交分享短链接 (s.suno.ai/...) 粘贴到输入框中。每行输入一个链接。',
        usageCreateStep2: '点击“制作播放列表”按钮，系统将自动获取标题、艺术家和封面图',
        usageCreateStep3: '点击列表中的曲目即可播放。您可以拖拽条目来重新排序',

        usageShareTitle: '🔗 分享播放列表',
        usageShareDesc: '生成短链接，轻松分享您的专属音乐收藏：',
        usageShareTwitter: '在 X (Twitter) 上分享给您的关注者',
        usageShareLine: '通过 LINE 应用发送列表链接',
        usageShareFacebook: '发布到 Facebook 动态进行分享',
        usageShareUrl: '复制此播放列表的唯一缩短链接',

        usageSaveTitle: '💾 备份与历史',
        usageSaveDownload: '将当前列表导出为 JSON 文件进行本地备份',
        usageSaveImport: '导入之前保存的 JSON 文件以恢复您的播放列表',
        usageSaveHistory: '最近制作的 10 个播放列表将自动保存在历史记录中',

        usageFeaturesTitle: '🎮 进阶功能',
        usageFeatureShuffle: '🔀 随机播放：以随机顺序享受您的音乐',
        usageFeatureRepeat: '🔁 循环模式：在 全部循环/单曲循环/不循环 之间切换',
        usageFeatureFavorite: '⭐ 收藏记录：在历史记录中点击星号永久保存列表',

        usageFeatureOpenInSuno: '🔗 在 SUNO 中打开：点击 🔗 按钮即可直达官方详情页',
        usageFeatureTheme: '🐱 主题挑选：在默认与茶虎猫主题间自由切换',

        // History Modal
        historyTitle: '播放列表历史',
        historyFavorites: '收藏',
        historyRecent: '最近',
        historyEmpty: '无历史记录',
        historyLoad: '加载',
        historyFavorite: '收藏',
        historyDelete: '删除',

        // Toast Messages
        toastUrlCopied: '链接已复制！',
        toastPlaylistSaved: '播放列表已下载',
        toastPlaylistImported: '首歌曲已导入',
        toastPlaylistCleared: '播放列表已清空',
        toastFavoriteAdded: '已添加到收藏',
        toastFavoriteRemoved: '已从收藏中移除',
        toastSharing: '分享中...',
        toastGeneratingUrl: '生成短链接中...',
        toastLoading: '加载中...',
        toastUpdated: '应用已更新',
        toastInstalled: '应用已安装！',
        openInSuno: '在 SUNO 中打开',
        donateSupport: '支持开发者',
        donateTreat: '🐾 给猫咪买零食',

        // Error Messages
        errorEmpty: '播放列表为空',
        errorInvalidJson: '请选择JSON文件',
        errorLoadFailed: '文件加载失败',
        errorPlaylistNotFound: '找不到播放列表',
        errorOffline: '离线',

        // Buttons
        close: '关闭',
        cancel: '取消',
        ok: '确定',

        // Language Selector
        language: '语言',
        langJa: '日本語',
        langEn: 'English',
        langZh: '中文',
        langKo: '한국어',

        // Theme Selector
        theme: '主题',
        themeDefault: '黑猫',
        themeTabby: '虎斑猫',

        // System Toasts & Dialogs
        repeatNone: '重复关闭',
        repeatAll: '播放列表循环',
        repeatOne: '单曲循环',
        confirmClear: '您确定要清空播放列表吗？',
        onlineMessage: '已恢复在线',
        offlineMessage: '您已离线',
        metaResolving: '正在解析短链接...',
        metaLoading: '正在加载元数据...',
        metaTimeout: '超时',
        metaNotFound: '找不到曲目',
        metaNoNetwork: '网络误差'
    },

    ko: {
        // App Info
        appName: 'SUNO 재생목록 플레이어',
        appTitle: 'SUNO 재생목록',
        appDescription: 'SUNO 음악을 연속 재생',

        // Tabs
        tabPlaylist: '재생 목록',

        // Input Section

        // Input Section
        inputTitle: '링크 추가',
        inputPlaceholder: 'SUNO 노래 링크를 붙여넣기 (한 줄에 하나씩) 또는 단축 링크 (s.suno.ai/xxxxx)',
        loadPlaylistBtn: '재생목록 만들기',

        // Player Controls
        previous: '이전',
        play: '재생',
        pause: '일시정지',
        next: '다음',
        shuffle: '셔플',
        repeat: '반복',
        none: '없음',
        all: '전체',
        one: '한 곡',

        // Playlist
        playlistTitle: '재생목록',
        trackCount: '곡',
        emptyPlaylist: '재생목록이 비어있습니다',

        // Actions
        clear: '지우기',
        download: '다운로드',
        import: '가져오기',
        share: '공유',
        history: '기록',
        help: '도움말',

        // Share Options
        shareTwitter: 'X (Twitter)로 공유',
        shareLine: 'LINE으로 공유',
        shareFacebook: 'Facebook으로 공유',
        shareCopy: 'URL 복사',

        // Help Modal
        helpTitle: '도움말',
        shortcutsTab: '단축키',
        usageTab: '사용 가이드',

        // Keyboard Shortcuts
        keySpace: 'Space',
        keyN: 'N',
        keyP: 'P',
        keyLeft: '←',
        keyRight: '→',
        keyM: 'M',
        actionPlay: '재생/일시정지',
        actionNext: '다음 곡',
        actionPrev: '이전 곡',
        actionSeekBack: '5초 뒤로',
        actionSeekForward: '5초 앞으로',
        actionMute: '음소거',

        // Usage Guide
        usageCreateTitle: '🎵 플레이리스트 만들기',
        usageCreateStep1: 'SUNO 곡 사이트 주소(suno.com/song/...)나 SNS 공유용 단축 주소(s.suno.ai/...)를 붙여넣으세요. 여러 곡일 경우 한 줄에 하나씩 입력해 주세요.',
        usageCreateStep2: '「플레이리스트 작성」 버튼을 누르면 제목, 아티스트, 썸네일을 자동으로 로드합니다',
        usageCreateStep3: '목록의 곡을 클릭하면 재생이 시작됩니다. 드래그하여 순서를 변경할 수 있습니다',

        usageShareTitle: '🔗 플레이리스트 공유하기',
        usageShareDesc: '나만의 리스트를 단축 URL로 생성하여 공유해 보세요:',
        usageShareTwitter: 'X(Twitter) 팔로워들에게 나의 리스트 공유',
        usageShareLine: 'LINE 메신저를 통해 앱으로 바로 전송',
        usageShareFacebook: 'Facebook 게시물로 공유하기',
        usageShareUrl: '이 플레이리스트 전용 단축 URL 복사하기',

        usageSaveTitle: '💾 백업 및 히스토리',
        usageSaveDownload: '현재 리스트를 JSON 파일로 내보내어 안전하게 백업합니다',
        usageSaveImport: '저장된 JSON 파일을 불러와 플레이리스트를 즉시 복원합니다',
        usageSaveHistory: '최근에 만든 리스트 10개까지 히스토리에 자동 저장됩니다',

        usageFeaturesTitle: '🎮 편리한 기능',
        usageFeatureShuffle: '🔀 셔플: 곡을 무작위 순서로 재생하여 즐깁니다',
        usageFeatureRepeat: '🔁 반복 모드: 전체/한 곡/반복 안 함을 자유롭게 전환합니다',
        usageFeatureFavorite: '⭐ 즐겨찾기: 히스토리에서 마음에 드는 리스트를 별표로 고정합니다',

        usageFeatureOpenInSuno: '🔗 SUNO에서 열기: 제목 옆의 🔗 버튼으로 공식 페이지에 즉시 접속합니다',
        usageFeatureTheme: '🐱 테마 변경: 기본 또는 치즈 고양이 테마로 디자인을 바꿉니다',

        // History Modal
        historyTitle: '재생목록 기록',
        historyFavorites: '즐겨찾기',
        historyRecent: '최근',
        historyEmpty: '기록이 없습니다',
        historyLoad: '불러오기',
        historyFavorite: '즐겨찾기',
        historyDelete: '삭제',

        // Toast Messages
        toastUrlCopied: 'URL이 복사되었습니다!',
        toastPlaylistSaved: '재생목록이 다운로드되었습니다',
        toastPlaylistImported: '곡을 가져왔습니다',
        toastPlaylistCleared: '재생목록이 지워졌습니다',
        toastFavoriteAdded: '즐겨찾기에 추가',
        toastFavoriteRemoved: '즐겨찾기에서 제거',
        toastSharing: '공유 중...',
        toastGeneratingUrl: '단축 URL 생성 중...',
        toastLoading: '로딩 중...',
        toastUpdated: '앱이 업데이트되었습니다',
        toastInstalled: '앱이 설치되었습니다!',
        openInSuno: 'SUNO에서 열기',
        donateSupport: '개발자 응원하기',
        donateTreat: '🐾 고양이 간식 주기',

        // Error Messages
        errorEmpty: '재생목록이 비어있습니다',
        errorInvalidJson: 'JSON 파일을 선택해주세요',
        errorLoadFailed: '파일 로드 실패',
        errorPlaylistNotFound: '재생목록을 찾을 수 없습니다',
        errorOffline: '오프라인',

        // Buttons
        close: '닫기',
        cancel: '취소',
        ok: '확인',

        // Language Selector
        language: '언어',
        langJa: '日本語',
        langEn: 'English',
        langZh: '中文',
        langKo: '한국어',

        // Theme Selector
        theme: '테마',
        themeDefault: '검은 고양이',
        themeTabby: '얼룩 고양이',

        // System Toasts & Dialogs
        repeatNone: '반복 끄기',
        repeatAll: '전체 반복',
        repeatOne: '한 곡 반복',
        confirmClear: '재생목록을 지우시겠습니까?',
        onlineMessage: '온라인으로 복귀',
        offlineMessage: '오프라인 상태입니다',
        metaResolving: '단축 링크를 확인 중...',
        metaLoading: '노래 정보를 가져오는 중...',
        metaTimeout: '시간 초과',
        metaNotFound: '노래를 찾을 수 없습니다',
        metaNoNetwork: '네트워크 오류'
    }
};

// Export translations to global scope
// This must be available before app.js loads
window.translations = translations;
