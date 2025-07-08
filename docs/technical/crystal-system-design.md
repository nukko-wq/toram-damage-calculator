# クリスタシステム設計書

## 1. 概要

現在のクリスタシステムではmemo1,memo2で装備条件付きの効果を文字列として表示しているが、これをシステム内で自動判定・適用する仕組みに改良する。

## 2. 現在の問題点

- memo1,memo2は単なる文字列で、実際の効果計算には反映されない
- 装備条件の判定が手動で、計算漏れが発生する可能性がある
- 新しい条件付き効果の追加が困難

## 3. 条件付き効果の自動適用システム設計

### 3.1 データ構造の拡張

```typescript
// 装備条件の定義（calculator.tsの型定義を使用）
export type EquipmentCondition =
  | { type: 'mainWeapon'; weaponType: WeaponType }
  | { type: 'subWeapon'; weaponType: SubWeaponType }
  | { type: 'armor'; armorType: ArmorType }

// 条件付き効果の定義
export interface ConditionalEffect {
  condition: EquipmentCondition
  properties: Partial<EquipmentProperties>
  description: string
}

// 拡張されたクリスタル定義
export interface PresetCrystal {
  id: string
  name: string
  type: CrystalType
  properties: Partial<EquipmentProperties>
  description?: string
  memo1?: string  // 後方互換性のため残す
  memo2?: string  // 後方互換性のため残す
  conditionalEffects?: ConditionalEffect[]  // 新しい条件付き効果
}
```

### 3.2 条件判定ロジック

```typescript
// 装備条件の判定
export function checkEquipmentCondition(
  condition: EquipmentCondition,
  equipmentState: EquipmentSlots
): boolean {
  switch (condition.type) {
    case 'mainWeapon':
      return equipmentState.main.weaponType === condition.weaponType
    case 'subWeapon':
      return equipmentState.subWeapon.weaponType === condition.weaponType
    case 'armor':
      return equipmentState.body.armorType === condition.armorType
    default:
      return false
  }
}

// 条件付き効果の適用
export function applyConditionalCrystalEffects(
  crystal: PresetCrystal,
  equipmentState: EquipmentSlots
): Partial<EquipmentProperties> {
  let effectiveProperties = { ...crystal.properties }
  
  if (crystal.conditionalEffects) {
    for (const effect of crystal.conditionalEffects) {
      if (checkEquipmentCondition(effect.condition, equipmentState)) {
        effectiveProperties = mergeProperties(effectiveProperties, effect.properties)
      }
    }
  }
  
  return effectiveProperties
}
```

### 3.3 具体的な実装例

```typescript
// 黒衣の聖誕姫の新しい定義
{
  id: '69d815eb-a2a1-486e-85f4-45d31f0ed2bd',
  name: '黒衣の聖誕姫',
  type: 'weapon',
  properties: {
    ATK_Rate: 9,
    STR_Rate: 3,
    MATK_Rate: 9,
    INT_Rate: 3,
    LongRangeDamage_Rate: -6,
  },
  memo1: '盾装備時: ヘイト-50%',
  memo2: '短剣装備時: クリティカルダメージ+1%',
  conditionalEffects: [
    {
      condition: { type: 'subWeapon', weaponType: '盾' },
      properties: { Aggro_Rate: -50 },
      description: '盾装備時: ヘイト-50%'
    },
    {
      condition: { type: 'subWeapon', weaponType: 'ナイフ' },
      properties: { CriticalDamage_Rate: 1 },
      description: '短剣装備時: クリティカルダメージ+1%'
    }
  ]
}

// ビルロッシュの新しい定義
{
  id: '4d5e6f78-9012-3456-789a-bcdef0123456',
  name: 'ビルロッシュ',
  type: 'armor',
  properties: {
    HP_Rate: 60,
    PhysicalResistance_Rate: -7,
    MagicalResistance_Rate: -7,
  },
  memo1: '片手剣装備時：ヘイト+15%',
  memo2: '手甲装備時：ヘイト+15%',
  conditionalEffects: [
    {
      condition: { type: 'mainWeapon', weaponType: '片手剣' },
      properties: { Aggro_Rate: 15 },
      description: '片手剣装備時：ヘイト+15%'
    },
    {
      condition: { type: 'mainWeapon', weaponType: '手甲' },
      properties: { Aggro_Rate: 15 },
      description: '手甲装備時：ヘイト+15%'
    }
  ]
}

// 機械紳メイプルの新しい定義
{
  id: '78901234-5678-9abc-def0-123456789012',
  name: '機械紳メイプル',
  type: 'special',
  properties: {
    MP: 200,
    ShortRangeDamage_Rate: 10,
    PhysicalResistance_Rate: 10,
    MagicalResistance_Rate: 10,
    AilmentResistance_Rate: 5,
    FractionalBarrier: 5,
  },
  memo1: '重鎧装備時: 物理耐性+15%',
  conditionalEffects: [
    {
      condition: { type: 'armor', armorType: 'heavy' },
      properties: { PhysicalResistance_Rate: 15 },
      description: '重鎧装備時: 物理耐性+15%'
    }
  ]
}

// 黒リグシーの新しい定義
{
  id: '89012345-6789-abcd-ef01-23456789abcd',
  name: '黒リグシー',
  type: 'special',
  properties: {
    AttackMPRecovery: 20,
    AttackSpeed: 300,
    AilmentResistance_Rate: 10,
    Aggro_Rate: 40,
  },
  memo1: '軽鎧装備時：バリア速度+10%',
  memo2: '重鎧装備時：割合バリア+10%',
  conditionalEffects: [
    {
      condition: { type: 'armor', armorType: 'light' },
      properties: { BarrierSpeed_Rate: 10 },
      description: '軽鎧装備時：バリア速度+10%'
    },
    {
      condition: { type: 'armor', armorType: 'heavy' },
      properties: { FractionalBarrier: 10 },
      description: '重鎧装備時：割合バリア+10%'
    }
  ]
}
```

