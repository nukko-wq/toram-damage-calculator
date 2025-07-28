# シュートスキル系統詳細設計書

## 概要

シュートスキル系統（category: 'shoot'）の全武器種で使用可能なバフスキルの詳細仕様を記述します。
各スキルの効果計算式、パラメータ、UI表示形式を定義します。

## データ構造

```typescript
interface ShootBuffSkillDetail {
  id: string                    // data-key値
  name: string                 // 表示名
  category: 'shoot'            // スキル系統（シュート固定）
  type: BuffSkillType         // UI制御タイプ
  order: number               // 表示順序
  maxLevel?: number           // 最大レベル（デフォルト10）
  maxStack?: number           // 最大重ねがけ数
  description: string         // スキル説明
  effects: SkillEffect[]      // 効果リスト
  calculationFormula: string  // 計算式
  uiSettings: UISettings      // UI表示設定
  weaponRequirements?: WeaponRequirement[]  // 武器制限
  specialMechanics?: any      // 特殊機能
}
```

## シュートスキル一覧

### 2.1 ロングレンジ (LongRange)
```typescript
{
  id: 'LongRange',
  name: 'ロングレンジ',
  category: 'shoot',
  type: 'level',
  order: 302,
  maxLevel: 10,
  description: 'AttackSkillのロングレンジ(canUseLongRange)が有効な場合にパッシブ倍率を上昇させる',
  effects: [
    {
      property: 'PassiveDamage_Rate',
      formula: 'skillLevel',
      conditions: ['AttackSkillのcanUseLongRange=true']
    }
  ],
  calculationFormula: 'パッシブ倍率% = skillLevel',
  weaponRequirements: [
    {
      weaponType: 'all',
      description: '全ての武器で効果があります'
    }
  ],
  uiSettings: {
    parameterName: 'スキルレベル',
    parameterUnit: 'Lv',
    showInModal: true,
    quickToggle: false
  },
  specialMechanics: {
    longRangeCondition: true,
    note: 'canUseLongRangePowerとは違う条件です。AttackSkillのcanUseLongRangeプロパティが有効な場合のみ効果があります。'
  }
}
```

**計算例:**
- スキルレベル10: パッシブ倍率+10%
- スキルレベル5: パッシブ倍率+5%

**適用条件:**
- AttackSkillのcanUseLongRange=trueの場合のみ効果発動
- canUseLongRangePowerとは異なる条件

### 2.2 武士弓術 (ar1)
```typescript
{
  id: 'ar1',
  name: '武士弓術',
  category: 'shoot',
  type: 'toggle',
  order: 301,
  description: 'サブ武器の抜刀剣による武器ATKと安定率の向上',
  effects: [
    {
      property: 'WeaponATK',
      formula: 'subWeaponATK',
      conditions: ['メイン武器が弓', 'サブ武器が抜刀剣']
    },
    {
      property: 'Stability_Rate',
      formula: 'Math.floor(subWeaponStability / 4)',
      conditions: ['メイン武器が弓', 'サブ武器が抜刀剣']
    }
  ],
  calculationFormula: 'WeaponATK = base + サブ武器の武器ATK, Stability% = base + Math.floor(サブ武器の安定率 / 4)',
  weaponRequirements: [
    {
      weaponType: 'bow',
      subWeaponType: 'katana',
      description: 'メイン武器が弓でサブ武器が抜刀剣で効果があります'
    }
  ],
  uiSettings: {
    parameterName: 'ON/OFF',
    showInModal: false,
    quickToggle: true
  }
}
```

**計算例:**
- サブ武器ATK300の抜刀剣: WeaponATK+300
- サブ武器安定率120の抜刀剣: Stability%+30 (120÷4=30)

**適用条件:**
- メイン武器が弓装備時のみ有効
- サブ武器が抜刀剣装備時のみ有効
- 両条件を満たす場合のみ効果発動

## 実装仕様

### UI統合
- BuffSkillFormでの表示・操作
- ロングレンジ: レベル型UI（1-10選択）
- 武士弓術: トグル型UI（ON/OFF）

### 計算エンジン統合
- `calculateLongRangePassiveMultiplier()` 関数によるパッシブ倍率計算
- `calculateArcheryEffects()` 関数による武士弓術効果計算
- `getShootSkillPassiveMultiplier()` 統合関数
- `getArcheryEffects()` 統合関数

### データ統合
- COMMON_BUFF_SKILLS（ロングレンジ）
- NEARLY_COMMON_SKILLS（武士弓術 - 素手以外対応）
- order: 301-302（シュート系統内での順序）
- category: 'shoot'での分類

## 注意事項

### ロングレンジ
- AttackSkillのcanUseLongRangeプロパティに完全依存
- canUseLongRangePowerとは異なる条件
- パッシブ倍率への加算効果（スキルレベル = 効果%）

### 武士弓術
- メイン武器とサブ武器の両方の条件チェックが必要
- サブ武器のステータス値を直接参照
- 安定率は小数点以下切り捨て（Math.floor）
- 素手では使用不可（NEARLY_COMMON_SKILLSに分類）