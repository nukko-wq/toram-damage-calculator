# MATK（魔法攻撃力）計算

## 概要

このドキュメントでは、トーラムオンラインにおけるMATK（魔法攻撃力）と槍MATK（旋風槍の一部スキル用）の計算式を詳細に説明します。

## 基本計算式

### MATK計算式
```
MATK = INT((自Lv+総武器MATK+ステータスMATK+MATKアップ(ｽﾃｰﾀｽ%)-MATKダウン(ｽﾃｰﾀｽ%))×(1+MATK%/100))+MATK固定値
```

### 槍MATK計算式（旋風槍の一部スキル専用）
```
槍MATK = INT((自Lv+総武器MATK+槍ステータスMATK+MATKアップ(ｽﾃｰﾀｽ%)-MATKダウン(ｽﾃｰﾀｽ%))×(1+MATK%/100))+MATK固定値
```

**槍MATKの特殊計算要素:**
- **総武器MATK**: 総武器ATK × 5/8
- **槍ステータスMATK**: 補正後INT × 4 + 補正後AGI × 1

## 詳細計算

### 総武器MATK

#### 通常MATK用
```
総武器MATK = INT(武器ATK×(1+(精錬値^2)/100)+精錬値)+INT(武器ATK×武器ATK%)+武器ATK固定値
```

**適用条件:**
- **杖・魔導具装備時**: 総武器MATKが適用される
- **手甲装備時**: 総武器ATK/2が総武器MATKとして適用される（この時点では小数点以下の切り捨ては行われず、MATK計算に使われる）
- **その他の武器**: 武器のATKが基礎MATKに適用されることはない

#### 槍MATK用
```
槍総武器MATK = INT(総武器ATK × 5/8)
```

**適用条件:**
- **旋風槍装備時の一部スキル**: 総武器ATKの5/8が総武器MATKとして使用される
- **総武器ATK**: [ATK計算式](./atk-calculation.md)で算出された値を使用

### ステータスMATK

#### 通常MATK用
武器種別によってステータスMATKの計算式が異なります：

- **片手剣**: 補正後INT × 3 + 補正後DEX × 1
- **両手剣**: 補正後INT × 3 + 補正後DEX × 1
- **弓**: 補正後INT × 3 + 補正後DEX × 1
- **自動弓**: 補正後INT × 3 + 補正後DEX × 1
- **杖**: 補正後INT × 4 + 補正後DEX × 1
- **魔道具**: 補正後INT × 4 + 補正後DEX × 1
- **手甲**: 補正後INT × 4 + 補正後DEX × 1
- **旋風槍**: 補正後INT × 2 + 補正後DEX × 1 + 補正後AGI × 1
- **抜刀剣**: 補正後INT × 1.5 + 補正後DEX × 1
- **素手**: 補正後INT × 3 + 補正後DEX × 1

#### 槍MATK用
旋風槍装備時の一部スキルで使用される特殊なステータスMATK：

- **槍ステータスMATK**: 補正後INT × 4 + 補正後AGI × 1

**重要**: 基礎ステータスではなく、**補正後ステータス**（装備・クリスタ・バフアイテム・料理補正を含む）を使用します。この時点では切り捨てが行われず、MATK計算に使われます（抜刀剣で小数点以下が発生した場合、MATK%計算時まで保持される）。

### MATKアップ(ｽﾃｰﾀｽ%)・MATKダウン(ｽﾃｰﾀｽ%)（ステータス連動攻撃力）
基礎ステータスのプロパティ数値%だけMATKが増加または減少します。小数点以下は切り捨てられます。

**プロパティ:**
- MATK_STR_Rate: MATK+(STR)%
- MATK_INT_Rate: MATK+(INT)%
- MATK_VIT_Rate: MATK+(VIT)%
- MATK_AGI_Rate: MATK+(AGI)%
- MATK_DEX_Rate: MATK+(DEX)%

**計算式:**
```
MATKアップ合計 = INT(基礎STR × MATK_STR_Rate/100) + INT(基礎INT × MATK_INT_Rate/100) + 
                INT(基礎VIT × MATK_VIT_Rate/100) + INT(基礎AGI × MATK_AGI_Rate/100) + 
                INT(基礎DEX × MATK_DEX_Rate/100)
```

