# StatusPreview コンポーネントUI設計書

## 概要

ヘッダー下に配置されるステータス計算結果の詳細表示コンポーネント。98項目の詳細ステータス情報を4つのセクションに整理表示するUIコンポーネントの設計書。

**機能要件詳細**: [StatusPreview機能要件](../requirements/10_status-preview-requirements.md)を参照

**計算ロジック詳細**: [基本ステータス計算式](../calculations/basic-stats.md)を参照

## コンポーネント構成

### StatusPreview（メインコンポーネント）
- **ファイル**: `src/components/layout/StatusPreview.tsx`
- **目的**: 正確な計算式による詳細ステータス表示
- **位置**: ResultToggleBar経由で表示制御

### 依存コンポーネント
- **StatSection**: 統一されたステータス表示セクション
- **StatItem**: 個別ステータス項目表示

## UIレイアウト設計

### 全体構造
```
┌─────────────────────────────────────┐
│ ┌─────────────┐ ┌─────────────┐    │
│ │基本ステータス │ │補正後ステータス│    │
│ │(30項目)      │ │(8項目)       │    │
│ └─────────────┘ └─────────────┘    │
│ ┌─────────────┐ ┌─────────────┐    │
│ │装備品補正値1 │ │装備品補正値2 │    │
│ │(31項目)      │ │(32項目)      │    │
│ └─────────────┘ └─────────────┘    │
│ ┌─────────────┐                    │
│ │装備品補正値3 │                    │
│ │(8項目)       │                    │
│ └─────────────┘                    │
└─────────────────────────────────────┘
```

### 基本ステータス（30項目）
```
┌─────── 基本ステータス ─────────┐
│ HP 14,413      MP 459         │
│ ATK 2,341      基礎ATK 1,890   │
│ サブATK 156    サブ基礎ATK 0   │
│ 総ATK 2,497    ブリンガーAM 124│
│ MATK 1,876     基本MATK 1,542 │
│ 安定率 85%     サブ安定率 75%  │
│ クリ率 12%     クリダメ 150%   │
│ 魔クリ率 8%    魔クリダメ 130% │
│ 総属性有利 25% 属性覚醒 15%    │
│ ASPD 1,200     CSPD 890       │
│ HIT 234        FLEE 189       │
│ 物理耐性 15%   魔法耐性 12%    │
│ 異常耐性 8%    行動速度 18%    │
│ 防御崩し 5%    先読み 3%       │
└─────────────────────────────┘
```

**ATK計算仕様**:
- **武器種別**: 選択された武器種に応じた計算式を適用
- **ATK計算式**: `INT((自Lv + 総武器ATK + ステータスATK + ATKアップ - ATKダウン) × (1 + ATK%/100)) + ATK固定値`
- **基礎ATK表示**: `Lv+総武器ATK+ステータスATK+ATKアップ(ステータス%) - ATKダウン(ステータス%)` (表示時のみ小数点以下切り捨て)
- **ステータスATK**: 武器種別に応じた計算式（例：旋風槍 `STR × 2.5 + AGI × 1.5`、素手 `STR × 1.0`）
- **データソース**: メイン武器の種別に基づいて計算式を自動選択
- **対応武器種**: 全11種の武器種（旋風槍、片手剣、両手剣、弓、自動弓、杖、魔導具、手甲、抜刀剣、双剣、素手）

**計算詳細**: [ATK計算式設計書](../calculations/atk-calculation.md)を参照

**ASPD計算仕様**:
- **武器種別**: 選択された武器種に応じた計算式を適用
- **ASPD計算式**: `INT((Lv + ステータスASPD + 武器補正値) × (1 + (ASPD% + ArmorType補正)/100)) + ASPD固定値`
- **ステータスASPD**: 武器種別に応じた計算式（例：片手剣 `STR × 0.2 + AGI × 4.2`、素手 `AGI × 9.6`）
- **武器補正値**: 武器種固有の基本ASPD値（例：片手剣 100、魔道具 900）
- **ArmorType補正**: 体装備の防具の改造による内部ASPD%補正（通常: 0%、軽量化: +50%、重量化: -50%）
- **重要な注意**: ArmorType補正は内部計算のみで使用され、装備品補正値のASPD%には表示されない
- **即座反映**: ArmorType変更時にZustandストア状態が強制更新され、StatusPreviewのASPD計算が自動的に再実行される
- **データソース**: メイン武器の種別、体装備のArmorType設定に基づいて計算式を自動選択
- **対応武器種**: 全11種の武器種

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#aspd（アタックスピード）計算)を参照

**行動速度計算仕様**:
- **計算式**: `MIN(50, MAX(0, INT((ASPD-1000)/180)) + 行動速度%)`
- **ASPDベース**: INT((ASPD-1000)/180) で計算、0未満は0に制限
- **行動速度%**: 装備/プロパティ、クリスタ、バフアイテムのMotionSpeed_Rate補正の合計
- **上限制限**: 最終結果は50%上限
- **料理除外**: 料理からの行動速度%補正は存在しない
- **データソース**: 上記で計算されたASPD値を使用

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#行動速度（motion-speed）計算)を参照

**サブATK仕様（双剣専用）**:
- **適用条件**: メイン武器種が「双剣」の場合のみ
- **サブATK計算**: `INT(サブ基礎ATK × (1 + ATK%/100)) + ATK固定値`
- **サブ基礎ATK**: `Lv+サブ総武器ATK+サブステータスATK+ATKアップ-ATKダウン`
- **サブステータスATK**: `STR × 1.0 + AGI × 3.0`
- **サブ総武器ATK**: サブ武器の武器ATK・精錬値を使用
- **非双剣時**: サブ武器ATKをそのまま表示、サブ基礎ATKは0表示

**HIT計算仕様**:
- **計算式**: `INT((Lv+総DEX)×(1+命中%/100))+命中固定値`
- **総DEX**: 補正後ステータスのDEX（装備・クリスタ・バフアイテム・料理補正を含む）
- **命中%**: 装備/プロパティ、クリスタ、バフアイテムのAccuracy_Rate補正の合計
- **命中固定値**: 装備/プロパティ、クリスタ、料理（しょうゆラーメン）、バフアイテムのAccuracy固定値の合計
- **料理特殊性**: 料理には命中%補正はないが、固定値補正は存在
- **データソース**: ステータスのレベル、補正後DEX値、各種補正値を使用

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#hit（命中）計算)を参照

