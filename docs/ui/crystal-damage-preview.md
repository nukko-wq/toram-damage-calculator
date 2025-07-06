# クリスタル選択時ダメージ差分プレビュー機能実装ドキュメント

## 概要

CrystalFormにおいて、クリスタル選択時にそのクリスタルをセットした場合のダメージ差分をリアルタイムで表示する機能の実装ドキュメント。

## 実装済み機能

### 基本機能
- **対象フォーム**: CrystalForm（実装済み）、EquipmentForm、BuffItemForm（将来）
- **表示位置**: 各クリスタルカードの左上角
- **表示内容**: 現在の平均ダメージとの差分
- **更新タイミング**: クリスタル選択モーダル表示時、リアルタイム計算

### 表示仕様
- **正の差分**: `+1,234` (緑色)
- **負の差分**: `-567` (赤色)
- **差分なし**: `±0` (グレー色)
- **計算不可**: `---` (グレー色)

## 技術仕様

### 実装アーキテクチャ

現在の実装では、DamagePreviewと完全に同じ計算エンジンを使用した共通のダメージ計算サービスを使用しています。

### データフロー

```typescript
// 1. 現在の状態でダメージを計算（共通サービス使用）
const baselineResults = calculateResults(baselineData)
const currentDamageResult = calculateDamageWithService(
  baselineData, 
  baselineResults, 
  { debug: options.debug, powerOptions }
)

// 2. クリスタル装着をシミュレーション
const simulatedData = simulateItemEquipSimple(currentData, item, slotInfo)
const simulatedResults = calculateResults(simulatedData)
const simulatedDamageResult = calculateDamageWithService(
  simulatedData, 
  simulatedResults, 
  { debug: options.debug, powerOptions }
)

// 3. 平均ダメージの差分を計算
const averageDifference = simulatedDamageResult.normal.average - currentDamageResult.normal.average
const difference = Math.round(averageDifference)
```

### 実装されたコンポーネントとファイル

#### 1. 共通ダメージ計算サービス

**ファイル**: `src/utils/damageCalculationService.ts`

```typescript
/**
 * DamagePreviewと同じ方法でダメージを計算する共通サービス
 */
export function calculateDamageWithService(
  calculatorData: CalculatorData,
  calculationResults: any,
  options: DamageCalculationOptions = {}
): DamageCalculationServiceResult {
  // DamagePreview.tsxと完全に同じ計算ロジックを使用
  // 最小、最大、平均ダメージを正確に計算
  // ダメージタイプ（白ダメ、クリティカル等）に対応
}
```

#### 2. クリスタル装着シミュレーション

**ファイル**: `src/utils/damageSimulationSimple.ts`

```typescript
/**
 * アイテム装着シミュレーション（シンプル版）
 */
export function simulateItemEquipSimple(
  currentData: CalculatorData,
  item: PreviewItem,
  slotInfo: SlotInfo
): CalculatorData {
  const simulatedData: CalculatorData = JSON.parse(JSON.stringify(currentData))
  
  // クリスタルスロットの更新
  if (slotInfo.type === 'crystal' && slotInfo.category && typeof slotInfo.slot === 'number') {
    const slotKey = `${slotInfo.category}${slotInfo.slot + 1}` // weapon1, armor2, etc.
    (simulatedData.crystals as unknown as Record<string, string | null>)[slotKey] = item.id
  }
  
  return simulatedData
}
```

#### 2. ダメージ差分計算フック

**ファイル**: `src/hooks/useDamageDifferenceCorrect.ts`

