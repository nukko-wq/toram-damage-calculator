# ダメージ計算ロジック設計書

## 概要

トーラムオンラインのダメージ計算システムを正確に再現するための計算ロジック仕様書。物理・魔法攻撃の基本ダメージから、クリティカル・属性・スキル補正まで包括的にカバーします。

## 基本ダメージ計算式

### 物理攻撃ダメージ
```
基本物理ダメージ = INT(ATK × 安定率) - 敵DEF + 物理貫通
最終ダメージ = INT(基本物理ダメージ × (1 + 物理耐性軽減率))
```

### 魔法攻撃ダメージ  
```
基本魔法ダメージ = INT(MATK × 安定率) - 敵MDEF + 魔法貫通
最終ダメージ = INT(基本魔法ダメージ × (1 + 魔法耐性軽減率))
```

## ダメージ計算データ構造

### TypeScript インターフェース

```typescript
// ダメージ計算の入力データ
interface DamageCalculationInput {
  // 攻撃者ステータス
  attacker: {
    ATK: number                    // 最終ATK
    MATK: number                   // 最終MATK
    stability: number              // 安定率(%)
    criticalRate: number           // クリティカル率
    criticalDamage: number         // クリティカルダメージ
    physicalPenetration: number    // 物理貫通
    magicalPenetration: number     // 魔法貫通
    elementAdvantage: number       // 属性有利
    weaponATK: number             // 武器ATK
    unsheatheAttack: number       // 抜刀威力
    shortRangeDamage: number      // 近距離威力
    longRangeDamage: number       // 遠距離威力
  }
  
  // 防御者（敵）ステータス
  defender: {
    DEF: number                   // 物理防御力
    MDEF: number                  // 魔法防御力
    physicalResistance: number    // 物理耐性(%)
    magicalResistance: number     // 魔法耐性(%)
    resistCritical: number        // クリティカル耐性
  }
  
  // 攻撃設定
  attackType: 'physical' | 'magical'  // 攻撃タイプ
  attackRange: 'short' | 'long'       // 攻撃距離
  isUnsheathe: boolean                 // 抜刀攻撃フラグ
  skillMultiplier?: number             // スキル倍率
}

// ダメージ計算の出力結果
interface DamageCalculationResult {
  minimum: DamageValues    // 最小ダメージ（安定率最小時）
  maximum: DamageValues    // 最大ダメージ（安定率最大時）
  average: DamageValues    // 平均ダメージ
  calculationSteps: CalculationSteps // 計算過程の詳細
}

interface DamageValues {
  damage: number          // ダメージ値
  stability: number       // 安定率(%)
  isCritical: boolean    // クリティカル判定
}

interface CalculationSteps {
  baseATK: number                    // 基礎ATK
  stabilityMultiplier: number        // 安定率乗数
  stabilizedATK: number             // 安定率適用後ATK
  defenseReduction: number          // 防御力減算
  penetrationBonus: number          // 貫通ボーナス
  baseDamage: number               // 基本ダメージ
  rangeMultiplier: number          // 距離補正
  unsheatheMultiplier: number      // 抜刀補正
  skillMultiplier: number          // スキル補正
  elementMultiplier: number        // 属性補正
  criticalMultiplier: number       // クリティカル補正
  resistanceMultiplier: number     // 耐性補正
  finalDamage: number             // 最終ダメージ
}
```

## 安定率システム

### 安定率の計算範囲
```typescript
interface StabilityRange {
  minimum: number    // 最小安定率（装備安定率の値）
  maximum: number    // 最大安定率（常に100%）
  average: number    // 平均安定率（(最小+最大)/2）
}

const calculateStabilityRange = (equipmentStability: number): StabilityRange => {
  const minimum = Math.max(0, Math.min(100, equipmentStability))
  const maximum = 100
  const average = (minimum + maximum) / 2
  
  return { minimum, maximum, average }
}
```

### 安定率適用計算
```typescript
const applyStability = (baseATK: number, stabilityPercent: number): number => {
  return Math.floor(baseATK * (stabilityPercent / 100))
}
```

## クリティカル計算

### クリティカル判定
```typescript
const calculateCriticalHit = (
  criticalRate: number,
  resistCritical: number
): boolean => {
  const effectiveCriticalRate = Math.max(0, criticalRate - resistCritical)
  return Math.random() * 100 < effectiveCriticalRate
}
```

### クリティカルダメージ補正
```typescript
const applyCriticalDamage = (
  baseDamage: number,
  criticalDamage: number,
  isCritical: boolean
): number => {
  if (!isCritical) return baseDamage
  return Math.floor(baseDamage * (1 + criticalDamage / 100))
}
```

## 距離・威力補正

### 距離補正システム
```typescript
interface RangeModifier {
  short: number      // 近距離補正(%)
  long: number       // 遠距離補正(%)
}

const applyRangeModifier = (
  baseDamage: number,
  range: 'short' | 'long',
  modifiers: RangeModifier
): number => {
  const modifier = range === 'short' ? modifiers.short : modifiers.long
  return Math.floor(baseDamage * (1 + modifier / 100))
}
```

