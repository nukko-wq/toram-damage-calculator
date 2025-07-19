# クリスタお気に入りシステム設計書

## 概要

CrystalSelectionModalとCrystalCardでクリスタ用のお気に入り機能を追加する実装設計書です。
装備品お気に入り機能と同様の仕組みを適用し、ユーザーのクリスタ選択効率を向上させます。

## 要件

### 機能要件
- CrystalCardの右下にハートアイコンのお気に入りボタンを配置
- お気に入り状態のトグル（ON/OFF切り替え）
- お気に入り情報はローカルストレージに永続化
- 全セーブデータで共有（個別セーブデータに依存しない）
- お気に入りクリスタの識別表示
- タイプフィルター使用時もお気に入り優先表示

### 非機能要件
- お気に入り操作はクリスタ選択操作を阻害しない
- パフォーマンスへの影響を最小限に抑制
- 既存のUI/UX（装備品お気に入り）との一貫性を保持
- フィルタリング機能との調和

## アーキテクチャ

### データ構造

#### クリスタお気に入り情報の型定義
```typescript
// src/types/favorites.ts に追加
export interface CrystalFavorite {
  crystalId: string
  isFavorite: boolean
  addedAt: string // ISO string
}

export interface CrystalFavoritesData {
  crystals: Record<string, CrystalFavorite>
  lastUpdated: string
}

// 統合お気に入りデータ
export interface FavoritesData {
  equipments: Record<string, EquipmentFavorite>
  crystals: Record<string, CrystalFavorite> // 新規追加
  lastUpdated: string
}
```

#### ローカルストレージキー
```typescript
// src/utils/storage.ts - 既存のキーを活用
export const STORAGE_KEYS = {
  // 既存のキー...
  EQUIPMENT_FAVORITES: 'toram_equipment_favorites', // 既存
  CRYSTAL_FAVORITES: 'toram_crystal_favorites', // 新規追加
} as const
```

### 管理クラス

#### クリスタお気に入り管理ユーティリティ
```typescript
// src/utils/crystalFavorites.ts
export class CrystalFavoritesManager {
  private static readonly STORAGE_KEY = STORAGE_KEYS.CRYSTAL_FAVORITES

  /**
   * クリスタお気に入りデータを取得
   */
  static getFavorites(): CrystalFavoritesData {
    return StorageHelper.get(this.STORAGE_KEY, {
      crystals: {},
      lastUpdated: new Date().toISOString()
    })
  }

  /**
   * クリスタのお気に入り状態を取得
   */
  static isFavorite(crystalId: string): boolean {
    const favorites = this.getFavorites()
    return favorites.crystals[crystalId]?.isFavorite ?? false
  }

  /**
   * クリスタのお気に入り状態を設定
   */
  static setFavorite(crystalId: string, isFavorite: boolean): boolean {
    const favorites = this.getFavorites()
    
    if (isFavorite) {
      favorites.crystals[crystalId] = {
        crystalId,
        isFavorite: true,
        addedAt: new Date().toISOString()
      }
    } else {
      delete favorites.crystals[crystalId]
    }
    
    favorites.lastUpdated = new Date().toISOString()
    return StorageHelper.set(this.STORAGE_KEY, favorites)
  }

  /**
   * クリスタのお気に入り状態をトグル
   */
  static toggleFavorite(crystalId: string): boolean {
    const currentState = this.isFavorite(crystalId)
    return this.setFavorite(crystalId, !currentState)
  }

  /**
   * お気に入りクリスタIDリストを取得（新しく追加された順）
   */
  static getFavoriteCrystalIds(): string[] {
    const favorites = this.getFavorites()
    return Object.keys(favorites.crystals)
      .filter(id => favorites.crystals[id].isFavorite)
      .sort((a, b) => {
        const aTime = new Date(favorites.crystals[a].addedAt).getTime()
        const bTime = new Date(favorites.crystals[b].addedAt).getTime()
        return bTime - aTime // 新しく追加された順
      })
  }

  /**
   * お気に入りクリスタデータをクリア
   */
  static clearFavorites(): boolean {
    return StorageHelper.set(this.STORAGE_KEY, {
      crystals: {},
      lastUpdated: new Date().toISOString()
    })
  }

  /**
   * お気に入りクリスタ件数を取得
   */
  static getFavoriteCount(): number {
    const favorites = this.getFavorites()
    return Object.keys(favorites.crystals).filter(
      id => favorites.crystals[id].isFavorite
    ).length
  }

  /**
   * 特定タイプのお気に入りクリスタ件数を取得
   */
  static getFavoriteCountByType(crystals: Crystal[], type: CrystalType | 'all'): number {
    const favoriteIds = this.getFavoriteCrystalIds()
    const favoriteSet = new Set(favoriteIds)
    
    return crystals.filter(crystal => {
      if (!favoriteSet.has(crystal.id)) return false
      if (type === 'all') return true
      return crystal.type === type
    }).length
  }
}
```

