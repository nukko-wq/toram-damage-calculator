# ブレードスキル系統詳細設計書

## 概要

ブレードスキル系統（category: 'blade'）の全武器種で使用可能なバフスキルの詳細仕様を記述します。
各スキルの効果計算式、パラメータ、UI表示形式を定義します。

## データ構造

```typescript
interface BladeBuffSkillDetail {
  id: string                    // data-key値
  name: string                 // 表示名
  category: 'blade'            // スキル系統（ブレード固定）
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

## ブレードスキル一覧

### 0.1 ブレードマスタリ (Ms-blade)
```typescript
{
  id: 'Ms-blade',
  name: 'ブレードマスタリ',
  category: 'mastery',
  type: 'level',
  order: 101,
  maxLevel: 10,
  description: '片手剣・両手剣・双剣装備時に武器ATKとATKを上昇させる',
  effects: [
    {
      property: 'WeaponATK_Rate',
      formula: 'skillLevel * 3',
      conditions: ['片手剣・両手剣・双剣装備時']
    },
    {
      property: 'ATK_Rate',
      formula: 'skillLevel >= 8 ? 3 : skillLevel >= 3 ? 2 : 1',
      conditions: ['片手剣・両手剣・双剣装備時']
    }
  ],
  calculationFormula: 'WeaponATK% = skillLevel × 3, ATK% = Lv1-2:1, Lv3-7:2, Lv8-10:3',
  weaponRequirements: [
    { weaponType: '片手剣', include: true },
    { weaponType: '両手剣', include: true },
    { weaponType: '双剣', include: true }
  ],
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  }
}

// 実装用の効果計算関数
function calculateBladeMasteryEffects(
  skillLevel: number,
  weaponType: MainWeaponType | null
): Partial<EquipmentProperties> {
  const bladeWeapons: MainWeaponType[] = [
    'oneHandSword',
    'twoHandSword',
    'dualSword',
  ]
  if (!weaponType || !bladeWeapons.includes(weaponType) || skillLevel <= 0)
    return {}

  // WeaponATK%計算
  const weaponATKRate = skillLevel * 3

  // ATK%計算（スキルレベル別）
  let atkRate = 0
  if (skillLevel >= 1 && skillLevel <= 2) {
    atkRate = 1
  } else if (skillLevel >= 3 && skillLevel <= 7) {
    atkRate = 2
  } else if (skillLevel >= 8 && skillLevel <= 10) {
    atkRate = 3
  }

  return {
    WeaponATK_Rate: weaponATKRate,
    ATK_Rate: atkRate,
  }
}
```

### 1.1 ウォークライ (IsWarcry)
```typescript
{
  id: 'IsWarcry',
  name: 'ウォークライ',
  category: 'blade',
  type: 'toggle',
  order: 201,
  description: '攻撃力と移動速度を上昇させる',
  effects: [
    {
      property: 'ATK',
      formula: '+300',
      conditions: []
    },
    {
      property: 'MotionSpeed_Rate',
      formula: '+50',
      conditions: []
    }
  ],
  calculationFormula: 'ATK = base + 300, 行動速度% = base + 50',
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}

// 実装用の効果計算関数
function calculateWarcryEffects(
  isEnabled: boolean
): Partial<EquipmentProperties> {
  if (!isEnabled) return {}
  
  return {
    ATK: 300,
    MotionSpeed_Rate: 50
  }
}
```


## 実装ステータス

- [x] ブレードマスタリ (Ms-blade) - 設計・実装完了
- [x] ウォークライ (IsWarcry) - 設計完了

## 特徴

- **武器種制限**: ブレードマスタリは片手剣・両手剣・双剣装備時のみ効果発動
- **段階的効果**: ブレードマスタリのATK%効果はスキルレベル帯によって段階的に変化
- **固定効果**: ウォークライは武器種に関係なく固定値で効果発動

## 関連ファイル

- メインドキュメント: `../buff-skill-details.md`
- 実装ファイル: `../../src/utils/buffSkillCalculation/categories/masterySkills.ts`
- データ定義: `../../src/data/buffSkills/mainWeapons/`