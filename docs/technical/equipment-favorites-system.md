# 装備品お気に入りシステム設計書

## 概要

EquipmentSelectionModalで装備品にお気に入り機能を追加する実装設計書です。
ユーザーがよく使用する装備品にお気に入りマークを付けて、アクセスを向上させます。

## 要件

### 機能要件
- EquipmentCardの右下にハートアイコンのお気に入りボタンを配置
- お気に入り状態のトグル（ON/OFF切り替え）
- お気に入り情報はローカルストレージに永続化
- 全セーブデータで共有（個別セーブデータに依存しない）
- お気に入り装備の識別表示

### 非機能要件
- お気に入り操作は装備選択操作を阻害しない
- パフォーマンスへの影響を最小限に抑制
- 既存のUI/UXとの一貫性を保持

## アーキテクチャ

### データ構造

#### お気に入り情報の型定義
```typescript
// src/types/favorites.ts
export interface EquipmentFavorite {
  equipmentId: string
  isFavorite: boolean
  addedAt: string // ISO string
}

export interface FavoritesData {
  equipments: Record<string, EquipmentFavorite>
  lastUpdated: string
}
```

#### ローカルストレージキー
```typescript
// src/utils/storage.ts に追加
export const STORAGE_KEYS = {
  // 既存のキー...
  EQUIPMENT_FAVORITES: 'toram_equipment_favorites', // 新規追加
} as const
```

### 管理クラス

#### お気に入り管理ユーティリティ
```typescript
// src/utils/equipmentFavorites.ts
export class EquipmentFavoritesManager {
  private static readonly STORAGE_KEY = STORAGE_KEYS.EQUIPMENT_FAVORITES

  /**
   * お気に入りデータを取得
   */
  static getFavorites(): FavoritesData {
    return StorageHelper.get(this.STORAGE_KEY, {
      equipments: {},
      lastUpdated: new Date().toISOString()
    })
  }

  /**
   * 装備のお気に入り状態を取得
   */
  static isFavorite(equipmentId: string): boolean {
    const favorites = this.getFavorites()
    return favorites.equipments[equipmentId]?.isFavorite ?? false
  }

  /**
   * 装備のお気に入り状態を設定
   */
  static setFavorite(equipmentId: string, isFavorite: boolean): boolean {
    const favorites = this.getFavorites()
    
    if (isFavorite) {
      favorites.equipments[equipmentId] = {
        equipmentId,
        isFavorite: true,
        addedAt: new Date().toISOString()
      }
    } else {
      delete favorites.equipments[equipmentId]
    }
    
    favorites.lastUpdated = new Date().toISOString()
    return StorageHelper.set(this.STORAGE_KEY, favorites)
  }

  /**
   * 装備のお気に入り状態をトグル
   */
  static toggleFavorite(equipmentId: string): boolean {
    const currentState = this.isFavorite(equipmentId)
    return this.setFavorite(equipmentId, !currentState)
  }

  /**
   * お気に入り装備IDリストを取得
   */
  static getFavoriteEquipmentIds(): string[] {
    const favorites = this.getFavorites()
    return Object.keys(favorites.equipments)
      .filter(id => favorites.equipments[id].isFavorite)
      .sort((a, b) => {
        const aTime = new Date(favorites.equipments[a].addedAt).getTime()
        const bTime = new Date(favorites.equipments[b].addedAt).getTime()
        return bTime - aTime // 新しく追加された順
      })
  }

  /**
   * お気に入りデータをクリア
   */
  static clearFavorites(): boolean {
    return StorageHelper.set(this.STORAGE_KEY, {
      equipments: {},
      lastUpdated: new Date().toISOString()
    })
  }
}
```

## UI実装

### EquipmentCardの修正

#### お気に入りボタンの追加
```typescript
// src/components/equipment/EquipmentCard.tsx

import { useState, useCallback } from 'react'
import { EquipmentFavoritesManager } from '@/utils/equipmentFavorites'

interface EquipmentCardProps {
  equipment: PresetEquipment
  isSelected: boolean
  onClick: () => void
  showDamageDifference?: boolean
  slotInfo?: SlotInfo
  // お気に入り機能用の新規プロパティ
  showFavoriteButton?: boolean
  onFavoriteChange?: (equipmentId: string, isFavorite: boolean) => void
}

export default function EquipmentCard({
  equipment,
  isSelected,
  onClick,
  showDamageDifference = false,
  slotInfo,
  showFavoriteButton = true,
  onFavoriteChange,
}: EquipmentCardProps) {
  const [isFavorite, setIsFavorite] = useState(
    () => EquipmentFavoritesManager.isFavorite(equipment.id)
  )

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation() // 装備選択イベントの阻止
    
    const newFavoriteState = !isFavorite
    const success = EquipmentFavoritesManager.setFavorite(equipment.id, newFavoriteState)
    
    if (success) {
      setIsFavorite(newFavoriteState)
      onFavoriteChange?.(equipment.id, newFavoriteState)
    }
  }, [equipment.id, isFavorite, onFavoriteChange])

  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md w-full max-w-[100%] sm:max-w-[260px]
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300'
        }
      `}
    >
      {/* お気に入りボタン - 右下に絶対配置 */}
      {showFavoriteButton && (
        <button
          onClick={handleFavoriteClick}
          className={`
            absolute bottom-2 right-2 p-1.5 rounded-full transition-all duration-200 hover:scale-110
            ${isFavorite 
              ? 'text-red-500 hover:text-red-600' 
              : 'text-gray-300 hover:text-red-400'
            }
          `}
          aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
        >
          <svg
            className="w-5 h-5"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isFavorite ? 0 : 2}
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            />
          </svg>
        </button>
      )}

      {/* 上部エリア：ダメージ差分表示と選択マーク */}
      <div className="flex justify-between items-start mb-2 min-h-[24px]">
        {/* 既存のダメージ差分表示 */}
        <div className="flex-1">
          {showDamageDifference && slotInfo && !isSelected && (
            // 既存の実装...
          )}
        </div>

        {/* お気に入りマーク（アイコン表示時） */}
        {isFavorite && (
          <div className="w-4 h-4 text-red-500 ml-2">
            <svg
              className="w-full h-full"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
        )}

        {/* 選択状態のチェックマーク */}
        {isSelected && (
          // 既存の実装...
        )}
      </div>

      {/* 既存のコンテンツ（装備名、ステータス等） */}
      {/* ... */}
    </div>
  )
}
```

### EquipmentSelectionModalの修正

#### お気に入り機能の統合
```typescript
// src/components/equipment/EquipmentSelectionModal.tsx