**FLEE計算仕様**:
- **計算式**: `INT(基礎FLEE × (1 + 回避%/100)) + 回避固定値`
- **基礎FLEE算出**: 体装備の状態とArmorTypeに応じて計算式が変化
  - **体装備なし**: `INT(75 + Lv × 3/2 + 補正後AGI × 2)`
  - **体装備あり（通常）**: `INT(Lv + 補正後AGI)`
  - **体装備あり（軽量化）**: `INT(30 + Lv × 5/4 + 補正後AGI × 7/4)`
  - **体装備あり（重量化）**: `INT(-15 + Lv/2 + 補正後AGI × 3/4)`
- **補正後AGI**: 装備・クリスタ・バフアイテム・料理補正を含むAGI値
- **回避%**: 装備/プロパティ、クリスタ、バフアイテムのDodge_Rate補正の合計
- **回避固定値**: 装備/プロパティ、クリスタ、バフアイテムのDodge固定値の合計
- **料理除外**: 料理からの回避補正は存在しない
- **ArmorType連動**: 体装備のArmorType変更により基礎FLEE計算式が自動切り替え
- **データソース**: ステータスのレベル、補正後AGI値、体装備状態、ArmorType設定、各種補正値を使用

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#flee（回避率）計算)を参照

**クリティカル率計算仕様**:
- **計算式**: `INT(INT(25+CRT/3.4)×(1+クリティカル率%/100))+クリティカル率固定値`
- **基本クリティカル率**: INT(25+CRT/3.4)で算出（CRTは基本ステータスの値）
- **クリティカル率%**: 装備/プロパティ、クリスタ、バフアイテムのCritical_Rate補正の合計
- **クリティカル率固定値**: 装備/プロパティ、クリスタ、料理（たこ焼き）、バフアイテムのCritical固定値の合計
- **料理特殊性**: 料理にはクリティカル率%補正はないが、固定値補正は存在
- **データソース**: 基本ステータスのCRT値、各種補正値を使用

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#クリティカル率（critical-rate）計算)を参照

**物理耐性計算仕様**:
- **計算式**: `装備/プロパティ物理耐性% + クリスタ物理耐性% + 料理物理耐性% + バフアイテム物理耐性%`
- **構成要素**: 
  - **装備/プロパティ**: 各装備品のPhysicalResistance_Rate補正値の合計
  - **クリスタ**: セットしてあるクリスタルのPhysicalResistance_Rate補正値の合計
  - **料理**: 料理（ビーフバーガー(物理耐性)）のPhysicalResistance_Rate補正値
  - **バフアイテム**: バフアイテムのPhysicalResistance_Rate補正値の合計
- **計算特性**: パーセンテージのみ（固定値補正なし）、単純加算方式
- **データソース**: 4つのデータソースからの%補正値を統合

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#物理耐性計算)を参照

**魔法耐性計算仕様**:
- **計算式**: `装備/プロパティ魔法耐性% + クリスタ魔法耐性% + 料理魔法耐性% + バフアイテム魔法耐性%`
- **構成要素**: 
  - **装備/プロパティ**: 各装備品のMagicalResistance_Rate補正値の合計
  - **クリスタ**: セットしてあるクリスタルのMagicalResistance_Rate補正値の合計
  - **料理**: 料理（フィッシュバーガー(魔法耐性)）のMagicalResistance_Rate補正値
  - **バフアイテム**: バフアイテムのMagicalResistance_Rate補正値の合計
- **計算特性**: パーセンテージのみ（固定値補正なし）、単純加算方式
- **データソース**: 4つのデータソースからの%補正値を統合

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#魔法耐性計算)を参照

**防御崩し計算仕様**:
- **計算式**: `装備/プロパティ防御崩し% + クリスタ防御崩し% + バフアイテム防御崩し%`
- **構成要素**: 
  - **装備/プロパティ**: 各装備品のArmorBreak_Rate補正値の合計
  - **クリスタ**: セットしてあるクリスタルのArmorBreak_Rate補正値の合計
  - **バフアイテム**: バフアイテムのArmorBreak_Rate補正値の合計
- **計算特性**: パーセンテージのみ（固定値補正なし）、単純加算方式
- **データソース**: 3つのデータソースからの%補正値を統合（料理除外）

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#防御崩し計算)を参照

**先読み計算仕様**:
- **計算式**: `装備/プロパティ先読み% + クリスタ先読み% + バフアイテム先読み%`
- **構成要素**: 
  - **装備/プロパティ**: 各装備品のAnticipate補正値の合計
  - **クリスタ**: セットしてあるクリスタルのAnticipate補正値の合計
  - **バフアイテム**: バフアイテムのAnticipate補正値の合計
- **計算特性**: パーセンテージのみ（固定値補正なし）、単純加算方式
- **データソース**: 3つのデータソースからの%補正値を統合（料理除外）

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#先読み計算)を参照

**CSPD（詠唱速度）計算仕様**:
- **計算式**: `INT((INT(Lv+補正後DEX×2.94+補正後AGI×1.16))×(1+CSPD%/100))+CSPD固定値`
- **計算段階**: 
  - **ベースCSPD**: INT(Lv + 補正後DEX × 2.94 + 補正後AGI × 1.16)
  - **CSPD%適用後**: INT(ベースCSPD × (1 + CSPD%/100))
  - **最終CSPD**: CSPD%適用後 + CSPD固定値
- **構成要素**: 
  - **CSPD%**: 装備/プロパティ、クリスタ、バフアイテムのCastingSpeed_Rate補正の合計
  - **CSPD固定値**: 装備/プロパティ、クリスタ、バフアイテムのCastingSpeed補正の合計
- **計算特性**: 2段階INT()切り捨て処理、DEX重要度高（係数2.94）、AGI影響小（係数1.16）
- **データソース**: 3つのデータソースからの補正値を統合（料理除外）

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#cspd詠唱速度計算)を参照

**総属性有利計算仕様**:
- **計算式**: `装備/プロパティ属性有利% + クリスタ属性有利% + 料理属性有利% + バフアイテム属性有利%`
- **構成要素**: 
  - **装備/プロパティ**: 各装備品のElementAdvantage_Rate補正値の合計
  - **クリスタ**: セットしてあるクリスタルのElementAdvantage_Rate補正値の合計
  - **料理**: 料理（属性パスタ（有利共通））のElementAdvantage_Rate補正値
  - **バフアイテム**: バフアイテムのElementAdvantage_Rate補正値の合計
