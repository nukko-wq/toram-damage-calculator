# StatusPreview 計算仕様詳細

## 概要

StatusPreviewコンポーネントで表示される各ステータスの計算仕様について詳細に記述する。基本ステータス30項目の計算ロジックと、それらの実装要件を定義する。

**メインUI設計**: [StatusPreview UI設計書](./status-preview.md)を参照  
**実装ガイド**: [StatusPreview 実装ガイド](./status-preview-implementation.md)を参照

## 基本ステータス計算仕様（30項目）

### 0値表示仕様
- **適用条件**: 計算結果が0、null、undefinedの場合
- **表示形式**: 数値の代わりに「-」を表示
- **対象**: 全ての基本ステータス項目（ATK、MATK、HP、MP等）
- **例外**: サブATK・サブ基礎ATK・サブ安定率は双剣以外では常に「-」表示（専用仕様）

### ATK計算仕様
- **計算式**: `INT((自Lv + 総武器ATK + ステータスATK + ATKアップ - ATKダウン) × (1 + ATK%/100)) + ATK固定値`
- **基礎ATK表示**: `Lv+総武器ATK+ステータスATK+ATKアップ(ステータス%) - ATKダウン(ステータス%)` (表示時のみ小数点以下切り捨て)
- **総武器ATK特殊計算**: 弓・自動弓装備時の矢ATK加算
  - **弓＋矢**: メイン武器が「弓」かつサブ武器が「矢」の場合、`総武器ATK = 精錬補正後武器ATK + 武器ATK%補正 + 武器ATK固定値 + 矢のATK`
  - **自動弓＋矢**: メイン武器が「自動弓」かつサブ武器が「矢」の場合、`総武器ATK = 精錬補正後武器ATK + 武器ATK%補正 + 武器ATK固定値 + INT(矢のATK/2)`
  - **その他**: 標準の総武器ATK計算（矢のATK加算なし）
  - **重要**: 精錬補正・武器ATK%補正はメイン武器のATKのみに適用、矢のATKは武器ATK固定値として最後に加算
- **ステータスATK**: 武器種別に応じた計算式（**補正後ステータス**を使用）（例：旋風槍 `補正後STR × 2.5 + 補正後AGI × 1.5`、素手 `補正後STR × 1.0`）
- **データソース**: メイン武器・サブ武器の種別、**補正後ステータス値**に基づいて計算式を自動選択
- **対応武器種**: 全11種の武器種（旋風槍、片手剣、両手剣、弓、自動弓、杖、魔導具、手甲、抜刀剣、双剣、素手）

**計算詳細**: [ATK計算式設計書](../calculations/atk-calculation.md)を参照

### 総ATK計算仕様
- **双剣以外**: `総ATK = ATK`（メイン武器のATKをそのまま表示）
- **双剣装備時**: `総ATK = ATK + サブATK`（メインATKとサブATKの合計値）
- **サブ武器なし**: 双剣でもサブATKが0の場合、`総ATK = ATK`
- **表示形式**: カンマ区切りの整数値（例: 2,497）
- **武器種判定**: `data.mainWeapon.weaponType === '双剣'` による条件分岐
- **データソース**: 
  - **メインATK**: ATK計算結果（上記ATK計算仕様による）
  - **サブATK**: サブATK計算結果（双剣専用、サブ武器のATK + 精錬補正等）
- **計算手順**:
  1. メイン武器種が「双剣」かチェック
  2. 双剣の場合：ATK + サブATK
  3. 双剣以外：ATK

