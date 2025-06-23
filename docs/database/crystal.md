# クリスタルデータベース設計

## ファイル構成・データフロー
**初期データ配置**:
- **プリセットデータ**: `src/data/crystals.json`（静的ファイル）

**アプリ起動時の処理**:
```
アプリ起動 → プリセットJSONを読み込み → LocalStorageにコピー → 以降はLocalStorageから参照
```

**ローカルストレージキー**:
- **プリセットクリスタル（コピー済み）**: LocalStorage (`preset_crystals`)
- **ユーザーカスタムデータ**: LocalStorage (`custom_crystals`)
- **統合アクセス**: 両方のデータを統一的に管理

## クリスタル構造

**プリセットクリスタルインターフェース**（初期配置用）:
```typescript
interface PresetCrystal {
  id: string
  name: string
  type: CrystalType
  properties: Partial<EquipmentProperties>
}
```

**ローカルストレージクリスタルインターフェース**（拡張版）:
```typescript
interface LocalStorageCrystal extends PresetCrystal {
  isPreset: boolean            // プリセット由来かどうか
  isFavorite: boolean          // お気に入り設定
  description?: string         // 説明文（オプション）
  createdAt: string           // 作成日時 (ISO string)
  updatedAt: string           // 更新日時 (ISO string)
}

// 統合型（アプリ内で使用するクリスタルデータ型）
type Crystal = LocalStorageCrystal

type CrystalType = 'weapon' | 'armor' | 'additional' | 'special' | 'normal'
```

## クリスタルタイプ別装着可能スロット

- **weapon**: メイン装備のクリスタルスロットのみ
- **armor**: 体装備のクリスタルスロットのみ  
- **additional**: 追加装備のクリスタルスロットのみ
- **special**: 特殊装備のクリスタルスロットのみ
- **normal**: 全てのクリスタルスロットに装着可能

## プロパティ設定値範囲

クリスタルのプロパティ値設定範囲は装備と同様：
- %系プロパティ: -1000 ～ 1000
- 固定値プロパティ: -99999 ～ 99999