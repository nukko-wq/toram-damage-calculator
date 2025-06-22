#!/usr/bin/env node

/**
 * データファイル整合性チェックスクリプト
 * src/data/ と public/data/ の対応ファイルが同一かどうかをチェックします
 *
 * チェック対象ファイル:
 * - crystals.json
 * - enemies.json
 * - equipments.json
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// ファイルパス設定
const srcDir = path.join(__dirname, '../src/data')
const publicDir = path.join(__dirname, '../public/data')

// チェック対象ファイル
const filesToCheck = ['crystals.json', 'enemies.json', 'equipments.json']

console.log('🔍 データファイル整合性チェックを開始します...\n')

/**
 * ファイルのMD5ハッシュを計算
 */
function getFileHash(filePath) {
	if (!fs.existsSync(filePath)) {
		return null
	}
	const content = fs.readFileSync(filePath)
	return crypto.createHash('md5').update(content).digest('hex')
}

/**
 * ファイルサイズを取得
 */
function getFileSize(filePath) {
	if (!fs.existsSync(filePath)) {
		return null
	}
	return fs.statSync(filePath).size
}

/**
 * ファイルの最終更新日時を取得
 */
function getFileModTime(filePath) {
	if (!fs.existsSync(filePath)) {
		return null
	}
	return fs.statSync(filePath).mtime.toISOString()
}

let identicalCount = 0
let differentCount = 0
let missingCount = 0

filesToCheck.forEach((filename) => {
	const srcPath = path.join(srcDir, filename)
	const destPath = path.join(publicDir, filename)

	console.log(`📄 ${filename}:`)

	// ファイル存在チェック
	const srcExists = fs.existsSync(srcPath)
	const destExists = fs.existsSync(destPath)

	if (!srcExists && !destExists) {
		console.log('   ❌ 両方のファイルが存在しません')
		missingCount++
		return
	}

	if (!srcExists) {
		console.log(`   ❌ src/data/${filename} が存在しません`)
		missingCount++
		return
	}

	if (!destExists) {
		console.log(`   ❌ public/data/${filename} が存在しません`)
		missingCount++
		return
	}

	// ファイル情報取得
	const srcHash = getFileHash(srcPath)
	const destHash = getFileHash(destPath)
	const srcSize = getFileSize(srcPath)
	const destSize = getFileSize(destPath)
	const srcModTime = getFileModTime(srcPath)
	const destModTime = getFileModTime(destPath)

	// 比較結果
	if (srcHash === destHash) {
		console.log('   ✅ ファイルは同一です')
		console.log(`      サイズ: ${srcSize} bytes`)
		console.log(`      ハッシュ: ${srcHash}`)
		identicalCount++
	} else {
		console.log('   ⚠️  ファイルが異なります')
		console.log(
			`      src/data/  - サイズ: ${srcSize} bytes, 更新: ${srcModTime}`,
		)
		console.log(
			`      public/data/ - サイズ: ${destSize} bytes, 更新: ${destModTime}`,
		)
		console.log(`      src ハッシュ:    ${srcHash}`)
		console.log(`      public ハッシュ: ${destHash}`)
		differentCount++
	}

	console.log('')
})

console.log('📊 チェック結果:')
console.log(`   同一: ${identicalCount}ファイル`)
console.log(`   異なる: ${differentCount}ファイル`)
console.log(`   見つからない: ${missingCount}ファイル`)

if (differentCount > 0 || missingCount > 0) {
	console.log('\n⚠️  ファイルの不整合が検出されました')
	console.log('💡 同期するには: npm run sync-data')
	process.exit(1)
} else {
	console.log('\n🎉 すべてのデータファイルが同期されています!')
	process.exit(0)
}