- **計算特性**: パーセンテージのみ（固定値補正なし）、単純加算方式
- **データソース**: 4つのデータソースからの%補正値を統合
- **適用範囲**: 全ての属性攻撃に対して共通で適用される汎用的な属性有利補正

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#総属性有利計算)を参照

**安定率計算仕様**:
- **計算式**: `MAX(0, MIN(100, メイン武器の安定率 + ステータス安定率 + 安定率%))`
- **構成要素**: 
  - **メイン武器の安定率**: メイン武器固有の安定率値
  - **ステータス安定率**: 武器種別に応じたSTR・DEXによる係数計算
  - **安定率%**: 装備/プロパティ、クリスタ、バフアイテムのStability_Rate補正の合計
- **武器種別係数**: 
  - **片手剣**: STR × 0.025 + DEX × 0.075
  - **両手剣**: DEX × 0.1
  - **弓**: STR × 0.05 + DEX × 0.05
  - **自動弓**: STR × 0.05
  - **杖**: STR × 0.05
  - **魔道具**: DEX × 0.1
  - **手甲**: DEX × 0.025
  - **旋風槍**: STR × 0.05 + DEX × 0.05
  - **抜刀剣**: STR × 0.075 + DEX × 0.025
  - **素手**: DEX × 0.35
  - **双剣**: 特殊計算（保留）
- **計算特性**: MIN/MAX関数使用、0-100%範囲制限、料理除外
- **データソース**: メイン武器基本値 + 武器種別ステータス計算 + 3つのデータソースからの%補正値を統合
- **制限**: 上限100%、下限0%の範囲制限が適用される

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#安定率計算)を参照

### 補正後ステータス（8項目）
```
┌─────── 補正後ステータス ─────┐
│ STR: 215      AGI: 165      │
│ INT: 210      DEX: 160      │
│ VIT: 205      CRT: 95       │
│ MEN: 115      TEC: 90       │
└─────────────────────────────┘
```

**計算方式**:
- **STR/INT/VIT/AGI/DEX**: `INT(基礎ステータス × (1 + ステータス%/100)) + ステータス固定値`
- **CRT/MEN/TEC**: 基本ステータスの値をそのまま表示（補正なし）

**データソース**:
- **基礎ステータス**: BaseStatsFormの入力値
- **ステータス%**: 装備・クリスタ・料理・バフアイテムの%補正の合計
- **ステータス固定値**: 装備・クリスタ・料理・バフアイテムの固定値補正の合計

### 装備品補正値1（31プロパティ - 2プロパティ/行表示）
```
┌─────────────── 装備品補正値1 ───────────────┐
│ プロパティ      %    +    プロパティ      %    +  │
│ ─────────────────────────────────────── │
│ ATK           15  150    物理貫通      25   -   │
│ MATK          12  120    魔法貫通      20   -   │
│ 武器ATK       10  200    属性威力      15   -   │
│ 抜刀威力      10   -     近距離威力    8    -   │
│ 遠距離威力    5    -     クリダメ      20   5   │
│ クリ率        5    2     STR           10  15   │
│ AGI           8   15     INT           12  10   │
│ DEX           6   10     VIT           5    5   │
│ ASPD          15  200    CSPD          10  150  │
│ 安定率        5    -     行動速度      5    -   │
│ 命中          8   34     回避          6   29   │
│ HP            10  200    MP            8   100  │
│ 攻撃MP回復    3    2     異常耐性      3    -   │
│ 物理耐性      5    -     魔法耐性      3    -   │
│ ヘイト        15   -     (空き)         -    -   │
└─────────────────────────────────────────┘
```

**データソース**:
- **装備**（11スロット：メイン、体、追加、特殊、サブ武器、オシャレ1-3、自由入力1-3）の全プロパティを統合
- **クリスタル**（8スロット：4カテゴリ×2スロット）の全効果を統合
- **料理**（5スロット）の全効果を統合
- **バフアイテム**（12カテゴリ）の全効果を統合

**補正値統合処理**:
装備品補正値1〜3は、上記4つのデータソースからの同名プロパティを自動集計したもの

### 装備品補正値2（31プロパティ - 2プロパティ/行表示）
```
┌─────────────── 装備品補正値2 ───────────────┐
│ プロパティ      %    +    プロパティ      %    +  │
│ ─────────────────────────────────────── │
│ ATK(STR)      8    -     MATK(STR)     6    -   │
│ ATK(INT)      10   -     MATK(INT)     12   -   │
│ ATK(VIT)      5    -     MATK(VIT)     4    -   │
│ ATK(AGI)      3    -     MATK(AGI)     2    -   │
│ ATK(DEX)      4    -     MATK(DEX)     3    -   │
│ 無耐性        5    -     火耐性        8    -   │
│ 水耐性        6    -     風耐性        7    -   │
│ 地耐性        5    -     光耐性        9    -   │
│ 闇耐性        4    -     直線軽減      3    -   │
│ 突進軽減      4    -     弾丸軽減      2    -   │
│ 周囲軽減      5    -     範囲軽減      3    -   │
│ 痛床軽減      2    -     隕石軽減      1    -   │
│ 射刃軽減      2    -     吸引軽減      1    -   │
│ 爆発軽減      3    -     物理バリア    -   150  │
│ 魔法バリア    -   120    割合バリア    -    5   │
│ バリア速度    10   -     (空き)         -    -   │
└─────────────────────────────────────────┘
```

### 装備品補正値3（8プロパティ - 2プロパティ/行表示）
```
┌─────────────── 装備品補正値3 ───────────────┐
│ プロパティ      %    +    プロパティ      %    +  │
│ ─────────────────────────────────────── │
│ 物理追撃      8    -     魔法追撃      6    -   │
│ HP自然回復   12   15     MP自然回復   10   10   │
│ 絶対命中      8    5     絶対回避      6    3   │
│ 復帰短縮      20   -     道具速度      -   15   │
└─────────────────────────────────────────┘
```

## データ表示仕様

### プロパティ表示パターン

#### 1. 2プロパティ/行レイアウトパターン

**基本構造**: `プロパティ名1 | %1 | +1 | プロパティ名2 | %2 | +2`

