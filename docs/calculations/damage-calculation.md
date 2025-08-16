# ダメージ計算式設計書

## 概要

トーラムオンラインの正確なダメージ計算式を実装するための設計書。複雑な多段階計算と各種補正、および安定率によるダメージ幅を正確に再現します。

## 基本ダメージ計算式

### 完全計算式
```
基本ダメージ = INT(INT(INT(INT(INT(INT(INT(INT((INT((自Lv+参照ステータス-敵Lv)×(1-物魔耐性/100)×(1-武器耐性/100)-計算後敵(M)DEF)+抜刀固定値+スキル固定値)×(1+有利/100))×スキル倍率/100)×(1+抜刀%/100))×慣れ/100)×(1+距離/100))×コンボ/100)×(1+パッシブ倍率/100))×(1+ブレイブ倍率/100))

最終ダメージ = 基本ダメージ × 安定率ランダム係数
```


### クリティカルダメージ計算式
クリティカルダメージ時は固定値加算直後（ステップ2の後）でクリティカルダメージ倍率を適用します。

```
クリティカルダメージ = INT(INT(INT(INT(INT(INT(INT(INT((INT((INT((自Lv+参照ステータス-敵Lv)×(1-物魔耐性/100)×(1-武器耐性/100)-計算後敵(M)DEF)+抜刀固定値+スキル固定値)×クリティカルダメージ%)×(1+有利/100))×スキル倍率/100)×(1+抜刀%/100))×慣れ/100)×(1+距離/100))×コンボ/100)×(1+パッシブ倍率/100))×(1+ブレイブ倍率/100))

最終クリティカルダメージ = クリティカルダメージ × 安定率ランダム係数
```

### Grazeダメージ計算式
**注意**: 現在の実装では、Grazeダメージは暫定的に `基本ダメージ × 0.1` として計算されています。

```
現在の実装:
Grazeダメージ = 基本ダメージ × 0.1

実装予定の正式な計算式:
Grazeダメージ = Criticalダメージと同じ計算過程
最終Grazeダメージ = Grazeダメージ × Graze用安定率ランダム係数
```

**Graze安定率の計算（実装予定）**:
- 基本安定率を半減（小数点以下切り捨て）して最小値とする
- 最大値は100%のまま
- 例: 基本安定率100% → Graze最小50% ～ 最大100%
- 例: 基本安定率90% → Graze最小45% ～ 最大100%

### ダメージ判定の実装状況

#### 現在実装済みの判定タイプ
1. **white（白ダメ）**: 基本ダメージに安定率を適用
2. **critical（クリティカル）**: 固定値加算後にクリティカルダメージ倍率を適用、その後通常の計算過程
3. **graze（グレイズ）**: 現在は暫定的に基本ダメージ×0.1として実装（本来の仕様とは異なる）
4. **expected（期待値）**: 平均ダメージを固定値として表示

#### 計算過程の共通性
- **基本ダメージ（白ダメ）**: 全10ステップの通常計算過程
- **クリティカルダメージ**: ステップ2後にクリティカル倍率適用、その後ステップ3～10を継続
- **Grazeダメージ（実装予定）**: クリティカルダメージと同じ計算過程、安定率のみ半減
- 全ステップで各段階ごとに小数点以下を切り捨て（INT適用）

**クリティカルダメージ%の参照**:
- 基本ステータスのクリティカルダメージ値を使用
- 例: クリティカルダメージ125%の場合、1.25倍として計算
- **データソース**: `calculationResults.basicStats.criticalDamage`

### 安定率システム
安定率は基本ステータスで決定され、実際のダメージに幅を与えます。

#### 安定率の仕組み
- **安定率**: 基本ステータスの安定率(%)（例: 70%）
- **ダメージ範囲**: 安定率% ～ 100% の範囲でダメージが変動
- **計算式**: `実際のダメージ = 基本ダメージ × (安定率 + ランダム値) / 100`
- **ランダム値**: 0 ～ (100 - 安定率) の範囲

#### 安定率の計算例
```
基本ダメージ: 10,000
安定率: 70%

最小ダメージ = 10,000 × 70% = 7,000
最大ダメージ = 10,000 × 100% = 10,000
ダメージ範囲: 7,000 ～ 10,000

ランダム係数 = (70 + ランダム(0-30)) / 100
```

#### Graze安定率の計算例

**現在の実装**:
```
基本ダメージ: 30,000
Grazeダメージ = 30,000 × 0.1 = 3,000（固定）
```

**実装予定の正式な計算**:
```
クリティカルダメージ: 30,000
基本安定率: 70%

Graze最小安定率 = Math.floor(70% / 2) = Math.floor(35) = 35%
Graze最小ダメージ = 30,000 × 35% = 10,500
Graze最大ダメージ = 30,000 × 100% = 30,000
Grazeダメージ範囲: 10,500 ～ 30,000

Grazeランダム係数 = (35 + ランダム(0-65)) / 100
```

