# AttackSkill計算モジュール設計書

## 概要

攻撃スキルの特殊な倍率・固定値計算を処理する独立したモジュールです。表示専用のAttackSkillFormとは分離し、実際の計算ロジックを担当します。

### 対象スキル例
1. **ムーンスラッシュ**: 倍率が特殊（2撃目は`|補正後STR|%`）、固定値も特殊（2撃目は`基礎INT/2`）
2. **ストライクスタブ(通常時)**: 倍率が特殊（`|200+補正後STR/5|%`）、固定値に装備ボーナス（`100 (旋風槍装備時+100)`）
3. **ストライクスタブ(敵状態異常時)**: 倍率が特殊（`400+補正後STRx20%`）、固定値に装備ボーナス（`100 (旋風槍装備時+100)`）

## 設計原則

1. **分離設計**: 表示(AttackSkillForm)と計算(このモジュール)の完全分離
2. **拡張性**: 新しいスキルの計算式を簡単に追加可能
3. **型安全性**: TypeScriptで完全な型チェック
4. **テスタビリティ**: 各計算関数の独立テスト可能

## データ構造

### 基本型定義

```typescript
// プレイヤーステータス（計算に必要な値）
interface PlayerStats {
  // 基本ステータス
  baseSTR: number
  baseDEX: number
  baseINT: number
  baseAGI: number
  baseVIT: number
  
  // 補正後ステータス
  adjustedSTR: number
  adjustedDEX: number
  adjustedINT: number
  adjustedAGI: number
  adjustedVIT: number
  
  // 計算済み値
  totalATK: number
  MATK: number
  HP: number
  MP: number
  level: number
}

// 装備情報（計算に必要な値）
interface EquipmentContext {
  mainWeaponType: WeaponType | null
  subWeaponType: WeaponType | null
  // 特定装備の判定用
  hasHalberdEquipped: boolean  // 旋風槍装備判定
  // 将来拡張: 他の特殊装備判定
}

// 計算結果
interface SkillCalculationResult {
  hitNumber: number
  calculatedMultiplier: number    // 計算された実際の倍率%
  calculatedFixedDamage: number   // 計算された実際の固定値
  calculationProcess?: string     // 計算過程の説明（デバッグ用）
}

// スキル計算入力
interface SkillCalculationInput {
  skillId: string
  hitNumber: number
  playerStats: PlayerStats
  equipmentContext: EquipmentContext
}
```

## 計算システム設計

### メイン計算エンジン

```typescript
// メイン計算エンジン
class AttackSkillCalculator {
  /**
   * スキルの計算を実行
   */
  calculateSkill(
    skillId: string, 
    playerStats: PlayerStats, 
    equipmentContext: EquipmentContext
  ): SkillCalculationResult[] {
    const skill = getAttackSkillById(skillId)
    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`)
    }
    
    return skill.hits.map(hit => 
      this.calculateHit({
        skillId,
        hitNumber: hit.hitNumber,
        playerStats,
        equipmentContext
      })
    )
  }
  
  /**
   * 単一撃の計算
   */
  private calculateHit(input: SkillCalculationInput): SkillCalculationResult {
    const calculator = this.getCalculatorForSkill(input.skillId)
    return calculator.calculate(input)
  }
  
  /**
   * スキル固有の計算機を取得
   */
  private getCalculatorForSkill(skillId: string): SkillHitCalculator {
    switch (skillId) {
      case 'moon_slash':
        return new MoonSlashCalculator()
      case 'strike_stab':
        return new StrikeStabCalculator()
      case 'slash':
      case 'magic_arrow':
      case 'power_shot':
      case 'dual_strike':
        return new StandardCalculator()
      default:
        throw new Error(`No calculator found for skill: ${skillId}`)
    }
  }
}
```

## 個別スキル計算器

### 基底クラス

```typescript
// 基底クラス
abstract class SkillHitCalculator {
  abstract calculate(input: SkillCalculationInput): SkillCalculationResult
  
