# マーシャルスキル系統詳細設計書

## 概要

マーシャルスキル系統（category: 'martial'）の手甲固有バフスキルの詳細仕様を記述します。
各スキルの効果計算式、パラメータ、UI表示形式を定義します。

## データ構造

```typescript
interface MartialBuffSkillDetail {
  id: string                    // data-key値
  name: string                 // 表示名
  category: 'martial'          // スキル系統（マーシャル固定）
  type: BuffSkillType         // UI制御タイプ
  order: number               // 表示順序
  maxLevel?: number           // 最大レベル（デフォルト10）
  maxStack?: number           // 最大重ねがけ数
  description: string         // スキル説明
  effects: SkillEffect[]      // 効果リスト
  calculationFormula: string  // 計算式
  uiSettings: UISettings      // UI表示設定
}
```

## マーシャルスキル一覧

### 1.1 体術鍛錬 (ma1)
```typescript
{
  id: 'ma1',
  name: '体術鍛錬',
  category: 'martial',
  type: 'level',
  order: 501,
  maxLevel: 10,
  description: '手甲装備時の攻撃速度を上昇させる',
  effects: [
    {
      property: 'AttackSpeed',
      formula: 'skillLevel * 10',
      conditions: ['手甲装備時']
    },
    {
      property: 'AttackSpeed_Rate',
      formula: 'Math.abs(skillLevel)',
      conditions: ['手甲装備時']
    }
  ],
  calculationFormula: `
    手甲装備時:
    - AttackSpeed = skillLevel × 10
    - AttackSpeed_Rate = |skillLevel|%
  `,
  weaponRequirements: [
    {
      weaponType: 'knuckle',
      include: true
    }
  ],
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculatePhysicalTrainingEffects(
  skillLevel: number,
  weaponType: MainWeaponType | null
): Partial<EquipmentProperties> {
  if (!weaponType || weaponType !== 'knuckle' || skillLevel <= 0) return {}

  // 攻撃速度効果計算
  const attackSpeed = skillLevel * 10
  const attackSpeedRate = Math.abs(skillLevel)

  return {
    AttackSpeed: attackSpeed,
    AttackSpeed_Rate: attackSpeedRate
  }
}
```

**計算例:**
- スキルレベル5の場合: AttackSpeed +50, AttackSpeed_Rate +5%
- スキルレベル10の場合: AttackSpeed +100, AttackSpeed_Rate +10%

**適用条件:**
- メイン武器が手甲装備時のみ効果発動

### 1.2 強力な追撃 (ma2-1)
```typescript
{
  id: 'ma2-1',
  name: '強力な追撃',
  category: 'martial',
  type: 'level',
  order: 502,
  maxLevel: 10,
  description: '手甲装備時の追撃効果を上昇させる',
  effects: [
    // TODO: 追撃効果の詳細設計が必要
  ],
  calculationFormula: `
    手甲装備時:
    - 追撃効果 = 詳細設計待ち
  `,
  weaponRequirements: [
    {
      weaponType: 'knuckle',
      include: true
    }
  ],
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}
```

### 1.3 アシュラオーラ (ma2)
```typescript
{
  id: 'ma2',
  name: 'アシュラオーラ',
  category: 'martial',
  type: 'toggle',
  order: 503,
  description: '手甲装備時の特殊効果を発動させる',
  effects: [
    // TODO: アシュラオーラ効果の詳細設計が必要
  ],
  calculationFormula: `
    手甲装備時:
    - 特殊効果 = 詳細設計待ち
  `,
  weaponRequirements: [
    {
      weaponType: 'knuckle',
      include: true
    }
  ],
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}
```

## 実装ステータス

- [x] 体術鍛錬 (ma1) - 設計・実装完了
- [ ] 強力な追撃 (ma2-1) - 設計待ち（効果詳細が不明）
- [ ] アシュラオーラ (ma2) - 設計待ち（効果詳細が不明）

## 特徴

- **武器種制限**: 全てのマーシャルスキルは手甲装備時のみ効果発動
- **攻撃速度特化**: 体術鍛錬は攻撃速度の向上に特化
- **レベル依存効果**: 体術鍛錬はスキルレベルに比例して効果が上昇

## 関連ファイル

- **メインドキュメント**: `../buff-skill-details.md`
- **実装ファイル**: `../../src/utils/buffSkillCalculation/categories/martialSkills.ts`
- **データ定義**: `../../src/data/buffSkills/mainWeapons/knuckle.ts`

## 変更履歴

| 日付 | 変更内容 | 担当者 |
|------|----------|--------|
| 2025-01-XX | マーシャルスキル系統を個別ファイルに分離 | buff-skill-details.mdから移動 |