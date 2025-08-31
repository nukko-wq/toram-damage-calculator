# スカルシェイカー スキル追加仕様書

## 概要

AttackSkillFormに新しい攻撃スキル「スカルシェイカー」を追加するための詳細仕様書です。設計書`attack-skill-form.md`と`attack-skill-calculation.md`に基づいて、系統的にスキルデータを定義します。

## 基本情報

- **スキル名**: スカルシェイカー
- **スキルID**: `skull_shaker`
- **系統グループ**: `necromancer` (ネクロマンサー系統)
- **カテゴリ**: `necromancer` (ネクロマンサースキル)
- **武器種要件**: なし（全武器対応）
- **消費MP**: TBD (保留)
- **表示順序**: 303 (300番台: ネクロマンサー系統)

## データ構造定義

### AttackSkill オブジェクト

```typescript
{
  // 基本情報
  id: 'skull_shaker',
  name: 'スカルシェイカー',
  order: 303,                    // ネクロマンサー系統300番台
  systemGroup: 'necromancer',    // ネクロマンサー系統
  category: 'necromancer',       // ネクロマンサーカテゴリ
  weaponTypeRequirements: [], // 全武器対応
  
  // 消費・条件
  mpCost: TBD,                   // 保留
  
  // 表示用計算式説明
  multiplierFormula: 'TBD',      // 保留
  fixedDamageFormula: 'TBD',     // 保留
  
  // 攻撃情報
  hits: [
    {
      hitNumber: 1,
      attackType: 'TBD',           // 保留（physical/magical）
      referenceDefense: 'TBD',     // 保留（DEF/MDEF）
      referenceResistance: 'TBD',  // 保留（physical/magical）
      powerReference: 'TBD',       // 保留（ATK/MATK）
      
      // 威力・固定値
      multiplier: TBD,             // 保留
      fixedDamage: TBD,            // 保留
      
      // 慣れ設定
      adaptation: 'TBD',           // 保留
      adaptationGrant: 'TBD',      // 保留
      
      // 補正適用設定
      canUseUnsheathePower: false, // 抜刀威力適用不可
      canUseLongRange: false,      // ロングレンジ適用不可
      canUseShortRangePower: true, // 近距離威力適用可能
      canUseLongRangePower: false  // 遠距離威力適用不可
    }
  ]
}
```

## 計算仕様

### 計算タイプ
- **計算方式**: TBD（保留）
- **攻撃回数**: TBD（保留）
- **威力倍率**: TBD（保留）
- **固定ダメージ**: TBD（保留）
- **特殊計算**: TBD（保留）

## UI表示仕様

### スキル選択ドロップダウン
- **表示位置**: ネクロマンサー系統グループ内、order順で3番目に表示
- **表示名**: `スカルシェイカー`
- **武器種フィルタ**: 全武器装備時に表示

### スキル情報表示
```
📊 スカルシェイカー
　　カテゴリ: ネクロマンサー系 | 消費MP: TBD
　　威力参照: TBD | タイプ: TBD
　　慣れ参照: TBD | 慣れ付与: TBD
　　参照防御力: TBD | 参照耐性: TBD
　　距離威力: 近距離○ | 抜刀威力: × | ロングレンジ: ×

🎯 スキル威力値
　　攻撃回数: TBD
　　威力倍率: TBD
　　固定ダメージ: TBD
```

### 詳細情報
```
📋 詳細情報 [▼]
　　必要武器: なし（全武器対応）
　　前提スキル: なし
　　特殊効果: TBD
　　計算方式: TBD
　　備考: ネクロマンサー系統のスキル（仕様未確定）
```

## 実装状況

### 現在の状況
- 基本情報定義完了（スキル名、ID、系統、カテゴリ、武器種要件、表示順序）
- その他の仕様は保留中

### 保留項目
1. **消費MP**: 消費MP値の決定
2. **攻撃仕様**: 威力倍率、固定ダメージ、攻撃回数の決定
3. **攻撃タイプ**: 物理攻撃か魔法攻撃かの決定
4. **慣れ設定**: 慣れ参照・付与の決定
5. **計算方式**: 標準計算か特殊計算かの決定
6. **実装ファイル作成**: 実際のコードへの追加

## 備考

この仕様書はスカルシェイカースキルの基本枠組みを定義したものです。具体的な攻撃仕様（威力倍率、固定ダメージ、攻撃回数等）は今後の設計段階で決定します。ネクロマンサー系統の実装と合わせて、包括的なスキルシステムの一部として開発される予定です。

現在は基本的なフレームワークのみが完成しており、詳細な仕様が確定次第、トゥームスキルと同様の完全な実装が可能です。