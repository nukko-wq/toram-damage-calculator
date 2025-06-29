# ATK計算式設計書

## 概要
トーラムオンラインにおけるATK（攻撃力）の詳細計算式について記述する。ATK計算は武器種別によって異なる計算式を使用し、複数の段階を経て最終的なATK値を算出する。

## 基本ATK計算式

### 基礎ATK計算
```
基礎ATK = 自Lv + 総武器ATK + ステータスATK + ATKアップ(ステータス%) - ATKダウン(ステータス%)
```
**注意**: 
- 基礎ATKの計算では小数点処理（INT関数）は適用しない
- StatusPreviewでの表示時のみ小数点以下を切り捨て（Math.floor）
- ATK計算では基礎ATKの小数点込みの値を使用

### 最終ATK計算
```
ATK = INT(基礎ATK × (1 + ATK%/100)) + ATK固定値
```

**注意:** `INT(数値)`は小数点以下を元の数値より小さい整数に切り捨てる関数
- 例: INT(-2.7) = -3
- ※ステータスのINTと混同しないように注意

## 総武器ATK計算

### 基本計算式
```
総武器ATK = INT(武器のATK × (1 + (精錬値^2)/100) + 精錬値) + INT(武器のATK × 武器ATK%/100) + 武器ATK固定値
```

### 弓装備時の特殊計算（矢装備時）

#### 弓+矢の場合
**適用条件**: メイン武器が「弓」かつサブ武器が「矢」の場合
```
総武器ATK = INT(メイン武器のATK × (1 + (精錬値^2)/100) + 精錬値) + INT(メイン武器のATK × 武器ATK%/100) + 武器ATK固定値 + 矢のATK
```

#### 自動弓+矢の場合
**適用条件**: メイン武器が「自動弓」かつサブ武器が「矢」の場合
```
総武器ATK = INT(メイン武器のATK × (1 + (精錬値^2)/100) + 精錬値) + INT(メイン武器のATK × 武器ATK%/100) + 武器ATK固定値 + INT(矢のATK/2)
```

**注意事項:**
- 弓の場合：矢のATKがそのまま武器ATK固定値として加算される
- 自動弓の場合：矢のATKを半分にした値（INT適用）が武器ATK固定値として加算される
- 精錬補正や武器ATK%補正は矢のATKには適用されない

### 計算手順

#### 0. 弓＋矢の場合の特殊処理
**適用条件**: 
- メイン武器の種別が「弓」または「自動弓」
- サブ武器の種別が「矢」

**処理方法**:
- 精錬補正・武器ATK%補正はメイン武器のATKのみに適用
- **弓の場合**: 矢のATKがそのまま武器ATK固定値として最後に加算
- **自動弓の場合**: INT(矢のATK/2)が武器ATK固定値として最後に加算

#### 1. 精錬補正後武器ATK
```
精錬補正後武器ATK = INT(武器のATK × (1 + (精錬値^2)/100) + 精錬値)
```

**構成要素:**
- **武器のATK**: 装備している武器の基本ATK値（弓＋矢の場合はメイン武器のATKのみ）
- **精錬値**: 武器の精錬レベル（0-15）

**計算例（弓＋矢の場合）:**
- メイン武器（弓）のATK: 800
- 精錬値: 10
- 精錬補正後武器ATK = INT(800 × (1 + (10^2)/100) + 10)
- 精錬補正後武器ATK = INT(800 × (1 + 100/100) + 10)
- 精錬補正後武器ATK = INT(800 × 2.0 + 10)
- 精錬補正後武器ATK = INT(1600 + 10) = 1610

#### 2. 武器ATK%補正
```
武器ATK%補正 = INT(武器のATK × 武器ATK%/100)
```

**構成要素:**
- **武器ATK%**: 装備・クリスタ・料理・バフアイテムの武器ATK%の合計

**計算例（弓＋矢の場合）:**
- メイン武器（弓）のATK: 800
- 武器ATK%: 20% (装備+クリスタ+バフアイテム)
- 武器ATK%補正 = INT(800 × 20/100) = INT(160) = 160

#### 3. 総武器ATK算出

**弓＋矢の場合:**
```
総武器ATK = 精錬補正後武器ATK + 武器ATK%補正 + 武器ATK固定値 + 矢のATK
```