**データソース**: `calculationResults.basicStats.stabilityRate`

### 実装における安定率の適用方法

#### damageCalculationService.ts の実装
現在の`damageCalculationService.ts`では、ダメージ判定タイプに応じて以下のように処理されています：

1. **white（白ダメ）**: 
   - 最小ダメージ = `Math.floor(baseDamage * stabilityRate / 100)`
   - 最大ダメージ = `baseDamage`
   - 平均ダメージ = `Math.floor((minDamage + maxDamage) / 2)`

2. **critical（クリティカル）**:
   - 基本ダメージが既にクリティカル倍率適用済み
   - 安定率の適用方法は白ダメと同じ

3. **graze（グレイズ）**:
   - 現在: `Math.floor(baseDamage * 0.1)` でグレイズベースダメージを計算
   - 安定率適用: グレイズベースダメージに対して通常の安定率を適用
   - **実装予定**: 安定率を半減してから適用する仕様

4. **expected（期待値）**:
   - 平均ダメージ = `Math.floor(baseDamage * averageStabilityRate / 100)`
   - 最小・最大・平均すべて同じ値として表示

#### 安定率別ダメージ例

**白ダメ・クリティカルダメージ**:
| 安定率 | 基本ダメージ | 最小ダメージ | 最大ダメージ | 平均ダメージ |
|--------|-------------|-------------|-------------|-------------|
| 50%    | 10,000      | 5,000       | 10,000      | 7,500       |
| 70%    | 10,000      | 7,000       | 10,000      | 8,500       |
| 85%    | 10,000      | 8,500       | 10,000      | 9,250       |
| 95%    | 10,000      | 9,500       | 10,000      | 9,750       |
| 100%   | 10,000      | 10,000      | 10,000      | 10,000      |

**Grazeダメージ（現在の実装）**:
| 安定率 | 基本ダメージ | Graze基準値 | Graze最小 | Graze最大 | Graze平均 |
|--------|-------------|-------------|-----------|-----------|-----------|
| 50%    | 10,000      | 1,000       | 500       | 1,000     | 750       |
| 70%    | 10,000      | 1,000       | 700       | 1,000     | 850       |
| 85%    | 10,000      | 1,000       | 850       | 1,000     | 925       |
| 95%    | 10,000      | 1,000       | 950       | 1,000     | 975       |
| 100%   | 10,000      | 1,000       | 1,000     | 1,000     | 1,000     |

**Grazeダメージ（実装予定の正式仕様）**:
| 安定率 | クリティカル | Graze最小安定率 | Graze最小 | Graze最大 | Graze平均 |
|--------|-------------|---------------|-----------|-----------|-----------|
| 50%    | 15,000      | 25%           | 3,750     | 15,000    | 9,375     |
| 70%    | 15,000      | 35%           | 5,250     | 15,000    | 10,125    |
| 85%    | 15,000      | 42%           | 6,300     | 15,000    | 10,650    |
| 95%    | 15,000      | 47%           | 7,050     | 15,000    | 11,025    |
| 100%   | 15,000      | 50%           | 7,500     | 15,000    | 11,250    |

### 計算ステップ分解

#### ステップ1: 基礎ダメージ計算
```
基礎ダメージ = INT((自Lv + 参照ステータス - 敵Lv) × (1 - 物魔耐性/100) × (1 - 武器耐性/100) - 計算後敵(M)DEF)
```

**重要な小数点処理**:
1. **耐性計算**: 小数点処理をせずにそのまま保持
   - 例: `10294 × 0.95 = 9779.3` （小数点保持）
2. **貫通計算**: 小数点処理をせずにそのまま保持
   - 例: `143 × 0.85 = 121.55` （小数点保持）
3. **防御力減算後**: 最終的にINT()で小数点以下切り捨て
   - 例: `INT(9779.3 - 121.55) = INT(9657.75) = 9657`

**計算例（白ダメージ）**:
```
入力: 自Lv=305, 参照ステータス=10132, 敵Lv=143, 物理耐性=5%, 敵DEF=143, 物理貫通=15%

ステップ1-1: 基本値計算
305 + 10132 - 143 = 10294

ステップ1-2: 耐性適用（小数点保持）
10294 × (1 - 5/100) = 10294 × 0.95 = 9779.3

ステップ1-3: 貫通計算（小数点保持）
143 × (1 - 15/100) = 143 × 0.85 = 121.55

ステップ1-4: 防御力減算＋小数点切り捨て
INT(9779.3 - 121.55) = INT(9657.75) = 9657
```

#### ステップ2: 固定値加算
```
固定値適用後 = INT(基礎ダメージ + 抜刀固定値 + スキル固定値)
```