```typescript
/**
 * 正しい方法によるダメージ差分計算フック
 * DamagePreviewと同じ計算エンジンを使用
 */
export function useDamageDifferenceCorrect(
	item: PreviewItem | null,
	slotInfo: SlotInfo,
	options: DamageDifferenceOptions = {},
): DamageDifferenceResult {
	const currentData = useCalculatorStore((state) => state.data)
	const currentResults = useCalculatorStore((state) => state.calculationResults)
	const powerOptions = useCalculatorStore((state) => state.data.powerOptions)
	
	return useMemo(() => {
		// 現在装着中のクリスタルIDを確認
		const currentSlotKey = slotInfo.category && typeof slotInfo.slot === 'number' 
			? `${slotInfo.category}${slotInfo.slot + 1}` 
			: null
		const currentEquippedCrystalId = currentSlotKey 
			? (currentData.crystals as unknown as Record<string, string | null>)[currentSlotKey]
			: null
			
		const isCurrentlyEquipped = currentEquippedCrystalId === item.id
		
		let baselineData: CalculatorData
		let simulatedData: CalculatorData

		if (isCurrentlyEquipped) {
			// 現在装着中のクリスタルの場合：外した状態を基準にして差分を計算
			baselineData = removeItemFromSlot(currentData, slotInfo)
			simulatedData = currentData // 現在の状態が装着状態
		} else {
			// 装着していないクリスタルの場合：現在の状態を基準にして装着後の差分を計算
			baselineData = currentData
			simulatedData = simulateItemEquipSimple(currentData, item, slotInfo)
		}

		// 基準状態のダメージを計算（共通サービスを使用）
		const baselineResults = calculateResults(baselineData)
		const currentDamageResult = calculateDamageWithService(
			baselineData, 
			baselineResults, 
			{ debug: options.debug, powerOptions: powerOptions || {} }
		)
		
		// シミュレーション後のステータスを計算（共通サービスを使用）
		const simulatedResults = calculateResults(simulatedData)
		const simulatedDamageResult = calculateDamageWithService(
			simulatedData, 
			simulatedResults, 
			{ debug: options.debug, powerOptions: powerOptions || {} }
		)
		
		// 平均ダメージの差分を計算
		const averageDifference = simulatedDamageResult.normal.average - currentDamageResult.normal.average
		const difference = Math.round(averageDifference)
		
		return {
			difference,
			isCalculating: false,
			error: null,
			currentDamage: currentDamageResult.normal.max,
			simulatedDamage: simulatedDamageResult.normal.max,
		}
	}, [item, currentData, currentResults, powerOptions, slotInfo, options.disabled, options.debug])
}
```

#### 3. UIコンポーネント

**ファイル**: `src/components/common/DamageDifferenceDisplayCorrect.tsx`

```typescript
/**
 * ダメージ差分表示コンポーネント（正しい版）
 */
export interface DamageDifferenceDisplayCorrectProps {
	item: PreviewItem
	slotInfo: SlotInfo
	size?: 'sm' | 'md' | 'lg'
	className?: string
	options?: DamageDifferenceOptions
}

export function DamageDifferenceDisplayCorrect({
	item,
	slotInfo,
	size = 'md',
	className = '',
	options = {},
}: DamageDifferenceDisplayCorrectProps) {
	const { difference, isCalculating, error } = useDamageDifferenceCorrect(
		item,
		slotInfo,
		options,
	)

	if (isCalculating) {
		return (
			<div className={`text-xs text-gray-400 ${className}`}>
				計算中...
			</div>
		)
	}

	if (error) {
		return (
			<div className={`text-xs text-gray-400 ${className}`}>
				---
			</div>
		)
	}

	const formatDifference = (diff: number): string => {
		if (diff === 0) return '±0'
		return diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString()
	}

	const getColorClass = (diff: number): string => {
		if (diff > 0) return 'text-green-600 font-semibold'
		if (diff < 0) return 'text-red-600 font-semibold'
		return 'text-gray-400'
	}

	const getSizeClass = (size: string): string => {
		switch (size) {
			case 'sm':
				return 'text-xs'
			case 'lg':
				return 'text-sm'
			default:
				return 'text-xs'
		}
	}

	return (
		<div className={`${getSizeClass(size)} ${getColorClass(difference)} ${className}`}>
			{formatDifference(difference)}
		</div>
	)
}
```

### スロット情報の型定義

```typescript
/**
 * スロット情報
 */
export interface SlotInfo {
  type: 'crystal' | 'equipment' | 'buffItem'
  category?: CrystalCategory | BuffItemCategory // crystal, buffItem用
  slot?: number | EquipmentSlot // crystal, equipment用
}

/**
 * ダメージプレビュー結果
 */
export interface DamagePreviewResult {
  maxDamage: number
  minDamage: number
  baseDamage: number
}
```

## 実装状況

### Phase 1: 基盤実装 ✅ 完了
1. **シミュレーション関数の実装** ✅
   - `simulateItemEquipSimple` (damageSimulationSimple.ts)
   - `calculateDamageWithService` (damageCalculationService.ts)
   - `calculateResults` (calculationEngine.ts)

2. **フックの実装** ✅
   - `useDamageDifferenceCorrect` (useDamageDifferenceCorrect.ts)