  protected getSkillHit(skillId: string, hitNumber: number): AttackHit {
    const skill = getAttackSkillById(skillId)
    const hit = skill?.hits.find(h => h.hitNumber === hitNumber)
    if (!hit) {
      throw new Error(`Hit ${hitNumber} not found for skill: ${skillId}`)
    }
    return hit
  }
}
```

### 標準計算器

```typescript
// 標準計算（固定値スキル用）
class StandardCalculator extends SkillHitCalculator {
  calculate(input: SkillCalculationInput): SkillCalculationResult {
    const hit = this.getSkillHit(input.skillId, input.hitNumber)
    
    return {
      hitNumber: input.hitNumber,
      calculatedMultiplier: hit.multiplier,      // 表示値をそのまま使用
      calculatedFixedDamage: hit.fixedDamage,    // 表示値をそのまま使用
      calculationProcess: `Fixed values: ${hit.multiplier}%, ${hit.fixedDamage}`
    }
  }
}
```

### ムーンスラッシュ計算器

```typescript
// ムーンスラッシュ専用計算
class MoonSlashCalculator extends SkillHitCalculator {
  calculate(input: SkillCalculationInput): SkillCalculationResult {
    const { hitNumber, playerStats } = input
    
    switch (hitNumber) {
      case 1:
        return {
          hitNumber: 1,
          calculatedMultiplier: 1000,           // 固定1000%
          calculatedFixedDamage: 400,           // 固定400
          calculationProcess: "Fixed: 1000%, 400"
        }
        
      case 2:
        const multiplier = Math.abs(playerStats.adjustedSTR)
        const fixedDamage = Math.floor(playerStats.baseINT / 2)
        
        return {
          hitNumber: 2,
          calculatedMultiplier: multiplier,
          calculatedFixedDamage: fixedDamage,
          calculationProcess: `|${playerStats.adjustedSTR}| = ${multiplier}%, floor(${playerStats.baseINT}/2) = ${fixedDamage}`
        }
        
      default:
        throw new Error(`Invalid hit number for Moon Slash: ${hitNumber}`)
    }
  }
}
```

### ストライクスタブ(通常時)計算器

```typescript
// ストライクスタブ(通常時)専用計算
class StrikeStabCalculator extends SkillHitCalculator {
  calculate(input: SkillCalculationInput): SkillCalculationResult {
    const { hitNumber, playerStats, equipmentContext } = input
    
    // 倍率計算: |200+補正後STR/5|%
    const multiplierValue = 200 + playerStats.adjustedSTR / 5
    const multiplier = Number(Math.abs(multiplierValue).toFixed(2))
    
    // 固定値計算: 100 (旋風槍装備時+100)
    const baseFixedDamage = 100
    const equipmentBonus = equipmentContext.hasHalberdEquipped ? 100 : 0
    const fixedDamage = baseFixedDamage + equipmentBonus
    
    return {
      hitNumber,
      calculatedMultiplier: multiplier,
      calculatedFixedDamage: fixedDamage,
      calculationProcess: `|200+floor(${playerStats.adjustedSTR}/5)| = ${multiplier}%, 100${equipmentBonus > 0 ? '+100(旋風槍)' : ''} = ${fixedDamage}`
    }
  }
}
```

### ストライクスタブ(敵状態異常時)計算器

```typescript
// ストライクスタブ(敵状態異常時)専用計算
class StrikeStabAilmentCalculator extends SkillHitCalculator {
  calculate(input: SkillCalculationInput): SkillCalculationResult {
    const { hitNumber, playerStats, equipmentContext } = input
    
    // 倍率計算: 400+補正後STRx20%
    const multiplierValue = 400 + playerStats.adjustedSTR * 0.2
    const multiplier = Number(multiplierValue.toFixed(2))
    
    // 固定値計算: 100 (旋風槍装備時+100)
    const baseFixedDamage = 100
    const equipmentBonus = equipmentContext.hasHalberdEquipped ? 100 : 0
    const fixedDamage = baseFixedDamage + equipmentBonus
    
    return {
      hitNumber,
      calculatedMultiplier: multiplier,
      calculatedFixedDamage: fixedDamage,
      calculationProcess: `400+${playerStats.adjustedSTR}x20% = 400+${(playerStats.adjustedSTR * 0.2).toFixed(2)} = ${multiplier}%, 100${equipmentBonus > 0 ? '+100(旋風槍)' : ''} = ${fixedDamage}`
    }
  }
}
```

## ユーティリティ関数

```typescript
// 計算支援関数
export class SkillCalculationUtils {
  /**
   * プレイヤーステータスを取得（他のストアから）
   */
  static getPlayerStats(): PlayerStats {
    // CalculatorStoreから現在のステータスを取得
    const store = useCalculatorStore.getState()
    const { baseStats, mainWeapon, subWeapon, equipment, crystals } = store.data
    
    // 基本ステータス計算（既存のbasicStatsCalculation.tsを使用）
    const results = calculateResults(store.data)
    
    return {
      baseSTR: baseStats.STR,
      baseDEX: baseStats.DEX,
      baseINT: baseStats.INT,
      baseAGI: baseStats.AGI,
      baseVIT: baseStats.VIT,
      
      // TODO: 補正後ステータスの計算実装
      adjustedSTR: baseStats.STR, // 暫定
      adjustedDEX: baseStats.DEX, // 暫定
      adjustedINT: baseStats.INT, // 暫定
      adjustedAGI: baseStats.AGI, // 暫定
      adjustedVIT: baseStats.VIT, // 暫定
      
      totalATK: results.totalATK || 0,
      MATK: results.MATK || 0,
      HP: results.HP || 0,
      MP: results.MP || 0,
      level: baseStats.level
    }
  }
  
