# 🎵 SUNO Playlist Player

SUNOのAI生成音楽をプレイリストで楽しめるWebアプリ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

## ✨ 機能

### コア機能
- 📝 **プレイリスト作成** - SUNOリンク（通常/短縮）からプレイリスト生成
- 🎵 **音楽再生** - 連続再生、前へ/次へ、シーク、音量調整
- 📊 **メタデータ自動取得** - タイトル、アーティスト名を自動取得
- 🔗 **URL共有** - プレイリストを共有可能なURLで生成

### エラーハンドリング
- 🔄 **リトライ機能** - 指数バックオフで最大3回再試行
- ⏱️ **タイムアウト処理** - 適切なタイムアウト設定
- 📡 **オフライン検出** - ネットワーク状態をリアルタイム監視
- 💬 **詳細エラー表示** - 分かりやすいエラーメッセージ

### UI/UX
- ⌨️ **キーボードショートカット** - Space、N、P、←→、Mで操作
- 🔀 **シャッフルモード** - ランダム再生
- 🔁 **リピートモード** - none/all/one の3モード
- 📜 **ヘルプモーダル** - ショートカット一覧表示

### プレイリスト永続化
- 💾 **自動保存** - LocalStorageに自動保存
- 📜 **履歴管理** - 最大10件の履歴を保持
- ⭐ **お気に入り** - 重要なプレイリストに星マーク
- 🔄 **自動復元** - ページリロード時に前回のプレイリストを復元提案

## 🚀 デプロイ

### Vercelにデプロイ

1. GitHubにリポジトリをプッシュ
2. [Vercel](https://vercel.com)にログイン
3. 「New Project」からリポジトリをインポート
4. 「Deploy」をクリック

## 💻 ローカル開発

### 必要なもの
- Node.js 18以上（Vercel開発サーバー用）

### セットアップ

```bash
# Vercel CLIをインストール（初回のみ）
npm i -g vercel

# ローカル開発サーバーを起動
vercel dev
```

ブラウザで `http://localhost:3000` を開く

## 📁 ファイル構造

```
suno-playlist-player/
├── api/
│   ├── metadata.js    # メタデータ取得API
│   └── resolve.js     # 短縮リンク解決API
├── index.html         # メインHTML
├── app.js            # クライアントJS
├── styles.css        # スタイル
├── vercel.json       # Vercel設定
├── package.json      # npm設定
└── README.md         # このファイル
```

## 🛠️ 技術スタック

- **フロントエンド**: HTML/CSS/JavaScript（Vanilla）
- **バックエンド**: Vercel Serverless Functions
- **ストレージ**: LocalStorage API
- **デプロイ**: Vercel

## ⌨️ キーボードショートカット

| キー | 機能 |
|------|------|
| `Space` | 再生/一時停止 |
| `N` | 次の曲 |
| `P` | 前の曲 |
| `←` | 5秒戻る |
| `→` | 5秒進む |
| `M` | ミュート/ミュート解除 |

## 📝 ライセンス

MIT

## 🙏 謝辞

[SUNO AI](https://suno.com) - AI音楽生成プラットフォーム