**自動弓＋矢の場合:**
```
総武器ATK = 精錬補正後武器ATK + 武器ATK%補正 + 武器ATK固定値 + INT(矢のATK/2)
```

**その他の場合:**
```
総武器ATK = 精錬補正後武器ATK + 武器ATK%補正 + 武器ATK固定値
```

**構成要素:**
- **武器ATK固定値**: 装備・クリスタ・料理・バフアイテムの武器ATK固定値の合計
- **矢のATK加算**: 
  - **弓の場合**: 矢のATKをそのまま加算
  - **自動弓の場合**: INT(矢のATK/2)を加算
  - **その他**: 加算なし

**計算例（弓＋矢の場合）:**
- 精錬補正後武器ATK: 1610
- 武器ATK%補正: 160  
- 武器ATK固定値: 80 (装備+クリスタ+バフアイテム)
- 矢のATK: 200
- 総武器ATK = 1610 + 160 + 80 + 200 = 2050

**計算例（自動弓＋矢の場合）:**
- 精錬補正後武器ATK: 1610
- 武器ATK%補正: 160  
- 武器ATK固定値: 80 (装備+クリスタ+バフアイテム)
- 矢のATK: 200
- INT(矢のATK/2): INT(200/2) = 100
- 総武器ATK = 1610 + 160 + 80 + 100 = 1950

## ステータスATK計算（武器種別）

### 旋風槍（Halberd）
```
ステータスATK = 補正後STR × 2.5 + 補正後AGI × 1.5
```

**注意事項:**
- **補正後ステータス**を使用（基礎ステータスではない）
- この段階では切り捨てが行われない
- ATK%計算時まで小数点以下を保持
- 手甲・槍・抜刀剣でも同様の小数点保持

**計算例:**
- 補正後STR: 200
- 補正後AGI: 150
- ステータスATK = 200 × 2.5 + 150 × 1.5 = 500 + 225 = 725

### 片手剣（One-Handed Sword）
```
ステータスATK = 補正後STR × 2.0 + 補正後DEX × 2.0
```

### 両手剣（Two-Handed Sword）
```
ステータスATK = 補正後STR × 3.0 + 補正後DEX × 1.0
```

### その他の武器種（将来実装予定）
```
// 弓系  
ステータスATK = 補正後DEX × 3.5 + 補正後STR × 1.0

// 杖系
ステータスATK = 補正後INT × 3.0 + 補正後DEX × 1.5

// 手甲系
ステータスATK = 補正後AGI × 2.5 + 補正後STR × 2.0

// 抜刀剣系
ステータスATK = 補正後STR × 2.5 + 補正後AGI × 2.0

// 他の武器種も同様の形式で定義
```

## ATKアップ・ATKダウン（ステータス%）

### 基本計算式
```
ATKアップ(ステータス%) = INT(基礎ステータス × ステータス%/100)
ATKダウン(ステータス%) = INT(基礎ステータス × ステータス%/100)
```

### 対象ステータス
- **ATKアップ(STR%)**: STRの指定%分だけATKが上昇
- **ATKアップ(AGI%)**: AGIの指定%分だけATKが上昇
- **ATKアップ(INT%)**: INTの指定%分だけATKが上昇
- **ATKアップ(VIT%)**: VITの指定%分だけATKが上昇
- **ATKアップ(DEX%)**: DEXの指定%分だけATKが上昇

### 計算例
**ATKアップ(AGI50%)**:
- 基礎AGI: 250
- ATKアップ(AGI50%) = INT(250 × 50/100) = INT(125) = 125

**ATKダウン(STR30%)**:
- 基礎STR: 200
- ATKダウン(STR30%) = INT(200 × 30/100) = INT(60) = 60

### データソース
- **装備・プロパティ**: ATK+(ステータス%)効果
- **クリスタル**: ATKアップ系クリスタ効果
- **バフアイテム**: ATKバフ効果
- **料理**: ATK系料理効果

## ATK%・ATK固定値補正

### ATK%補正
```
ATK%補正 = (1 + ATK%/100)
```

**構成要素:**
- **ATK%**: 装備・クリスタ・料理・バフアイテムのATK%の合計

### ATK固定値
```
ATK固定値 = 装備ATK固定値 + クリスタATK固定値 + 料理ATK固定値 + バフATK固定値
```