## UI実装

### CrystalCardの修正

#### お気に入りボタンの追加
```typescript
// src/components/crystal/CrystalCard.tsx

import { useState, useCallback } from 'react'
import { CrystalFavoritesManager } from '@/utils/crystalFavorites'

interface CrystalCardProps {
  crystal: Crystal
  isSelected: boolean
  onClick: () => void
  showDamageDifference?: boolean
  slotInfo?: SlotInfo
  // お気に入り機能用の新規プロパティ
  showFavoriteButton?: boolean
  onFavoriteChange?: (crystalId: string, isFavorite: boolean) => void
}

export default function CrystalCard({
  crystal,
  isSelected,
  onClick,
  showDamageDifference = false,
  slotInfo,
  showFavoriteButton = true,
  onFavoriteChange,
}: CrystalCardProps) {
  const [isFavorite, setIsFavorite] = useState(
    () => CrystalFavoritesManager.isFavorite(crystal.id)
  )

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation() // クリスタ選択イベントの阻止
    
    const newFavoriteState = !isFavorite
    const success = CrystalFavoritesManager.setFavorite(crystal.id, newFavoriteState)
    
    if (success) {
      setIsFavorite(newFavoriteState)
      onFavoriteChange?.(crystal.id, newFavoriteState)
    }
  }, [crystal.id, isFavorite, onFavoriteChange])

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
          type="button"
          onClick={handleFavoriteClick}
          className={`
            absolute bottom-2 right-2 p-1.5 rounded-full transition-all duration-200 hover:scale-110 z-10
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
            <title>{isFavorite ? 'お気に入り済み' : 'お気に入りに追加'}</title>
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
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
              <title>お気に入り</title>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
        )}

        {/* 選択状態のチェックマーク */}
        {isSelected && (
          // 既存の実装...
        )}
      </div>

      {/* 既存のコンテンツ（クリスタ名、プロパティ等） */}
      {/* ... */}
    </div>
  )
}
```

### CrystalSelectionModalの修正

#### お気に入り機能とフィルタリングの統合
```typescript
// src/components/crystal/CrystalSelectionModal.tsx

import { useState, useCallback } from 'react'
import { CrystalFavoritesManager } from '@/utils/crystalFavorites'