#### ステップ3: 属性有利補正
```
有利適用後 = INT(固定値適用後 × (1 + 有利/100))
```

#### ステップ4: スキル倍率補正
```
スキル倍率適用後 = INT(有利適用後 × INT(スキル倍率)/100)
```

**重要**: スキル倍率は小数点以下を切り捨ててから使用します。

例：
- スキル倍率334.4% → INT(334.4) = 334% として計算
- スキル倍率120.9% → INT(120.9) = 120% として計算

#### ステップ2a: クリティカルダメージ補正（クリティカル・Graze時のみ）
クリティカルダメージ時およびGraze時は、固定値加算の後にクリティカルダメージ倍率を適用します。

```
クリティカル適用後 = INT(固定値適用後 × クリティカルダメージ%)
```

**計算の特徴**:
- 固定値加算の直後にクリティカルダメージ倍率を適用して小数点切り捨て
- その後は通常と同じ順序で属性有利、スキル倍率を適用
- 基本ステータスのクリティカルダメージ値（例: 125%）を使用
- calculationResults.basicStats.criticalDamageから取得
- **重要**: GrazeダメージもCriticalと同じ計算過程を経て、最終的に安定率のみ変更

**例**:
- 固定値適用後: 10302、クリティカルダメージ: 336%
- ステップ2a: INT(10302 × 336/100) = INT(34614.72) = 34614

#### ステップ5: 抜刀%補正
```
抜刀%適用後 = INT(クリティカル適用後 × (1 + 抜刀%/100))
```

**注意**: クリティカル・Graze時は「クリティカル適用後」の値を、通常時は「スキル倍率適用後」の値を使用します。

#### ステップ6: 慣れ補正
```
慣れ適用後 = INT(抜刀%適用後 × 慣れ/100)
```

#### ステップ7: 距離補正
```
距離適用後 = INT(慣れ適用後 × (1 + 距離/100))
```

#### ステップ8: コンボ補正
```
コンボ適用後 = INT(距離適用後 × コンボ/100)
```

#### ステップ9: パッシブ倍率補正
```
パッシブ適用後 = INT(コンボ適用後 × (1 + パッシブ倍率/100))
```

#### ステップ10: ブレイブ倍率補正（最終）
```
最終ダメージ = INT(パッシブ適用後 × (1 + ブレイブ倍率/100))
```

## 構成要素詳細

### 基本パラメータ

#### 自Lv
- **説明**: 基本ステータスのレベル
- **データソース**: `data.baseStats.level`
- **値の範囲**: 1-400

#### 参照ステータス
- **説明**: 攻撃スキルによって決まる参照ステータス
- **種類**:
  - **物理スキル**: 基本ステータスの総ATK
  - **魔法スキル**: 基本ステータスのMATK
  - **その他**: スキル固有の参照ステータス
- **データソース**: `calculationResults.basicStats.totalATK` または `calculationResults.basicStats.MATK`

#### 敵Lv
- **説明**: 敵情報にセットされている敵レベル
- **データソース**: `data.enemy.level`
- **値の範囲**: 1-999

### 耐性システム

#### 物魔耐性
- **物理耐性**: 基本ステータスの物理耐性(%)
- **魔法耐性**: 基本ステータスの魔法耐性(%)
- **選択基準**: 使用する攻撃スキルのタイプによって決定
- **データソース**: `calculationResults.basicStats.physicalResistance` または `calculationResults.basicStats.magicalResistance`

#### 武器耐性
- **現在の実装**: 考慮しない（値は0）
- **将来実装**: 敵ごとの武器種別耐性
- **計算**: `(1 - 武器耐性/100)` ※現在は `(1 - 0/100) = 1`

### 敵防御力システム

#### 計算後敵(M)DEF
複数の段階的処理を経て最終的な敵防御力を算出：

##### 1. 破壊状態異常による半減
```typescript
// 敵が破壊状態異常中の場合
let processedDEF = enemy.DEF // または enemy.MDEF
if (enemy.hasDestruction) {
  processedDEF = Math.ceil(processedDEF / 2) // 小数点以下切り上げ
}
```
**実装状況**: 未実装（状態異常システム未実装）