## 完全計算例

### 弓＋矢の場合

#### 入力値
- **キャラクター**: Lv 150
- **メイン武器（弓）**: ATK 800、精錬値 10
- **サブ武器（矢）**: ATK 200
- **基礎ステータス**: STR 180, DEX 220
- **武器ATK%**: 20%
- **武器ATK固定値**: 80
- **ATK%**: 25%
- **ATK固定値**: 150

#### 計算手順

##### 1. 総武器ATK計算（弓＋矢特殊計算）
```
精錬補正後武器ATK = INT(800 × (1 + (10^2)/100) + 10) = INT(1610) = 1610
武器ATK%補正 = INT(800 × 20/100) = 160
総武器ATK = 1610 + 160 + 80 + 200 = 2050
```
**注意**: 矢のATK（200）は武器ATK固定値として最後に加算

##### 3. ステータスATK計算（弓）
```
ステータスATK = 補正後STR × 1.0 + 補正後DEX × 3.0
ステータスATK = 180 × 1.0 + 220 × 3.0 = 180 + 660 = 840
```

##### 4. 基礎ATK計算
```
基礎ATK = 150 + 2050 + 840 = 3040
```

##### 5. 最終ATK計算
```
ATK = INT(3040 × (1 + 25/100)) + 150
ATK = INT(3040 × 1.25) + 150 = INT(3800) + 150 = 3950
```

### 旋風槍の場合

### 入力値
- **キャラクター**: Lv 150
- **武器**: ATK 1000、精錬値 15
- **基礎ステータス**: STR 200, AGI 150
- **武器ATK%**: 25%
- **武器ATK固定値**: 100
- **ATKアップ(AGI50%)**: 基礎AGI 250の50% = 125
- **ATK%**: 30%
- **ATK固定値**: 200

### 計算手順

#### 1. 総武器ATK計算
```
精錬補正後武器ATK = INT(1000 × (1 + (15^2)/100) + 15) = INT(3265) = 3265
武器ATK%補正 = INT(1000 × 25/100) = 250
総武器ATK = 3265 + 250 + 100 = 3615
```

#### 2. ステータスATK計算（旋風槍）
```
ステータスATK = 補正後STR × 2.5 + 補正後AGI × 1.5 = 200 × 2.5 + 150 × 1.5 = 500 + 225 = 725
```

#### 3. ATKアップ・ダウン計算
```
ATKアップ(AGI50%) = INT(250 × 50/100) = 125
ATKダウン = 0 (なし)
```

#### 4. 最終ATK計算
```
ATK計算前 = 150 + 3615 + 725 + 125 - 0 = 4615
ATK = INT(4615 × (1 + 30/100)) + 200
ATK = INT(4615 × 1.30) + 200
ATK = INT(5999.5) + 200
ATK = 5999 + 200 = 6199
```

## 武器種別対応表

| 武器種 | 英語キー | ステータスATK計算式 | 実装状況 |
|--------|----------|-------------------|----------|
| 旋風槍 | halberd | STR×2.5 + AGI×1.5 | ✅ 実装済み |
| 片手剣 | 1hsword | STR×2.0 + DEX×2.0 | ✅ 実装済み |
| 両手剣 | 2hsword | STR×3.0 + DEX×1.0 | ✅ 実装済み |
| 弓 | bow | STR×1.0 + DEX×3.0 | ✅ 実装済み |
| 自動弓 | bowgun | DEX×4.0 | ✅ 実装済み |
| 杖 | staff | STR×3.0 + INT×1.0 | ✅ 実装済み |
| 魔導具 | magic-device | AGI×2.0 + INT×2.0 | ✅ 実装済み |
| 手甲 | knuckle | DEX×0.5 + AGI×2.0 | ✅ 実装済み |
| 抜刀剣 | katana | STR×1.5 + DEX×2.5 | ✅ 実装済み |
| 双剣 | dual-sword | STR×1.0 + DEX×2.0 + AGI×1.0 | ✅ 実装済み |
| 素手 | barehand | STR×1.0 | ✅ 実装済み |

## TypeScript実装例

