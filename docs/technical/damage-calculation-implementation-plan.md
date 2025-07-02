# ダメージ計算実装計画書

## 概要

トーラムオンラインのダメージ計算システムを段階的に実装するための詳細な計画書。複雑な計算式を確実に実装するため、フェーズ分けして進行します。

## 実装フェーズ

### 📋 フェーズ1: 基本計算エンジン（優先度: 最高）

#### 目標
- 基本ダメージ計算の実装
- 固定値加算の実装
- 単体テストの作成

#### 実装項目

##### 1.1 基本ダメージ計算（ステップ1）
- **実装ファイル**: `src/utils/damageCalculation.ts`
- **関数名**: `calculateBaseDamage`
- **計算式**: `INT((自Lv + 参照ステータス - 敵Lv) × (1 - 物魔耐性/100) × (1 - 武器耐性/100) - 計算後敵(M)DEF)`

**実装詳細**:
```typescript
interface BaseDamageInput {
  playerLevel: number
  referenceStat: number
  enemyLevel: number
  physicalResistance: number // %
  magicalResistance: number // %
  weaponResistance: number // % (現在は0固定)
  attackType: 'physical' | 'magical'
  enemyDEF: number
  enemyMDEF: number
  physicalPenetration: number
  magicalPenetration: number
  // 状態異常・バフ（将来実装）
  hasDestruction?: boolean
  eternalNightmareReduction?: number
}
```

##### 1.2 敵防御力処理システム
- **実装ファイル**: `src/utils/enemyDefenseProcessor.ts`
- **関数名**: `processEnemyDefense`

**処理順序**:
1. 基本防御力取得（DEF or MDEF）
2. 破壊状態異常による半減（Math.ceil(def / 2)）※未実装
3. エターナルナイトメア減算 ※未実装
4. 貫通による低下（Math.floor(Math.max(0, def - penetration))）

##### 1.3 固定値加算（ステップ2）
- **実装ファイル**: `src/utils/damageCalculation.ts`
- **関数名**: `applyFixedValues`
- **計算式**: `INT(基礎ダメージ + 抜刀固定値 + スキル固定値)`

**実装詳細**:
```typescript
interface FixedValuesInput {
  baseDamage: number
  unsheatheFixedDamage: number
  skillFixedDamage: number
  isUnsheatheAttack: boolean
}
```

#### 完了条件
- [ ] 基本ダメージ計算の単体テスト（5パターン以上）
- [ ] 敵防御力処理の単体テスト（貫通のみ）
- [ ] 固定値加算の単体テスト
- [ ] 計算過程の詳細記録機能

---

### 📋 フェーズ2: 倍率システム（優先度: 高）

#### 目標
- 属性有利・スキル倍率の実装
- 抜刀%・慣れ・距離補正の実装
- StatusPreviewとの連携

#### 実装項目

##### 2.1 属性有利補正（ステップ3）
- **実装ファイル**: `src/utils/damageCalculation.ts`
- **関数名**: `applyElementAdvantage`
- **計算式**: `INT(固定値適用後 × (1 + 有利/100))`

**実装詳細**:
```typescript
interface ElementAdvantageInput {
  damage: number
  totalElementAdvantage: number // 基本ステータスから取得
  elementAwakeningAdvantage: number // 25%固定（実装予定）
  isElementAttack: boolean // UI制御
}
```

##### 2.2 スキル倍率補正（ステップ4）
- **実装ファイル**: `src/utils/damageCalculation.ts`
- **関数名**: `applySkillMultiplier`
- **計算式**: `INT(有利適用後 × スキル倍率/100)`

##### 2.3 抜刀%補正（ステップ5）
- **実装ファイル**: `src/utils/damageCalculation.ts`
- **関数名**: `applyUnsheatheRate`
- **計算式**: `INT(スキル倍率適用後 × (1 + 抜刀%/100))`

##### 2.4 慣れ補正（ステップ6）
- **実装ファイル**: `src/utils/damageCalculation.ts`
- **関数名**: `applyFamiliarity`
- **計算式**: `INT(抜刀%適用後 × 慣れ/100)`

##### 2.5 距離補正（ステップ7）
- **実装ファイル**: `src/utils/damageCalculation.ts`
- **関数名**: `applyDistance`
- **計算式**: `INT(慣れ適用後 × (1 + 距離/100))`