```
プロパティ      %    +    プロパティ      %    +
─────────────────────────────────────
ATK           15  150    物理貫通      25   -     // 両方あり + %のみ
HP            10  200    MP            8   100    // 両方あり + 両方あり
物理バリア    -   150    魔法バリア    -   120    // +のみ + +のみ
```

#### 2. 各パターンの表示例

**両方表示プロパティ**: 両方の列に値を表示
```
ATK           15  150    MATK          12  120
HP            10  200    MP            8   100
STR           5   15     AGI           8   15
```

**%のみプロパティ**: +列は「-」表示
```
ヘイト        15   -     火耐性        8    -
属性威力      15   -     安定率        5    -
物理貫通      25   -     魔法貫通      20   -
```

**+のみプロパティ**: %列は「-」表示
```
道具速度      -   15     物理バリア    -   150
魔法バリア    -   120    割合バリア    -    5
```

### 数値表示フォーマット
- **整数値**: カンマ区切り（例: 14,413）
- **パーセント**: %記号付き（例: +15%、85%）
- **固定値**: 符号付き数値（例: +150、-50）
- **ゼロ値**: 「0」で表示（非表示にしない）

### 色分け表示
- **基本値**: 通常色（黒）
- **正の補正値**: 強調色（青）
- **負の補正値**: 警告色（赤）
- **計算結果**: 結果色（緑）

## 技術仕様

### TypeScript インターフェース

```typescript
interface StatusPreviewProps {
  isVisible: boolean
}

// 98項目の詳細計算結果（CalculationResultDisplay.tsxから継承）
interface CalculationResults {
  // 基本ステータス（30項目）
  basicStats: {
    HP: number                          // HP計算結果
    MP: number                          // MP計算結果
    ATK: number                         // ATK計算結果（武器種別対応）
    baseATK: number                     // 基礎ATK（表示時のみ小数点以下切り捨て）
    subATK: number                      // サブ武器ATK（双剣時は計算値、非双剣時はサブ武器ATK）
    subBaseATK: number                  // サブ武器基礎ATK（双剣時は計算値、非双剣時は0）
    totalATK: number                    // 総ATK（暫定値）
    bringerAM: number                   // ブリンガーAM（暫定値）
    MATK: number                        // MATK（暫定値）
    baseMATK: number                    // 基本MATK（暫定値）
    stabilityRate: number               // メイン武器安定率
    subStabilityRate: number            // サブ武器安定率
    criticalRate: number                // クリティカル率（計算結果）
    criticalDamage: number              // クリティカルダメージ（暫定値）
    magicCriticalRate: number           // 魔法クリティカル率（暫定値）
    magicCriticalDamage: number         // 魔法クリティカルダメージ（暫定値）
    totalElementAdvantage: number       // 総属性有利（暫定値）
    elementAwakeningAdvantage: number   // 属性覚醒有利（暫定値）
    ASPD: number                        // 攻撃速度（武器種別計算結果）
    CSPD: number                        // 詠唱速度（計算結果）
    HIT: number                         // 命中（計算結果）
    FLEE: number                        // 回避（体装備状態・ArmorType依存計算結果）
    physicalResistance: number          // 物理耐性（計算結果）
    magicalResistance: number           // 魔法耐性（暫定値）
    ailmentResistance: number           // 異常耐性（暫定値）
    motionSpeed: number                 // 行動速度（ASPD依存計算結果）
    armorBreak: number                  // 防御崩し（計算結果）
    anticipate: number                  // 先読み（計算結果）
  }
  
  // 補正後ステータス（8項目）
  adjustedStats: {
    STR: number      // INT(基礎STR × (1 + STR%/100)) + STR固定値
    AGI: number      // INT(基礎AGI × (1 + AGI%/100)) + AGI固定値
    INT: number      // INT(基礎INT × (1 + INT%/100)) + INT固定値
    DEX: number      // INT(基礎DEX × (1 + DEX%/100)) + DEX固定値
    VIT: number      // INT(基礎VIT × (1 + VIT%/100)) + VIT固定値
    CRT: number      // 基本ステータスの値をそのまま表示
    MEN: number      // 基本ステータスの値をそのまま表示
    TEC: number      // 基本ステータスの値をそのまま表示
  }
  
  // 装備品補正値1（31項目）
  equipmentBonus1: {
    ATK: number
    physicalPenetration: number
    MATK: number
    magicalPenetration: number
    weaponATK: number
    elementPower: number
    unsheatheAttack: number
    shortRangeDamage: number
    longRangeDamage: number
    criticalDamage: number
    criticalRate: number
    STR: number
    AGI: number
    INT: number
    DEX: number
    VIT: number
    ASPD: number
    CSPD: number
    stability: number
    motionSpeed: number
    accuracy: number
    dodge: number
    MP: number
    attackMPRecovery: number
    HP: number
    ailmentResistance: number
    physicalResistance: number
    magicalResistance: number
    aggroPlus: number
    aggroMinus: number
  }
  
  // 装備品補正値2（32項目）
  equipmentBonus2: {
    ATK_STR: number
    MATK_STR: number
    ATK_INT: number
    MATK_INT: number
    ATK_VIT: number
    MATK_VIT: number
    ATK_AGI: number
    MATK_AGI: number
    ATK_DEX: number
    MATK_DEX: number
    neutralResistance: number
    fireResistance: number
    waterResistance: number
    windResistance: number
    earthResistance: number
    lightResistance: number
    darkResistance: number
    linearReduction: number
    rushReduction: number
    bulletReduction: number
    proximityReduction: number
    areaReduction: number
    floorTrapReduction: number
    meteorReduction: number
    bladeReduction: number
    suctionReduction: number
    explosionReduction: number
    physicalBarrier: number
    magicalBarrier: number
    fractionalBarrier: number
    barrierCooldown: number
  }
  
  // 装備品補正値3（8項目）
  equipmentBonus3: {
    physicalFollowup: number
    magicalFollowup: number
    naturalHPRecovery: number
    naturalMPRecovery: number
    absoluteAccuracy: number
    absoluteDodge: number
    revivalTime: number
    itemCooldown: number
  }
}

interface AllBonuses {
  VIT?: number            // VIT固定値の合計
  VIT_Rate?: number       // VIT%の合計
  HP?: number             // HP固定値の合計
  HP_Rate?: number        // HP%の合計
  MP?: number             // MP固定値の合計
  MP_Rate?: number        // MP%の合計
  AttackSpeed?: number    // ASPD固定値の合計
  AttackSpeed_Rate?: number // ASPD%の合計（ArmorType補正は含まない）
  MotionSpeed_Rate?: number  // 行動速度%の合計（装備+クリスタ+バフアイテム、料理除外）
  // 注意: ArmorType補正は内部計算のみで、AllBonusesには含まれない
}
```