### インターフェース定義
```typescript
interface ATKCalculationSteps {
  // 総武器ATK関連
  baseWeaponATK: number           // 武器の基本ATK（弓＋矢の場合は加算後）
  arrowATK?: number               // 矢のATK（弓装備時のみ）
  isBowArrowCombo: boolean        // 弓＋矢の組み合わせかどうか
  refinementLevel: number         // 精錬値
  refinedWeaponATK: number        // 精錬補正後武器ATK
  weaponATKPercentBonus: number   // 武器ATK%補正
  weaponATKFixedBonus: number     // 武器ATK固定値
  totalWeaponATK: number          // 総武器ATK
  
  // ステータスATK関連
  baseSTR: number                 // 基礎STR
  baseAGI: number                 // 基礎AGI（槍の場合）
  statusATK: number               // ステータスATK
  
  // ATKアップ・ダウン関連
  atkUpSTR: number               // ATKアップ(STR%)
  atkUpAGI: number               // ATKアップ(AGI%)
  atkUpINT: number               // ATKアップ(INT%)
  atkUpVIT: number               // ATKアップ(VIT%)
  atkUpDEX: number               // ATKアップ(DEX%)
  atkDownTotal: number           // ATKダウン合計
  
  // 最終計算
  atkBeforePercent: number       // ATK%適用前
  atkPercent: number             // ATK%
  atkAfterPercent: number        // ATK%適用後
  atkFixed: number               // ATK固定値
  finalATK: number               // 最終ATK
}

interface WeaponType {
  id: string
  name: string
  statusATKFormula: (baseStats: BaseStats) => number
}

// 武器種別定義
const WEAPON_TYPES: Record<string, WeaponType> = {
  halberd: {
    id: 'halberd',
    name: '旋風槍',
    statusATKFormula: (stats) => stats.STR * 2.5 + stats.AGI * 1.5
  },
  oneHandedSword: {
    id: 'oneHandedSword', 
    name: '片手剣',
    statusATKFormula: (stats) => stats.STR * 2.0 + stats.DEX * 2.0
  },
  twoHandedSword: {
    id: 'twoHandedSword',
    name: '両手剣',
    statusATKFormula: (stats) => stats.STR * 3.0 + stats.DEX * 1.0
  },
  bow: {
    id: 'bow',
    name: '弓',
    statusATKFormula: (stats) => stats.DEX * 3.5 + stats.STR * 1.0
  },
  staff: {
    id: 'staff',
    name: '杖',
    statusATKFormula: (stats) => stats.INT * 3.0 + stats.DEX * 1.5
  },
  knuckle: {
    id: 'knuckle',
    name: '手甲',
    statusATKFormula: (stats) => stats.AGI * 2.5 + stats.STR * 2.0
  },
  katana: {
    id: 'katana',
    name: '抜刀剣',
    statusATKFormula: (stats) => stats.STR * 2.5 + stats.AGI * 2.0
  },
  // 他の武器種も同様に定義
}
```