## 4. 計算エンジンとの統合

### 4.1 計算フロー

1. 装備されたクリスタルを取得
2. 各クリスタルの条件付き効果を判定
3. 条件を満たす効果を基本効果に加算
4. 最終的な効果を計算に反映

### 4.2 リアルタイム更新

```typescript
// 装備変更時の自動再計算
export function recalculateCrystalEffects(
  crystals: CrystalSlots,
  equipmentState: EquipmentSlots
): Partial<EquipmentProperties> {
  let totalEffects: Partial<EquipmentProperties> = {}
  
  // 各スロットのクリスタルを処理
  Object.values(crystals).forEach(slots => {
    slots.forEach(crystal => {
      if (crystal) {
        const effectiveProperties = applyConditionalCrystalEffects(crystal, equipmentState)
        totalEffects = mergeProperties(totalEffects, effectiveProperties)
      }
    })
  })
  
  return totalEffects
}
```

## 5. UI表示の改善

### 5.1 条件付き効果の表示

- 現在の装備状態で有効な効果を緑色で表示
- 無効な効果はグレーアウト表示
- 効果の適用条件を明確に表示

### 5.2 プレビュー機能

```typescript
// 装備変更時のプレビュー表示
export function previewCrystalEffects(
  crystal: PresetCrystal,
  currentEquipment: EquipmentSlots,
  proposedEquipment: EquipmentSlots
): {
  current: Partial<EquipmentProperties>
  proposed: Partial<EquipmentProperties>
  changes: string[]
} {
  const currentEffects = applyConditionalCrystalEffects(crystal, currentEquipment)
  const proposedEffects = applyConditionalCrystalEffects(crystal, proposedEquipment)
  
  return {
    current: currentEffects,
    proposed: proposedEffects,
    changes: calculateEffectChanges(currentEffects, proposedEffects)
  }
}
```

## 6. 武器種・防具種の分類

### 6.1 WeaponType（メイン武器）
- '片手剣', '双剣', '両手剣', '手甲', '旋風槍', '抜刀剣', '弓', '自動弓', '杖', '魔導具', '素手'

### 6.2 SubWeaponType（サブ武器）
- 'ナイフ', '矢', '盾', '魔道具', '手甲', '巻物', '片手剣', '抜刀剣', 'なし'

### 6.3 ArmorType（防具改造）
- 'normal', 'heavy', 'light'

## 7. 実装手順

### 7.1 Phase 1: 型定義の拡張
- `EquipmentCondition`、`ConditionalEffect`の型定義追加
- `PresetCrystal`インターフェースの拡張

### 7.2 Phase 2: 条件判定ロジック
- `checkEquipmentCondition`関数の実装
- `applyConditionalCrystalEffects`関数の実装

### 7.3 Phase 3: データ移行
- 既存のmemo1,memo2を`conditionalEffects`に変換
- 新しいフォーマットでのクリスタルデータ更新

### 7.4 Phase 4: 計算エンジン統合
- `recalculateCrystalEffects`の実装
- 装備変更時の自動再計算機能

### 7.5 Phase 5: UI更新
- 条件付き効果の表示機能
- プレビュー機能の実装

## 8. 後方互換性

- 既存のmemo1,memo2フィールドは保持
- 新しいシステムと並行して動作
- 段階的な移行が可能

## 9. テストケース

### 9.1 基本的な条件判定
- サブ武器が盾装備時の効果適用（黒衣の聖誕姫）
- サブ武器がナイフ装備時の効果適用（黒衣の聖誕姫）
- 重鎧装備時の効果適用（機械紳メイプル、黒リグシー）
- 軽鎧装備時の効果適用（黒リグシー）
- 片手剣装備時の効果適用（ビルロッシュ）
- 手甲装備時の効果適用（ビルロッシュ）

### 9.2 複数条件の組み合わせ
- 複数の条件付き効果が同時に適用される場合
- 条件の優先度処理

### 9.3 装備変更時の動作
- 装備変更時の効果の付与/除去
- リアルタイム計算の正確性

## 10. パフォーマンス考慮事項

- 条件判定の最適化
- 不要な再計算の回避
- キャッシュ機能の実装

## 11. 将来の拡張性

- 新しい条件タイプの追加
- より複雑な条件式のサポート
- 装備セット効果との統合

---

この設計により、現在のmemo1,memo2による手動表示から、システムによる自動判定・適用に移行できます。段階的な実装により、既存の機能を維持しながら新機能を追加できます。