### UIコンポーネント設計

#### StatItemコンポーネントの拡張

```typescript
interface PropertyDisplayProps {
  propertyName: string
  rateValue: number | null
  fixedValue: number | null
  propertyConfig: PropertyConfig
}

const PropertyDisplay: React.FC<PropertyDisplayProps> = ({ 
  propertyName, 
  rateValue, 
  fixedValue, 
  propertyConfig 
}) => {
  return (
    <div className="grid grid-cols-[100px_60px_60px] gap-2 py-1 px-2">
      {/* プロパティ名 */}
      <span className="text-sm text-gray-700 font-medium truncate">
        {propertyName}
      </span>
      
      {/* %値 */}
      <div className="text-center">
        {propertyConfig.hasRate ? (
          <span className={cn(
            "text-xs tabular-nums px-1 py-0.5 rounded",
            rateValue > 0 ? "bg-sky-50 text-sky-700" : "text-gray-400"
          )}>
            {rateValue > 0 ? rateValue : '-'}
          </span>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </div>
      
      {/* +値 */}
      <div className="text-center">
        {propertyConfig.hasFixed ? (
          <span className={cn(
            "text-xs tabular-nums px-1 py-0.5 rounded",
            fixedValue > 0 ? "bg-rose-50 text-rose-700" : "text-gray-400"
          )}>
            {fixedValue > 0 ? fixedValue : '-'}
          </span>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </div>
    </div>
  )
}
```

#### セクションヘッダーの追加

```typescript
// 2プロパティ/行表示用ヘッダー
const PropertyDoubleSectionHeader: React.FC = () => {
  return (
    <div className="grid grid-cols-[80px_40px_40px_80px_40px_40px] gap-2 py-2 px-2 border-b border-gray-200 bg-gray-50">
      <span className="text-xs font-medium text-gray-600">プロパティ</span>
      <span className="text-xs font-medium text-center text-sky-600">%</span>
      <span className="text-xs font-medium text-center text-rose-600">+</span>
      <span className="text-xs font-medium text-gray-600">プロパティ</span>
      <span className="text-xs font-medium text-center text-sky-600">%</span>
      <span className="text-xs font-medium text-center text-rose-600">+</span>
    </div>
  )
}
```

### データバインディングパターン

```typescript
// 2プロパティ/行表示用データ構造
interface PropertyDoubleDisplayData {
  property1: PropertyDisplayData
  property2?: PropertyDisplayData  // 奇数個の場合は空
}

interface PropertyDisplayData {
  propertyName: string
  rateValue: number | null
  fixedValue: number | null
  propertyConfig: PropertyConfig
}

// 2プロパティ/行形式への変換
const formatEquipmentBonusDoubleSection = (
  bonusData: EquipmentBonusResult
): PropertyDoubleDisplayData[] => {
  const singleProperties = Object.entries(bonusData).map(([key, value]) => {
    const config = PROPERTY_DISPLAY_CONFIG[key]
    const isRateProperty = key.endsWith('_Rate')
    const basePropertyName = isRateProperty ? key.replace('_Rate', '') : key
    
    return {
      propertyName: PROPERTY_LABELS[basePropertyName],
      rateValue: config.hasRate ? bonusData[`${basePropertyName}_Rate`] || null : null,
      fixedValue: config.hasFixed ? bonusData[basePropertyName] || null : null,
      propertyConfig: config
    }
  })
  
  // 2つずつペアに分割
  const pairs: PropertyDoubleDisplayData[] = []
  for (let i = 0; i < singleProperties.length; i += 2) {
    pairs.push({
      property1: singleProperties[i],
      property2: singleProperties[i + 1] || undefined
    })
  }
  
  return pairs
}
```

### データソース

```typescript
const { data } = useCalculatorStore()
const baseStats = data.baseStats
```

## レスポンシブ設計

### ブレークポイント対応
- **sm未満**: 1列表示
- **md以上**: 2列表示
- **lg以上**: 4列表示

### グリッドレイアウト
```css
.status-grid {
  display: grid;
  grid-template-columns: 1fr;                           /* mobile */
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);              /* tablet */
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);              /* desktop */
  }
}

/* 各セクションのサイズ調整 */
.basic-stats { @apply md:col-span-2 lg:col-span-2; }
.hp-details { @apply md:col-span-1 lg:col-span-1; }
.mp-details { @apply md:col-span-1 lg:col-span-1; }
.weapon-info { @apply md:col-span-2 lg:col-span-2; }
```

## スタイリング仕様

### コンテナ
```css
.status-preview {
  @apply bg-gray-50 border-b border-gray-200 
         transition-all duration-300 ease-in-out;
}

.status-container {
  @apply container mx-auto px-4 py-6;
}
```

### 計算式説明部分
```css
.formula-explanation {
  @apply mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md;
}

.formula-content {
  @apply text-sm text-blue-700;
}

.formula-note {
  @apply mt-1 text-xs;
}
```

## データフロー

### 入力データ
1. **BaseStats**: Zustandストアから取得
2. **AllBonuses**: 装備・クリスタ・料理・バフから集計（将来実装）

### 計算処理
1. **補正値集計**: aggregateAllBonuses()
2. **HP計算**: calculateHP()
3. **MP計算**: calculateMP()
4. **ATK計算**: calculateATK() - 武器種別対応
5. **ASPD計算**: calculateASPD() - 武器種別対応、ArmorType補正対応
6. **行動速度計算**: calculateMotionSpeed() - ASPD依存計算

### 表示データ
1. **基本ステータス**: 計算結果を含む全ステータス
2. **計算詳細**: HP・MPの段階的計算過程
3. **武器情報**: メイン・サブ武器の基本データ

## アクセシビリティ

### ARIA属性
```tsx
<div 
  role="region" 
  aria-label="ステータス計算結果"
  aria-live="polite"
>
  <StatSection 
    title="基本ステータス"
    role="group"
    aria-labelledby="basic-stats-title"
  />
</div>
```

### キーボードナビゲーション
- Tab順序: セクション間の論理的な移動
- 各StatSectionは独立したフォーカス領域