##### 2. エターナルナイトメア減算
```typescript
// バフスキルのエターナルナイトメア使用中
if (buffSkills.eternalNightmare.isEnabled) {
  const eternalNightmareReduction = calculateEternalNightmareReduction(
    buffSkills.eternalNightmare.level,
    buffSkills.getTotalDarkPowerLevel(),
    processedDEF,
    enemy // 敵情報を追加
  )
  processedDEF = processedDEF - eternalNightmareReduction
}

function calculateEternalNightmareReduction(
  eternalNightmareLevel: number,
  totalDarkPowerLevel: number,
  currentDefense: number,
  enemy: EnemyInfo
): number {
  const calculatedReduction = eternalNightmareLevel * totalDarkPowerLevel * 0.5
  
  // ボス戦の場合はNormal難易度のDEF/MDEFを参照
  let referenceDef = currentDefense
  if (enemy.category === 'boss' && enemy.difficulty !== 'normal') {
    // Normal難易度のDEF/MDEFを取得
    const normalStats = getEnemyNormalStats(enemy.id)
    referenceDef = normalStats.DEF // または normalStats.MDEF（攻撃タイプに応じて）
  }
  
  const halfDefense = referenceDef * 0.5
  return Math.min(calculatedReduction, halfDefense)
}
```
**計算例**: 
- エターナルナイトメアLv10 × ダークパワー合計Lv80 × 0.5 = 400
- 通常戦: 敵DEF 143 × 0.5 = 71.5 → 減算量 = Math.min(400, 71.5) = 71.5
- ボス戦Hard (DEF 800): Normal DEF 400 × 0.5 = 200 → 減算量 = Math.min(400, 200) = 200
**実装状況**: 実装済み（ボス戦対応含む）

##### 3. 貫通による低下
```typescript
// 貫通値の適用条件と計算方法（%計算）：
// - 物理貫通：参照防御力がDEFの場合のみ適用
// - 魔法貫通：参照防御力がMDEFの場合のみ適用
// - 貫通値は%で計算：(M)DEF × (1 - 貫通%/100)
// - 小数点は保持したまま基礎ダメージ計算で最終的にfloorを適用

let penetrationRate = 0
if (defenseType === 'DEF') {
    penetrationRate = input.penetration.physical
} else if (defenseType === 'MDEF') {
    penetrationRate = input.penetration.magical
}

// 貫通計算（小数点を保持したまま返す）
processed = processed * (1 - penetrationRate / 100)

// 小数点を保持したまま返す（Math.floorは基礎ダメージ計算で適用）
return processed
```

**重要な計算方法**:
- **貫通値は%として適用**: 例えば物理貫通15%の場合、DEF × 0.85
- **計算式**: `(M)DEF × (1 - 貫通%/100)`
- **小数点処理**: 貫通計算では小数点を保持し、基礎ダメージ計算の最終段階でMath.floor適用
- **例**: DEF 143、物理貫通15% → 143 × (1 - 15/100) = 143 × 0.85 = 121.55 → 基礎ダメージ計算でfloor適用
- **データソース**: `calculationResults.equipmentBonus1.physicalPenetration` または `calculationResults.equipmentBonus1.magicalPenetration`

**適用条件**:
- **物理貫通**: 物理攻撃でDEFを参照する場合のみ有効
- **魔法貫通**: 魔法攻撃でMDEFを参照する場合のみ有効
- **混合攻撃**: 参照防御力の種類に応じて対応する貫通値のみ適用

**注意**: ステップ2の処理後の値をもとにステップ3を計算

### 固定値補正

#### 抜刀固定値
- **説明**: 装備品補正値1の抜刀威力(+)
- **データソース**: `calculationResults.equipmentBonus1.unsheatheAttack`（固定値）
- **適用条件**: 抜刀攻撃時のみ

#### スキル固定値
- **説明**: 攻撃スキルごとに設定される固定ダメージ
- **データソース**: 攻撃スキルデータの`fixedDamage`プロパティ
- **値の例**: スキルによって0-1000など

### 倍率補正システム

#### 有利（属性有利）
```typescript
const totalAdvantage = calculateElementAdvantage(basicStats, powerOptions)

function calculateElementAdvantage(basicStats: BasicStats, powerOptions: PowerOptions): number {
  switch (powerOptions.elementPower) {
    case 'disabled':
      return 0 // 属性威力無効時は0
    case 'awakeningOnly':
      return 25 // 覚醒のみ時は25%固定
    case 'advantageOnly':
      return basicStats.totalElementAdvantage // 装備品補正値1の総属性有利のみ
    case 'enabled':
      return basicStats.totalElementAdvantage + 25 // 総属性有利 + 属性覚醒25%
    default:
      return basicStats.totalElementAdvantage
  }
}
```

- **総属性有利**: 基本ステータスの総属性有利（装備品補正値1から算出）
- **属性覚醒有利**: 25%固定
- **計算方式**: 属性威力オプションに応じて決定
  - **有効**: 総属性有利 + 25%（属性覚醒）
  - **有利のみ**: 総属性有利のみ（属性覚醒なし）
  - **覚醒のみ**: 25%固定（装備品の属性有利無視）
  - **無効**: 0%（属性有利計算を完全に無効化）
- **選択制御**: DamagePreview.tsxで属性攻撃および属性威力オプションで制御
- **データソース**: `calculationResults.basicStats.totalElementAdvantage`