### 構成要素
- **自Lv**: ステータスのレベル
- **総武器MATK**: 武器種別に応じた武器攻撃力（上記参照）
- **ステータスMATK**: 武器種別に応じたステータス攻撃力（**補正後ステータス**を使用、上記参照）
- **MATKアップ**: ステータス連動攻撃力の増加分（**基礎ステータス**を使用）
- **MATKダウン**: ステータス連動攻撃力の減少分（**基礎ステータス**を使用）
- **基本MATK**: `自Lv+総武器MATK+ステータスMATK+MATKアップ(ｽﾃｰﾀｽ%)-MATKダウン(ｽﾃｰﾀｽ%)`
- **MATK%**: 装備/プロパティ、クリスタ、バフアイテムのMATK%(MATK_Rate)の合計
- **MATK固定値**: 装備/プロパティ、クリスタ、料理、バフアイテムのMATK固定値(MATK)の合計

### 計算手順
1. **総武器MATK計算**: 武器種別に応じて計算
2. **ステータスMATK計算**: 武器種別×**補正後ステータス値**で計算
3. **MATKアップ・ダウン計算**: 各**基礎ステータス**連動分を合計
4. **基本MATK計算**: Lv + 総武器MATK + ステータスMATK + MATKアップ - MATKダウン
5. **MATK%適用**: INT(基本MATK × (1 + MATK%/100))
6. **MATK固定値加算**: %適用後 + MATK固定値

## 計算例

### 例1: 杖装備ケース
**入力値:**
- Lv: 150
- 武器ATK: 200, 精錬値: 10, 武器ATK%: 30%, 武器ATK固定値: 50
- 基礎INT: 300, 基礎DEX: 180
- 補正後INT: 350, 補正後DEX: 220（装備・クリスタ等補正適用後）
- MATKアップ(INT25%): 基礎INT300 → 75増加
- MATK%: 40%
- MATK固定値: 80

**計算手順:**
1. 総武器MATK = INT(200×(1+(10^2)/100)+10) + INT(200×30/100) + 50 = INT(200×2.0+10) + 60 + 50 = 410 + 60 + 50 = 520
2. ステータスMATK = 350×4 + 220×1 = 1400 + 220 = 1620（補正後ステータス使用）
3. MATKアップ = INT(300×25/100) = 75, MATKダウン = 0（基礎ステータス使用）
4. 基本MATK = 150 + 520 + 1620 + 75 - 0 = 2365
5. MATK%適用後 = INT(2365×(1+40/100)) = INT(2365×1.40) = INT(3311) = 3311
6. 最終MATK = 3311 + 80 = 3391

### 例2: 手甲装備ケース
**入力値:**
- Lv: 120
- 総武器ATK: 800（計算済み）
- 基礎INT: 250, 基礎DEX: 200
- 補正後INT: 290, 補正後DEX: 240（装備・クリスタ等補正適用後）
- MATKアップなし
- MATK%: 25%
- MATK固定値: 40

**計算手順:**
1. 総武器MATK = 800/2 = 400（小数点なし）
2. ステータスMATK = 290×4 + 240×1 = 1160 + 240 = 1400（補正後ステータス使用）
3. MATKアップ = 0, MATKダウン = 0
4. 基本MATK = 120 + 400 + 1400 + 0 - 0 = 1920
5. MATK%適用後 = INT(1920×(1+25/100)) = INT(1920×1.25) = INT(2400) = 2400
6. 最終MATK = 2400 + 40 = 2440

### 例3: 抜刀剣装備ケース（小数点発生）
**入力値:**
- Lv: 180
- 総武器MATK: 0（抜刀剣は武器MATKなし）
- 基礎INT: 333, 基礎DEX: 150
- 補正後INT: 380, 補正後DEX: 190（装備・クリスタ等補正適用後）
- MATKアップなし
- MATK%: 50%
- MATK固定値: 60

**計算手順:**
1. 総武器MATK = 0
2. ステータスMATK = 380×1.5 + 190×1 = 570 + 190 = 760（補正後ステータス使用、小数点なし）
3. MATKアップ = 0, MATKダウン = 0
4. 基本MATK = 180 + 0 + 760 + 0 - 0 = 940
5. MATK%適用後 = INT(940×(1+50/100)) = INT(940×1.50) = INT(1410) = 1410
6. 最終MATK = 1410 + 60 = 1470

## TypeScript実装例