**計算詳細**: [総ATK計算式](../calculations/basic-stats.md#総atk計算)を参照

### MATK計算仕様
- **計算式**: `INT((自Lv+総武器MATK+ステータスMATK+MATKアップ(ｽﾃｰﾀｽ%)-MATKダウン(ｽﾃｰﾀｽ%))×(1+MATK%/100))+MATK固定値`
- **総武器MATK**: 武器種別に応じて適用条件が異なる
  - **杖・魔導具**: `INT(武器ATK×(1+(精錬値^2)/100)+精錬値)+INT(武器ATK×武器ATK%)+武器ATK固定値`
  - **手甲**: `総武器ATK/2`（小数点保持でMATK計算に使用）
  - **その他**: 武器ATKは基礎MATKに適用されない（0）
- **ステータスMATK**: 武器種別に応じた計算式（**補正後ステータス**を使用）
  - **片手剣・両手剣・弓・自動弓・素手**: `補正後INT × 3 + 補正後DEX × 1`
  - **杖・魔導具・手甲**: `補正後INT × 4 + 補正後DEX × 1`
  - **旋風槍**: `補正後INT × 2 + 補正後DEX × 1 + 補正後AGI × 1`
  - **抜刀剣**: `補正後INT × 1.5 + 補正後DEX × 1`（小数点保持）
- **MATKアップ(ｽﾃｰﾀｽ%)**: 基礎ステータス値に連動する攻撃力補正
  - **MATK_STR_Rate**: `INT(基礎STR × MATK_STR_Rate/100)`
  - **MATK_INT_Rate**: `INT(基礎INT × MATK_INT_Rate/100)`
  - **MATK_VIT_Rate**: `INT(基礎VIT × MATK_VIT_Rate/100)`
  - **MATK_AGI_Rate**: `INT(基礎AGI × MATK_AGI_Rate/100)`
  - **MATK_DEX_Rate**: `INT(基礎DEX × MATK_DEX_Rate/100)`
- **MATK%**: 装備/プロパティ、クリスタ、バフアイテムのMATK_Rate補正の合計
- **MATK固定値**: 装備/プロパティ、クリスタ、料理、バフアイテムのMATK固定値の合計
- **計算特性**: 抜刀剣のステータスMATKのみ小数点保持、他は各段階でINT()適用
- **データソース**: メイン武器の種別、**基礎ステータス値**（MATKアップ用）、**補正後ステータス値**（ステータスMATK用）、各種補正値を使用
- **重要な注意**: 
  - 手甲装備時は総武器ATK計算結果を2で割るため、ATK計算との連動が必要
  - ステータスMATKは補正後ステータス、MATKアップは基礎ステータスを使用する点に注意

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#matk計算)を参照

### ASPD計算仕様
- **計算式**: `INT((Lv + ステータスASPD + 武器補正値) × (1 + (ASPD% + ArmorType補正)/100)) + ASPD固定値`
- **ステータスASPD**: 武器種別に応じた計算式（例：片手剣 `STR × 0.2 + AGI × 4.2`、素手 `AGI × 9.6`）
- **武器補正値**: 武器種固有の基本ASPD値（例：片手剣 100、魔道具 900）
- **ArmorType補正**: 体装備の防具の改造による内部ASPD%補正（通常: 0%、軽量化: +50%、重量化: -50%）
- **重要な注意**: ArmorType補正は内部計算のみで使用され、装備品補正値のASPD%には表示されない
- **即座反映**: ArmorType変更時にZustandストア状態が強制更新され、StatusPreviewのASPD計算が自動的に再実行される
- **データソース**: メイン武器の種別、体装備のArmorType設定に基づいて計算式を自動選択
- **対応武器種**: 全11種の武器種

**計算詳細**: [速度系計算式](../calculations/speed-calculations.md#aspd計算)を参照

### 行動速度計算仕様
- **計算式**: `MIN(50, MAX(0, INT((ASPD-1000)/180)) + 行動速度%)`
- **ASPDベース**: INT((ASPD-1000)/180) で計算、0未満は0に制限
- **行動速度%**: 装備/プロパティ、クリスタ、バフアイテムのMotionSpeed_Rate補正の合計
- **上限制限**: 最終結果は50%上限
- **料理除外**: 料理からの行動速度%補正は存在しない
- **データソース**: 上記で計算されたASPD値を使用

**計算詳細**: [速度系計算式](../calculations/speed-calculations.md#行動速度計算)を参照

### サブATK仕様
- **表示条件**: 常時表示（ラベル位置統一のため）
- **双剣時の計算**:
  - **サブ基礎ATK計算**: `INT((Lv+サブ総武器ATK+サブステータスATK) × (1 + ATK%/100)) + ATK固定値`
  - **サブ安定率計算**: `INT(MAX(0, MIN(100, サブ武器の安定率/2 + ステータス安定率 + 安定率%))) + 安定率%`
  - **サブATK計算**: `INT(サブ基礎ATK × サブ安定率/100)`
  - **サブステータスATK**: `補正後STR × 1.0 + 補正後AGI × 3.0`（**補正後ステータス**を使用）
  - **双剣のサブ武器のステータス安定率**: `基礎STR × 0.06 + 基礎AGI × 0.04`（**基礎ステータス**を使用）
  - **サブ総武器ATK**: サブ武器の武器ATK・精錬値を使用
  - **安定率%**: 装備/プロパティ、クリスタ、バフアイテムのStability_Rate補正の合計
- **非双剣時の表示**: 「-」を表示（計算は実行されない）
- **表示値**:
  - **双剣時**: 上記計算式で算出された「サブATK」および「サブ基礎ATK」の値を表示
  - **非双剣時**: 「-」を表示

### サブ基礎ATK仕様
- **表示条件**: 常時表示（ラベル位置統一のため）
- **双剣時の計算**: `INT((Lv+サブ総武器ATK+サブステータスATK) × (1 + ATK%/100)) + ATK固定値`
- **非双剣時の表示**: 「-」を表示（計算は実行されない）
- **表示値**:
  - **双剣時**: 上記計算式で算出された「サブ基礎ATK」の値を表示
  - **非双剣時**: 「-」を表示

### HIT計算仕様
- **計算式**: `INT((Lv+総DEX)×(1+命中%/100))+命中固定値`
- **総DEX**: 補正後ステータスのDEX（装備・クリスタ・バフアイテム・料理補正を含む）
- **命中%**: 装備/プロパティ、クリスタ、バフアイテムのAccuracy_Rate補正の合計
- **命中固定値**: 装備/プロパティ、クリスタ、料理（しょうゆラーメン）、バフアイテムのAccuracy固定値の合計
- **料理特殊性**: 料理には命中%補正はないが、固定値補正は存在
- **データソース**: ステータスのレベル、補正後DEX値、各種補正値を使用

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#hit計算)を参照

### FLEE計算仕様
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

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#flee計算)を参照

### クリティカル率計算仕様
- **計算式**: `INT(INT(25+CRT/3.4)×(1+クリティカル率%/100))+クリティカル率固定値`
- **基本クリティカル率**: INT(25+CRT/3.4)で算出（CRTは基本ステータスの値）
- **クリティカル率%**: 装備/プロパティ、クリスタ、バフアイテムのCritical_Rate補正の合計
- **クリティカル率固定値**: 装備/プロパティ、クリスタ、料理（たこ焼き）、バフアイテムのCritical固定値の合計
- **料理特殊性**: 料理にはクリティカル率%補正はないが、固定値補正は存在
- **データソース**: 基本ステータスのCRT値、各種補正値を使用

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#クリティカル率計算)を参照

### クリティカルダメージ計算仕様
- **計算式**: `INT((150+MAX(補正後STR/5,(補正後STR+補正後AGI)/10))×(1+CD%/100))+CD固定値`
- **基礎クリティカルダメージ**: 150 + MAX(補正後STR/5, (補正後STR+補正後AGI)/10)
- **MAX判定**: STR重視(STR/5)とSTR+AGI重視((STR+AGI)/10)の高い方を採用
- **CD%(CriticalDamage_Rate)**: 装備/プロパティ、クリスタ、バフアイテムのCriticalDamage_Rate補正の合計
- **CD固定値(CriticalDamage)**: 装備/プロパティ、クリスタ、バフアイテムのCriticalDamage固定値の合計
- **料理除外**: 料理にはクリティカルダメージ補正（%・固定値とも）は存在しない
- **300超過時特殊処理**: 300を超えた場合、300以降の数値は半減され小数点以下は切り捨て
  - 例：計算結果301 → 最終CD 300、計算結果324 → 最終CD 312
- **データソース**: 補正後STR・AGI値、各種補正値を使用

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#クリティカルダメージ計算)を参照

### 物理耐性計算仕様
- **計算式**: `装備/プロパティ物理耐性% + クリスタ物理耐性% + 料理物理耐性% + バフアイテム物理耐性%`
- **構成要素**: 
  - **装備/プロパティ**: 各装備品のPhysicalResistance_Rate補正値の合計
  - **クリスタ**: セットしてあるクリスタルのPhysicalResistance_Rate補正値の合計
  - **料理**: 料理（ビーフバーガー(物理耐性)）のPhysicalResistance_Rate補正値
  - **バフアイテム**: バフアイテムのPhysicalResistance_Rate補正値の合計
- **計算特性**: パーセンテージのみ（固定値補正なし）、単純加算方式
- **データソース**: 4つのデータソースからの%補正値を統合

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#物理耐性計算)を参照

### 魔法耐性計算仕様
- **計算式**: `装備/プロパティ魔法耐性% + クリスタ魔法耐性% + 料理魔法耐性% + バフアイテム魔法耐性%`
- **構成要素**: 
  - **装備/プロパティ**: 各装備品のMagicalResistance_Rate補正値の合計
  - **クリスタ**: セットしてあるクリスタルのMagicalResistance_Rate補正値の合計
  - **料理**: 料理（フィッシュバーガー(魔法耐性)）のMagicalResistance_Rate補正値
  - **バフアイテム**: バフアイテムのMagicalResistance_Rate補正値の合計
- **計算特性**: パーセンテージのみ（固定値補正なし）、単純加算方式
- **データソース**: 4つのデータソースからの%補正値を統合

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#魔法耐性計算)を参照

### 防御崩し計算仕様
- **計算式**: `装備/プロパティ防御崩し% + クリスタ防御崩し% + バフアイテム防御崩し%`
- **構成要素**: 
  - **装備/プロパティ**: 各装備品のArmorBreak_Rate補正値の合計
  - **クリスタ**: セットしてあるクリスタルのArmorBreak_Rate補正値の合計
  - **バフアイテム**: バフアイテムのArmorBreak_Rate補正値の合計
- **計算特性**: パーセンテージのみ（固定値補正なし）、単純加算方式
- **データソース**: 3つのデータソースからの%補正値を統合（料理除外）

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#防御崩し計算)を参照

### 先読み計算仕様
- **計算式**: `装備/プロパティ先読み% + クリスタ先読み% + バフアイテム先読み%`
- **構成要素**: 
  - **装備/プロパティ**: 各装備品のAnticipate補正値の合計
  - **クリスタ**: セットしてあるクリスタルのAnticipate補正値の合計
  - **バフアイテム**: バフアイテムのAnticipate補正値の合計
- **計算特性**: パーセンテージのみ（固定値補正なし）、単純加算方式
- **データソース**: 3つのデータソースからの%補正値を統合（料理除外）

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#先読み計算)を参照

### CSPD（詠唱速度）計算仕様
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

**計算詳細**: [速度系計算式](../calculations/speed-calculations.md#cspd計算)を参照

### 総属性有利計算仕様
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

### 安定率計算仕様
- **基本計算式**: `MAX(0, MIN(100, メイン武器の安定率 + ステータス安定率 + 安定率%))`
- **弓+矢特殊計算**: メイン武器が「弓」かつサブ武器が「矢」の場合、`MAX(0, MIN(100, メイン武器の安定率 + ステータス安定率 + 安定率% + 矢の安定率))`
- **自動弓+矢特殊計算**: メイン武器が「自動弓」かつサブ武器が「矢」の場合、`MAX(0, MIN(100, メイン武器の安定率 + ステータス安定率 + 安定率% + 矢の安定率/2))`
- **構成要素**: 
  - **メイン武器の安定率**: メイン武器固有の安定率値
  - **ステータス安定率**: 武器種別に応じたSTR・DEXによる係数計算
  - **安定率%**: 装備/プロパティ、クリスタ、バフアイテムのStability_Rate補正の合計
  - **矢の安定率**: 弓+矢装備時の追加安定率
    - **弓の場合**: 矢の安定率をそのまま加算
    - **自動弓の場合**: 矢の安定率/2を加算（INT適用）
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
  - **双剣**: メイン武器の安定率計算（上記共通計算式を使用）
- **計算特性**: MIN/MAX関数使用、0-100%範囲制限、料理除外
- **データソース**: メイン武器基本値 + 武器種別ステータス計算 + 3つのデータソースからの%補正値 + 矢の安定率（弓+矢時のみ、自動弓は半分）を統合
- **制限**: 上限100%、下限0%の範囲制限が適用される

### サブ安定率計算仕様
- **表示条件**: 常時表示（ラベル位置統一のため）
- **双剣時の計算式**: `INT(MAX(0, MIN(100, サブ武器の安定率/2 + 双剣のサブ武器のステータス安定率 + 安定率%))) + 安定率%`
- **弓+矢時の表示**: サブ武器（矢）の安定率値をそのまま表示（計算は実行されない）
- **その他の武器種の表示**: 「-」を表示（計算は実行されない）
- **構成要素（双剣時のみ）**: 
  - **サブ武器の安定率**: サブ武器フォームで設定された安定率値（0-100の数値）
  - **双剣のサブ武器のステータス安定率**: 基礎STR × 0.06 + 基礎AGI × 0.04（**基礎ステータス**を使用）
  - **安定率%**: 装備/プロパティ、クリスタ、バフアイテムのStability_Rate補正の合計（メイン武器と共通）
- **表示値**: 
  - **双剣時**: 上記計算式で算出された「サブ安定率」の値を表示
  - **弓+矢時**: サブ武器（矢）の安定率値を表示
  - **その他**: 「-」を表示
- **計算特性**: 
  - **双剣**: 2段階計算（MAX/MIN → INT → 安定率%加算）、基礎ステータス使用
  - **弓+矢**: 単純表示（計算なし）

**計算詳細**: [基本ステータス計算式](../calculations/basic-stats.md#安定率計算)を参照

## 補正後ステータス計算仕様（8項目）

### 計算方式
- **STR/INT/VIT/AGI/DEX**: `INT(基礎ステータス × (1 + ステータス%/100)) + ステータス固定値`
- **CRT/MEN/TEC**: 基本ステータスの値をそのまま表示（補正なし）

### データソース
- **基礎ステータス**: BaseStatsFormの入力値
- **ステータス%**: 装備・クリスタ・料理・バフアイテムの%補正の合計
- **ステータス固定値**: 装備・クリスタ・料理・バフアイテムの固定値補正の合計

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
- **ヘイト**: ヘイト

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

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2025-06-28 | 双剣サブATK安定率計算を修正 | サブ安定率の計算式を追加、正しい2段階計算に修正 |
| 2025-06-28 | 双剣サブATK計算仕様を修正 | 安定率による計算方式に変更、サブ基礎ATK計算式も更新 |
| 2025-06-28 | ATK計算仕様を補正後ステータス使用に修正 | ステータスATK・サブステータスATKで補正後ステータスを使用するよう変更 |
| 2025-06-28 | StatusPreview計算仕様を専用ファイルに分離 | status-preview.mdから計算仕様部分を抽出 |
| 2025-06-28 | クリティカルダメージ計算仕様を追加 | MAX関数使用、補正後STR・AGI依存、300超過時半減処理、料理除外の仕様を追加 |
| 2025-06-29 | サブ安定率計算仕様を追加 | 双剣専用のサブ安定率計算式と表示要件を詳細化、計算後の値を表示することを明記 |
| 2025-06-29 | 弓＋矢の特殊ATK計算仕様を追加 | 弓・自動弓装備時の矢ATK加算計算をATK計算仕様に追加 |
| 2025-06-29 | 弓＋矢のATK計算仕様を修正 | 矢のATKを武器ATK固定値として加算する正しい仕様に修正 |
| 2025-06-29 | 自動弓＋矢のATK計算仕様を追加 | 自動弓の場合は矢のATK/2（INT適用）を武器ATK固定値として加算する仕様を追加 |
| 2025-06-29 | サブATK・サブ基礎ATK表示仕様を修正 | 常時表示（双剣以外は「-」表示）に変更してラベル位置を統一 |
| 2025-06-29 | 弓+矢の安定率計算仕様を追加 | 弓・自動弓+矢装備時は矢の安定率を加算する特殊計算を追加 |
| 2025-06-29 | 弓+矢のサブ安定率表示仕様を追加 | 弓+矢時はサブ武器（矢）の安定率値を表示する仕様を追加 |
| 2025-06-29 | 自動弓+矢の安定率計算仕様を追加 | 自動弓の場合は矢の安定率/2（INT適用）を加算する特殊計算を追加 |
| 2025-06-29 | 基本ステータスラベルに%表記を追加 | パーセンテージ系のステータスラベルに(%)を追加して単位を明確化 |
| 2025-06-29 | レジスタシステム設計を追加 | 最大HPアップ(maxHPUp)の仕様を装備品補正値1のHP(+)への加算として設計 |
| 2025-07-02 | 総ATK計算仕様を追加 | 双剣専用のATK+サブATK加算仕様、武器種判定による条件分岐、計算手順を追加 |

## 関連ドキュメント
- [StatusPreview UI設計書](./status-preview.md) - メインUI設計とレイアウト
- [StatusPreview 実装ガイド](./status-preview-implementation.md) - TypeScript実装例とコード
- [StatusPreview データ仕様](./status-preview-data.md) - データ構造とインターフェース
- [基本ステータス計算式](../calculations/basic-stats.md) - 計算ロジックの詳細
- [速度系計算式](../calculations/speed-calculations.md) - ASPD・CSPD・行動速度計算の詳細
- [HP・MP計算式](../calculations/hp-mp-calculation.md) - HP・MP計算の詳細