  /**
   * 装備コンテキストを取得
   */
  static getEquipmentContext(): EquipmentContext {
    const store = useCalculatorStore.getState()
    const { mainWeapon, subWeapon } = store.data
    
    return {
      mainWeaponType: mainWeapon.type,
      subWeaponType: subWeapon.type,
      hasHalberdEquipped: mainWeapon.type === '旋風槍'
    }
  }
}
```

## 統合インターフェース

```typescript
// 外部からの呼び出し用
export class AttackSkillCalculationService {
  private calculator = new AttackSkillCalculator()
  
  /**
   * 現在のプレイヤー状態でスキル計算を実行
   */
  calculateCurrentSkill(skillId: string): SkillCalculationResult[] {
    const playerStats = SkillCalculationUtils.getPlayerStats()
    const equipmentContext = SkillCalculationUtils.getEquipmentContext()
    
    return this.calculator.calculateSkill(skillId, playerStats, equipmentContext)
  }
  
  /**
   * 特定の条件でスキル計算を実行（テスト用）
   */
  calculateSkillWithStats(
    skillId: string,
    playerStats: PlayerStats,
    equipmentContext: EquipmentContext
  ): SkillCalculationResult[] {
    return this.calculator.calculateSkill(skillId, playerStats, equipmentContext)
  }
}

// シングルトンインスタンス
export const attackSkillCalculation = new AttackSkillCalculationService()
```

## ファイル構成

```
src/utils/attackSkillCalculation/
├── index.ts                    // 外部公開インターフェース
├── types.ts                    // 型定義
├── AttackSkillCalculator.ts    // メイン計算エンジン
├── calculators/
│   ├── SkillHitCalculator.ts   // 基底クラス
│   ├── StandardCalculator.ts   // 標準計算
│   ├── MoonSlashCalculator.ts  // ムーンスラッシュ
│   ├── StrikeStabCalculator.ts // ストライクスタブ(通常時)
│   ├── StrikeStabAilmentCalculator.ts // ストライクスタブ(敵状態異常時)
│   └── index.ts               // 計算器エクスポート
├── utils.ts                   // ユーティリティ関数
└── __tests__/                 // テストファイル
    ├── MoonSlashCalculator.test.ts
    ├── StrikeStabCalculator.test.ts
    └── AttackSkillCalculator.test.ts
