# ダメージ計算実装手順書

## 概要

DamagePreviewのUI実装が完了したため、次はダメージ計算エンジンの実装を行います。段階的に機能を実装し、確実に動作させることを目標とします。

## 現在の状況

### ✅ 完了済み
- 基本ステータス計算システム（HP/MP/ATK/MATK）
- 攻撃スキル計算システム（倍率・固定値）
- データ統合システム（装備・クリスタル・バフ等）
- DamagePreviewのUI設計と仮実装

### ❌ 未実装
- コアダメージ計算エンジン（10ステップ計算）
- DamagePreviewとの実際の計算連携
- PowerOptionsの計算への反映

## 実装手順

### Phase 1: 基本ダメージ計算エンジンの作成（最優先）

#### Step 1.1: 計算エンジンの骨格作成
**目標**: 最小限の計算エンジンで基礎ダメージを計算

**実装内容**:
1. `src/utils/damageCalculation.ts`を作成
2. 設計書のTypeScriptインターフェースを実装
3. 基礎ダメージ計算（ステップ1-2）のみ実装

**実装ファイル**:
```typescript
// src/utils/damageCalculation.ts
export interface DamageCalculationInput {
  // 設計書docs/calculations/damage-calculation.mdから型定義をコピー
}

export interface DamageCalculationResult {
  // 設計書から型定義をコピー
}

export function calculateDamage(input: DamageCalculationInput): DamageCalculationResult {
  // ステップ1: 基礎ダメージ計算のみ実装
  // ステップ2: 固定値加算のみ実装
  // 残りはプレースホルダー
}
```

**検証方法**:
- コンソールログで計算結果を確認
- 簡単なテストケースで動作確認

#### Step 1.2: DamagePreviewとの基本連携
**目標**: ダミーデータを実際の計算結果に置き換え

**実装内容**:
1. DamagePreviewでZustandストアから計算データを取得
2. 基本的な計算エンジン呼び出し
3. 計算結果をテーブルに表示

**修正ファイル**:
- `src/components/layout/DamagePreview.tsx`

**実装ポイント**:
```typescript
// DamagePreview.tsx内
const calculatorData = useCalculatorStore((state) => state.data)
const calculationResult = calculateDamage({
  // 基本的なパラメータのみ設定
  playerLevel: calculatorData.baseStats.level,
  // 他は最小限の設定
})

// ダミーデータの代わりに計算結果を使用
const actualNormalAttack = {
  min: calculationResult.finalDamage,
  max: calculationResult.finalDamage,
  average: calculationResult.finalDamage,
  stability: 100,
}
```

### Phase 2: スキル連携（中優先）

#### Step 2.1: 攻撃スキル選択システムとの連携
**目標**: 選択された攻撃スキルの倍率・固定値を計算に反映

**実装内容**:
1. 攻撃スキルデータの取得
2. スキル倍率・固定値の適用（ステップ3-4）
3. 通常攻撃とスキル攻撃の計算分岐

**実装ポイント**:
```typescript
// attackSkillデータから倍率と固定値を取得
const selectedSkill = getAttackSkillById(calculatorData.attackSkill.selectedSkillId)
if (selectedSkill) {
  // スキル計算システムを活用
  const skillCalculation = attackSkillCalculation.calculateSkill(selectedSkill.id, calculatorData)
  // 計算結果をダメージ計算に適用
}
```

#### Step 2.2: PowerOptionsの基本適用
**目標**: DamagePreviewのPowerOptionsを計算に反映

**実装内容**:
1. PowerOptionsの設定を計算エンジンに渡す
2. スキルダメージ選択（全て/1撃目/2撃目/3撃目）の実装
3. ダメージ判定（Critical/Graze/白ダメ/期待値）の基本実装

### Phase 3: オプション機能の実装（低優先）

#### Step 3.1: 属性・距離・コンボ補正
**目標**: 各種補正機能の実装

**実装内容**:
1. 属性攻撃（有利/その他/無/不利）の実装
2. 距離判定（近距離/遠距離/無効化）の実装
3. コンボ強打の実装
4. 抜刀威力の実装

#### Step 3.2: 高度な機能
**目標**: 複雑な計算機能の実装

**実装内容**:
1. ボス戦難易度による敵ステータス調整
2. 属性威力の詳細設定
3. 慣れ倍率スライダーの実装
4. より詳細なダメージ判定