### 計算関数実装
```typescript
/**
 * ATK計算（全武器種対応、弓＋矢の特殊計算を含む）
 * ATK = INT((自Lv + 総武器ATK + ステータスATK + ATKアップ - ATKダウン) × (1 + ATK%/100)) + ATK固定値
 */
export function calculateATK(
  stats: BaseStats,
  mainWeapon: WeaponData,
  subWeapon: WeaponData,
  adjustedStats: AdjustedStatsCalculation,
  bonuses: AllBonuses = {}
): ATKCalculationSteps {
  // 0. 弓＋矢の判定
  const isBowArrowCombo = (mainWeapon.weaponType === '弓' || mainWeapon.weaponType === '自動弓') 
                         && subWeapon.weaponType === '矢'

  // 1. 総武器ATK計算（メイン武器のATKのみに補正適用）
  const refinedWeaponATK = Math.floor(
    mainWeapon.ATK * (1 + Math.pow(mainWeapon.refinement, 2) / 100) + mainWeapon.refinement
  )
  
  const weaponATKPercent = bonuses.weaponATK_Rate || 0
  const weaponATKPercentBonus = Math.floor(mainWeapon.ATK * weaponATKPercent / 100)
  
  // 矢のATKは武器ATK固定値として加算
  const weaponATKFixedBonus = bonuses.weaponATK || 0
  const arrowATK = isBowArrowCombo ? subWeapon.ATK : 0
  const totalWeaponATK = refinedWeaponATK + weaponATKPercentBonus + weaponATKFixedBonus + arrowATK
  
  // 2. ステータスATK計算（旋風槍の場合、補正後ステータスを使用）
  const weaponType = WEAPON_TYPES[weapon.type] || WEAPON_TYPES.halberd
  const statusATK = weaponType.statusATKFormula(adjustedStats)
  
  // 3. ATKアップ・ダウン計算
  const atkUpSTR = Math.floor(stats.STR * (bonuses.ATK_STR_Rate || 0) / 100)
  const atkUpAGI = Math.floor(stats.AGI * (bonuses.ATK_AGI_Rate || 0) / 100)
  const atkUpINT = Math.floor(stats.INT * (bonuses.ATK_INT_Rate || 0) / 100)
  const atkUpVIT = Math.floor(stats.VIT * (bonuses.ATK_VIT_Rate || 0) / 100)
  const atkUpDEX = Math.floor(stats.DEX * (bonuses.ATK_DEX_Rate || 0) / 100)
  const atkUpTotal = atkUpSTR + atkUpAGI + atkUpINT + atkUpVIT + atkUpDEX
  
  // ATKダウンは現在なしと仮定
  const atkDownTotal = 0
  
  // 4. 最終ATK計算
  const atkBeforePercent = stats.level + totalWeaponATK + statusATK + atkUpTotal - atkDownTotal
  const atkPercent = bonuses.ATK_Rate || 0
  const atkAfterPercent = Math.floor(atkBeforePercent * (1 + atkPercent / 100))
  const atkFixed = bonuses.ATK || 0
  const finalATK = atkAfterPercent + atkFixed
  
  return {
    baseWeaponATK: weapon.ATK,
    refinementLevel: weapon.refinement,
    refinedWeaponATK,
    weaponATKPercentBonus,
    weaponATKFixedBonus,
    totalWeaponATK,
    baseSTR: stats.STR,
    baseAGI: stats.AGI,
    statusATK,
    atkUpSTR,
    atkUpAGI,
    atkUpINT,
    atkUpVIT,
    atkUpDEX,
    atkDownTotal,
    atkBeforePercent,
    atkPercent,
    atkAfterPercent,
    atkFixed,
    finalATK
  }
}
```

## 検証データ

### ATK計算検証例（旋風槍）
| Lv | 武器ATK | 精錬 | STR | AGI | 武器ATK% | ATK% | 期待ATK | 実測ATK | 状態 |
|----|---------|------|-----|-----|----------|------|---------|---------|------|
| 150 | 1000 | 15 | 200 | 150 | 25% | 30% | 6199 | - | 🔄 |
| 100 | 800 | 10 | 180 | 120 | 20% | 25% | 4284 | - | 🔄 |
| 200 | 1200 | 15 | 250 | 200 | 30% | 35% | 8901 | - | 🔄 |

**計算詳細例（Lv:150, 武器ATK:1000, 精錬:15, STR:200, AGI:150）:**
1. 総武器ATK = 3615
2. ステータスATK = 725
3. ATKアップ = 125 (AGI50%の場合)
4. ATK計算前 = 4615
5. 最終ATK = 6199

**凡例:**
- ✅: 検証済み（正確）
- 🔄: 検証待ち
- ❌: 要修正

## 実装における注意点

### 端数処理
- **精錬補正**: INT()による切り捨て
- **武器ATK%補正**: INT()による切り捨て  
- **ATKアップ・ダウン**: INT()による切り捨て
- **最終ATK**: INT()による切り捨て

### ステータスATK保持
- 武器種別によってステータスATK計算式が異なる
- 計算途中の小数点以下は最終計算まで保持
- 手甲・旋風槍・抜刀剣も同様の処理