## パフォーマンス最適化

### メモ化
```typescript
const calculatedStats = useMemo(() => ({
  HP: hpCalculation.finalHP,
  MP: mpCalculation.finalMP,
  // other stats...
}), [hpCalculation, mpCalculation, baseStats])
```

### 計算最適化
- 必要時のみ再計算実行
- 中間結果の適切なキャッシュ
- 大量データでの性能考慮

### ASPD実装指針
```typescript
// ASPD計算関数の実装（ArmorType補正対応）
function calculateASPD(
  stats: BaseStats,
  weapon: { weaponType: WeaponTypeEnum },
  adjustedStats: AdjustedStatsCalculation,
  bonuses: AllBonuses,
  armorType: ArmorType = 'normal'
): ASPDCalculationSteps {
  // 1. 武器種別ステータスASPD計算
  const weaponTypeKey = getWeaponTypeKey(weapon.weaponType)
  const weaponType = WEAPON_TYPES[weaponTypeKey]
  const statusASPD = weaponType.statusASPDFormula(adjustedStats)
  
  // 2. 武器補正値取得
  const weaponBaseCorrection = weaponType.aspdCorrection
  
  // 3. ArmorType補正計算（内部計算のみ）
  const armorTypeBonus = getArmorTypeASPDBonus(armorType)
  
  // 4. 実効ASPD%計算
  const aspdPercent = bonuses.AttackSpeed_Rate || 0
  const effectiveASPDPercent = aspdPercent + armorTypeBonus
  
  // 5. ASPD計算
  const aspdBeforePercent = stats.level + statusASPD + weaponBaseCorrection
  const aspdAfterPercent = Math.floor(aspdBeforePercent * (1 + effectiveASPDPercent / 100))
  const aspdFixed = bonuses.AttackSpeed || 0
  const finalASPD = aspdAfterPercent + aspdFixed
  
  return { 
    statusASPD, 
    weaponBaseCorrection, 
    armorTypeBonus,
    effectiveASPDPercent,
    finalASPD 
  }
}

// ArmorType補正値取得関数
function getArmorTypeASPDBonus(armorType: ArmorType): number {
  switch (armorType) {
    case 'light': return 50   // 軽量化: +50%
    case 'heavy': return -50  // 重量化: -50%
    case 'normal':
    default: return 0         // 通常: +0%
  }
}
```

**武器種設定への追加項目:**
- `statusASPDFormula`: ステータスASPD計算関数
- `aspdCorrection`: 武器種補正値

**ArmorType設定への追加項目:**
- `armorType`: 体装備の防具の改造設定（'normal' | 'light' | 'heavy'）
- ArmorType補正は内部計算のみで使用され、UI表示には影響しない

## インタラクション設計

### 表示制御
- ResultToggleBarからの表示/非表示制御
- スライドダウン/アップアニメーション（300ms）
- フェードイン/アウト効果

### 値変更時の視覚フィードバック
```typescript
// 値が変更された項目のハイライト表示
interface StatItemProps {
  name: string
  value: number
  isChanged?: boolean  // 変更フラグ
  previousValue?: number  // 変更前の値
}

// 変更時のアニメーション
.stat-changed {
  @apply bg-yellow-100 border-yellow-300 
         transition-colors duration-500 ease-out
}
```

### 計算過程の詳細表示（将来実装）
- 各ステータス項目をクリックで詳細展開
- 計算式と中間値の表示
- ツールチップでの簡単な説明

## パフォーマンス最適化

### レンダリング最適化
```typescript
// StatSectionコンポーネントのメモ化
export const StatSection = React.memo<StatSectionProps>(({ 
  title, 
  stats, 
  className 
}) => {
  return (
    <div className={cn("bg-white rounded-lg border p-4", className)}>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(stats).map(([key, value]) => (
          <StatItem key={key} name={key} value={value} />
        ))}
      </div>
    </div>
  )
})

// StatItemコンポーネント
export const StatItem: React.FC<StatItemProps> = ({ 
  name, 
  value, 
  isChanged,
  previousValue 
}) => {
  return (
    <div className={cn(
      "flex justify-between items-center py-1 px-2 rounded",
      isChanged && "stat-changed"
    )}>
      <span className="text-sm text-gray-600">{name}</span>
      <span className="font-mono text-sm">
        {formatDisplayValue(value)}
      </span>
    </div>
  )
}
```

## エラー表示設計

### 計算エラー時の表示
```typescript
// エラー状態の表示コンポーネント
const ErrorDisplay: React.FC<{ error: string }> = ({ error }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
      <div className="text-red-600 font-medium">計算エラー</div>
      <div className="text-red-500 text-sm mt-1">{error}</div>
    </div>
  )
}

// 異常値の表示
const formatDisplayValue = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '---'
  if (isNaN(value)) return 'エラー'
  if (!isFinite(value)) return '∞'
  return value.toLocaleString()
}
```

### ローディング状態
```typescript
const LoadingDisplay: React.FC = () => {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-lg h-32" />
      ))}
    </div>
  )
}
```

## 実装例

### StatusPreviewコンポーネント
```typescript
export const StatusPreview: React.FC<StatusPreviewProps> = ({ isVisible }) => {
  const calculationResults = useCalculatorStore((state) => state.calculationResults)
  
  if (!isVisible) return null
  
  if (!calculationResults) {
    return <LoadingDisplay />
  }
  
  return (
    <div className="status-preview">
      <div className="status-container">
        <div className="status-grid">
          <StatSection 
            title="基本ステータス"
            stats={calculationResults.basicStats}
            className="basic-stats"
          />
          <StatSection 
            title="補正後ステータス"
            stats={calculationResults.adjustedStats}
            className="adjusted-stats"
          />
          <StatSection 
            title="装備品補正値1"
            stats={calculationResults.equipmentBonus1}
            className="equipment-bonus-1"
          />
          <StatSection 
            title="装備品補正値2"
            stats={calculationResults.equipmentBonus2}
            className="equipment-bonus-2"
          />
          <StatSection 
            title="装備品補正値3"
            stats={calculationResults.equipmentBonus3}
            className="equipment-bonus-3"
          />
        </div>
      </div>
    </div>
  )
}
```

## 装備品補正値計算仕様

### 計算方法

装備品補正値1〜3の各プロパティ値は、以下の4つのソースからの値を加算して算出される：

