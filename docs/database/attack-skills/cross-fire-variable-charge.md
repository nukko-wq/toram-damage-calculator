# クロスファイア(溜め可変) スキル追加仕様書

## 概要

AttackSkillFormに新しい攻撃スキル「クロスファイア(溜め可変)」を追加するための詳細仕様書です。設計書`attack-skill-form.md`と`attack-skill-calculation.md`に基づいて、系統的にスキルデータを定義します。

このスキルは溜め回数を1-5の範囲で可変設定可能な特殊スキルで、DamagePreviewに専用UIを用意する仕様です。

## 基本情報

- **スキル名**: クロスファイア(溜め可変)
- **スキルID**: `cross_fire_variable_charge`
- **系統グループ**: `bow` (弓系統)
- **カテゴリ**: `shoot` (シュート)
- **武器種要件**: `弓`, `自動弓`
- **消費MP**: 400
- **表示順序**: 502 (500番台: 弓系統)
- **特殊機能**: 溜め回数可変設定（1-5回）

## データ構造定義

### AttackSkill オブジェクト

```typescript
{
  // 基本情報
  id: 'cross_fire_variable_charge',
  name: 'クロスファイア(溜め可変)',
  order: 502,                    // 弓系統500番台
  systemGroup: 'bow',            // 弓系統
  category: 'shoot',             // シュートカテゴリ
  weaponTypeRequirements: ['弓', '自動弓'],
  
  // 消費・条件
  mpCost: 400,
  
  // 表示用計算式説明
  multiplierFormula: '弓:特殊計算(溜め可変)、自動弓:特殊計算(溜め可変)',
  fixedDamageFormula: '400/400',
  
  // 特殊機能フラグ
  hasVariableCharging: true,     // 溜め可変機能あり
  chargingRange: {               // 溜め回数設定範囲
    min: 1,
    max: 5,
    default: 1
  },
  
  // 攻撃情報（2hit攻撃）
  hits: [
    {
      hitNumber: 1,
      attackType: 'physical',
      referenceDefense: 'DEF',
      referenceResistance: 'physical',
      powerReference: 'ATK',
      
      // 表示用倍率・固定値（デフォルト値: 溜め1回）
      multiplier: 1950,          // 弓装備時の表示用（実際は特殊計算）
      fixedDamage: 400,          // 固定ダメージ400
      
      // 慣れ設定
      adaptation: 'physical',     // 物理慣れ参照
      adaptationGrant: 'physical',  // 物理慣れ付与
      
      // 補正適用設定（仕様保留）
      canUseUnsheathePower: false,  // 抜刀威力適用（要決定）
      canUseLongRange: true,        // ロングレンジ適用可能（弓系統）
      canUseShortRangePower: true,  // 近距離威力適用可能
      canUseLongRangePower: true,   // 遠距離威力適用可能（弓系統）
      
      // 特殊効果（自動弓のみ物理貫通）
      specialEffects: ['物理貫通'] // 自動弓装備時のみ適用
    },
    {
      hitNumber: 2,
      attackType: 'physical',
      referenceDefense: 'DEF',
      referenceResistance: 'physical',
      powerReference: 'ATK',
      
      // 表示用倍率・固定値（デフォルト値: 溜め1回）
      multiplier: 200,           // 弓装備時の表示用（100%x2）
      fixedDamage: 400,          // 固定ダメージ400
      
      // 慣れ設定
      adaptation: 'physical',     // 物理慣れ参照
      adaptationGrant: 'physical',  // 物理慣れ付与
      
      // 補正適用設定（仕様保留）
      canUseUnsheathePower: false,  // 抜刀威力適用（要決定）
      canUseLongRange: true,        // ロングレンジ適用可能（弓系統）
      canUseShortRangePower: true,  // 近距離威力適用可能
      canUseLongRangePower: true,   // 遠距離威力適用可能（弓系統）
      
      // 特殊効果（自動弓のみ物理貫通）
      specialEffects: ['物理貫通'] // 自動弓装備時のみ適用
    }
  ]
}
```

## 計算仕様（仮）

### 計算タイプ
- **計算方式**: 特殊計算（CrossFireVariableChargeCalculator専用）
- **溜め回数依存**: 1-5回の可変溜めにより威力が変動
- **1撃目**: 弓:|950xチャージ数+基礎DEXx20%xチャージ数|%、自動弓:900xチャージ数%
- **2撃目**: 弓:200%x(チャージ数-1)、自動弓:300%x(チャージ数-1)、チャージ数1の場合倍率・固定ダメージ共に0、チャージ数2以上の場合固定ダメージ400
- **特殊計算**: あり（武器種・溜め回数・基礎DEX依存）

