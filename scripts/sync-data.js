#!/usr/bin/env node

/**
 * データ同期スクリプト
 * TypeScriptモジュールをrequireで読み込み、JSONファイルを生成して public/data/ に同期します
 *
 * 同期対象ファイル:
 * - crystals.ts → crystals.json
 * - enemies.ts → enemies.json 
 * - equipments.ts → equipments.json
 *
 * buffItems.ts は src/data/ のみに存在するため同期対象外
 */

const fs = require('node:fs')
const path = require('node:path')

// ファイルパス設定
const publicDir = path.join(__dirname, '../public/data')

// 同期対象データ
const dataToSync = [
	{ name: 'crystals.json', getData: () => require('../src/data/crystals.ts').crystalsData },
	{ name: 'enemies.json', getData: () => require('../src/data/enemies.ts').enemiesData },
	{ name: 'equipments.json', getData: () => require('../src/data/equipments.ts').equipmentsData }
]

console.log('🔄 TypeScriptモジュールからJSONデータ同期を開始します...\n')

// public/data ディレクトリが存在しない場合は作成
if (!fs.existsSync(publicDir)) {
	fs.mkdirSync(publicDir, { recursive: true })
	console.log('📁 public/data ディレクトリを作成しました')
}

let syncCount = 0
let errorCount = 0

dataToSync.forEach(({ name, getData }) => {
	const destPath = path.join(publicDir, name)

	try {
		// TypeScriptモジュールからデータを取得
		const data = getData()
		
		// JSONに変換して保存
		fs.writeFileSync(destPath, JSON.stringify(data, null, 2), 'utf8')

		// ファイルサイズの確認
		const destStats = fs.statSync(destPath)

		console.log(`✅ ${name}: ${destStats.size} bytes 同期完了`)
		syncCount++
	} catch (error) {
		console.log(`❌ ${name}: 同期エラー - ${error.message}`)
		errorCount++
	}
})

console.log('\n📊 同期結果:')
console.log(`   成功: ${syncCount}ファイル`)
console.log(`   エラー: ${errorCount}ファイル`)

if (errorCount === 0) {
	console.log('\n🎉 データファイルの同期が正常に完了しました!')
	process.exit(0)
} else {
	console.log('\n⚠️  一部のファイルで同期エラーが発生しました')
	process.exit(1)
}
