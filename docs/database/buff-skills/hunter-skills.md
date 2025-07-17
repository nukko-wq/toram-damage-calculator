# ハンタースキル系統詳細設計書

## 概要

ハンタースキル系統（category: 'hunter'）のバフスキル詳細仕様を記述します。
武器種別による効果の変動があるスキルが含まれています。

## データ構造

```typescript
interface HunterSkillDetail {
  id: string                    // data-key値
  name: string                 // 表示名
  category: 'hunter'           // スキル系統
  type: BuffSkillType         // UI制御タイプ
  order: number               // 表示順序
  maxLevel?: number           // 最大レベル（デフォルト10）
  description: string         // スキル説明
  effects: SkillEffect[]      // 効果リスト
  calculationFormula: string  // 計算式
  uiSettings: UISettings      // UI表示設定
  weaponConditionalEffects?: object // 武器種別効果
}
```

## ハンタースキル一覧

### 1. カムフラージュ (hunter5-2)

```typescript
{
  id: 'hunter5-2',
  name: 'カムフラージュ',
  category: 'hunter',
  type: 'level',
  order: 1701,
  maxLevel: 10,
  description: '基本ステータスのレベルとスキルレベルに応じてATKとクリティカルを上昇させる',
  weaponConditionalEffects: {
    // 弓・自動弓の場合
    bow: {
      conditions: ['メイン武器が弓または自動弓'],
      effects: [
        { property: 'ATK', formula: 'Math.floor(baseStatsLevel * skillLevel / 10)' },
        { property: 'Critical', formula: 'skillLevel * 4' }
      ]
    },
    // その他の武器の場合
    default: {
      conditions: ['メイン武器が弓・自動弓以外'],
      effects: [
        { property: 'ATK', formula: 'Math.floor(baseStatsLevel / 2 * skillLevel / 10)' },
        { property: 'Critical', formula: 'skillLevel * 4' }
      ]
    }
  },
  calculationFormula: `
    弓・自動弓装備時:
    - ATK = Math.floor(基本ステータスレベル × スキルレベル ÷ 10)
    - クリティカル = スキルレベル × 4
    
    その他武器装備時:
    - ATK = Math.floor(基本ステータスレベル ÷ 2 × スキルレベル ÷ 10)
    - クリティカル = スキルレベル × 4
  `,
  example: {
    baseStatsLevel: 305,
    skillLevel: 10,
    bowCalculation: 'ATK = Math.floor(305 × 10 ÷ 10) = Math.floor(305) = 305, Critical = 10 × 4 = 40',
    otherCalculation: 'ATK = Math.floor(305 ÷ 2 × 10 ÷ 10) = Math.floor(152.5 × 1) = Math.floor(152.5) = 152, Critical = 10 × 4 = 40',
    bowResult: 'ATK +305, Critical +40',
    otherResult: 'ATK +152, Critical +40'
  },
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateCamouflageEffects(
  skillLevel: number,
  baseStatsLevel: number,
  weaponType: MainWeaponType | null
): Partial<EquipmentProperties> {
  if (!skillLevel || skillLevel === 0) return {}
  
  const isBowWeapon = weaponType === 'bow' || weaponType === 'bowgun'
  
  // ATK計算：弓系は基本ステータスレベル × スキルレベル ÷ 10、その他は基本ステータスレベル ÷ 2 × スキルレベル ÷ 10（小数点切り捨て）
  const atkBonus = isBowWeapon 
    ? Math.floor(baseStatsLevel * skillLevel / 10)
    : Math.floor(baseStatsLevel / 2 * skillLevel / 10)
  
  return {
    ATK: atkBonus,
    Critical: skillLevel * 4
  }
}
```

## 実装詳細

### 武器種別効果システム

カムフラージュは武器種によって効果が変動する特殊なスキルです：

- **弓・自動弓装備時**: より高いATK上昇値
- **その他武器装備時**: ATK上昇値が半分

### 計算式の特徴

1. **基本ステータスレベル依存**: プレイヤーの基本ステータスレベルが効果値に影響
2. **小数点処理**: Math.floor()による切り捨て処理
3. **武器種判定**: 弓・自動弓か他の武器かで分岐

### 実装パターン

```typescript
// buffSkillCalculation.ts での実装例
export function calculateCamouflageEffects(
  skillLevel: number,
  baseStatsLevel: number,
  weaponType: MainWeaponType | null
): Partial<EquipmentProperties> {
  if (!skillLevel || skillLevel === 0) return {}
  
  const isBowWeapon = weaponType === 'bow' || weaponType === 'bowgun'
  
  const atkBonus = isBowWeapon 
    ? Math.floor(baseStatsLevel * skillLevel / 10)
    : Math.floor(baseStatsLevel / 2 * skillLevel / 10)
  
  return {
    ATK: atkBonus,
    Critical: skillLevel * 4
  }
}
```

## UI仕様

### レベル設定タイプ

- **パラメータ名**: スキルレベル
- **範囲**: 1-10
- **UI**: モーダル表示、+1/-1ボタン、直接入力
- **単位**: Lv

## 関連ファイル

- **メインドキュメント**: `../buff-skill-details-common.md`
- **実装ファイル**: `../../src/utils/buffSkillCalculation.ts`
- **データ定義**: `../../src/data/buffSkills.ts`
- **型定義**: `../../src/types/buffSkill.ts`

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2025-01-XX | ハンタースキル系統を個別ファイルに分離 | buff-skill-details-common.mdから移動 |