### Phase 4: 最適化と拡張（将来）

#### Step 4.1: パフォーマンス最適化
- 計算処理の最適化
- リアルタイム更新の改善
- メモ化の導入

#### Step 4.2: 高度なバフシステム
- パッシブ倍率システム（ステップ9）
- ブレイブ倍率システム（ステップ10）
- エターナルナイトメア実装
- 状態異常システム（破壊）

## 実装時の注意点

### データ取得パターン
```typescript
// Zustandストアからの基本データ取得
const calculatorData = useCalculatorStore((state) => state.data)
const baseStats = calculatorData.baseStats
const attackSkill = calculatorData.attackSkill
const equipment = calculatorData.equipment
const crystals = calculatorData.crystals
const buffSkills = calculatorData.buffSkills
```

### 計算エンジン呼び出しパターン
```typescript
// 段階的実装での計算エンジン利用
const damageInput: DamageCalculationInput = {
  // Phase 1: 基本パラメータのみ
  playerLevel: baseStats.level,
  referenceStat: baseStats.totalATK,
  enemyLevel: 100, // 固定値から開始
  
  // Phase 2: スキル連携後に追加
  attackSkill: {
    type: 'physical',
    multiplier: skillCalculation.multiplier,
    fixedDamage: skillCalculation.fixedDamage,
  },
  
  // Phase 3: オプション連携後に追加
  userSettings: {
    familiarity: 100,
    currentDistance: powerOptions.distance,
  },
}

const result = calculateDamage(damageInput)
```

### エラーハンドリング
```typescript
// 計算エラーの処理
try {
  const result = calculateDamage(input)
  setDamageResult(result)
} catch (error) {
  console.error('ダメージ計算エラー:', error)
  // フォールバック値を設定
  setDamageResult(fallbackResult)
}
```

## 検証・テスト方法

### Phase 1 検証
- コンソールログで基礎ダメージ計算結果を確認
- 手計算との比較検証
- 極端な値でのエラーチェック

### Phase 2 検証
- 各攻撃スキルでの計算結果確認
- スキル倍率の正確性検証
- 通常攻撃との差分確認

### Phase 3 検証
- PowerOptionsの各設定での計算結果確認
- オプション組み合わせでのテスト
- 実際のゲームデータとの比較

## 実装優先度

### 最優先（Phase 1）
1. 基礎ダメージ計算エンジンの作成
2. DamagePreviewとの基本連携
3. 動作確認

### 高優先（Phase 2）
1. 攻撃スキル連携
2. PowerOptionsの基本機能
3. スキルダメージ表示

### 中優先（Phase 3）
1. 各種補正機能
2. 詳細オプション
3. UI改善

### 低優先（Phase 4）
1. 高度なバフシステム
2. パフォーマンス最適化
3. 追加機能

## 関連ドキュメント

- [ダメージ計算式設計書](../calculations/damage-calculation.md) - 計算式の詳細仕様
- [基本ステータス計算式](../calculations/basic-stats.md) - 基盤となる計算式
- [攻撃スキル計算システム](../technical/attack-skill-calculation.md) - スキル計算の詳細
- [DamagePreview UI設計](../ui/damage-preview.md) - UI仕様

## 進捗管理

### 完了チェックリスト

#### Phase 1
- [ ] `damageCalculation.ts`の作成
- [ ] 基礎ダメージ計算（ステップ1-2）の実装
- [ ] DamagePreviewでの表示確認
- [ ] 基本的な動作検証

#### Phase 2
- [ ] 攻撃スキル連携の実装
- [ ] PowerOptionsの基本機能実装
- [ ] スキルダメージ選択機能
- [ ] ダメージ判定の基本実装

#### Phase 3
- [ ] 属性攻撃機能の実装
- [ ] 距離判定機能の実装
- [ ] コンボ強打機能の実装
- [ ] 抜刀威力機能の実装

#### Phase 4
- [ ] 高度なバフシステム実装
- [ ] パフォーマンス最適化
- [ ] 追加機能の実装

## 更新履歴

| 日付 | 更新内容 | 担当者 |
|------|----------|--------|
| 2025-07-03 | 初版作成 | Claude |

---

このドキュメントは実装の進捗に応じて更新していきます。各Phaseの完了時に次のPhaseの詳細を追加・修正してください。