**実装詳細**:
```typescript
interface DistanceInput {
  damage: number
  attackSkill: AttackSkill
  currentDistance: 'short' | 'long' // ユーザーが選択した距離
  shortRangeMultiplier: number // 近距離威力(%)
  longRangeMultiplier: number // 遠距離威力(%)
}

function applyDistance(input: DistanceInput): number {
  // 攻撃スキルが現在の距離で補正対応しているかチェック
  if (!input.attackSkill.supportedDistances.includes(input.currentDistance)) {
    return input.damage // 距離補正なし
  }
  
  const multiplier = input.currentDistance === 'short' 
    ? input.shortRangeMultiplier 
    : input.longRangeMultiplier
    
  return Math.floor(input.damage * (1 + multiplier / 100))
}
```

#### 完了条件
- [ ] 各補正の単体テスト
- [ ] 複合テスト（ステップ1-7の連続計算）
- [ ] StatusPreviewからのデータ取得確認

---

### 📋 フェーズ3: UI連携とコンボシステム（優先度: 中）

#### 目標
- DamagePreview.tsxとの連携
- ユーザー制御可能な設定の実装
- コンボ補正の実装

#### 実装項目

##### 3.1 DamagePreview.tsx連携
**新規作成**: `src/components/damage/DamagePreview.tsx`

**UI要素**:
```typescript
interface DamagePreviewState {
  // 攻撃設定
  selectedAttackSkill: AttackSkill
  isUnsheatheAttack: boolean
  currentDistance: 'short' | 'long' // 距離判定（ユーザー選択）
  
  // 属性設定
  isElementAttack: boolean
  elementAdvantageActive: boolean
  
  // ユーザー調整値
  familiarity: number // スライダー (50-250%)
  
  // コンボ設定
  comboStrongHitActive: boolean
  
  // 敵設定（簡易）
  enemyLevel: number
  enemyDEF: number
  enemyMDEF: number
}
```

##### 3.2 コンボ補正（ステップ8）
- **実装ファイル**: `src/utils/damageCalculation.ts`
- **関数名**: `applyCombo`
- **計算式**: `INT(距離適用後 × コンボ/100)`

**実装詳細**:
```typescript
interface ComboInput {
  damage: number
  isStrongHitActive: boolean
  comboMultiplier: number // 150% (強打有効時)
}
```

##### 3.3 攻撃スキルデータ構造
**新規作成**: `src/data/attackSkills.ts`

```typescript
interface AttackSkill {
  id: string
  name: string
  type: 'physical' | 'magical'
  referenceStatType: 'totalATK' | 'MATK'
  baseMultiplier: number // %
  fixedDamage: number
  supportedDistances: ('short' | 'long')[] // 距離補正が有効な距離
  canUseLongRange: boolean // ロングレンジバフ適用可否
  weaponTypeRequirements?: WeaponType[]
}

// 例: 
// supportedDistances: ['short'] → 近距離のみ補正有効
// supportedDistances: ['long'] → 遠距離のみ補正有効  
// supportedDistances: ['short', 'long'] → 両方で補正有効
// supportedDistances: [] → 距離補正なし
```

#### 完了条件
- [ ] DamagePreview.tsxの基本UI実装
- [ ] 攻撃スキルデータの作成（10スキル以上）
- [ ] リアルタイム計算の実装
- [ ] コンボ補正の実装とテスト

---

### 📋 フェーズ4: 高度なバフシステム（優先度: 低）

#### 目標
- パッシブ倍率システムの実装
- ブレイブ倍率システムの実装
- バフスキル連携の完成

#### 実装項目

##### 4.1 パッシブ倍率計算（ステップ9）
- **実装ファイル**: `src/utils/passiveMultiplierCalculator.ts`
- **関数名**: `calculatePassiveMultiplier`

**対象スキル**:
1. 匠の剣術 - 物理攻撃時のダメージアップ
2. ロングレンジ - 遠距離攻撃時のダメージアップ
3. 体術鍛錬 - 素手・手甲時のダメージアップ
4. 強打 - バフスキルの強打（コンボとは別）
5. 集中 - 魔法攻撃時のダメージアップ