import { useState, useCallback } from 'react'
import { EquipmentFavoritesManager } from '@/utils/equipmentFavorites'

export default function EquipmentSelectionModal({
  // 既存のprops...
}: EquipmentSelectionModalProps) {
  const [favoritesChanged, setFavoritesChanged] = useState(0)

  const handleFavoriteChange = useCallback((equipmentId: string, isFavorite: boolean) => {
    // お気に入り状態変更時の処理
    setFavoritesChanged(prev => prev + 1) // 再レンダリングトリガー
    
    // 必要に応じて親コンポーネントに通知
    console.log(`Equipment ${equipmentId} favorite state changed to ${isFavorite}`)
  }, [])

  // 装備リストの表示順序: お気に入り → 通常
  const sortedEquipments = useMemo(() => {
    const favoriteIds = EquipmentFavoritesManager.getFavoriteEquipmentIds()
    const favoriteSet = new Set(favoriteIds)
    
    const favorites = filteredEquipments.filter(eq => favoriteSet.has(eq.id))
    const others = filteredEquipments.filter(eq => !favoriteSet.has(eq.id))
    
    return [...favorites, ...others]
  }, [filteredEquipments, favoritesChanged])

  return (
    // 既存のJSX...
    <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
      {sortedEquipments.map((equipment) => (
        <EquipmentCard
          key={equipment.id}
          equipment={equipment}
          isSelected={selectedEquipmentId === equipment.id}
          onClick={() => handleSelect(equipment.id)}
          showDamageDifference={isOpen && !!slotInfo}
          slotInfo={slotInfo}
          showFavoriteButton={true}
          onFavoriteChange={handleFavoriteChange}
        />
      ))}
    </div>
    // ...
  )
}
```

## データ永続化

### ローカルストレージ構造
```json
{
  "toram_equipment_favorites": {
    "equipments": {
      "equipment-id-1": {
        "equipmentId": "equipment-id-1",
        "isFavorite": true,
        "addedAt": "2024-01-15T10:30:00.000Z"
      },
      "equipment-id-2": {
        "equipmentId": "equipment-id-2", 
        "isFavorite": true,
        "addedAt": "2024-01-16T14:20:00.000Z"
      }
    },
    "lastUpdated": "2024-01-16T14:20:00.000Z"
  }
}
```

## パフォーマンス考慮事項

### 最適化ポイント
1. **お気に入り状態の初期化**: コンポーネントマウント時のみ実行
2. **イベント伝播の制御**: お気に入りボタンクリック時の装備選択阻止
3. **メモ化**: お気に入り装備リストのソート処理
4. **LocalStorage操作の最小化**: 状態変更時のみ書き込み

### メモリ使用量
- お気に入り1件あたり約80-100バイト
- 100件のお気に入り登録でも約10KB以下
- LocalStorageの容量制限（5MB）に対して十分軽量

## 拡張可能性

### 将来的な機能拡張
1. **お気に入りフィルタリング**: お気に入りのみ表示するフィルタ
2. **お気に入りカテゴリ**: カテゴリ別のお気に入り管理
3. **お気に入り同期**: クラウド同期機能（オプション）
4. **お気に入り統計**: 利用頻度の分析機能

### コンポーネント再利用
- `EquipmentCard`のお気に入り機能は他の装備選択UIでも利用可能
- `EquipmentFavoritesManager`はクリスタル等の他アイテムにも応用可能

## テスト要件

### 単体テスト
- `EquipmentFavoritesManager`の全メソッド
- お気に入り状態の永続化と復元
- LocalStorage操作のエラーハンドリング

### 統合テスト  
- EquipmentCard内でのお気に入り操作
- EquipmentSelectionModal内でのお気に入り表示
- お気に入り状態変更時のUI更新

### E2Eテスト
- お気に入り登録→ページリロード→状態確認
- 大量のお気に入り登録時のパフォーマンス
- モーダル内でのお気に入り操作とアイテム選択の競合確認

## 実装順序

1. **Phase 1**: 型定義とユーティリティクラスの実装
2. **Phase 2**: EquipmentCardへのお気に入りボタン追加
3. **Phase 3**: EquipmentSelectionModalでの統合とソート機能
4. **Phase 4**: UI/UXの調整とテスト
5. **Phase 5**: パフォーマンスチューニングと最適化

この設計により、ユーザーフレンドリーで保守性の高いお気に入り機能を実現できます。