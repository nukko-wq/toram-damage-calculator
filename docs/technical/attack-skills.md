# 攻撃スキル一覧と詳細設計書

## 概要

この設計書では、トーラムオンラインの攻撃スキル（アクティブスキル）システムの詳細仕様を定義する。
バフスキルとは異なり、これらは直接的なダメージ計算に使用される攻撃技能である。

## 攻撃スキル系統と一覧

### 1. 剣系統 (Sword)
- **ハードヒット** (Sword-1-10)
- **バスターブレード** (Sword-3-10)
- **メテオブレイカー** (Sword-4-10)
- **ムーンスラッシュ** (Sword-5-10)
- **オーラブレード** (Sword-5-20)
- **シャットアウト(通常)** (Sword-5-30-1)
- **シャットアウト(出血付与時)** (Sword-5-30-2)
- **オーガスラッシュ** (Sword-5-40)
- **ルヴニール** (Night-4-10) - ナイト系統
- **Lブーメラン III(前提最大)** (Pal-3-10) - パラディン系統

### 2. 魔法剣士系統 (MagicWarrior)
- **エレメントスラッシュ** (MagicWarrior-2-10)
- **エンチャントソード-新仕様** (MagicWarrior-3-10)
- **エンチャントバースト:溜め0-3(新仕様)** (MagicWarrior-4-10-1~4)
- **エンチャントアガラル** (MagicWarrior-4-20)
- **ユニオンソード-新仕様** (MagicWarrior-5-10-1-1)
- **リユニオンソード** (MagicWarrior-5-10-2)

### 3. 手甲系統 (Martial)
- **ラッシュ** (Martial-3-10)
- **チャリオット** (Martial-4-10)
- **フラッシュアーツ** (Martial-4-20)
- **ゴリアステイクショット** (CR-2-10-1~2)
- **ゲイザーシュート** (CR-4-10-1~2)
- **ジオクラッシャー** (CR-4-20)

### 4. 弓系統 (Shoot)
- **クロスファイア** (Shoot-4-10-1~4)
- **旋身番撃ち** (Shoot-5-10-1~2)
- **コンクェスター** (Shoot-5-20-1~2)
- **パラボラキャノン** (Shoot-5-30-1~2)
- **ワイドスプレッド** (Shoot-5-40-1~2)
- **ペネトレイター** (Shoot-5-50-1)
- **サンライズアロー** (Hunter-3-10)
- **サイクロンアロー** (Hunter-3-20)
- **サテライトアロー** (Hunter-4-10)
- **バーティカルエア** (Hunter-4-20-1~3)
- **マルチプル** (Hunter-4-30-1~4)

### 5. 魔法系統 (Magic)
- **術式/アロー** (Magic-1-10-1~2)
- **術式/ランサー** (Magic-2-10-1~2)
- **術式/ブラスト** (Magic-2-20)
- **術式/インパクト** (Magic-3-10)
- **術式/ストーム** (Magic-3-20-1~2)
- **術式/フィナウ** (Magic-4-10)
- **術式/バースト** (Magic-4-20)
- **術式/マジックカノン** (Magic-5-10-1~6)
- **術式/フォール** (Magic-5-20-1~2)
- **ネメシス** (Priest-4-10-1~3)

### 6. 槍系統 (Halberd)
- **ダイブインパクト** (Halberd-3-10-1)
- **ストライクスタブ** (Halberd-3-20-1~2)
- **バスターランス** (Halberd-3-30-1~2)
- **ドラゴントゥース** (Halberd-4-10)
- **ライトニングへイル** (Halberd-4-20)
- **クロノスドライブ** (Halberd-4-30)
- **ドラゴニックチャージ** (Halberd-5-10-1~4)
- **ディメンジョンティル** (Halberd-5-20)
- **トールハンマー** (Halberd-5-30-10~40)

### 7. 抜刀系統 (Mononof)
- **八相発破** (Mononof-3-10)
- **桜花爛漫** (Mononof-3-20)
- **一閃** (Mononof-1-10)
- **天流乱星** (Mononof-4-10-1~4)
- **霞雪月花** (Mononof-5-10~4)
- **無影斬-新仕様** (Mononof-5-20)
- **天上天下無双斬り** (Mononof-5-30)

### 8. 双剣系統 (DualSword)
- **ツインスラッシュ** (DS-1-10)
- **エアスライド** (DS-2-10-1~2)
- **シャイニングクロス** (DS-4-10~2)
- **シュツルムリーパー** (DS-4-20)
- **エアスライサー** (DS-5-10)
- **ルーナディザスター** (DS-5-20-0~4)
- **ツインバスターブレード** (DS-5-30-1~2)
- **エアリアルレイ** (DS-4-30)