```typescript
// 各プロパティの計算式
equipmentBonusValue = equipmentValue + crystalValue + foodValue + buffValue
```

### データソース詳細

#### 1. 装備品/プロパティ (Equipment Properties)
- **ソース**: 装備フォームで設定された8スロットの装備品
- **対象**: メイン、ボディ、アディショナル、スペシャル、サブ武器、ファッション1-3
- **取得**: 各装備品の選択されたプロパティ値

#### 2. クリスタル (Crystal Properties)  
- **ソース**: クリスタルフォームで設定された8スロットのクリスタル
- **対象**: 武器クリスタル×2、防具クリスタル×2、アディショナルクリスタル×2、スペシャルクリスタル×2
- **取得**: 各クリスタルの効果値

#### 3. 料理 (Food Effects)
- **ソース**: 料理選択フォームで設定された料理とレベル
- **対象**: HP系、MP系、ATK系等の各種料理
- **取得**: 選択された料理の指定レベル効果値
- **詳細**: [料理データ設計書](../data/food-data.md)参照

#### 4. バフアイテム (Buff Items)
- **ソース**: バフアイテム選択フォームで設定されたアイテム
- **対象**: 各種バフアイテム、スキルバフ
- **取得**: 選択されたバフの効果値

### 計算実装例

```typescript
// 装備品補正値計算の実装例
interface BonusCalculationSources {
  equipment: Record<string, number>  // 装備品からの補正値
  crystal: Record<string, number>    // クリスタルからの補正値  
  food: Record<string, number>       // 料理からの補正値
  buff: Record<string, number>       // バフからの補正値
}

function calculateEquipmentBonus(
  propertyName: string,
  sources: BonusCalculationSources
): number {
  const equipmentValue = sources.equipment[propertyName] || 0
  const crystalValue = sources.crystal[propertyName] || 0
  const foodValue = sources.food[propertyName] || 0
  const buffValue = sources.buff[propertyName] || 0
  
  return equipmentValue + crystalValue + foodValue + buffValue
}

// 全プロパティの計算
function calculateAllEquipmentBonuses(
  sources: BonusCalculationSources
): Record<string, number> {
  const allProperties = new Set([
    ...Object.keys(sources.equipment),
    ...Object.keys(sources.crystal),
    ...Object.keys(sources.food),
    ...Object.keys(sources.buff)
  ])
  
  const result: Record<string, number> = {}
  
  for (const property of allProperties) {
    result[property] = calculateEquipmentBonus(property, sources)
  }
  
  return result
}
```

### 計算フロー

1. **データ収集**: 各フォームから現在の設定値を取得
2. **プロパティ集約**: 同一プロパティの値を4ソースから収集
3. **加算計算**: プロパティごとに4つの値を合計
4. **結果格納**: 装備品補正値1〜3の適切なセクションに配置
5. **UI更新**: StatusPreviewで計算結果を表示

### プロパティ分類

#### 装備品補正値1 (31プロパティ)
- **攻撃系**: ATK, MATK, 武器ATK, 物理貫通, 魔法貫通
- **属性系**: 属性威力, 抜刀威力, 近距離威力, 遠距離威力
- **クリティカル**: クリ率, クリダメ
- **ステータス**: STR, AGI, INT, DEX, VIT
- **速度系**: ASPD, CSPD, 安定率, 行動速度% (MotionSpeed_Rate)
- **命中回避**: 命中, 回避
- **HP/MP**: HP, MP, 攻撃MP回復
- **耐性**: 異常耐性, 物理耐性, 魔法耐性
- **ヘイト**: ヘイト+, ヘイト-

#### 装備品補正値2 (31プロパティ)  
- **ステータス依存攻撃**: ATK+(STR%), MATK+(STR%), ATK+(INT%), MATK+(INT%), etc.
- **属性耐性**: 無耐性, 火耐性, 水耐性, 風耐性, 地耐性, 光耐性, 闇耐性
- **ダメージ軽減**: 直線軽減, 突進軽減, 弾丸軽減, 周囲軽減, 範囲軽減, 痛床軽減, 隕石軽減, 射刃軽減, 吸引軽減, 爆発軽減
- **バリア**: 物理バリア, 魔法バリア, 割合バリア, バリア速度

#### 装備品補正値3 (8プロパティ)
- **追撃**: 物理追撃, 魔法追撃  
- **自然回復**: HP自然回復, MP自然回復
- **絶対系**: 絶対命中, 絶対回避
- **特殊**: 復帰短縮, 道具速度

### データ統合ポイント

#### aggregateAllBonuses関数での統合
```typescript
// src/utils/basicStatsCalculation.ts での実装
export function aggregateAllBonuses(
  equipmentBonuses: Record<string, number>,
  crystalBonuses: Record<string, number>, 
  foodBonuses: Record<string, number>,
  buffBonuses: Record<string, number>
): AllBonuses {
  // 4つのソースから値を集約して装備品補正値を計算
  const aggregated: Record<string, number> = {}
  
  // 全プロパティを収集
  const allKeys = new Set([
    ...Object.keys(equipmentBonuses),
    ...Object.keys(crystalBonuses),
    ...Object.keys(foodBonuses), 
    ...Object.keys(buffBonuses)
  ])
  
  // プロパティごとに4ソースの値を加算
  for (const key of allKeys) {
    aggregated[key] = (equipmentBonuses[key] || 0) +
                     (crystalBonuses[key] || 0) +
                     (foodBonuses[key] || 0) +
                     (buffBonuses[key] || 0)
  }
  
  return aggregated
}
```

## FLEE計算実装ガイダンス

### 実装要件

#### 1. 基礎FLEE計算の体装備状態判定

```typescript
// 体装備の状態とArmorTypeを判定する関数
function getBodyEquipmentStatus(bodyEquipment: Equipment | null): {
  hasBodyEquipment: boolean
  armorType: ArmorType
} {
  if (!bodyEquipment || !bodyEquipment.id) {
    return { hasBodyEquipment: false, armorType: 'normal' }
  }
  
  return { 
    hasBodyEquipment: true, 
    armorType: bodyEquipment.armorType || 'normal' 
  }
}
```

#### 2. FLEE計算関数の実装