### 抜刀威力補正
```typescript
const applyUnsheatheModifier = (
  baseDamage: number,
  unsheatheAttack: number,
  isUnsheathe: boolean
): number => {
  if (!isUnsheathe) return baseDamage
  return Math.floor(baseDamage * (1 + unsheatheAttack / 100))
}
```

## 属性システム

### 属性有利計算
```typescript
interface ElementAdvantage {
  totalAdvantage: number      // 総属性有利(%)
  elementPower: number        // 属性威力
  awakeningBonus: number      // 属性覚醒ボーナス
}

const applyElementAdvantage = (
  baseDamage: number,
  elementAdvantage: ElementAdvantage
): number => {
  const totalBonus = elementAdvantage.totalAdvantage + 
                    elementAdvantage.elementPower + 
                    elementAdvantage.awakeningBonus
  return Math.floor(baseDamage * (1 + totalBonus / 100))
}
```

## 防御・耐性システム

### 防御力計算
```typescript
const applyDefense = (
  damage: number,
  defense: number,
  penetration: number
): number => {
  const effectiveDefense = Math.max(0, defense - penetration)
  return Math.max(1, damage - effectiveDefense)  // 最低1ダメージ保証
}
```

### 耐性計算
```typescript
const applyResistance = (
  damage: number,
  resistancePercent: number
): number => {
  const resistanceMultiplier = 1 - (resistancePercent / 100)
  return Math.floor(damage * Math.max(0, resistanceMultiplier))
}
```

## メイン計算エンジン

### 総合ダメージ計算関数
```typescript
export const calculateDamage = (
  input: DamageCalculationInput
): DamageCalculationResult => {
  const stabilityRange = calculateStabilityRange(input.attacker.stability)
  
  // 最小・最大・平均の3パターンを計算
  const results = [
    { stability: stabilityRange.minimum, type: 'minimum' },
    { stability: stabilityRange.maximum, type: 'maximum' },
    { stability: stabilityRange.average, type: 'average' }
  ].map(({ stability, type }) => {
    return calculateSingleDamage(input, stability, type)
  })
  
  return {
    minimum: results[0],
    maximum: results[1], 
    average: results[2],
    calculationSteps: results[2].steps  // 平均時の計算過程を返す
  }
}

const calculateSingleDamage = (
  input: DamageCalculationInput,
  stabilityPercent: number,
  type: string
): DamageValues & { steps: CalculationSteps } => {
  const { attacker, defender, attackType, attackRange, isUnsheathe, skillMultiplier = 1 } = input
  
  // 1. 基礎攻撃力取得
  const baseATK = attackType === 'physical' ? attacker.ATK : attacker.MATK
  
  // 2. 安定率適用
  const stabilizedATK = applyStability(baseATK, stabilityPercent)
  
  // 3. 防御力減算
  const defense = attackType === 'physical' ? defender.DEF : defender.MDEF
  const penetration = attackType === 'physical' ? attacker.physicalPenetration : attacker.magicalPenetration
  const afterDefense = applyDefense(stabilizedATK, defense, penetration)
  
  // 4. 距離補正
  const rangeModifiers = {
    short: attacker.shortRangeDamage,
    long: attacker.longRangeDamage
  }
  const afterRange = applyRangeModifier(afterDefense, attackRange, rangeModifiers)
  
  // 5. 抜刀補正
  const afterUnsheathe = applyUnsheatheModifier(afterRange, attacker.unsheatheAttack, isUnsheathe)
  
  // 6. スキル倍率
  const afterSkill = Math.floor(afterUnsheathe * skillMultiplier)
  
  // 7. 属性補正
  const elementAdvantage = {
    totalAdvantage: attacker.elementAdvantage,
    elementPower: 0,  // TODO: 属性威力の実装
    awakeningBonus: 0 // TODO: 属性覚醒の実装
  }
  const afterElement = applyElementAdvantage(afterSkill, elementAdvantage)
  
  // 8. クリティカル判定・補正
  const isCritical = calculateCriticalHit(attacker.criticalRate, defender.resistCritical)
  const afterCritical = applyCriticalDamage(afterElement, attacker.criticalDamage, isCritical)
  
  // 9. 耐性補正
  const resistance = attackType === 'physical' ? defender.physicalResistance : defender.magicalResistance
  const finalDamage = applyResistance(afterCritical, resistance)
  
  // 計算過程の記録
  const steps: CalculationSteps = {
    baseATK,
    stabilityMultiplier: stabilityPercent / 100,
    stabilizedATK,
    defenseReduction: defense - penetration,
    penetrationBonus: penetration,
    baseDamage: afterDefense,
    rangeMultiplier: attackRange === 'short' ? attacker.shortRangeDamage : attacker.longRangeDamage,
    unsheatheMultiplier: isUnsheathe ? attacker.unsheatheAttack : 0,
    skillMultiplier,
    elementMultiplier: elementAdvantage.totalAdvantage,
    criticalMultiplier: isCritical ? attacker.criticalDamage : 0,
    resistanceMultiplier: resistance,
    finalDamage
  }
  
  return {
    damage: finalDamage,
    stability: stabilityPercent,
    isCritical,
    steps
  }
}
```