#### スキル倍率
- **説明**: 攻撃スキルごとに設定される倍率
- **データソース**: 攻撃スキルデータの`multiplier`プロパティ
- **値の例**: 100-500%など（スキルによって異なる）

#### 抜刀%
- **説明**: 装備品補正値1の抜刀威力(%)
- **データソース**: `calculationResults.equipmentBonus1.unsheatheAttack_Rate`（注：現在は実装中）
- **適用条件**: 抜刀攻撃時のみ

#### 慣れ
- **デフォルト値**: 100%
- **値の範囲**: 50-250%
- **UI制御**: DamagePreview.tsxでスライダーで調整可能（将来実装）

#### 距離
- **説明**: 装備品補正値1の近距離威力(%) または 遠距離威力(%)
- **データソース**: 
  - 近距離時: `calculationResults.equipmentBonus1.shortRangeDamage`
  - 遠距離時: `calculationResults.equipmentBonus1.longRangeDamage`
- **適用条件**: 
  - 攻撃スキルが距離補正に対応している
  - かつ、ユーザーが選択した距離と一致している
  - 「無効」選択時は距離補正を適用しない
- **UI制御**: DamagePreview.tsxで距離判定（近距離/遠距離/無効）を選択可能

#### コンボ
- **デフォルト値**: 100%
- **強打有効時**: 150%
- **UI制御**: DamagePreview.tsxで強打有効/無効を選択可能（将来実装）

#### パッシブ倍率
**構成スキル**:
- 匠の剣術
- ロングレンジ（攻撃スキルによって有効/無効）
- 体術鍛錬
- 強打（バフスキルの強打、コンボの強打とは別）
- 集中

**計算方式**: 複数バフ有効時は加算してから適用（要検証）
```typescript
const passiveMultiplier = buffEffect1 + buffEffect2 + buffEffect3 + ...
// 例: 匠の剣術10% + 体術鍛錬15% = 25%として適用
```

**実装状況**: 仕様確定、実装予定

#### ブレイブ倍率
**構成スキル**:
1. ブレイブオーラ
2. マナリチャージ
3. 獅子奮闘・極
4. オーラブレード
5. アシュラオーラ
6. エンハンス

**計算方式**: 複数バフ有効時は加算してから適用（要検証）
```typescript
const braveMultiplier = braveAura + manaRecharge + lionFury + ...
// 例: ブレイブオーラ20% + マナリチャージ15% = 35%として適用
```

**実装状況**: 仕様確定、実装予定

## TypeScript実装インターフェース

### 基本データ構造

