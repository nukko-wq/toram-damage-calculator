# スプライトスキル系統詳細設計書

## 概要

スプライトスキル系統（category: 'sprite'）のバフスキル詳細仕様を記述します。
スプライトスキル系統は敵のステータスに依存する効果やブレイブ倍率への影響が特徴です。

## データ構造

```typescript
interface SpriteSkillDetail {
  id: string                    // data-key値
  name: string                 // 表示名
  category: 'sprite'           // スキル系統（スプライト固定）
  type: BuffSkillType         // UI制御タイプ
  order: number               // 表示順序
  isCircle?: boolean          // サークルバフ（味方にも効果）かどうか（デフォルト: false）
  description: string         // スキル説明
  effects: SkillEffect[]      // 効果リスト
  calculationFormula: string  // 計算式
  weaponRequirement?: object  // 武器種別要件
  uiSettings: UISettings      // UI表示設定
  specialNotes?: string[]     // 特別な実装注意点
}
```

## スプライトスキル一覧

### 5.1 エンハンス (IsEnhance)

```typescript
{
  id: 'IsEnhance',
  name: 'エンハンス',
  category: 'sprite',
  type: 'toggle',
  order: 801,
  isCircle: true, // サークルバフ（UI表示で赤色）
  description: 'ブレイブ倍率を上昇、ATK・MATKを敵の防御力に応じて上昇',
  effects: [
    {
      property: 'BraveMultiplier',
      formula: '+10',
      conditions: ['全武器種共通']
    },
    {
      property: 'ATK',
      formula: 'Math.min(Math.floor(敵Normal難易度DEF / 2), 敵Normal難易度レベル)',
      conditions: ['Normal難易度の敵防御力依存、上限は敵レベル']
    },
    {
      property: 'MATK',
      formula: 'Math.min(Math.floor(敵Normal難易度MDEF / 2), 敵Normal難易度レベル)',
      conditions: ['Normal難易度の敵魔法防御力依存、上限は敵レベル']
    }
  ],
  calculationFormula: `
    ブレイブ倍率% = base + 10
    ATK = base + Math.min(Math.floor(敵Normal難易度DEF / 2), 敵Normal難易度レベル)
    MATK = base + Math.min(Math.floor(敵Normal難易度MDEF / 2), 敵Normal難易度レベル)
  `,
  weaponRequirement: {
    description: 'すべての武器で効果があります'
  },
  damageCalculationIntegration: {
    braveMultiplier: 'ブレイブオーラと同じ仕組みでブレイブ倍率に加算',
    atkBonus: 'Normal難易度DEFに基づいて基本ステータス計算でATKに加算',
    matkBonus: 'Normal難易度MDEFに基づいて基本ステータス計算でMATKに加算',
    difficultyHandling: 'ボス戦時もNormal難易度のDEF/MDEFを参照',
    floorCalculation: 'ATK・MATK計算で小数点以下は切り捨て（Math.floor使用）'
  },
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  },
  specialNotes: [
    'ATK・MATK計算で小数点以下は切り捨て（Math.floor使用）',
    '敵DEF・MDEF・レベルは常にNormal難易度の値を参照（プリセット敵データのそのままの値）',
    '難易度設定に関係なく、選択された敵のプリセットデータ値から計算',
    'エターナルナイトメアと同様の方式でNormal難易度データを参照',
    'ブレイブ倍率の実装はブレイブオーラ（BraveMultiplier）と同じ仕組み',
    '実装: getPresetEnemyById → enemyData.stats.DEF/MDEF, enemyData.level'
  ]
}

// 実装用の効果計算関数
function calculateEnhanceEffects(
  isEnabled: boolean,
  normalEnemyDEF: number,
  normalEnemyMDEF: number,
  normalEnemyLevel: number
): {
  playerEffects: Partial<EquipmentProperties>,
  braveBonus: number
} {
  if (!isEnabled) {
    return { playerEffects: {}, braveBonus: 0 }
  }
  
  // ATK・MATK計算（上限は敵レベル）
  const atkBonus = Math.min(Math.floor(normalEnemyDEF / 2), normalEnemyLevel)
  const matkBonus = Math.min(Math.floor(normalEnemyMDEF / 2), normalEnemyLevel)
  
  const playerEffects: Partial<EquipmentProperties> = {
    ATK: atkBonus,
    MATK: matkBonus
  }
  
  return {
    playerEffects,
    braveBonus: 10  // ブレイブ倍率+10%
  }
}
```

