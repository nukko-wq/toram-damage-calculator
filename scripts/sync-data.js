#!/usr/bin/env node

/**
 * データ同期スクリプト
 * TypeScriptファイルからデータを抽出してJSONファイルを生成し public/data/ に同期します
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
const srcDir = path.join(__dirname, '../src/data')
const publicDir = path.join(__dirname, '../public/data')

/**
 * TypeScriptファイルからデータを抽出する関数
 * export const dataName の部分を正規表現で抽出してJSONに変換
 */
function extractDataFromTSFile(filePath, exportName) {
	try {
		const content = fs.readFileSync(filePath, 'utf8')
		
		// export const exportName: Type = { ... } as const の部分を抽出
		const exportRegex = new RegExp(
			`export\\s+const\\s+${exportName}\\s*(?::\\s*[\\w<>,\\[\\]\\s]+\\s*)?=\\s*({[\\s\\S]*?})\\s*(?:as\\s+const)?`, 
			'm'
		)
		const match = content.match(exportRegex)
		
		if (!match) {
			throw new Error(`${exportName} export not found in ${filePath}`)
		}
		
		let dataString = match[1]
		
		// TypeScript固有の記法を削除・変換
		dataString = dataString
			.replace(/\/\*\*[\s\S]*?\*\//g, '') // /** */ コメント除去
			.replace(/\/\/.*$/gm, '') // // コメント除去
			.replace(/\s+as\s+[\w<>]+/g, '') // "as Type" を除去
			.replace(/\s+as\s+const/g, '') // "as const" を除去
			.replace(/([{,\[\s])(\w+):/g, '$1"$2":') // プロパティ名をクォートで囲む
			.replace(/,(\s*[}\]])/g, '$1') // 末尾カンマ除去
			.replace(/'/g, '"') // シングルクォートをダブルクォートに変換
		
		// デバッグ用に抽出されたデータの最初の部分をコンソールに出力
		console.log(`\n=== Debug: ${exportName} extracted data preview ===`)
		console.log(dataString.substring(0, 300) + '...')
		console.log(`=== End preview ===\n`)
		
		// JSONとしてパース
		return JSON.parse(dataString)
	} catch (error) {
		throw new Error(`Failed to parse ${filePath}: ${error.message}`)
	}
}

// 同期対象データ
const dataToSync = [
	{ 
		name: 'crystals.json', 
		tsFile: path.join(srcDir, 'crystals.ts'),
		exportName: 'crystalsData'
	},
	{ 
		name: 'enemies.json', 
		tsFile: path.join(srcDir, 'enemies.ts'),
		exportName: 'enemiesData'
	},
	{ 
		name: 'equipments.json', 
		tsFile: path.join(srcDir, 'equipments.ts'),
		exportName: 'equipmentsData'
	}
]

console.log('🔄 TypeScriptモジュールからJSONデータ同期を開始します...\n')

// public/data ディレクトリが存在しない場合は作成
if (!fs.existsSync(publicDir)) {
	fs.mkdirSync(publicDir, { recursive: true })
	console.log('📁 public/data ディレクトリを作成しました')
}

let syncCount = 0
let errorCount = 0

dataToSync.forEach(({ name, tsFile, exportName }) => {
	const destPath = path.join(publicDir, name)

	try {
		// TypeScriptファイルからデータを抽出
		const data = extractDataFromTSFile(tsFile, exportName)
		
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