```typescript
// ダメージ計算の入力データ
export interface DamageCalculationInput {
  // 基本情報
  playerLevel: number
  enemyLevel: number
  referenceStatType: 'totalATK' | 'MATK' | 'custom'
  referenceStat: number
  
  // 攻撃スキル情報
  attackSkill: {
    type: 'physical' | 'magical'
    multiplier: number // スキル倍率(%)
    fixedDamage: number // スキル固定値
    supportedDistances: ('short' | 'long')[] // 対応距離（距離補正有効な距離）
    canUseLongRange: boolean // ロングレンジバフの適用可否
  }
  
  // 耐性・防御力
  resistance: {
    physical: number // 物理耐性(%)
    magical: number // 魔法耐性(%)
    weapon: number // 武器耐性(%) ※現在は0固定
  }
  
  enemy: {
    DEF: number
    MDEF: number
    level: number
    category: 'mob' | 'fieldBoss' | 'boss' | 'raidBoss'
    difficulty?: 'normal' | 'hard' | 'lunatic' | 'ultimate' // boss カテゴリのみ
    raidBossLevel?: number // raidBoss カテゴリのみ
    hasDestruction: boolean // 破壊状態異常
    guaranteedCritical: number // 確定クリティカル (0-999)
  }
  
  // 貫通・固定値
  penetration: {
    physical: number // 物理貫通
    magical: number // 魔法貫通
  }
  
  unsheathe: {
    fixedDamage: number // 抜刀固定値
    rateBonus: number // 抜刀%(%)
    isActive: boolean // 抜刀攻撃かどうか
  }
  
  // 属性・距離・コンボ
  elementAdvantage: {
    total: number // 総属性有利(%)
    awakening: number // 属性覚醒有利(%)
    isActive: boolean // 属性攻撃有効かどうか
  }
  
  distance: {
    shortRange: number // 近距離威力(%)
    longRange: number // 遠距離威力(%)
  }
  
  combo: {
    isActive: boolean // コンボ強打有効
    multiplier: number // コンボ倍率（150%など）
  }
  
  // バフ倍率
  passiveMultiplier: number // パッシブ倍率の合計(%)
  braveMultiplier: number // ブレイブ倍率の合計(%)
  
  // UI制御値
  userSettings: {
    adaptation: number // 慣れ(50-250%)
    currentDistance: 'short' | 'long' | 'disabled' // 現在の距離判定
    damageType: 'critical' | 'graze' | 'expected' | 'white' // ダメージ判定
  }
  
  // 安定率
  stability: {
    rate: number // 安定率(%)（例: 70）
  }
  
  // クリティカル
  critical: {
    damage: number // クリティカルダメージ(%)（例: 125）
  }
  
  // バフスキル情報（エターナルナイトメア用）
  buffSkills: {
    eternalNightmare: {
      isEnabled: boolean
      level: number // 1-10
    }
    totalDarkPowerLevel: number // ダークパワースキル合計レベル
  }
}

// ダメージ計算の出力結果
export interface DamageCalculationResult {
  baseDamage: number // 安定率適用前の基本ダメージ
  stabilityResult: {
    minDamage: number // 最小ダメージ（有効安定率%適用時）
    maxDamage: number // 最大ダメージ（100%時）
    averageDamage: number // 平均ダメージ
    stabilityRate: number // 元の安定率(%)
    effectiveStabilityRate: number // 実際に使用された安定率(%)（Graze時は半減）
  }
  calculationSteps: DamageCalculationSteps
}

// 計算過程の詳細
export interface DamageCalculationSteps {
  // ステップ1: 基礎ダメージ
  step1_baseDamage: {
    playerLevel: number
    referenceStat: number
    enemyLevel: number
    beforeResistance: number // (自Lv + 参照ステータス - 敵Lv)
    physicalResistanceRate: number
    magicalResistanceRate: number
    weaponResistanceRate: number
    afterResistance: number
    enemyDEF: number
    result: number
  }
  
  // ステップ2: 固定値加算
  step2_fixedValues: {
    baseDamage: number
    unsheatheFixed: number
    skillFixed: number
    result: number
  }
  
  // ステップ3: 属性有利
  step3_elementAdvantage: {
    beforeAdvantage: number
    advantageRate: number
    result: number
  }
  
  // ステップ4: スキル倍率
  step4_skillMultiplier: {
    beforeSkill: number
    skillRate: number
    result: number
  }
  
  // ステップ5: 抜刀%
  step5_unsheatheRate: {
    beforeUnsheathe: number
    unsheatheRate: number
    result: number
  }
  
  // ステップ6: 慣れ
  step6_adaptation: {
    beforeAdaptation: number
    adaptationRate: number
    result: number
  }
  
  // ステップ7: 距離
  step7_distance: {
    beforeDistance: number
    distanceRate: number
    result: number
  }
  
  // ステップ8: コンボ
  step8_combo: {
    beforeCombo: number
    comboRate: number
    result: number
  }
  
  // ステップ9: パッシブ倍率
  step9_passive: {
    beforePassive: number
    passiveRate: number
    result: number
  }
  
  // ステップ4a: クリティカルダメージ（クリティカル・Graze時のみ）
  step4a_critical?: {
    beforeCritical: number
    criticalRate: number
    result: number
  }
  
  // ステップ10: ブレイブ倍率
  step10_brave: {
    beforeBrave: number
    braveRate: number
    result: number
  }
}
```

### 計算関数の実装例

