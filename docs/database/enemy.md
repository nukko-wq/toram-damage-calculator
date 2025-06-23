# 敵情報データベース設計

## ファイル構成・データフロー
**初期データ配置**:
- **プリセットデータ**: `src/data/enemies.json`（静的ファイル）

**アプリ起動時の処理**:
```
アプリ起動 → プリセットJSONを読み込み → LocalStorageにコピー → 以降はLocalStorageから参照
```

**ローカルストレージキー**:
- **プリセット敵情報（コピー済み）**: LocalStorage (`preset_enemies`)
- **ユーザーカスタムデータ**: LocalStorage (`custom_enemies`)
- **統合アクセス**: 両方のデータを統一的に管理

## JSON構造

```json
{
  "enemies": {
    "mob": [敵情報配列],
    "fieldBoss": [敵情報配列],
    "boss": [敵情報配列],
    "raidBoss": [敵情報配列]
  }
}
```

## 敵情報構造

**プリセット敵情報インターフェース**（初期配置用）:
```typescript
interface PresetEnemy {
  id: string                    // 一意識別子
  name: string                  // 敵名
  level: number                 // レベル (1-999)
  stats: EnemyStats            // 基本ステータス
  category: EnemyCategory      // 敵カテゴリ
}
```

**ローカルストレージ敵情報インターフェース**（拡張版）:
```typescript
interface LocalStorageEnemy extends PresetEnemy {
  isPreset: boolean            // プリセット由来かどうか
  isFavorite: boolean          // お気に入り設定
  createdAt: string           // 作成日時 (ISO string)
  updatedAt: string           // 更新日時 (ISO string)
}

// 統合型（アプリ内で使用する敵情報データ型）
type Enemy = LocalStorageEnemy

interface EnemyStats {
  DEF: number                  // 物理防御力 (0-9999)
  MDEF: number                 // 魔法防御力 (0-9999)
  physicalResistance: number   // 物理耐性% (-100-100)
  magicalResistance: number    // 魔法耐性% (-100-100)
  resistCritical: number       // クリティカル耐性 (0-999) ※プリセット敵情報では0、ユーザーが調整可能
  requiredHIT: number          // 必要HIT (0-9999) ※プリセット敵情報では0、ユーザーが調整可能
}

type EnemyCategory = 'mob' | 'fieldBoss' | 'boss' | 'raidBoss'
```

## mainWeapon装備の武器ステータス仕様

mainWeaponカテゴリの装備では、`weaponStats`フィールドで武器の基本ステータスを定義できます：

- **設定あり**: 装備データで定義された値を使用
- **設定なし**: WeaponFormで入力された値を使用
- **優先度**: `weaponStats` > WeaponForm入力値

```typescript
// 例：武器ステータスが設定された装備
{
  "id": "legendary_sword",
  "name": "レジェンダリーソード",
  "weaponStats": {
    "ATK": 500,
    "stability": 90,
    "refinement": 15
  },
  "properties": {
    "ATK_Rate": 20,
    "Critical_Rate": 15
  }
}

// 例：武器ステータスが未設定の装備（WeaponFormの値を使用）
{
  "id": "basic_sword",
  "name": "ベーシックソード",
  "properties": {
    "ATK%": 10 
  }
}
```