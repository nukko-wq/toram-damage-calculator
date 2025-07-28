# ミンストレルスキル系統詳細設計書

## 概要

ミンストレルスキル系統（category: 'minstrel'）の全武器種で使用可能なバフスキルの詳細仕様を記述します。
各スキルの効果計算式、パラメータ、UI表示形式を定義します。

## データ構造

```typescript
interface MinstrelBuffSkillDetail {
  id: string                    // data-key値
  name: string                 // 表示名
  category: 'minstrel'         // スキル系統（ミンストレル固定）
  type: BuffSkillType         // UI制御タイプ
  order: number               // 表示順序
  maxLevel?: number           // 最大レベル（デフォルト10）
  maxStack?: number           // 最大重ねがけ数
  description: string         // スキル説明
  effects: SkillEffect[]      // 効果リスト
  calculationFormula: string  // 計算式
  uiSettings: UISettings      // UI表示設定
  specialMechanics?: any      // 特殊機能
}
```

## ミンストレルスキル一覧

### 17.1 熱情の歌 (IsHotKnows)
```typescript
{
  id: 'IsHotKnows',
  name: '熱情の歌',
  category: 'minstrel',
  type: 'stack',
  order: 2401,
  maxStack: 10,
  description: 'DamagePreviewの属性攻撃設定に応じて属性有利率が変動',
  effects: [
    {
      property: 'ElementAdvantage_Rate',
      formula: 'stackCount * 1.5',
      conditions: ['DamagePreview属性攻撃=有(有利)']
    },
    {
      property: 'ElementAdvantage_Rate',
      formula: '-(stackCount * 1.5)',
      conditions: ['DamagePreview属性攻撃=不利属性']
    }
  ],
  calculationFormula: '属性有利% = ±(スタック数 × 1.5) [有利: +, 不利: -]',
  weaponRequirements: [
    {
      weaponType: 'all',
      description: '全ての武器で効果があります'
    }
  ],
  uiSettings: {
    parameterName: 'スタック数',
    parameterUnit: '回',
    showInModal: true,
    quickToggle: false
  },
  specialMechanics: {
    damagePreviewIntegration: true,
    elementAdvantageConditions: {
      advantageous: '+1.5 × スタック数',
      disadvantageous: '-1.5 × スタック数',
      other: '効果なし',
      none: '効果なし'
    }
  }
}
```

**計算例:**
- スタック数10、属性攻撃=有(有利): +15%の属性有利率
- スタック数10、属性攻撃=不利属性: -15%の属性有利率
- スタック数5、属性攻撃=有(有利): +7.5%の属性有利率

**適用条件:**
- DamagePreviewの属性攻撃設定に連動
- 有利属性設定時: 正の効果
- 不利属性設定時: 負の効果
- その他・無属性設定時: 効果なし

## 実装仕様

### UI統合
- BuffSkillFormでの表示・操作
- スタック型UI（1-10選択）
- DamagePreviewとの連携機能

### 計算エンジン統合
- `calculateHotKnowsEffects()` 関数による効果計算
- PowerOptionsのelementAttack設定との連動
- ElementAdvantage_Rateプロパティへの反映

### データ統合
- COMMON_BUFF_SKILLSへの登録済み
- order: 2401（ミンストレル系統内での順序）
- category: 'minstrel'での分類

## 注意事項

- 熱情の歌の効果はDamagePreviewの属性攻撃設定に完全依存
- 属性攻撃が「その他」「なし」の場合は効果が発動しない
- スタック数による効果の増減は線形（1.5%/スタック）
- 不利属性時は負の効果となり、属性有利率が下がる