```typescript
/**
 * メインダメージ計算関数
 */
export function calculateDamage(input: DamageCalculationInput): DamageCalculationResult {
  const steps = {} as DamageCalculationSteps
  
  // ステップ1: 基礎ダメージ計算
  const step1Result = calculateBaseDamage(input, steps)
  
  // ステップ2: 固定値加算
  const step2Result = applyFixedValues(step1Result, input, steps)
  
  // ステップ3-4: 属性有利とスキル倍率
  let currentDamage = step2Result
  currentDamage = applyElementAdvantage(currentDamage, input, steps)
  currentDamage = applySkillMultiplier(currentDamage, input, steps)
  
  // ステップ4a: クリティカルダメージ（クリティカル・Graze時のみ）
  if (input.userSettings.damageType === 'critical' || input.userSettings.damageType === 'graze') {
    currentDamage = applyCriticalDamage(currentDamage, input, steps)
  }
  
  // ステップ5-10: 残りの倍率適用
  currentDamage = applyUnsheatheRate(currentDamage, input, steps)
  currentDamage = applyAdaptation(currentDamage, input, steps)
  currentDamage = applyDistance(currentDamage, input, steps)
  currentDamage = applyCombo(currentDamage, input, steps)
  currentDamage = applyPassiveMultiplier(currentDamage, input, steps)
  const baseDamage = applyBraveMultiplier(currentDamage, input, steps)
  
  // 安定率適用
  const stabilityResult = calculateStabilityDamage(baseDamage, input.stability.rate, input.userSettings.damageType)
  
  return {
    baseDamage,
    stabilityResult,
    calculationSteps: steps
  }
}

/**
 * ステップ1: 基礎ダメージ計算
 */
function calculateBaseDamage(input: DamageCalculationInput, steps: DamageCalculationSteps): number {
  const beforeResistance = input.playerLevel + input.referenceStat - input.enemyLevel
  
  // 耐性適用
  const physicalResistanceMultiplier = 1 - input.resistance.physical / 100
  const magicalResistanceMultiplier = 1 - input.resistance.magical / 100
  const weaponResistanceMultiplier = 1 - input.resistance.weapon / 100
  
  const resistanceMultiplier = input.attackSkill.type === 'physical' 
    ? physicalResistanceMultiplier 
    : magicalResistanceMultiplier
  
  const afterResistance = beforeResistance * resistanceMultiplier * weaponResistanceMultiplier
  
  // 敵防御力処理
  const enemyDefense = input.attackSkill.type === 'physical' ? input.enemy.DEF : input.enemy.MDEF
  const processedDefense = processEnemyDefense(enemyDefense, input)
  
  const result = Math.floor(afterResistance - processedDefense)
  
  // 計算過程を記録
  steps.step1_baseDamage = {
    playerLevel: input.playerLevel,
    referenceStat: input.referenceStat,
    enemyLevel: input.enemyLevel,
    beforeResistance,
    physicalResistanceRate: input.resistance.physical,
    magicalResistanceRate: input.resistance.magical,
    weaponResistanceRate: input.resistance.weapon,
    afterResistance,
    enemyDEF: processedDefense,
    result
  }
  
  return Math.max(1, result) // 最低1ダメージ保証
}

/**
 * 敵防御力の処理（破壊・エターナルナイトメア・貫通）
 */
function processEnemyDefense(defense: number, input: DamageCalculationInput): number {
  let processed = defense
  
  // 1. 破壊状態異常による半減（小数点以下切り上げ）
  if (input.enemy.hasDestruction) {
    processed = Math.ceil(processed / 2)
  }
  
  // 2. エターナルナイトメア減算
  if (input.buffSkills.eternalNightmare.isEnabled) {
    const eternalReduction = input.buffSkills.eternalNightmare.level * input.buffSkills.totalDarkPowerLevel * 0.5
    processed = Math.max(0, processed - eternalReduction)
  }
  
  // 3. 貫通による低下（小数点以下切り捨て）
  const penetration = input.attackSkill.type === 'physical' 
    ? input.penetration.physical 
    : input.penetration.magical
  
  processed = Math.floor(Math.max(0, processed - penetration))
  
  return processed
}

/**
 * 安定率ダメージ計算
 */
function calculateStabilityDamage(
  baseDamage: number, 
  stabilityRate: number, 
  damageType: 'critical' | 'graze' | 'expected' | 'white'
): {
  minDamage: number
  maxDamage: number
  averageDamage: number
  stabilityRate: number
  effectiveStabilityRate: number
} {
  let effectiveStabilityRate = stabilityRate
  
  // Graze時は安定率を半減（小数点以下切り捨て）
  if (damageType === 'graze') {
    effectiveStabilityRate = Math.floor(stabilityRate / 2)
  }
  
  // 最小ダメージ = 基本ダメージ × 有効安定率%
  const minDamage = Math.floor(baseDamage * effectiveStabilityRate / 100)
  
  // 最大ダメージ = 基本ダメージ × 100%
  const maxDamage = baseDamage
  
  // 平均ダメージ = (最小 + 最大) / 2
  const averageDamage = Math.floor((minDamage + maxDamage) / 2)
  
  return {
    minDamage,
    maxDamage,
    averageDamage,
    stabilityRate: stabilityRate, // 元の安定率
    effectiveStabilityRate // 実際に使用された安定率
  }
}

/**
 * ランダムダメージ生成（実際のダメージシミュレーション用）
 */
function generateRandomDamage(
  baseDamage: number, 
  stabilityRate: number, 
  damageType: 'critical' | 'graze' | 'expected' | 'white'
): number {
  let effectiveStabilityRate = stabilityRate
  
  // Graze時は安定率を半減（小数点以下切り捨て）
  if (damageType === 'graze') {
    effectiveStabilityRate = Math.floor(stabilityRate / 2)
  }
  
  // ランダム係数: 有効安定率% ～ 100% の範囲
  const randomRange = 100 - effectiveStabilityRate
  const randomValue = Math.random() * randomRange
  const finalRate = (effectiveStabilityRate + randomValue) / 100
  
  return Math.floor(baseDamage * finalRate)
}

// 他のステップ関数も同様に実装...
```

## 実装フェーズ

### フェーズ1: 基本計算エンジン（優先度: 高）
- [x] 基本ダメージ計算（ステップ1-2）
- [ ] 属性有利・スキル倍率（ステップ3-4）
- [ ] 抜刀・慣れ・距離補正（ステップ5-7）

