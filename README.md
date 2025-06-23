# トーラムオンライン ダメージ計算ツール

MMORPGトーラムオンラインのダメージ計算を行うWebアプリケーション。

## 技術スタック

- **フレームワーク**: Next.js 15 + React 19
- **言語**: TypeScript (strict mode)
- **スタイリング**: Tailwind CSS v4
- **状態管理**: Zustand
- **フォーム管理**: React Hook Form + Zod validation
- **コード品質**: Biome

## プロジェクト構成

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## ドキュメント

プロジェクトの詳細な設計書は `docs/` ディレクトリに整理されています：

- **[docs/README.md](./docs/README.md)** - 設計書全体の構成と利用方法
- **[docs/requirements/](./docs/requirements/)** - 要件定義書（機能別）
- **[docs/technical/](./docs/technical/)** - 技術仕様書（システム別）
- **[docs/database/](./docs/database/)** - データベース・ストレージ設計
- **[docs/store/](./docs/store/)** - Zustand状態管理設計
- **[docs/ui/](./docs/ui/)** - UI仕様書

### 開発者向けガイド

1. **プロジェクト理解**: `docs/requirements/00_overview.md` から開始
2. **技術アーキテクチャ**: `docs/technical/00_overview.md` で全体設計を理解
3. **実装詳細**: 担当する機能に応じて関連する設計書を参照

## 開発情報

### 開発フェーズ

- **フェーズ1**: 入力フォーム・UI実装（完了）
- **フェーズ2**: カスタムデータ編集機能（進行中）
- **フェーズ3**: ダメージ計算ロジック実装（予定）

### 主要コマンド

```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run start        # プロダクションサーバー起動
npm run lint         # ESLint実行
npm run format       # Biome フォーマット実行
npx tsc --noEmit     # 型チェック実行
```