### 9. その他スキル (Other)
- **ソウルハント** (DarkPower-4-10-1~5)
- **ガトリングナイフ** (Knife-3-10)
- **フリンチナイフ/ファイティングナイフ** (Knife-4-10-1~2)
- **アサシンスタブ** (Assassin-3-10-1~2)
- **シールドキャノン** (Sheild-3-10)
- **ブリザード** (Wizzard-3-10)
- **水遁の術** (Ninja-1-10)
- **火遁の術** (Ninja-1-20-1)
- **風遁の術** (Ninja-1-30-1~2)
- **雷遁の術** (Ninja-1-40-1~2)

## スキルID構造

### 基本パターン
```
{系統}-{階層}-{番号}-{バリエーション}
```

### 例
- `Sword-1-10`: 剣系統 1階層 10番
- `Magic-5-10-3`: 魔法系統 5階層 10番 バリエーション3
- `Halberd-5-30-40`: 槍系統 5階層 30番 バリエーション40

### 特殊系統
- `Night-*`: ナイト系統
- `Pal-*`: パラディン系統  
- `CR-*`: クリティカルレジスト系統
- `Hunter-*`: ハンター系統
- `Priest-*`: プリースト系統
- `DarkPower-*`: ダークパワー系統
- `Knife-*`: ナイフ系統
- `Assassin-*`: アサシン系統
- `Sheild-*`: シールド系統
- `Wizzard-*`: ウィザード系統
- `Ninja-*`: 忍者系統

## スキル特性分類

### 1. 単発スキル
- ハードヒット、バスターブレード等
- 1回の発動で1つのダメージ判定

### 2. 多段ヒットスキル
- ワイドスプレッド (1hit/5hit)
- ペネトレイター (5hit)
- マジックカノン (1/5hit, 5/5hit)

### 3. バリエーションスキル
- ストライクスタブ (通常時)
- ストライクスタブ (敵状態異常時)
- シャットアウト (通常)
- シャットアウト (出血付与時)
- バーティカルエア (距離0-3m)
- バーティカルエア (距離4-7m)
- バーティカルエア (距離8m以上)

### 4. 溜め・チャージスキル
- エンチャントバースト (溜め0-3)
- マジックカノン (チャージ60%/100%/200%)
- ソウルハント (溜めなし/5溜め/10溜め)

### 5. 距離バリエーションスキル
- バーティカルエア (距離0-3m)
- バーティカルエア (距離4-7m)
- バーティカルエア (距離8m以上)
- ドラゴニックチャージ (3m+進度2以下)
- ルーナディザスター (距離8m未満)
- ルーナディザスター (距離8m以上)

### 6. システム定義パラメータスキル
- クロスファイア (溜めレベル別に定義)
- マジックカノン (チャージレベル別に定義)
- ツインバスターブレード (敵数別に定義)

## データ構造定義

### 基本AttackSkillDefinition
```typescript
export interface AttackSkillDefinition {
  id: string                    // スキルID (例: "Sword-1-10")
  name: string                  // スキル名 (例: "ハードヒット")
  category: AttackSkillCategory // スキル系統
  weaponType: WeaponType[]      // 対応武器種
  tier: number                  // 階層 (1-5)
  order: number                 // 系統内順序
  
  // UI関連
  componentName: string         // 対応するコンポーネント名
  description?: string          // スキルの詳細説明・条件等
  
  // 共通ダメージ計算関連（各スキルコンポーネントで使用）
  damageType: DamageType        // 物理/魔法/無属性
}
```

### スキル系統定義
```typescript
export type AttackSkillCategory = 
  | 'sword'        // 剣系統
  | 'magicWarrior' // 魔法剣士系統
  | 'martial'      // 手甲系統
  | 'shoot'        // 弓系統
  | 'magic'        // 魔法系統
  | 'halberd'      // 槍系統
  | 'mononofu'     // 抜刀系統
  | 'dualSword'    // 双剣系統
  | 'other'        // その他

export type DamageType = 'physical' | 'magical' | 'neutral'
```


## スキル選択フォーム設計

### 基本構造
```typescript
export interface AttackSkillFormData {
  selectedSkill: string | null    // 選択されたスキルID
  skillParameters?: Record<string, any> // スキル固有パラメータ
}
```

### UIコンポーネント構造

#### 共通コンポーネント
- **AttackSkillSelector**: スキル選択コンボボックス
- **AttackSkillRenderer**: 選択されたスキルに応じて個別コンポーネントを動的レンダリング
- **BaseAttackSkillComponent**: 全スキルコンポーネントの基底クラス