### 計算処理（仮実装）

専用の`CrossFireVariableChargeCalculator`を使用した特殊計算を行います：

```typescript
class CrossFireVariableChargeCalculator extends SkillHitCalculator {
  calculate(input: SkillCalculationInput): SkillCalculationResult {
    const { hitNumber, playerStats, equipmentContext, variableOptions } = input
    const chargeLevel = variableOptions?.chargeLevel ?? 1 // デフォルト1回

    switch (hitNumber) {
      case 1: {
        // 1撃目: 武器種・溜め回数に応じた計算
        let multiplier: number
        
        if (equipmentContext.mainWeaponType === '弓') {
          // 弓: |950xチャージ数+基礎DEXx20%xチャージ数|
          const baseMultiplier = 950 * chargeLevel
          const dexBonus = Math.floor(playerStats.baseDEX * 0.2) * chargeLevel
          multiplier = Math.abs(baseMultiplier + dexBonus)
        } else if (equipmentContext.mainWeaponType === '自動弓') {
          // 自動弓: 900xチャージ数
          multiplier = 900 * chargeLevel
        } else {
          multiplier = 0 // 武器種不適合
        }
        
        // 自動弓装備時は物理貫通効果を追加
        const physicalPenetration = equipmentContext.mainWeaponType === '自動弓'
          ? Math.abs(Math.floor(playerStats.baseDEX * 0.1))
          : 0
        
        return {
          hitNumber: 1,
          calculatedMultiplier: multiplier,
          calculatedFixedDamage: 400,
          physicalPenetration: physicalPenetration,
          calculationProcess: equipmentContext.mainWeaponType === '弓'
            ? `|950x${chargeLevel} + floor(${playerStats.baseDEX} * 0.2)x${chargeLevel}| = ${multiplier}%`
            : `900x${chargeLevel} = ${multiplier}%` + (physicalPenetration > 0 ? `, 物理貫通: ${physicalPenetration}%` : '')
        }
      }

      case 2: {
        // 2撃目: 武器種・溜め回数に応じた計算
        let multiplier: number
        
        if (equipmentContext.mainWeaponType === '弓') {
          // 弓: 200%x(チャージ数-1)
          multiplier = chargeLevel > 1 ? 200 * (chargeLevel - 1) : 0
        } else if (equipmentContext.mainWeaponType === '自動弓') {
          // 自動弓: 300%x(チャージ数-1)
          multiplier = chargeLevel > 1 ? 300 * (chargeLevel - 1) : 0
        } else {
          multiplier = 0 // 武器種不適合
        }
        
        // 自動弓装備時は物理貫通効果を追加
        const physicalPenetration = equipmentContext.mainWeaponType === '自動弓'
          ? Math.abs(Math.floor(playerStats.baseDEX * 0.1))
          : 0
        
        return {
          hitNumber: 2,
          calculatedMultiplier: multiplier,
          calculatedFixedDamage: chargeLevel > 1 ? 400 : 0,
          physicalPenetration: physicalPenetration,
          calculationProcess: equipmentContext.mainWeaponType === '弓'
            ? `200x(${chargeLevel}-1) = ${multiplier}%` + (chargeLevel > 1 ? ', 固定400' : ', 固定0')
            : `300x(${chargeLevel}-1) = ${multiplier}%` + (chargeLevel > 1 ? ', 固定400' : ', 固定0') + (physicalPenetration > 0 ? `, 物理貫通: ${physicalPenetration}%` : '')
        }
      }

      default:
        throw new Error(`Invalid hit number for Cross Fire (Variable Charge): ${hitNumber}`)
    }
  }
  
  private getChargeMultiplier(chargeLevel: number, hitNumber: number, weaponType?: string): number {
    // このメソッドは使用されない（直接計算に変更）
    return 0
  }
}
```

## 専用UI仕様

### DamagePreview内の専用UI配置

クロスファイア(溜め可変)がセットされている場合、DamagePreviewの威力オプション→ボス難易度の上部に専用UIを表示します。

```typescript
// 溜め回数設定UI
interface ChargeVariableUI {
  // 表示条件
  isVisible: boolean // スキルが'cross_fire_variable_charge'の場合のみtrue
  
  // UI要素
  label: '溜め回数'
  inputType: 'number'
  inputRange: {
    min: 1,
    max: 5,
    step: 1,
    default: 1
  }
  
  // UI配置
  position: 'damagePreview.powerOptions.beforeBossDifficulty'
  
  // スタイル
  className: 'flex items-center gap-2 mb-4'
}
```