```

## 使用例

### AttackSkillFormでの統合

```typescript
// AttackSkillFormでの使用
import { attackSkillCalculation } from '@/utils/attackSkillCalculation'

function updateSkillCalculation(skillId: string) {
  try {
    const results = attackSkillCalculation.calculateCurrentSkill(skillId)
    
    // 計算結果をストアに保存
    updateAttackSkill({
      selectedSkillId: skillId,
      calculatedData: results.map(result => ({
        hitNumber: result.hitNumber,
        calculatedMultiplier: result.calculatedMultiplier,
        calculatedFixedDamage: result.calculatedFixedDamage,
        // その他の表示用データ...
      })),
      lastCalculatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Skill calculation failed:', error)
  }
}
```

### テスト例

```typescript
// テスト例
describe('MoonSlashCalculator', () => {
  const calculator = new MoonSlashCalculator()
  
  test('1撃目は固定値', () => {
    const result = calculator.calculate({
      skillId: 'moon_slash',
      hitNumber: 1,
      playerStats: mockPlayerStats,
      equipmentContext: mockEquipmentContext
    })
    
    expect(result.calculatedMultiplier).toBe(1000)
    expect(result.calculatedFixedDamage).toBe(400)
  })
  
  test('2撃目はSTRとINTに依存', () => {
    const playerStats = {
      ...mockPlayerStats,
      adjustedSTR: -150,  // 負の値でもabs()で正になる
      baseINT: 99
    }
    
    const result = calculator.calculate({
      skillId: 'moon_slash',
      hitNumber: 2,
      playerStats,
      equipmentContext: mockEquipmentContext
    })
    
    expect(result.calculatedMultiplier).toBe(150)  // |−150| = 150
    expect(result.calculatedFixedDamage).toBe(49)  // floor(99/2) = 49
  })
})
```

## 実装フェーズ

### フェーズ1: 基盤構築
- [ ] 型定義の作成 (`types.ts`)
- [ ] 基底クラスの実装 (`SkillHitCalculator.ts`)
- [ ] メイン計算エンジンの実装 (`AttackSkillCalculator.ts`)
- [ ] ユーティリティ関数の実装 (`utils.ts`)

### フェーズ2: 標準計算器
- [ ] 標準計算器の実装 (`StandardCalculator.ts`)
- [ ] 統合インターフェースの実装 (`index.ts`)
- [ ] 基本テストの作成

### フェーズ3: 特殊計算器
- [ ] ムーンスラッシュ計算器の実装 (`MoonSlashCalculator.ts`)
- [ ] ストライクスタブ(通常時)計算器の実装 (`StrikeStabCalculator.ts`)
- [ ] 特殊計算のテスト作成

### フェーズ4: 統合・最適化
- [ ] AttackSkillFormとの統合
- [ ] エラーハンドリングの強化
- [ ] パフォーマンス最適化
- [ ] 包括的なテストスイート

## 拡張ポイント

### 新しいスキル追加

1. 新しい計算器クラスを`calculators/`に追加
2. `AttackSkillCalculator.getCalculatorForSkill()`にケースを追加
3. テストファイルを`__tests__/`に追加

### 新しい計算要素

- 装備ボーナス（武器種別、精錬値など）
- バフ効果の適用
- 敵の状態による補正
- 時間帯やエリアによる補正

この設計により、攻撃スキルの複雑な計算を体系的に管理し、新しいスキルの追加や既存スキルの修正を容易にできます。各計算器は独立してテスト可能で、メンテナンス性も高くなります。