### 武器種別拡張性
- 新しい武器種の追加が容易な設計
- ステータスATK計算式のカスタマイズ対応
- 将来的な計算式変更への対応

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2025-06-28 | 双剣サブATK安定率計算を修正 | ステータス安定率係数を修正（STR×0.06+AGI×0.04） |
| 2025-06-28 | 双剣サブATK安定率計算を修正 | サブ安定率の計算式を追加、正しい2段階計算に修正 |
| 2025-06-29 | 弓＋矢の特殊ATK計算を追加 | 弓・自動弓装備時の矢ATK加算計算、TypeScript実装例、計算例を追加 |
| 2025-06-29 | 弓＋矢のATK計算仕様を修正 | 矢のATKを武器ATK固定値として加算する正しい計算式に修正 |
| 2025-06-28 | 双剣サブATK計算式を修正 | 安定率による計算方式に変更、サブ基礎ATK定義も修正 |
| 2025-06-28 | ステータスATK計算を補正後ステータス使用に修正 | 基礎ステータスから補正後ステータスに変更、全武器種対応 |
| 2024-06-24 | ATK計算式設計書を新規作成 | 旋風槍のATK計算式を実装 |
| 2024-06-24 | 武器種別を整理・更新 | 片手剣・両手剣を追加、剣・槍・忍刀を削除 |
| 2024-06-24 | 武器種別マッピング機能を実装 | 日本語武器種と英語キーの対応付けでATK計算を修正 |
| 2024-06-24 | 基礎ATK計算式を修正 | 基礎ATK = Lv+総武器ATK+ステータスATK+ATKアップ-ATKダウン |
| 2024-06-24 | 武器種別計算式を修正 | 弓、自動弓、杖、魔導具、手甲、抜刀剣、素手の計算式を更新 |
| 2024-06-24 | 双剣の計算式を修正 | STR×1.0 + DEX×2.0 + AGI×1.0 に変更 |
| 2024-06-24 | サブATK計算仕様を追加 | 双剣専用のサブATK・サブ基礎ATK計算設計書を追加 |

## サブATK計算（双剣専用）

### 概要
双剣武器種を選択している場合のみ、サブATKとサブ基礎ATKの計算を行う。

### サブ基礎ATK計算式
```
サブ基礎ATK = INT((自Lv + 総サブ武器ATK + ステータスサブATK) × (1 + ATK%/100)) + ATK固定値
```

### サブ安定率計算式
```
サブ安定率 = INT(サブ武器の安定率とサブ武器のステータス安定率をもとに計算) + 安定率%
```

#### サブ武器の安定率とサブ武器のステータス安定率をもとに計算
```
サブ武器の安定率とサブ武器のステータス安定率をもとに計算 = MAX(0, MIN(100, サブ武器の安定率/2 + 双剣のサブ武器のステータス安定率 + 安定率%))
```

#### 双剣のサブ武器のステータス安定率
```
双剣のサブ武器のステータス安定率 = STR × 0.06 + AGI × 0.04
```

### サブATK計算式
```
サブATK = INT(サブ基礎ATK × サブ安定率/100)
```

**構成要素:**
- **サブ武器の安定率**: サブ武器フォームで設定された安定率値（0-100の数値）
- **双剣のサブ武器のステータス安定率**: STR × 0.06 + AGI × 0.04（基礎ステータスを使用）
- **安定率%**: 装備/プロパティ、クリスタ、バフアイテムのStability_Rate補正の合計

**注意**: 
- サブATK計算にはATKアップ(ステータス%)・ATKダウン(ステータス%)は含まれない
- サブ基礎ATKにATK%とATK固定値を適用してから、サブ安定率による計算を行う
- ステータス安定率は基礎ステータス（補正前）を使用
- 安定率の合計は0-100の範囲に制限される

### サブステータスATK計算式（双剣専用）
```
サブステータスATK = STR × 1.0 + AGI × 3.0
```

### 総サブ武器ATK計算
サブ武器の情報を使用して総武器ATKを計算：

```
総サブ武器ATK = INT(サブ武器ATK × (1 + (サブ精錬値^2)/200) + サブ精錬値) + INT(サブ武器ATK × 武器ATK%) + 武器ATK固定値
```

**構成要素:**
- **サブ武器ATK**: サブ武器フォームで設定された武器ATK
- **サブ精錬値**: サブ武器フォームで設定された精錬値
- **武器ATK%**: メイン武器と同じ武器ATK%補正を使用
- **武器ATK固定値**: メイン武器と同じ武器ATK固定値を使用

### 適用条件
- **武器種**: メイン武器の武器種が「双剣」の場合のみ計算
- **表示**: StatusPreviewの「サブATK」「サブ基礎ATK」項目に表示
- **非双剣時**: サブ武器のATKをそのまま表示（現在の実装）

### 計算手順