```typescript
interface PassiveMultiplierInput {
  buffSkills: BuffSkillFormData
  attackSkill: AttackSkill
  mainWeaponType: WeaponType
  currentDistance: 'short' | 'long'
}

// 計算例: 複数バフが有効な場合
function calculatePassiveMultiplier(input: PassiveMultiplierInput): number {
  let totalMultiplier = 0
  
  // 匠の剣術（物理攻撃時）
  if (input.attackSkill.type === 'physical' && input.buffSkills.skills.masterSword?.isEnabled) {
    totalMultiplier += getMasterSwordMultiplier(input.buffSkills.skills.masterSword.level)
  }
  
  // ロングレンジ（遠距離攻撃 && スキルが対応 && バフ有効時）
  if (input.currentDistance === 'long' && 
      input.attackSkill.canUseLongRange &&
      input.buffSkills.skills.longRange?.isEnabled) {
    totalMultiplier += getLongRangeMultiplier(input.buffSkills.skills.longRange.level)
  }
  
  // 体術鍛錬（素手・手甲時）
  if ((input.mainWeaponType === '素手' || input.mainWeaponType === '手甲') &&
      input.buffSkills.skills.martialTraining?.isEnabled) {
    totalMultiplier += getMartialTrainingMultiplier(input.buffSkills.skills.martialTraining.level)
  }
  
  // 加算結果を返す（要検証）
  return totalMultiplier
}
```

##### 4.2 ブレイブ倍率計算（ステップ10）
- **実装ファイル**: `src/utils/braveMultiplierCalculator.ts`
- **関数名**: `calculateBraveMultiplier`

**対象スキル**:
1. ブレイブオーラ - 基本的なダメージアップ
2. マナリチャージ - MP消費でダメージアップ
3. 獅子奮闘・極 - HP低下時のダメージアップ
4. オーラブレード - 武器攻撃時のダメージアップ
5. アシュラオーラ - 連続攻撃時のダメージアップ
6. エンハンス - 属性攻撃時のダメージアップ

##### 4.3 バフスキル統合システム
- **実装ファイル**: `src/utils/buffSkillDamageEffects.ts`
- **関数名**: `getBuffSkillDamageEffects`

#### 完了条件
- [ ] パッシブ倍率の実装と単体テスト
- [ ] ブレイブ倍率の実装と単体テスト
- [ ] バフスキルとの完全連携
- [ ] 複合バフの重複計算テスト

---

### 📋 フェーズ5: 高度な機能と最適化（優先度: 低）

#### 目標
- 状態異常システムの実装
- エターナルナイトメアの実装
- 計算最適化とキャッシュ

#### 実装項目

##### 5.1 状態異常システム
**新規作成**: `src/utils/statusAilmentEffects.ts`

```typescript
interface StatusAilment {
  type: 'destruction' | 'poison' | 'paralysis' // など
  isActive: boolean
  level?: number
  duration?: number
}

interface EnemyStatusEffects {
  destruction: boolean // 破壊状態異常
  // 他の状態異常も追加予定
}
```

##### 5.2 エターナルナイトメア実装
- **実装ファイル**: `src/utils/eternalNightmareCalculator.ts`
- **計算式**: `エターナルナイトメアLv × ダークパワー合計Lv × 0.5`
- **例**: Lv10 × 80 × 0.5 = 400（DEF/MDEFから400減算）

```typescript
interface EternalNightmareInput {
  eternalNightmareLevel: number // 1-10
  totalDarkPowerLevel: number // ダークパワースキル合計レベル
}

function calculateEternalNightmareReduction(input: EternalNightmareInput): number {
  return input.eternalNightmareLevel * input.totalDarkPowerLevel * 0.5
}
```

##### 5.3 計算最適化
- **キャッシュシステム**: 同一条件での再計算を避ける
- **バッチ計算**: 複数シナリオの一括計算
- **メモ化**: 計算結果の記憶

#### 完了条件
- [ ] 状態異常システムの基本実装
- [ ] エターナルナイトメアの仕様確定と実装
- [ ] 計算パフォーマンスの最適化
- [ ] メモリ使用量の最適化

---

## データ依存関係

### 必要な既存データ
1. **基本ステータス**: `basicStats`（StatusPreviewから取得）
   - 総ATK, MATK, レベル
   - 物理耐性, 魔法耐性
   - 総属性有利, 物理貫通, 魔法貫通

2. **装備品補正値**: `equipmentBonus1`
   - 抜刀威力(+), 抜刀威力(%)
   - 近距離威力(%), 遠距離威力(%)

3. **敵情報**: `data.enemy`
   - レベル, DEF, MDEF

4. **バフスキル**: `data.buffSkills`（フェーズ4以降）
   - 各バフスキルの有効状態とレベル

### 新規作成データ
1. **攻撃スキルマスタ**: `src/data/attackSkills.ts`
2. **ダメージ計算設定**: `src/types/damageCalculation.ts`
3. **UI状態管理**: DamagePreview専用のstate