export default function CrystalSelectionModal({
  // 既存のprops...
}: CrystalSelectionModalProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | CrystalType>('all')
  const [favoritesChanged, setFavoritesChanged] = useState(0)

  // お気に入り変更ハンドラー
  const handleFavoriteChange = useCallback((crystalId: string, isFavorite: boolean) => {
    setFavoritesChanged(prev => prev + 1) // 再レンダリングトリガー
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Crystal ${crystalId} favorite state changed to ${isFavorite}`)
    }
  }, [])

  // フィルタリング+お気に入り順ソート
  const sortedCrystals = useMemo(() => {
    // 1. タイプフィルタリング
    const filtered = availableCrystals.filter(crystal => {
      if (activeFilter === 'all') return true
      return crystal.type === activeFilter
    })

    // 2. お気に入り順ソート
    const favoriteIds = CrystalFavoritesManager.getFavoriteCrystalIds()
    const favoriteSet = new Set(favoriteIds)
    
    const favorites = filtered.filter(crystal => favoriteSet.has(crystal.id))
    const others = filtered.filter(crystal => !favoriteSet.has(crystal.id))
    
    return [...favorites, ...others]
  }, [availableCrystals, activeFilter, favoritesChanged])

  // フィルタータブの数量更新（お気に入り考慮）
  const getFilterCount = useCallback((filter: 'all' | CrystalType) => {
    if (filter === 'all') return availableCrystals.length
    return availableCrystals.filter(c => c.type === filter).length
  }, [availableCrystals])

  const getFavoriteFilterCount = useCallback((filter: 'all' | CrystalType) => {
    return CrystalFavoritesManager.getFavoriteCountByType(availableCrystals, filter)
  }, [availableCrystals, favoritesChanged])

  return (
    // 既存のJSX...
    <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
      {sortedCrystals.map((crystal) => (
        <CrystalCard
          key={crystal.id}
          crystal={crystal}
          isSelected={selectedCrystalId === crystal.id}
          onClick={() => handleSelect(crystal.id)}
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
  "toram_crystal_favorites": {
    "crystals": {
      "crystal-id-1": {
        "crystalId": "crystal-id-1",
        "isFavorite": true,
        "addedAt": "2024-01-19T10:30:00.000Z"
      },
      "crystal-id-2": {
        "crystalId": "crystal-id-2", 
        "isFavorite": true,
        "addedAt": "2024-01-19T14:20:00.000Z"
      }
    },
    "lastUpdated": "2024-01-19T14:20:00.000Z"
  }
}
```

## フィルタリング統合

### タイプフィルター + お気に入り優先表示
1. **フィルタリング処理**: タイプフィルターを先に適用
2. **ソート処理**: フィルター結果内でお気に入り優先表示
3. **カウント表示**: フィルタータブに総数とお気に入り数を表示

### フィルタータブ表示例
```
[全て (25/3★)] [武器 (8/1★)] [防具 (6/2★)] [追加 (4/0★)] [特殊 (3/0★)] [ノーマル (4/0★)]
```
- 左の数値: 総クリスタ数
- 右の数値: お気に入り数（★マーク付き）

## パフォーマンス考慮事項

### 最適化ポイント
1. **お気に入り状態の初期化**: コンポーネントマウント時のみ実行
2. **フィルター + ソートの最適化**: useMemoによるメモ化
3. **イベント伝播の制御**: お気に入りボタンクリック時のクリスタ選択阻止
4. **LocalStorage操作の最小化**: 状態変更時のみ書き込み

### メモリ使用量
- お気に入り1件あたり約80-100バイト
- 100件のお気に入り登録でも約10KB以下
- 装備品お気に入りと合わせても軽量

## 装備品お気に入りとの整合性

### 共通点
- 同一のUI/UXパターン（ハートアイコン、配置、動作）
- 同一のストレージ管理パターン
- 同一のお気に入り優先表示ロジック

### 相違点
- **ストレージキー**: 別々の管理（独立性維持）
- **フィルタリング**: クリスタはタイプフィルターとの統合
- **データ構造**: クリスタ固有のプロパティ対応

## 拡張可能性

### 将来的な機能拡張
1. **お気に入りフィルタ**: お気に入りのみ表示するフィルタ
2. **お気に入りカテゴリ**: タイプ別のお気に入り管理
3. **統合お気に入り管理**: 装備品とクリスタの一元管理画面
4. **お気に入り統計**: 利用頻度の分析機能

### コンポーネント再利用
- `CrystalCard`のお気に入り機能は他のクリスタ選択UIでも利用可能
- `CrystalFavoritesManager`は管理画面等の他機能でも応用可能

## テスト要件

### 単体テスト
- `CrystalFavoritesManager`の全メソッド
- お気に入り状態の永続化と復元
- タイプフィルター + お気に入りソートの動作

### 統合テスト  
- CrystalCard内でのお気に入り操作
- CrystalSelectionModal内でのお気に入り表示
- フィルター切り替え時のお気に入り表示維持

### E2Eテスト
- お気に入り登録→フィルター切り替え→状態確認
- お気に入り登録→ページリロード→状態確認
- 装備品お気に入りとクリスタお気に入りの独立動作確認

## 実装順序

1. **Phase 1**: 型定義とクリスタ用ユーティリティクラスの実装
2. **Phase 2**: CrystalCardへのお気に入りボタン追加
3. **Phase 3**: CrystalSelectionModalでの統合とフィルター連携
4. **Phase 4**: UI/UXの調整とテスト
5. **Phase 5**: パフォーマンスチューニングと最適化

この設計により、装備品お気に入り機能と一貫性を保ちながら、クリスタ固有の要件（タイプフィルター）にも対応したユーザーフレンドリーなお気に入り機能を実現できます。