#### 1. 武器種チェック
```typescript
if (mainWeapon.weaponType === '双剣') {
  // サブATK計算を実行
} else {
  // サブ武器ATKをそのまま使用
}
```

#### 2. サブ総武器ATK計算（精錬補正は /200）
```typescript
const subRefinedWeaponATK = Math.floor(
  subWeapon.ATK * (1 + subWeapon.refinement ** 2 / 200) + subWeapon.refinement
)
const subWeaponATKPercentBonus = Math.floor(subWeapon.ATK * (bonuses.weaponATK_Rate || 0))
const subWeaponATKFixedBonus = bonuses.weaponATK || 0
const subTotalWeaponATK = subRefinedWeaponATK + subWeaponATKPercentBonus + subWeaponATKFixedBonus
```

#### 3. サブステータスATK計算
```typescript
const subStatusATK = adjustedStats.STR * 1.0 + adjustedStats.AGI * 3.0
```

#### 4. サブ基礎ATK計算（ATKアップ・ATKダウンは含まない）
```typescript
const subBaseATKBeforePercent = stats.level + subTotalWeaponATK + subStatusATK
const subATKAfterPercent = Math.floor(subBaseATKBeforePercent * (1 + atkPercent / 100))
const subBaseATK = subATKAfterPercent + atkFixed
```

#### 5. 双剣のサブ武器ステータス安定率計算
```typescript
const subWeaponStatusStability = baseStats.STR * 0.06 + baseStats.AGI * 0.04
```

#### 6. サブ武器の安定率とステータス安定率をもとに計算
```typescript
const stabilityPercent = bonuses.Stability_Rate || 0
const stabilityBase = Math.max(0, Math.min(100, subWeapon.stability / 2 + subWeaponStatusStability + stabilityPercent))
```

#### 7. サブ安定率計算
```typescript
const subStability = Math.floor(stabilityBase) + stabilityPercent
```

#### 8. サブATK計算（サブ安定率適用）
```typescript
const subFinalATK = Math.floor(subBaseATK * subStability / 100)
```

### TypeScript実装例

```typescript
interface SubATKCalculationSteps {
  // サブ総武器ATK関連
  subBaseWeaponATK: number          // サブ武器の基本ATK
  subRefinementLevel: number        // サブ精錬値
  subRefinedWeaponATK: number       // サブ精錬補正後武器ATK
  subWeaponATKPercentBonus: number  // サブ武器ATK%補正
  subWeaponATKFixedBonus: number    // サブ武器ATK固定値
  subTotalWeaponATK: number         // サブ総武器ATK

  // サブステータスATK関連
  subStatusATK: number              // サブステータスATK（STR×1 + AGI×3）

  // サブ基礎ATK計算
  subBaseATKBeforePercent: number   // サブATK%適用前
  subATKAfterPercent: number        // サブATK%適用後
  subBaseATK: number                // サブ基礎ATK（ATK固定値適用後）

  // サブATK最終計算（安定率適用）
  subWeaponStability: number        // サブ武器の安定率
  subWeaponStatusStability: number  // 双剣のサブ武器ステータス安定率
  stabilityPercent: number          // 安定率%補正
  stabilityBase: number             // 安定率とステータス安定率をもとに計算
  subStability: number              // サブ安定率（計算後）
  subFinalATK: number               // サブ最終ATK
}

function calculateSubATK(
  stats: BaseStats,
  mainWeapon: MainWeapon,
  subWeapon: SubWeapon,
  adjustedStats: AdjustedStatsCalculation,
  bonuses: AllBonuses = {}
): SubATKCalculationSteps | null {
  // 双剣以外は計算しない
  if (mainWeapon.weaponType !== '双剣') {
    return null
  }

  // サブ総武器ATK計算（精錬補正は /200）
  const subRefinedWeaponATK = Math.floor(
    subWeapon.ATK * (1 + subWeapon.refinement ** 2 / 200) + subWeapon.refinement
  )
  const subWeaponATKPercentBonus = Math.floor(subWeapon.ATK * (bonuses.weaponATK_Rate || 0))
  const subWeaponATKFixedBonus = bonuses.weaponATK || 0
  const subTotalWeaponATK = subRefinedWeaponATK + subWeaponATKPercentBonus + subWeaponATKFixedBonus

  // サブステータスATK計算（双剣専用計算式、補正後ステータスを使用）
  const subStatusATK = adjustedStats.STR * 1.0 + adjustedStats.AGI * 3.0

  // サブ基礎ATK計算（ATKアップ・ATKダウンは含まない）
  const subBaseATKBeforePercent = stats.level + subTotalWeaponATK + subStatusATK

  // サブATK%適用（メイン武器と同じATK%を使用）
  const atkPercent = bonuses.ATK_Rate || 0
  const subATKAfterPercent = Math.floor(subBaseATKBeforePercent * (1 + atkPercent / 100))
  
  // サブATK固定値適用（メイン武器と同じATK固定値を使用）
  const atkFixed = bonuses.ATK || 0
  const subBaseATK = subATKAfterPercent + atkFixed

  // 双剣のサブ武器ステータス安定率計算
  const subWeaponStatusStability = stats.STR * 0.06 + stats.AGI * 0.04

  // サブ武器の安定率とサブ武器のステータス安定率をもとに計算
  const stabilityPercent = bonuses.Stability_Rate || 0
  const stabilityBase = Math.max(0, Math.min(100, subWeapon.stability / 2 + subWeaponStatusStability + stabilityPercent))

  // サブ安定率計算
  const subStability = Math.floor(stabilityBase) + stabilityPercent

  // サブATK計算（サブ安定率適用）
  const subFinalATK = Math.floor(subBaseATK * subStability / 100)

  return {
    subBaseWeaponATK: subWeapon.ATK,
    subRefinementLevel: subWeapon.refinement,
    subRefinedWeaponATK,
    subWeaponATKPercentBonus,
    subWeaponATKFixedBonus,
    subTotalWeaponATK,
    subStatusATK,
    subBaseATKBeforePercent,
    subATKAfterPercent,
    subBaseATK,
    subWeaponStability: subWeapon.stability,
    subWeaponStatusStability,
    stabilityPercent,
    stabilityBase,
    subStability,
    subFinalATK,
  }
}
```

