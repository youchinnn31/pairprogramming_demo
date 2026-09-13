# Travel Plan App

旅行計画を作成、編集、確認する Express + EJS + SQLite アプリです。

## Scripts

- `npm run dev`: 開発サーバーを起動
- `npm run build`: TypeScript をビルド
- `npm start`: ビルド済みアプリを起動

## Docker

```bash
docker build -t travel-plan-app .
docker run --rm -p 3000:3000 travel-plan-app
```

起動したら、ブラウザで `http://localhost:3000` を開きます。