### UI実装仕様

```tsx
// DamagePreview内の専用UI部分
{selectedSkill?.id === 'cross_fire_variable_charge' && (
  <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
    <label htmlFor="charge-level" className="text-sm font-medium text-blue-800">
      溜め回数:
    </label>
    <input
      id="charge-level"
      type="number"
      min={1}
      max={5}
      step={1}
      defaultValue={1}
      value={chargeLevel}
      onChange={(e) => setChargeLevel(parseInt(e.target.value) || 1)}
      className="w-16 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    <span className="text-xs text-blue-600">回 (1-5)</span>
  </div>
)}
```

### 状態管理仕様

```typescript
// UI State (uiStore または専用state)
interface VariableChargeState {
  chargeLevel: number // 1-5, default: 1
}

// Calculator Store連携
interface AttackSkillState {
  selectedSkill: AttackSkill | null
  variableOptions?: {
    chargeLevel?: number // クロスファイア(溜め可変)の場合のみ使用
  }
}

// 状態更新関数
const updateChargeLevel = (level: number) => {
  if (level < 1 || level > 5) return
  
  // uiStoreまたは専用stateの更新
  setChargeLevel(level)
  
  // calculatorStoreのvariableOptions更新
  updateVariableOptions({ chargeLevel: level })
  
  // 再計算のトリガー
  triggerRecalculation()
}
```

## UI配置詳細

### DamagePreview内の表示位置

```tsx
<div className="damage-preview">
  {/* 既存の威力オプション */}
  <div className="power-options">
    
    {/* 👆 この位置に溜め回数設定UIを挿入 */}
    {selectedSkill?.id === 'cross_fire_variable_charge' && (
      <ChargeVariableUI />
    )}
    
    {/* 既存のボス難易度設定 */}
    <div className="boss-difficulty">
      {/* ... */}
    </div>
    
    {/* その他の威力オプション */}
  </div>
</div>
```

### レスポンシブ対応

```css
/* モバイル対応 */
@media (max-width: 768px) {
  .charge-variable-ui {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .charge-input {
    width: 100%;
    max-width: 120px;
  }
}
```

## 型定義拡張

### AttackSkill型の拡張

```typescript
interface AttackSkill {
  // 既存のプロパティ...
  
  // 溜め可変機能
  hasVariableCharging?: boolean
  chargingRange?: {
    min: number
    max: number
    default: number
  }
}

// 計算入力の拡張
interface SkillCalculationInput {
  // 既存のプロパティ...
  
  // 可変オプション
  variableOptions?: {
    chargeLevel?: number
  }
}
```

### UI State型の拡張

```typescript
interface UiState {
  // 既存のプロパティ...
  
  // 攻撃スキル関連UI状態
  attackSkill: {
    variableCharge: {
      chargeLevel: number // 1-5, default: 1
    }
  }
}
```

## 倍率仕様（TBD）

### 倍率テーブル構造（仮）

| 溜め回数 | 1撃目（弓） | 1撃目（自動弓） | 2撃目（弓） | 2撃目（自動弓） |
|----------|-------------|-----------------|-------------|-----------------|
| 1回      | \|950+基礎DEXx20%\|% | 900% | 0% | 0% |
| 2回      | \|1900+基礎DEXx40%\|% | 1800% | 200% | 300% |
| 3回      | \|2850+基礎DEXx60%\|% | 2700% | 400% | 600% |
| 4回      | \|3800+基礎DEXx80%\|% | 3600% | 600% | 900% |
| 5回      | \|4750+基礎DEXx100%\|% | 4500% | 800% | 1200% |

*注意: 実際の倍率データは後で記述予定*

### 計算式構造（仮）

#### 1撃目
- **弓**: `|950xチャージ数 + 基礎DEXx20%xチャージ数|%`
- **自動弓**: `900xチャージ数%`

#### 2撃目
- **弓**: `200%x(チャージ数-1)`（チャージ数1の場合は0%）
- **自動弓**: `300%x(チャージ数-1)`（チャージ数1の場合は0%）
- **固定ダメージ**: チャージ数2以上の場合400、チャージ数1の場合は0

## 仕様決定待ち項目

### 基本仕様
- [x] **表示順序**: 弓系統500番台の配置位置（502に設定済み）
- [x] **計算方式**: 特殊計算（CrossFireVariableChargeCalculator専用）
- [x] **UI配置**: DamagePreview内のボス難易度上部
- [x] **入力範囲**: 1-5回、デフォルト1回