---

## テスト戦略

### 単体テスト
各計算ステップごとの独立したテスト

```typescript
describe('ダメージ計算', () => {
  describe('基礎ダメージ計算', () => {
    test('物理攻撃の基礎ダメージ', () => {
      const input = {
        playerLevel: 150,
        referenceStat: 2500,
        enemyLevel: 100,
        // ...
      }
      const result = calculateBaseDamage(input)
      expect(result).toBe(expectedValue)
    })
    
    // 境界値テスト
    test('最低ダメージ保証', () => {
      // 計算結果が1未満になるケース
    })
    
    test('負のダメージ処理', () => {
      // 防御力が攻撃力を上回るケース
    })
  })
  
  // 各ステップのテスト
  describe('属性有利補正', () => {
    test('属性攻撃有効時', () => {})
    test('属性攻撃無効時', () => {})
  })
})
```

### 統合テスト
複数ステップを組み合わせた計算の確認

### E2Eテスト
UIからの実際の操作によるテスト

---

## ファイル構成

```
src/
├── utils/
│   ├── damageCalculation.ts           # メイン計算エンジン
│   ├── enemyDefenseProcessor.ts       # 敵防御力処理
│   ├── passiveMultiplierCalculator.ts # パッシブ倍率計算
│   ├── braveMultiplierCalculator.ts   # ブレイブ倍率計算
│   ├── buffSkillDamageEffects.ts      # バフスキル効果統合
│   └── statusAilmentEffects.ts        # 状態異常効果
├── types/
│   └── damageCalculation.ts           # 型定義
├── data/
│   └── attackSkills.ts                # 攻撃スキルマスタ
├── components/
│   └── damage/
│       └── DamagePreview.tsx          # ダメージプレビューUI
└── __tests__/
    └── damage/
        ├── damageCalculation.test.ts   # 単体テスト
        └── integration.test.ts         # 統合テスト
```

---

## 進行スケジュール

### 週1-2: フェーズ1（基本計算エンジン）
- [ ] 基本ダメージ計算の実装
- [ ] 敵防御力処理の実装
- [ ] 固定値加算の実装
- [ ] 単体テスト作成

### 週3-4: フェーズ2（倍率システム）
- [ ] 属性有利～距離補正の実装
- [ ] StatusPreview連携
- [ ] 統合テスト作成

### 週5-6: フェーズ3（UI連携）
- [ ] DamagePreview.tsx作成
- [ ] 攻撃スキルデータ作成
- [ ] リアルタイム計算実装

### 週7-8: フェーズ4（バフシステム）
- [ ] パッシブ倍率実装
- [ ] ブレイブ倍率実装
- [ ] バフスキル連携

### 週9-10: フェーズ5（高度な機能）
- [ ] 状態異常システム
- [ ] 最適化とキャッシュ
- [ ] 完成テスト

---

## リスクと対策

### 技術的リスク
1. **計算精度の問題**: トーラムオンラインとの誤差
   - **対策**: 詳細なテストケース作成、実ゲームとの検証

2. **パフォーマンス問題**: 複雑な計算による遅延
   - **対策**: メモ化、キャッシュ、バッチ計算

3. **データ依存関係**: 他のシステムとの結合度
   - **対策**: インターフェース明確化、モック使用

### 仕様リスク
1. **不明確な仕様**: エターナルナイトメアなど
   - **対策**: 段階的実装、後から追加可能な設計

2. **仕様変更**: ゲームアップデートによる計算式変更
   - **対策**: 設定可能な計算パラメータ化

---

## 完了条件

### フェーズ1完了条件
- [ ] 基本ダメージ計算（ステップ1-2）の完全実装
- [ ] 単体テスト100%パス
- [ ] 計算過程の詳細記録

### フェーズ2完了条件
- [ ] ステップ3-7の完全実装
- [ ] StatusPreviewとの連携確認
- [ ] 統合テスト100%パス

### フェーズ3完了条件
- [ ] DamagePreview.tsxの基本機能実装
- [ ] リアルタイム計算の動作確認
- [ ] ユーザー操作による計算結果変更

### 全体完了条件
- [ ] 全10ステップの完全実装
- [ ] 全フェーズの機能動作確認
- [ ] パフォーマンス要件達成（計算時間 < 10ms）
- [ ] 実ゲームとの計算結果一致確認

---

この実装計画に基づいて段階的に開発を進めることで、確実で保守性の高いダメージ計算システムを構築できます。