3. **UIコンポーネントの実装** ✅
   - `DamageDifferenceDisplayCorrect` (DamageDifferenceDisplayCorrect.tsx)

### Phase 2: CrystalFormへの適用 ✅ 完了
1. **CrystalCardの更新** ✅
   - カード上部にダメージ差分表示を追加
   - 選択モーダル内の各クリスタルカードに適用
   - CrystalSelectionModal.tsx でslotInfoを渡すように更新

2. **パフォーマンス最適化** ✅
   - 計算結果のメモ化 (useMemo)
   - 不要な再計算の防止
   - デバッグオプション対応

### Phase 3: 他フォームへの展開 📋 計画中
1. **EquipmentFormへの適用** 📋
   - 装備選択時のダメージ差分表示

2. **BuffItemFormへの適用** 📋
   - バフアイテム選択時のダメージ差分表示

## パフォーマンス考慮事項

### 最適化ポイント
1. **計算の軽量化**
   - 必要最小限のステータス再計算
   - ダメージ計算の簡略化オプション

2. **メモ化**
   - アイテムごとの計算結果キャッシュ
   - 基本データ変更時のみ再計算

3. **非同期処理**
   - 重い計算のWorker化（将来）
   - 段階的な計算結果表示

### 制約事項
- **計算精度**: 完全なダメージ計算は重いため、簡略版を使用
- **更新頻度**: ベースデータ変更時のみ全体再計算
- **表示遅延**: 計算に時間がかかる場合は「計算中」表示

## テストケース

### 単体テスト
1. **シミュレーション関数**
   - 正常なアイテム装着シミュレーション
   - 不正なスロット指定のエラーハンドリング

2. **ダメージ差分計算**
   - 正の差分、負の差分、差分なしのケース
   - 計算エラー時の処理

### 統合テスト
1. **CrystalForm連携**
   - クリスタル選択時の差分表示
   - リアルタイム更新の動作確認

2. **パフォーマンステスト**
   - 大量のアイテム表示時の応答性
   - 連続操作時のメモリ使用量

## 将来の拡張

### 機能拡張
1. **比較モード**
   - 複数アイテムの同時比較
   - ソート機能（差分順）

2. **詳細表示**
   - ATK、クリティカル等の個別差分
   - グラフィカルな差分表示

3. **推奨アイテム**
   - 最適なアイテムの自動提案
   - ビルド最適化支援

## 実装されたファイル構成

```
src/
├── hooks/
│   └── useDamageDifferenceCorrect.ts   # ダメージ差分計算フック（実装済み）
├── utils/
│   ├── damageCalculationService.ts     # 共通ダメージ計算サービス（実装済み）
│   └── damageSimulationSimple.ts       # シンプルなシミュレーション（実装済み）
├── components/
│   ├── common/
│   │   └── DamageDifferenceDisplayCorrect.tsx # 差分表示コンポーネント（実装済み）
│   ├── crystal/
│   │   ├── CrystalCard.tsx            # 更新済み: 差分表示追加
│   │   └── CrystalSelectionModal.tsx   # 更新済み: slotInfo渡し対応
│   ├── equipment/
│   │   └── EquipmentCard.tsx          # 将来: 差分表示追加
│   └── buff-item/
│       └── BuffItemCard.tsx           # 将来: 差分表示追加
└── types/
    └── damagePreview.ts               # 型定義（実装済み）
```

## 主な技術的特徴

1. **DamagePreviewとの統合**: 同じ計算エンジンを使用することで一貫性を保証
2. **リアルタイム計算**: クリスタル選択モーダルを開いた瞬間から全クリスタルの差分を表示
3. **装着状態の考慮**: 現在装着中のクリスタルは外した場合の差分を表示
4. **平均ダメージベース**: 最小・最大・平均の複雑な計算から平均ダメージの差分に単純化
5. **デバッグ機能**: 詳細なログ出力でトラブルシューティングを支援
6. **型安全性**: TypeScriptによる厳密な型チェック

## 次期展開予定

1. **EquipmentForm**: 装備選択時のダメージ差分表示
2. **BuffItemForm**: バフアイテム選択時のダメージ差分表示
3. **パフォーマンス向上**: Worker利用による重い計算の非同期化
4. **比較機能**: 複数アイテムの同時比較とソート機能

この実装により、クリスタル選択時のダメージ差分プレビュー機能が完成し、ユーザーはより効率的にクリスタル選択を行うことができるようになりました。