### 威力・ダメージ仕様
- [x] **基本倍率**: 1撃目：弓|950xチャージ数+基礎DEXx20%xチャージ数|%、自動弓900xチャージ数%、2撃目：弓200%x(チャージ数-1)、自動弓300%x(チャージ数-1)
- [x] **固定ダメージ**: 1hit目は常に400固定ダメージ、2hit目はチャージ数2以上で400、チャージ数1では0
- [x] **計算式**: 弓:|950xチャージ数+基礎DEXx20%xチャージ数|%、自動弓:900xチャージ数%（1撃目）
- [x] **特殊効果**: 2撃目はチャージ数1の場合発動しない（倍率・固定ダメージ共に0）

### UI仕様
- [x] **表示条件**: cross_fire_variable_chargeスキル選択時のみ
- [x] **入力要素**: number input, 1-5範囲, デフォルト1
- [x] **配置位置**: ボス難易度設定の上部
- [ ] **バリデーション**: 入力値検証とエラー表示

### 補正適用仕様
- [ ] **抜刀威力**: 適用可否 (canUseUnsheathePower)
- [x] **ロングレンジ**: 適用可能 (canUseLongRange: true - 弓系統)
- [x] **距離威力**: 近距離威力適用可能、遠距離威力適用可能
- [x] **慣れ付与**: 物理慣れ付与 (adaptation: 'physical', adaptationGrant: 'physical')

## 実装ファイル更新予定

### 1. スキルデータ追加
- `src/data/attackSkills.ts`: 新しいスキルオブジェクトを追加

### 2. 計算器実装
- `src/utils/attackSkillCalculation/AttackSkillCalculator.ts`: `cross_fire_variable_charge`ケースを追加
- `src/utils/attackSkillCalculation/calculators/CrossFireVariableChargeCalculator.ts`: 専用計算機を作成
- `src/utils/attackSkillCalculation/calculators/index.ts`: エクスポート追加

### 3. UI実装
- `src/components/forms/AttackSkillForm.tsx`: スキル選択部分（必要に応じて）
- `src/components/damage/DamagePreview.tsx`: 溜め回数設定UI追加
- `src/components/damage/ChargeVariableUI.tsx`: 専用UI コンポーネント作成（必要に応じて）

### 4. 状態管理
- `src/stores/uiStore.ts`: variableCharge状態追加
- `src/stores/calculatorStore.ts`: variableOptions追加
- `src/hooks/useCalculatorData.ts`: variableOptions対応

### 5. 型定義拡張
- `src/types/calculator.ts`: AttackSkill, SkillCalculationInput型の拡張

## 実装優先度

### フェーズ1（基本実装）
1. **スキルデータ追加**: 基本的なスキルオブジェクト作成
2. **専用UI実装**: DamagePreview内の溜め回数設定UI
3. **状態管理実装**: 溜め回数の状態管理とストア連携
4. **型定義拡張**: 必要な型定義の追加・拡張

### フェーズ2（計算実装）
1. **計算器作成**: CrossFireVariableChargeCalculator実装
2. **倍率テーブル**: 溜め回数に応じた倍率データ実装
3. **計算連携**: AttackSkillCalculatorとの連携

### フェーズ3（詳細調整）
1. **UI改善**: バリデーション、エラーハンドリング
2. **特殊効果**: 溜め回数による追加効果実装
3. **テスト**: 単体・統合テスト実装

## 仕様決定後の実装手順

### 1. 倍率データ決定
溜め回数1-5回に対応する各hitの倍率値を決定し、仕様書に記載

### 2. UI実装
DamagePreview内に溜め回数設定UIを実装

### 3. 計算器実装
決定された倍率データに基づいて専用計算器を実装

### 4. 統合テスト
UI→状態管理→計算→表示の一連の流れをテスト

## 備考

この仕様書は基本構造と専用UI仕様を定義した初期版です。倍率データの詳細は後で記述予定で、その際に計算器の実装も完成させる必要があります。

溜め可変機能は従来のスキルにない特殊機能のため、UI設計と状態管理には特に注意が必要です。ユーザビリティを考慮し、直感的で分かりやすいUIを提供する必要があります。

## 次のステップ

1. **倍率データの決定**: 溜め回数1-5回の各倍率値を決定
2. **UI実装**: DamagePreview内の専用UI実装
3. **計算器実装**: 倍率データに基づく専用計算器作成
4. **テスト実装**: 動作確認とテスト