### StatusPreview表示仕様

#### 双剣選択時
- **サブATK**: `subFinalATK` の値を表示
- **サブ基礎ATK**: `Math.floor(subBaseATK)` の値を表示（表示時のみ小数点以下切り捨て）

#### 非双剣選択時
- **サブATK**: `subWeapon.ATK` の値を表示（現在の実装）
- **サブ基礎ATK**: 0 を表示（TODO表示）

### 計算例

**入力値:**
- メイン武器種: 双剣
- Lv: 150
- 補正後STR: 200
- 補正後AGI: 180
- サブ武器ATK: 100
- サブ武器安定率: 80%
- サブ精錬値: 10
- 武器ATK%: 15%
- 武器ATK固定値: 50
- ATK%: 20%
- ATK固定値: 100
- 安定率%: 10%

**計算手順:**
1. サブ精錬補正後武器ATK = INT(100 × (1 + 10²/200) + 10) = INT(100 × 1.5 + 10) = 160
2. サブ武器ATK%補正 = INT(100 × 15/100) = 15
3. サブ総武器ATK = 160 + 15 + 50 = 225
4. サブステータスATK = 200 × 1.0 + 180 × 3.0 = 740
5. サブATK%適用前 = 150 + 225 + 740 = 1115
6. サブATK%適用後 = INT(1115 × 1.20) = 1338
7. サブ基礎ATK = 1338 + 100 = 1438
8. 双剣のサブ武器のステータス安定率 = 200 × 0.06 + 180 × 0.04 = 12 + 7.2 = 19.2
9. サブ武器の安定率とサブ武器のステータス安定率をもとに計算 = MAX(0, MIN(100, 80/2 + 19.2 + 10)) = MAX(0, MIN(100, 40 + 19.2 + 10)) = MAX(0, MIN(100, 69.2)) = 69.2
10. サブ安定率 = INT(69.2) + 10 = 69 + 10 = 79
11. サブATK = INT(1438 × 79/100) = INT(1136.02) = 1136

**表示結果:**
- サブATK: 1136
- サブ基礎ATK: 1438

## 関連ドキュメント
- [基本ステータス計算式](./basic-stats.md) - 補正後ステータス計算
- [武器システム設計](../technical/weapon-system.md) - 武器データ構造
- [StatusPreview機能要件](../requirements/10_status-preview-requirements.md) - ATK表示要件