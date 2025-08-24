# オーラブレード スキル追加仕様書

## 概要

AttackSkillFormに新しい攻撃スキル「オーラブレード」を追加するための詳細仕様書です。設計書`attack-skill-form.md`と`attack-skill-calculation.md`に基づいて、系統的にスキルデータを定義します。

## 基本情報

- **スキル名**: オーラブレード
- **スキルID**: `aura_blade`
- **系統グループ**: `sword` (剣系統)
- **カテゴリ**: `blade` (ブレードスキル)
- **武器種要件**: `片手剣`, `双剣`, `両手剣`
- **消費MP**: 保留
- **表示順序**: 104 (ムーンスラッシュの後)

## データ構造定義

### AttackSkill オブジェクト

```typescript
{
  // 基本情報
  id: 'aura_blade',
  name: 'オーラブレード',
  order: 104,                   // ムーンスラッシュの後
  systemGroup: 'sword',          // 剣系統
  category: 'blade',             // ブレードカテゴリ
  weaponTypeRequirements: ['片手剣', '双剣', '両手剣'],
  
  // 消費・条件
  mpCost: 保留,
  
  // 表示用計算式説明
  multiplierFormula: '1500%',     // 固定倍率
  fixedDamageFormula: '200',      // 固定値
  
  // 攻撃情報（1hit攻撃）
  hits: [
    {
      hitNumber: 1,
      attackType: 'physical',
      referenceDefense: 'DEF',
      referenceResistance: 'physical',
      powerReference: 'ATK',
      
      // 表示用倍率・固定値
      multiplier: 1500,          // 基本倍率1500%
      fixedDamage: 200,          // 基本固定値200
      
      // 慣れ設定
      adaptation: 'physical',     // 物理慣れ参照
      adaptationGrant: 'physical',  // 物理慣れ付与
      
      // 補正適用設定
      canUseUnsheathePower: false,  // 抜刀威力適用不可
      canUseLongRange: true,        // ロングレンジ適用可能
      canUseShortRangePower: true,  // 近距離威力適用可能
      canUseLongRangePower: true    // 遠距離威力適用可能
    }
  ]
}
```

## 計算仕様

### 計算タイプ
- **計算方式**: 基本計算（StandardCalculator使用）
- **1撃目**: 固定1500%、固定200ダメージ
- **特殊計算**: なし

### 計算処理

1. **基本倍率**: 1500%
2. **基本固定値**: 200
3. **計算フロー**: 標準的な物理攻撃計算に従う

## 実装方針

### データ登録
1. `src/data/attackSkills.ts`にスキルデータを追加
2. 標準的な計算処理のため、専用のCalculatorクラスは不要
3. `StandardCalculator`を使用した標準計算

### 表示・入力制御
- 武器種要件: 片手剣、双剣、両手剣のみで選択可能
- 1撃攻撃のため、タブ表示は1撃目のみ

### 将来の拡張ポイント
1. **消費MP**: 最終仕様確定時に設定
2. **表示順序**: 他スキルとの並び順確定時に設定
3. **特殊効果**: 追加効果がある場合はCalculatorクラス作成を検討

## 備考

- 現在は基本的な1撃物理攻撃スキルとして設計
- 倍率1500%、固定値200の基本仕様のみ確定
- その他の詳細仕様は保留状態で、後日追加実装予定