```typescript
interface FLEECalculationSteps {
  level: number
  adjustedAGI: number
  hasBodyEquipment: boolean
  armorType: ArmorType
  baseFLEE: number
  dodgePercent: number
  fleeAfterPercent: number
  dodgeFixed: number
  finalFLEE: number
}

function calculateFLEE(
  level: number,
  adjustedAGI: number,
  bodyEquipment: Equipment | null,
  allBonuses: AllBonuses = {}
): FLEECalculationSteps {
  // 1. 体装備状態の判定
  const { hasBodyEquipment, armorType } = getBodyEquipmentStatus(bodyEquipment)
  
  // 2. 基礎FLEE計算（4パターン）
  let baseFLEE: number
  
  if (!hasBodyEquipment) {
    // 体装備なし
    baseFLEE = Math.floor(75 + level * 3/2 + adjustedAGI * 2)
  } else {
    // 体装備あり（ArmorTypeに応じて分岐）
    switch (armorType) {
      case 'light':
        // 軽量化
        baseFLEE = Math.floor(30 + level * 5/4 + adjustedAGI * 7/4)
        break
      case 'heavy':
        // 重量化
        baseFLEE = Math.floor(-15 + level/2 + adjustedAGI * 3/4)
        break
      case 'normal':
      default:
        // 通常
        baseFLEE = Math.floor(level + adjustedAGI)
        break
    }
  }
  
  // 3. 回避%適用（装備+クリスタ+バフアイテム、料理除外）
  const dodgePercent = allBonuses.Dodge_Rate || 0
  const fleeAfterPercent = Math.floor(baseFLEE * (1 + dodgePercent / 100))
  
  // 4. 回避固定値加算（装備+クリスタ+バフアイテム、料理除外）
  const dodgeFixed = allBonuses.Dodge || 0
  const finalFLEE = fleeAfterPercent + dodgeFixed
  
  return {
    level,
    adjustedAGI,
    hasBodyEquipment,
    armorType,
    baseFLEE,
    dodgePercent,
    fleeAfterPercent,
    dodgeFixed,
    finalFLEE,
  }
}
```

#### 3. StatusPreviewでの統合

```typescript
// StatusPreviewコンポーネント内でのFLEE計算統合
const fleeCalculation = useMemo(() => {
  return calculateFLEE(
    baseStats.level,
    adjustedStatsCalculation.AGI,
    data.equipment.body,  // 体装備データ
    allBonuses
  )
}, [baseStats.level, adjustedStatsCalculation.AGI, data.equipment.body, allBonuses])

// 基本ステータス表示データに含める
const basicStatsResult = {
  // ... 他のステータス
  FLEE: fleeCalculation.finalFLEE,
  // ... 他のステータス
}
```

#### 4. ArmorType変更時の自動更新

FLEE計算は以下の要素が変更された時に自動的に再計算されます：

- **レベル変更**: BaseStatsForm → baseStats.level
- **AGI変更**: BaseStatsForm → adjustedStats.AGI（装備・クリスタ・料理・バフアイテム補正込み）
- **体装備変更**: EquipmentForm → data.equipment.body
- **ArmorType変更**: ArmorTypeSelect → data.equipment.body.armorType
- **回避%変更**: 装備・クリスタ・バフアイテムのプロパティ変更
- **回避固定値変更**: 装備・クリスタ・バフアイテムのプロパティ変更

#### 5. 重要な実装注意点

1. **INT()関数の使用**: 各計算段階でMath.floor()を使用して切り捨て処理を行う
2. **料理除外**: 料理からの回避補正は存在しないため、AllBonusesの計算時に料理データを除外
3. **ArmorType連動**: 体装備のArmorType変更時にFLEE値が即座に更新される
4. **体装備なし処理**: 体装備が選択されていない場合の特別な計算式を適用
5. **負数対応**: 重量化時の基礎FLEE計算で負数が発生する可能性があるため適切に処理

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2024-06-23 | StatusPreview独立設計書作成 | header-component.mdから分離 |
| 2024-06-23 | UI設計書に特化した内容に変更 | 計算ロジックをrequirements/に分離 |
| 2024-06-23 | 装備品補正値計算仕様を追加 | 4ソース加算方式の詳細化 |
| 2024-06-24 | 基礎ATK仕様を更新 | 基礎ATK＝ステータスATKであることを明記 |
| 2024-06-24 | 基礎ATK計算式を修正 | 正しい基礎ATK計算式に変更 |
| 2024-06-24 | サブATK仕様を追加 | 双剣専用のサブATK・サブ基礎ATK計算仕様を追加 |
| 2024-06-25 | 行動速度計算仕様を追加 | ASPD依存の行動速度計算式と表示要件を追加 |
| 2024-06-26 | クリティカル率計算仕様を追加 | 実装済みクリティカル率計算の詳細仕様を記述 |
| 2024-06-26 | HIT計算仕様を更新 | 実装済みHIT計算の詳細仕様を記述 |
| 2024-06-26 | 物理耐性計算仕様を追加 | 4データソース統合による物理耐性計算仕様を記述 |
| 2024-06-26 | TypeScript型定義を更新 | 実装済み計算項目の型定義コメントを更新 |
| 2024-06-26 | 魔法耐性計算仕様を追加 | 4データソース統合による魔法耐性計算仕様を記述 |
| 2024-06-26 | 防御崩し計算仕様を追加 | 3データソース統合による防御崩し計算仕様を記述 |
| 2024-06-26 | 先読み計算仕様を追加 | 3データソース統合による先読み計算仕様を記述 |
| 2024-06-26 | CSPD（詠唱速度）計算仕様を追加 | INT関数2段階処理、Lv+補正後DEX・AGI依存計算仕様を記述 |
| 2024-06-26 | 総属性有利計算仕様を追加 | 4データソース統合による総属性有利計算仕様を記述 |
| 2025-06-28 | ASPD計算にArmorType補正を追加 | 軽量化+50%、重量化-50%、内部計算のみでUI表示に影響しない仕様を追加 |
| 2025-06-28 | FLEE計算仕様と実装ガイダンスを追加 | 体装備状態・ArmorType依存の4パターン基礎FLEE計算、実装コード例、自動更新仕様を追加 |

## 関連ドキュメント
- [StatusPreview機能要件](../requirements/10_status-preview-requirements.md) - 機能仕様の詳細
- [基本ステータス計算式](../calculations/basic-stats.md) - 計算ロジックの詳細
- [ヘッダーコンポーネント設計](./header-component.md)
- [結果トグルバー設計](./result-toggle-bar.md)