#!/usr/bin/env node

/**
 * データ同期スクリプト
 * src/data/ から public/data/ にJSONファイルを同期します
 * 
 * 同期対象ファイル:
 * - crystals.json
 * - enemies.json  
 * - equipments.json
 * 
 * buffItems.json は src/data/ のみに存在するため同期対象外
 */

const fs = require('fs')
const path = require('path')

// ファイルパス設定
const srcDir = path.join(__dirname, '../src/data')
const publicDir = path.join(__dirname, '../public/data')

// 同期対象ファイル
const filesToSync = [
	'crystals.json',
	'enemies.json', 
	'equipments.json'
]

console.log('🔄 データファイル同期を開始します...\n')

// public/data ディレクトリが存在しない場合は作成
if (!fs.existsSync(publicDir)) {
	fs.mkdirSync(publicDir, { recursive: true })
	console.log('📁 public/data ディレクトリを作成しました')
}

let syncCount = 0
let errorCount = 0

filesToSync.forEach(filename => {
	const srcPath = path.join(srcDir, filename)
	const destPath = path.join(publicDir, filename)
	
	try {
		// ソースファイルの存在チェック
		if (!fs.existsSync(srcPath)) {
			console.log(`⚠️  ${filename}: ソースファイルが見つかりません`)
			errorCount++
			return
		}
		
		// ファイルコピー
		fs.copyFileSync(srcPath, destPath)
		
		// ファイルサイズの確認
		const srcStats = fs.statSync(srcPath)
		const destStats = fs.statSync(destPath)
		
		console.log(`✅ ${filename}: ${srcStats.size} bytes 同期完了`)
		syncCount++
		
	} catch (error) {
		console.log(`❌ ${filename}: 同期エラー - ${error.message}`)
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