```typescript
export interface MATKCalculationSteps {
	level: number
	weaponATK: number
	weaponMATK: number
	statusMATK: number
	matkUpTotal: number
	matkDownTotal: number
	baseMATK: number
	matkPercent: number
	matkAfterPercent: number
	matkFixed: number
	finalMATK: number
}

export const calculateMATK = (
	level: number,
	weaponType: WeaponType,
	weaponATK: number,
	refinementLevel: number,
	totalWeaponATK: number,
	baseStats: BaseStats,
	adjustedStats: AdjustedStats,
	bonuses: AllBonuses,
): MATKCalculationSteps => {
	// 総武器MATK計算
	let weaponMATK = 0
	if (weaponType === 'staff' || weaponType === 'magicDevice') {
		// 杖・魔導具: 総武器MATKを適用
		const weaponATKPercent = bonuses.WeaponATK_Rate || 0
		const weaponATKFixed = bonuses.WeaponATK || 0
		weaponMATK = Math.floor(weaponATK * (1 + (refinementLevel ** 2) / 100) + refinementLevel) +
		            Math.floor(weaponATK * weaponATKPercent / 100) + weaponATKFixed
	} else if (weaponType === 'knuckle') {
		// 手甲: 総武器ATK/2（小数点保持）
		weaponMATK = totalWeaponATK / 2
	}
	// その他の武器種は weaponMATK = 0

	// ステータスMATK計算（補正後ステータスを使用）
	const { INT, DEX, AGI } = adjustedStats
	let statusMATK = 0
	switch (weaponType) {
		case 'oneHandSword':
		case 'twoHandSword':
		case 'bow':
		case 'bowgun':
		case 'bareHand':
			statusMATK = INT * 3 + DEX * 1
			break
		case 'staff':
		case 'magicDevice':
		case 'knuckle':
			statusMATK = INT * 4 + DEX * 1
			break
		case 'halberd':
			statusMATK = INT * 2 + DEX * 1 + AGI * 1
			break
		case 'katana':
			statusMATK = INT * 1.5 + DEX * 1 // 小数点保持
			break
	}

	// MATKアップ・ダウン計算（基礎ステータスを使用）
	const matkUpSTR = Math.floor(baseStats.STR * (bonuses.MATK_STR_Rate || 0) / 100)
	const matkUpINT = Math.floor(baseStats.INT * (bonuses.MATK_INT_Rate || 0) / 100)
	const matkUpVIT = Math.floor(baseStats.VIT * (bonuses.MATK_VIT_Rate || 0) / 100)
	const matkUpAGI = Math.floor(baseStats.AGI * (bonuses.MATK_AGI_Rate || 0) / 100)
	const matkUpDEX = Math.floor(baseStats.DEX * (bonuses.MATK_DEX_Rate || 0) / 100)
	
	const matkUpTotal = matkUpSTR + matkUpINT + matkUpVIT + matkUpAGI + matkUpDEX
	const matkDownTotal = 0 // 必要に応じて実装

	// 基本MATK計算
	const baseMATK = level + weaponMATK + statusMATK + matkUpTotal - matkDownTotal

	// MATK%適用
	const matkPercent = bonuses.MATK_Rate || 0
	const matkAfterPercent = Math.floor(baseMATK * (1 + matkPercent / 100))

	// MATK固定値加算
	const matkFixed = bonuses.MATK || 0
	const finalMATK = matkAfterPercent + matkFixed

	return {
		level,
		weaponATK,
		weaponMATK,
		statusMATK,
		matkUpTotal,
		matkDownTotal,
		baseMATK,
		matkPercent,
		matkAfterPercent,
		matkFixed,
		finalMATK,
	}
}
```

## 重要な制限事項

1. **武器種別依存**: 総武器MATKとステータスMATKの計算式は武器種別により大きく異なる
2. **ステータス使用区分**: 
   - ステータスMATK計算: **補正後ステータス**を使用
   - MATKアップ・ダウン計算: **基礎ステータス**を使用
3. **小数点処理**: INT()関数による小数点以下切り捨て処理が重要
4. **手甲特殊計算**: 手甲装備時は総武器ATK/2をMATKとして使用
5. **抜刀剣小数点**: 抜刀剣のステータスMATK計算で小数点が発生する場合がある

## 関連ドキュメント
- [基本ステータス計算式](./basic-stats.md) - 基本ステータス計算の詳細
- [計算式概要](./overview.md)
- [装備品補正値計算](./equipment-bonuses.md)
- [クリスタ効果計算](./crystal-effects.md)