#### 個別スキルコンポーネント
各攻撃スキルに対応する専用コンポーネント:

**剣系統**
- **HardHitComponent** (`Sword-1-10`)
- **BusterBladeComponent** (`Sword-3-10`)
- **MeteorBreakerComponent** (`Sword-4-10`)
- **MoonSlashComponent** (`Sword-5-10`)
- **AuraBladeComponent** (`Sword-5-20`)
- **ShutOutNormalComponent** (`Sword-5-30-1`)
- **ShutOutBleedingComponent** (`Sword-5-30-2`)

**魔法剣士系統**
- **ElementSlashComponent** (`MagicWarrior-2-10`)
- **EnchantSwordComponent** (`MagicWarrior-3-10`)
- **EnchantBurstCharge0Component** (`MagicWarrior-4-10-1`)
- **EnchantBurstCharge1Component** (`MagicWarrior-4-10-2`)
- **EnchantBurstCharge2Component** (`MagicWarrior-4-10-3`)
- **EnchantBurstCharge3Component** (`MagicWarrior-4-10-4`)
- **DragonicChargeEditComponent** (`Halberd-5-10-2-Edit`) - チャージレベル入力UI付き

**可変パラメータスキル**
- **MagicCannonEditComponent** (`Magic-5-10-6-Edit`) - チャージレベル入力UI
- **SoulHuntEditComponent** (`DarkPower-4-10-4-Edit`) - 溜めレベル入力UI
- **TwinBusterBladeEditComponent** (`DS-5-30-2-Edit`) - 敵数入力UI

## ダメージ計算への統合

### 計算フロー
1. **スキル選択**: ユーザーがスキルを選択
2. **コンポーネント動的レンダリング**: 選択されたスキルIDに基づいて対応コンポーネントを表示
3. **スキル固有パラメータ設定**: 各コンポーネントが独自のUI要素でパラメータを収集
4. **個別ダメージ計算**: 各スキルコンポーネントが独自の計算式を実行
5. **結果表示**: 計算結果をリアルタイムで表示・更新

### スキル個別コンポーネント設計

#### BaseAttackSkillComponent
```typescript
export abstract class BaseAttackSkillComponent {
  protected skill: AttackSkillDefinition
  protected baseStats: any // 基本ステータス
  protected weaponData: any // 武器データ
  protected buffs: any // バフデータ
  
  constructor(skill: AttackSkillDefinition) {
    this.skill = skill
  }
  
  // 各スキルで実装必須
  abstract calculateDamage(): number
  abstract renderParameterInputs(): JSX.Element
  abstract getSkillParameters(): Record<string, any>
  
  // 共通処理
  protected getBaseAttackPower(): number {
    // 武器攻撃力 + ステータス補正の共通計算
  }
  
  protected applyCommonBuffs(damage: number): number {
    // 共通バフ適用処理
  }
}
```

#### 個別スキル実装例
```typescript
// ドラゴニックチャージ(チャージ可変)の例
export class DragonicChargeEditComponent extends BaseAttackSkillComponent {
  private chargeLevel: number = 2 // デフォルト値
  
  calculateDamage(): number {
    const baseAttack = this.getBaseAttackPower()
    
    // ドラゴニックチャージ固有の計算式
    let damage = baseAttack * 4.5 // 基本倍率
    
    // チャージレベル補正（進度による倍率変化）
    const chargeMultiplier = {
      0: 1.0,
      1: 1.2,
      2: 1.5,
      3: 1.8,
      4: 2.2,
      5: 2.7
    }
    
    damage *= chargeMultiplier[this.chargeLevel] || 1.0
    
    // 距離補正（3m固定）
    damage *= 1.1
    
    return Math.floor(this.applyCommonBuffs(damage))
  }
  
  renderParameterInputs(): JSX.Element {
    return (
      <div className="skill-parameters">
        <label>チャージレベル（進度）</label>
        <select 
          value={this.chargeLevel}
          onChange={(e) => this.setChargeLevel(Number(e.target.value))}
        >
          <option value={0}>進度0</option>
          <option value={1}>進度1</option>
          <option value={2}>進度2（デフォルト）</option>
          <option value={3}>進度3</option>
          <option value={4}>進度4</option>
          <option value={5}>進度5</option>
        </select>
      </div>
    )
  }
  
  getSkillParameters(): Record<string, any> {
    return {
      chargeLevel: this.chargeLevel
    }
  }
  
  private setChargeLevel(level: number) {
    this.chargeLevel = level
    // リアルタイム計算更新をトリガー
    this.onParameterChange()
  }
}
```