## 実装詳細

### 敵ステータス依存システム

スプライトスキル系統の特徴として、敵のステータスに依存する効果があります：

#### エンハンスの計算パターン
```typescript
// エンハンス効果計算例
export function getSpriteSkillBonuses(
  buffSkillData: Record<string, BuffSkillState> | null,
  normalEnemyDEF: number,
  normalEnemyMDEF: number,
  normalEnemyLevel: number
): {
  bonuses: Partial<AllBonuses>,
  braveMultiplier: number
} {
  const bonuses: Partial<AllBonuses> = {}
  let braveMultiplier = 0
  
  if (!buffSkillData) return { bonuses, braveMultiplier }
  
  // エンハンス (IsEnhance) の処理
  const enhance = buffSkillData.IsEnhance
  if (enhance?.isEnabled) {
    const effects = calculateEnhanceEffects(
      enhance.isEnabled,
      normalEnemyDEF,
      normalEnemyMDEF,
      normalEnemyLevel
    )
    integrateEffects(effects.playerEffects, bonuses)
    braveMultiplier += effects.braveBonus
  }
  
  return { bonuses, braveMultiplier }
}
```

### Normal難易度データ参照システム

#### 実装パターン
```typescript
// Normal難易度データ参照の実装例
export function getNormalEnemyStats(
  selectedEnemyId: string
): { def: number, mdef: number, level: number } {
  // プリセット敵データからNormal難易度の値を取得
  const enemyData = getPresetEnemyById(selectedEnemyId)
  
  if (!enemyData) {
    return { def: 0, mdef: 0, level: 1 }
  }
  
  // Normal難易度の基本ステータスを返す
  return {
    def: enemyData.stats.DEF,      // プリセットデータそのまま
    mdef: enemyData.stats.MDEF,    // プリセットデータそのまま
    level: enemyData.level         // プリセットデータそのまま
  }
}
```

### UI仕様

#### toggleタイプ（エンハンス）

- **パラメータ名**: ON/OFF
- **UI**: クイックトグル、モーダル表示なし
- **表示形式**: 「エンハンス」（スキル名のみ）

### 武器種別要件

全武器種で使用可能：

- **対象武器**: すべての武器
- **制限**: なし
- **効果変動**: 武器種による効果の違いなし

### ブレイブ倍率統合

エンハンスはブレイブ倍率に影響します：

```typescript
// ブレイブ倍率計算での統合例
export function calculateTotalBraveMultiplier(
  baseMultiplier: number,
  spriteSkillBonus: number,
  supportSkillBonus: number
): number {
  return baseMultiplier + spriteSkillBonus + supportSkillBonus
}
```

## 実装ステータス

- [x] エンハンス (IsEnhance) - 設計・実装完了（敵ステータス依存効果含む）

## 特徴

- **敵ステータス依存**: エンハンスは敵のDEF・MDEF・レベルに依存した効果
- **ブレイブ倍率影響**: ブレイブオーラと同じ仕組みでブレイブ倍率を上昇
- **Normal難易度参照**: ボス戦でもNormal難易度データを参照する特殊処理
- **上限制限**: 敵レベルを上限とするATK・MATK上昇制限
- **全武器対応**: すべての武器種で使用可能
- **切り捨て計算**: Math.floorを使用した切り捨て計算

## 関連ファイル

- **メインドキュメント**: `../buff-skill-details.md`
- **実装ファイル**: `../../src/utils/buffSkillCalculation/categories/spriteSkills.ts`
- **データ定義**: `../../src/data/buffSkills/common.ts`
- **型定義**: `../../src/types/buffSkill.ts`

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2025-01-XX | スプライトスキル系統を個別ファイルに分離 | buff-skill-details.mdから移動 |
| 2025-01-XX | パワーウェーブとヒールを削除 | エンハンスのみに整理 |