## スキル系ダメージ計算

### スキル倍率システム
```typescript
interface SkillDamageModifier {
  baseMultiplier: number       // 基本倍率
  levelMultiplier: number      // レベル補正
  masteryBonus: number         // マスタリーボーナス
  comboMultiplier: number      // コンボ補正
}

const calculateSkillDamage = (
  baseDamage: number,
  skill: SkillDamageModifier
): number => {
  const totalMultiplier = skill.baseMultiplier * 
                         (1 + skill.levelMultiplier / 100) *
                         (1 + skill.masteryBonus / 100) *
                         skill.comboMultiplier
  return Math.floor(baseDamage * totalMultiplier)
}
```

## 特殊ダメージ計算

### 追撃ダメージ
```typescript
interface FollowupDamage {
  physicalFollowup: number     // 物理追撃(%)
  magicalFollowup: number      // 魔法追撃(%)
  triggerRate: number          // 発動率(%)
}

const calculateFollowupDamage = (
  baseDamage: number,
  followup: FollowupDamage,
  attackType: 'physical' | 'magical'
): number => {
  const followupRate = attackType === 'physical' ? followup.physicalFollowup : followup.magicalFollowup
  const isTriggered = Math.random() * 100 < followup.triggerRate
  
  if (!isTriggered) return 0
  return Math.floor(baseDamage * (followupRate / 100))
}
```

### 貫通ダメージ
```typescript
const calculatePenetrationDamage = (
  baseATK: number,
  penetrationRate: number,
  defenseIgnoreRate: number
): number => {
  const penetrationDamage = Math.floor(baseATK * (penetrationRate / 100))
  const ignoredDefense = Math.floor(penetrationDamage * (defenseIgnoreRate / 100))
  return penetrationDamage + ignoredDefense
}
```

## 計算最適化

### キャッシュ戦略
```typescript
interface DamageCalculationCache {
  inputHash: string
  result: DamageCalculationResult
  timestamp: number
}

const CACHE_DURATION = 5000 // 5秒

const getCachedResult = (input: DamageCalculationInput): DamageCalculationResult | null => {
  const hash = generateInputHash(input)
  const cached = damageCache.get(hash)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result
  }
  return null
}
```

### バッチ計算
```typescript
const calculateMultipleDamageScenarios = (
  baseInput: DamageCalculationInput,
  scenarios: Partial<DamageCalculationInput>[]
): DamageCalculationResult[] => {
  return scenarios.map(scenario => {
    const input = { ...baseInput, ...scenario }
    return calculateDamage(input)
  })
}
```

## エラーハンドリング

### 入力値検証
```typescript
const validateDamageInput = (input: DamageCalculationInput): string[] => {
  const errors: string[] = []
  
  if (input.attacker.ATK < 0) errors.push('ATKは0以上である必要があります')
  if (input.attacker.stability < 0 || input.attacker.stability > 100) {
    errors.push('安定率は0-100%の範囲である必要があります')
  }
  if (input.defender.DEF < 0) errors.push('DEFは0以上である必要があります')
  
  return errors
}
```

### 計算例外処理
```typescript
const safeCalculateDamage = (input: DamageCalculationInput): DamageCalculationResult => {
  try {
    const errors = validateDamageInput(input)
    if (errors.length > 0) {
      throw new Error(`入力値エラー: ${errors.join(', ')}`)
    }
    
    return calculateDamage(input)
  } catch (error) {
    console.error('ダメージ計算エラー:', error)
    return getDefaultDamageResult()
  }
}
```

## テスト仕様

### 単体テスト
```typescript
describe('ダメージ計算', () => {
  test('基本物理ダメージ計算', () => {
    const input: DamageCalculationInput = {
      attacker: { ATK: 1000, stability: 85, /* ... */ },
      defender: { DEF: 200, physicalResistance: 0, /* ... */ },
      attackType: 'physical',
      attackRange: 'short',
      isUnsheathe: false
    }
    
    const result = calculateDamage(input)
    expect(result.minimum.damage).toBeGreaterThan(0)
    expect(result.maximum.damage).toBeGreaterThan(result.minimum.damage)
  })
  
  // 他のテストケース...
})
```

## パフォーマンス指標

### 計算速度目標
- **単一計算**: < 1ms
- **バッチ計算**: < 10ms (10シナリオ)
- **UI更新**: < 100ms (デバウンス込み)

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2024-12-25 | ダメージ計算ロジック設計書作成 | 初版作成 |

## 関連ドキュメント
- [DamagePreview UI設計書](../ui/damage-preview.md) - UI表示の詳細仕様
- [基本ステータス計算式](./basic-stats.md) - 基盤となる計算式
- [StatusPreview 計算仕様](../ui/status-preview-calculations.md) - 関連計算ロジック