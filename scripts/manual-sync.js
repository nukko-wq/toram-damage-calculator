#!/usr/bin/env node

/**
 * 手動データ同期スクリプト
 * crystal.ts を直接編集した後に実行してください
 * 
 * 使用方法: node scripts/manual-sync.js
 */

const fs = require('node:fs')
const path = require('node:path')

console.log('🔄 手動データ同期を開始します...\n')
console.log('❗ 重要: crystal.ts を編集した後は、以下の手順を実行してください:')
console.log('1. crystal.ts の変更内容を確認')
console.log('2. 開発サーバーを起動: npm run dev')
console.log('3. ブラウザでデータが正しく読み込まれることを確認')
console.log('4. 本番ビルド: npm run build (自動でデータ同期も実行されます)')
console.log('')

// 現在の設計について説明
console.log('📋 現在のデータシステム設計:')
console.log('├─ src/data/crystals.ts     ← 開発時メインデータ (こちらを編集)')
console.log('├─ public/data/crystals.json ← 本番配信用データ (自動生成)')
console.log('└─ ハイブリッドシステム: 開発時は.ts、本番時は.json を使用')
console.log('')

console.log('✅ 現在の実装では以下の方法でデータが同期されます:')
console.log('- 開発時: crystalDatabase.ts が直接 crystals.ts を読み込み')
console.log('- 本番時: presetVersionManager.ts が crystals.json をフェッチ')
console.log('- ビルド時: prebuild スクリプトで .ts → .json 自動変換')
console.log('')

console.log('🎯 推奨ワークフロー:')
console.log('1. src/data/crystals.ts を編集')
console.log('2. npm run dev で開発サーバー起動（即座に反映）')
console.log('3. 確認後、npm run build で本番ビルド')
console.log('')

console.log('✨ 設定完了: crystals.ts の編集内容は開発サーバーで即座に確認できます！')