## 実装優先度

### Phase 1 (高優先度)
- BaseAttackSkillComponent基底クラス
- AttackSkillRenderer動的レンダリングシステム
- 基本スキル定義とマッピング
- 5-10個の代表的なスキルコンポーネント実装

### Phase 2 (中優先度)  
- 残りの基本スキルコンポーネント実装
- チャージ・可変パラメータスキルコンポーネント
- 多段ヒットスキル対応
- スキルプレビュー機能

### Phase 3 (低優先度)
- 全154スキルのコンポーネント完全実装
- スキル系統別フィルタリング
- スキル検索機能
- パフォーマンス最適化

## スキルコンポーネントマッピング

### コンポーネント名マッピング例
```typescript
export const SKILL_COMPONENT_MAP: Record<string, string> = {
  'Sword-1-10': 'HardHitComponent',
  'Sword-3-10': 'BusterBladeComponent',
  'MagicWarrior-4-10-1': 'EnchantBurstCharge0Component',
  'MagicWarrior-4-10-2': 'EnchantBurstCharge1Component',
  'Halberd-5-10-2-Edit': 'DragonicChargeEditComponent',
  'Magic-5-10-6-Edit': 'MagicCannonEditComponent',
  'DarkPower-4-10-4-Edit': 'SoulHuntEditComponent',
  // ... 全154スキル
}
```

### 動的コンポーネントローディング
```typescript
const AttackSkillRenderer: React.FC<{skillId: string}> = ({ skillId }) => {
  const componentName = SKILL_COMPONENT_MAP[skillId]
  
  if (!componentName) {
    return <div>未実装のスキルです</div>
  }
  
  // 動的インポートまたはコンポーネントマップから取得
  const SkillComponent = getSkillComponent(componentName)
  
  return <SkillComponent skillId={skillId} />
}
```

## スキル固有パラメータの例

### チャージ・溜めスキル
- **ドラゴニックチャージ(チャージ可変)**: 進度0-5選択
- **マジックカノン(チャージ可変)**: チャージ60%/100%/200%選択
- **ソウルハント(溜め可変)**: 溜めレベル0-10選択
- **クロスファイア(溜め可変)**: 溜めレベル0-3選択

### 敵数・ヒット数可変スキル
- **ツインバスターブレード(敵数可変)**: 対象敵数1-8選択
- **ネメシス(hit数可変)**: 追撃ヒット数1-20選択
- **天流乱星(段数可変)**: 攻撃段数1-4選択

### 距離依存スキル
- **バーティカルエア**: 距離0-3m/4-7m/8m以上（個別スキル定義）
- **ルーナディザスター**: 距離8m未満/以上（個別スキル定義）

### 条件分岐スキル
- **ストライクスタブ**: 通常時/敵状態異常時（個別スキル定義）
- **シャットアウト**: 通常/出血付与時（個別スキル定義）

## コンポーネント開発ガイドライン

### 1. 命名規則
- コンポーネント名: `{スキル名}Component`
- ファイル名: `{スキル名}Component.tsx`
- 配置: `src/components/attack-skills/`

### 2. 必須実装メソッド
- `calculateDamage()`: スキル固有のダメージ計算
- `renderParameterInputs()`: パラメータ入力UI
- `getSkillParameters()`: 現在のパラメータ値取得

### 3. 状態管理
- スキル固有パラメータは各コンポーネント内で管理
- 計算結果は親コンポーネントに通知
- リアルタイム更新対応

## 注意事項

1. **バフスキルとの区別**: 攻撃スキルは直接ダメージ計算に使用され、バフスキルは状態補正に使用される
2. **武器種制限**: 各スキルは対応する武器種でのみ使用可能
3. **スキル重複**: 攻撃スキルは同時に1つのみ選択可能
4. **チャージレベル検証**: チャージレベルは定義された範囲内で検証する必要がある
5. **新仕様対応**: 一部スキルは「新仕様」として区別され、計算式が異なる場合がある
6. **個別スキル定義**: 条件や距離等によるバリエーションは、それぞれ独立したスキルとして定義される
7. **個別コンポーネント実装**: 各攻撃スキルは専用コンポーネントで独自の計算式とUIを持つ
8. **動的パラメータ**: 「-Edit」サフィックス付きスキルは可変パラメータを持ち、専用入力UIを提供
9. **段階的実装**: 154スキル全てを一度に実装するのではなく、優先度に応じて段階的に開発

この設計書に基づいて、段階的に攻撃スキルシステムを実装していく。