### フェーズ2: UI連携（優先度: 中）
- [ ] DamagePreview.tsxとの連携
- [ ] 敵カテゴリ別UI表示（ボス難易度選択、レイドボスレベル調整）
- [ ] 属性攻撃有効/無効の選択
- [ ] 慣れスライダー（50-250%）
- [ ] 距離判定選択（近距離/遠距離/無効）
- [ ] コンボ強打有効/無効の選択
- [ ] 確定クリティカル設定（0-999）

### フェーズ3: 高度な機能（優先度: 低）
- [ ] パッシブ倍率システム
- [ ] ブレイブ倍率システム
- [ ] エターナルナイトメア実装
- [ ] 状態異常システム（破壊）

## 計算例

### 例1: 基本的な物理攻撃
**入力条件**:
- 自Lv: 150
- 総ATK: 2,500
- 敵Lv: 100
- 物理耐性: 15%
- 敵DEF: 300
- 物理貫通: 50

**計算過程**:
1. 基礎ダメージ = INT((150 + 2500 - 100) × (1 - 15/100) × (1 - 0/100) - (300 - 50))
   = INT(2550 × 0.85 × 1 - 250)
   = INT(2167.5 - 250)
   = INT(1917.5) = 1917

### 例2: 魔法攻撃（属性有利あり）
**入力条件**:
- 自Lv: 120
- MATK: 3,200
- 敵Lv: 80
- 魔法耐性: 10%
- 敵MDEF: 400
- 魔法貫通: 100
- 総属性有利: 25%
- スキル倍率: 150%

**計算過程**:
1. 基礎ダメージ = INT((120 + 3200 - 80) × (1 - 10/100) - (400 - 100))
   = INT(3240 × 0.9 - 300)
   = INT(2916 - 300) = 2616

2. 属性有利適用 = INT(2616 × (1 + 25/100))
   = INT(2616 × 1.25) = INT(3270) = 3270

3. スキル倍率適用 = INT(3270 × 150/100)
   = INT(3270 × 1.5) = INT(4905) = 4905

## 重要な注意事項

### INT()関数の適用
- 各計算ステップで必ずINT()（小数点以下切り捨て）を適用
- JavaScriptでは`Math.floor()`を使用
- 負数の場合も元の数値より小さい整数に切り捨て

### 最低ダメージ保証
- 基礎ダメージ計算で1未満になった場合は1に補正
- 各ステップでの中間結果は1未満でも可（最終結果のみ保証）

### データ依存関係
- 基本ステータス計算結果に依存
- 装備品補正値に依存
- バフスキル状態に依存（将来実装）

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2025-07-02 | ダメージ計算式設計書を完全リライト | トーラムオンラインの正確な計算式に基づく全面刷新 |
| 2025-07-02 | 敵情報システム対応を追加 | ボス難易度、レイドボスレベル調整、確定クリティカル機能 |

## 敵情報システム連携

### ボス難易度システム
**適用対象**: `boss` カテゴリのみ

```typescript
// ボス難易度別ステータス調整
function adjustBossStats(baseStats: EnemyStats, difficulty: BossDifficulty) {
  const levelBonus = getDifficultyLevelBonus(difficulty) // normal:0, hard:10, lunatic:20, ultimate:40
  const defMultiplier = getDifficultyDefMultiplier(difficulty) // normal:1, hard:2, lunatic:4, ultimate:6
  
  return {
    level: baseStats.level + levelBonus,
    DEF: Math.floor(baseStats.DEF * defMultiplier),
    MDEF: Math.floor(baseStats.MDEF * defMultiplier),
    // 耐性は変更なし
    physicalResistance: baseStats.physicalResistance,
    magicalResistance: baseStats.magicalResistance
  }
}
```

### レイドボス レベル調整システム
**適用対象**: `raidBoss` カテゴリのみ

```typescript
// レイドボス別計算式
function calculateRaidBossStats(raidBossId: string, level: number): EnemyStats {
  switch (raidBossId) {
    case 'ca10a211-71b5-4683-811e-3e09457edbe3': // 竜骨の魔人
      return {
        DEF: Math.floor(level * 3 / 4),
        MDEF: Math.floor(level * 3 / 2),
        physicalResistance: Math.floor(level / 10),
        magicalResistance: Math.floor(25 + level / 10),
        // ...他のステータス
      }
    // 他のレイドボスも同様
  }
}
```

### 確定クリティカル
全敵カテゴリで設定可能（0-999）。ボスの状態やゲージに応じてユーザーが調整。

## 関連ドキュメント
- [DamagePreview UI設計書](../ui/damage-preview.md) - UI表示の詳細仕様
- [基本ステータス計算式](./basic-stats.md) - 基盤となる計算式
- [装備品補正値計算](./equipment-bonuses.md) - 補正値計算の詳細
- [敵情報データベース設計](../database/enemy.md) - 敵情報システムの詳細