# クリスタルデータベース設計

## ファイル構成・データフロー
**初期データ配置**:
- **プリセットデータ**: `src/data/crystals.ts`（TypeScript静的ファイル）

**アプリ起動時の処理**:
```
アプリ起動 → プリセットTypeScriptモジュールを読み込み → LocalStorageにコピー → 以降はLocalStorageから参照
```

**TypeScript移行の利点**:
- EquipmentPropertiesインターフェースによる厳密な型チェック
- CrystalTypeとPresetCrystalの型安全性保証
- エディタでの自動補完とプロパティ検証
- コンパイル時エラー検出によるデータ整合性確保

**ローカルストレージキー**:
- **プリセットクリスタル（コピー済み）**: LocalStorage (`preset_crystals`)
- **ユーザーカスタムデータ**: LocalStorage (`custom_crystals`)
- **統合アクセス**: 両方のデータを統一的に管理

## クリスタル型定義

### 基本型定義

```typescript
export type CrystalType = 
  | 'weapon'
  | 'armor' 
  | 'additional'
  | 'special'
  | 'normal'
```

### プリセットクリスタルインターフェース（初期配置用）

```typescript
export interface PresetCrystal {
  id: string
  name: string
  type: CrystalType
  properties: Partial<EquipmentProperties>
  description?: string
  memo1?: string       // 装備条件メモ1（例: "盾装備時: ヘイト-50%"）
  memo2?: string       // 装備条件メモ2（例: "短剣装備時: クリティカルダメージ+1%"）
}
```

### ユーザーカスタムクリスタル

```typescript
export interface UserCrystal {
  id: string
  name: string
  type: CrystalType
  properties: Partial<EquipmentProperties>
  description?: string
  // memo1, memo2 は含まない（ユーザー作成時の複雑性回避）
  isCustom: true
  createdAt: string
  updatedAt: string
  isFavorite?: boolean
}
```

### LocalStorage用拡張インターフェース

```typescript
// 共通フィールド（プリセット由来）
interface LocalStoragePresetItemBase {
  isPreset: true
  isFavorite: boolean
  isModified: boolean
  modifiedAt?: string
  originalChecksum?: string
  createdAt: string
  updatedAt: string
}

// 共通フィールド（ユーザーカスタム）
interface LocalStorageCustomItemBase {
  isPreset: false
  isFavorite: boolean
  isModified: boolean
  createdAt: string
  updatedAt: string
}

// ローカルストレージクリスタル（プリセット由来）
export interface LocalStorageCrystal
  extends PresetCrystal,
    LocalStoragePresetItemBase {
  description?: string
  memo1?: string
  memo2?: string
}

// カスタムクリスタル（統合型）
export interface CustomCrystal
  extends PresetCrystal,
    LocalStorageCustomItemBase {
  isCustom: true
  description?: string
  // memo1, memo2 は継承されない
}
```

### 統合型（アプリ内で使用するクリスタルデータ型）

```typescript
export type Crystal = LocalStorageCrystal | CustomCrystal
```

## クリスタルタイプ別装着可能スロット

- **weapon**: メイン装備のクリスタルスロットのみ（weapon1, weapon2）
- **armor**: 体装備のクリスタルスロットのみ（armor1, armor2）
- **additional**: 追加装備のクリスタルスロットのみ（additional1, additional2）
- **special**: 特殊装備のクリスタルスロットのみ（special1, special2）
- **normal**: 全てのクリスタルスロットに装着可能

```typescript
export interface CrystalSlots {
  weapon1: string | null
  weapon2: string | null
  armor1: string | null
  armor2: string | null
  additional1: string | null
  additional2: string | null
  special1: string | null
  special2: string | null
}
```

## メモ機能設計

### 概要
プリセットクリスタルのみでメモ機能を提供。開発者が設定する装備条件や特殊効果の覚え書きとして使用。

### 用途例
- **memo1**: "盾装備時: ヘイト-50%"
- **memo2**: "短剣装備時: クリティカルダメージ+1%"

### 設計方針
- **プリセットのみ**: ユーザーカスタムクリスタルには含めない
- **自由記述**: 複雑な条件分岐システムではなく、テキストメモとして実装
- **オプショナル**: 必須フィールドではない

## プロパティ設定値範囲

クリスタルのプロパティ値設定範囲は装備と同様：
- **%系プロパティ**: -1000 ～ 1000
- **固定値プロパティ**: -99999 ～ 99999

## データ管理API

### データベース関数
- `getAllCrystals()`: プリセット + カスタムを統合して取得
- `getPresetCrystals()`: プリセットクリスタルのみ取得
- `getUserCrystals()`: ユーザーカスタムクリスタル取得
- `saveUserCrystal()`: カスタムクリスタル保存
- `updateUserCrystal()`: カスタムクリスタル更新
- `deleteUserCrystal()`: カスタムクリスタル削除

### データ統合
- プリセットとカスタムは同一のインターフェースで統一管理
- タイムスタンプ管理（`createdAt`, `updatedAt`）
- お気に入り機能（`isFavorite`）
- 変更追跡（`isModified`, `modifiedAt`）

## 技術的特徴

### 型安全性
- TypeScript strict modeでの厳密な型チェック
- EquipmentPropertiesによる統一的なプロパティ管理
- コンパイル時エラー検出

### パフォーマンス
- LocalStorageによる高速アクセス
- 重複除去によるメモリ効率化
- 必要時のみデータ読み込み

### 拡張性
- 新しいクリスタルタイプの追加が容易
- プロパティシステムの一元管理
- プリセット・カスタムの統一API
- メモ機能の段階的拡張対応