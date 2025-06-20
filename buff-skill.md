# バフスキル システム仕様書

## 1. 概要
トーラムオンラインのバフスキルのオン/オフ設定とレベル・パラメータ調整を行うシステム。
各バフスキルは個別にオン/オフ切り替え可能で、有効時は対応するレベルやパラメータを設定できる。

## 2. バフスキル一覧

### 2.1 マスタリスキル

| スキル名 | 設定パラメータ | 範囲 | 備考 |
|---------|----------------|------|------|
| ハルバードマスタリ | スキルレベル | 1-10 | マスタリ系スキル |
| ブレードマスタリ | スキルレベル | 1-10 | マスタリ系スキル |
| シュートマスタリ | スキルレベル | 1-10 | マスタリ系スキル |
| マジックマスタリ | スキルレベル | 1-10 | マスタリ系スキル |
| マーシャルマスタリ | スキルレベル | 1-10 | マスタリ系スキル |
| デュアルマスタリ | スキルレベル | 1-10 | マスタリ系スキル |
| シールドマスタリ | スキルレベル | 1-10 | マスタリ系スキル |

### 2.2 ブレードスキル

| スキル名 | 設定パラメータ | 範囲 | 備考 |
|---------|----------------|------|------|
| ウォークライ | - | オン/オフのみ | 固定効果 |
| バーサーク | - | オン/オフのみ | 固定効果 |

### 2.3 シュートスキル

| スキル名 | 設定パラメータ | 範囲 | 備考 |
|---------|----------------|------|------|
| 武士弓術 | - | オン/オフのみ | 固定効果 |
| ロングレンジ | スキルレベル | 1-10 | 遠距離威力アップ |

### 2.4 ハルバードスキル

| スキル名 | 設定パラメータ | 範囲 | 備考 |
|---------|----------------|------|------|
| クイックオーラ | スキルレベル | 1-10 | 攻撃速度アップ |
| 会心の捌き | - | オン/オフのみ | 固定効果 |
| トルネードランス | カウント数 | 1-10 | 重ねがけ効果 |
| 神速の捌手 | 重ねがけ数 | 1-3 | 最大3重ねがけ |
| トールハンマー | - | オン/オフのみ | 固定効果 |

### 2.5 モノノフスキル

| スキル名 | 設定パラメータ | 範囲 | 備考 |
|---------|----------------|------|------|
| 武士道 | スキルレベル | 1-10 | クリティカル率アップ |
| 明鏡止水 | スキルレベル | 1-10 | 命中・回避アップ |
| 両手持ち | - | オン/オフのみ | 固定効果 |
| 怪力乱神 | スキルレベル | 1-10 | 攻撃力アップ |

### 2.6 デュアルソードスキル

| スキル名 | 設定パラメータ | 範囲 | 備考 |
|---------|----------------|------|------|
| 神速の軌跡 | スキルレベル | 1-10 | 攻撃速度アップ |
| フィロエクレール | スキルレベル | 1-10 | 属性攻撃アップ |

### 2.7 スプライトスキル

| スキル名 | 設定パラメータ | 範囲 | 備考 |
|---------|----------------|------|------|
| エンハンス | - | オン/オフのみ | 固定効果 |
| スタピリス | - | オン/オフのみ | 固定効果 |
| プリエール | - | オン/オフのみ | 固定効果 |

### 2.8 ダークパワースキル

| スキル名 | 設定パラメータ | 範囲 | 備考 |
|---------|----------------|------|------|
| エターナルナイトメア | スキルレベル | 1-10 | |
| | 使用スキルポイント | 25-80 | 効果に影響 |

### 2.9 シールドスキル

| スキル名 | 設定パラメータ | 範囲 | 備考 |
|---------|----------------|------|------|
| プロテクション | - | オン/オフのみ | 固定効果 |
| イージス | - | オン/オフのみ | 固定効果 |

### 2.10 ナイトスキル

| スキル名 | 設定パラメータ | 範囲 | 備考 |
|---------|----------------|------|------|
| ナイトプレッジ | スキルレベル | 1-10 | |
| | プレイヤーの数 | 0-4 | パーティメンバー数 |
| | 盾精錬値 | 1-15 | 装備している盾の精錬値 |

### 2.11 ハンタースキル

| スキル名 | 設定パラメータ | 範囲 | 備考 |
|---------|----------------|------|------|
| カムフラージュ | スキルレベル | 1-10 | 隠密効果 |

### 2.12 アサシンスキル

| スキル名 | 設定パラメータ | 範囲 | 備考 |
|---------|----------------|------|------|
| シーカーリウス | - | オン/オフのみ | 固定効果 |
| 暗殺の極意 | - | オン/オフのみ | 固定効果 |

### 2.13 ニンジャスキル

| スキル名 | 設定パラメータ | 範囲 | 備考 |
|---------|----------------|------|------|
| 忍道 | スキルレベル | 1-10 | 忍者の基本スキル |
| 忍術 | スキルレベル | 1-10 | 忍術系スキル |
| 忍術鍛錬Ⅰ | スキルレベル | 1-10 | 忍術強化スキル |
| 忍術鍛錬Ⅱ | スキルレベル | 1-10 | 忍術強化スキル |

### 2.14 サポートスキル

| スキル名 | 設定パラメータ | 範囲 | 備考 |
|---------|----------------|------|------|
| ブレイブ | 使用者か？ | 0-1 | 0:他者使用, 1:自己使用 |
| ハイサイクル | - | オン/オフのみ | 固定効果 |
| クイックモーション | - | オン/オフのみ | 固定効果 |
| マナリチャージ | - | オン/オフのみ | 固定効果 |

### 2.15 サバイバルスキル

| スキル名 | 設定パラメータ | 範囲 | 備考 |
|---------|----------------|------|------|
| MPブースト | スキルレベル | 1-10 | MP最大値アップ |

### 2.16 バトルスキル

| スキル名 | 設定パラメータ | 範囲 | 備考 |
|---------|----------------|------|------|
| スペルバースト | - | オン/オフのみ | 固定効果 |
| クリティカルUP | - | オン/オフのみ | 固定効果 |
| HPブースト | スキルレベル | 1-10 | HP最大値アップ |
| 攻撃力UP | スキルレベル | 1-10 | 攻撃力アップ |
| 脅威の威力 | スキルレベル | 1-10 | 攻撃力アップ |
| 魔法力UP | スキルレベル | 1-10 | 魔法攻撃力アップ |
| 更なるまりょく | スキルレベル | 1-10 | 魔法攻撃力アップ |
| 命中UP | スキルレベル | 1-10 | 命中率アップ |
| 回避UP | スキルレベル | 1-10 | 回避率アップ |

### 2.17 ペット使用スキル（赤バフ）

| スキル名 | 設定パラメータ | 範囲 | 備考 |
|---------|----------------|------|------|
| ブレイブアップ | - | オン/オフのみ | ペット専用バフ |
| マインドアップ | - | オン/オフのみ | ペット専用バフ |
| カットアップ | - | オン/オフのみ | ペット専用バフ |
| クリティカルアップ | - | オン/オフのみ | ペット専用バフ |

### 2.18 ミンストレルスキル

| スキル名 | 設定パラメータ | 範囲 | 備考 |
|---------|----------------|------|------|
| 熱情の歌 | カウント数 | 1-10 | 重ねがけ効果 |

### 2.19 パルチザンスキル

| スキル名 | 設定パラメータ | 範囲 | 備考 |
|---------|----------------|------|------|
| 前線維持Ⅱ | スキルレベル | 1-10 | 防御力アップ |

## 3. UI設計仕様

### 3.1 基本レイアウト
- **グリッドレイアウト**: 5カラム表示（レスポンシブ対応）
- **スキルカード形式**: 各スキルを個別のカード形式で表示
- **平坦表示**: カテゴリ別の折りたたみなし、全スキルを一覧表示
- **カテゴリラベル**: 各スキルカード上部にカテゴリ名を表示

### 3.2 マスタリスキル自動表示システム
- **武器種連動表示**: メイン武器の武器種に応じて該当するマスタリスキルのみを表示
- **武器種とマスタリスキルの対応関係**:

| 武器種 | 表示されるマスタリスキル |
|--------|------------------------|
| 素手 | シールドマスタリ |
| 片手剣 | ブレードマスタリ + シールドマスタリ |
| 双剣 | ブレードマスタリ + デュアルマスタリ |
| 両手剣 | ブレードマスタリ |
| 手甲 | マーシャルマスタリ + シールドマスタリ |
| 旋風槍 | ハルバードマスタリ |
| 抜刀剣 | 該当なし（マスタリスキル系統全体を非表示） |
| 弓 | シュートマスタリ |
| 自動弓 | シュートマスタリ + シールドマスタリ |
| 杖 | マジックマスタリ + シールドマスタリ |
| 魔導具 | マジックマスタリ |

- **動的表示切り替え**: 武器種変更時に即座にマスタリスキル表示を更新
- **マスタリスキル設定のリセット**: 武器種変更時に全てのマスタリスキルがデフォルト状態にリセット
- **新規表示スキルの初期化**: 新しい武器種に対応するマスタリスキルは無効状態・初期パラメータで表示

### 3.2.2 武器種専用スキル自動表示システム
- **武器種連動表示**: メイン武器の武器種に応じて該当する専用スキルのみを表示
- **武器種と専用スキルの対応関係**:

| 武器種 | 表示される専用スキル |
|--------|-------------------|
| 旋風槍 | トールハンマー、トルネードランス、会心の捌き（ハルバードスキル） |

- **動的表示切り替え**: 武器種変更時に即座に専用スキル表示を更新
- **専用スキル設定のリセット**: 武器種変更時に専用スキルがデフォルト状態にリセット
- **新規表示スキルの初期化**: 新しい武器種に対応する専用スキルは無効状態・初期パラメータで表示

### 3.3 スキル設定UI
- **トグルスイッチ**: 各スキルの有効/無効を切り替え（チェックボックスからトグルスイッチに変更）
- **スキル名クリック**: スキル名をクリックでポップオーバーを表示
- **ポップオーバー内パラメータ編集**: 専用フォームでスキルレベルや特殊パラメータの数値入力
- **スキル名へのパラメータ表示**: 現在の設定値をスキル名に併記（例: ハルバードマスタリ/10）
- **リアルタイム反映**: 設定変更時に即座にダメージ計算に反映

### 3.4 バリデーション
- **数値範囲チェック**: 各パラメータの最小/最大値制限
- **必須項目チェック**: オン状態での必須パラメータ検証
- **エラー表示**: 不正な値入力時の視覚的フィードバック

## 4. データ構造

### 4.1 バフスキルデータ型
```typescript
interface BuffSkill {
  id: string
  name: string
  category: BuffSkillCategory
  isEnabled: boolean
  parameters: BuffSkillParameters
}

interface BuffSkillParameters {
  skillLevel?: number      // 1-10
  stackCount?: number      // 重ねがけ数
  playerCount?: number     // プレイヤー数
  refinement?: number      // 精錬値
  spUsed?: number         // 使用SP
  isCaster?: number       // 使用者フラグ
}

type BuffSkillCategory = 
  | 'mastery' | 'blade' | 'shoot' | 'halberd' | 'mononofu'
  | 'dualSword' | 'sprite' | 'darkPower' | 'shield' | 'knight'
  | 'hunter' | 'assassin' | 'ninja' | 'support' | 'survival'
  | 'battle' | 'pet' | 'minstrel' | 'partisan'
```

### 4.2 武器種とスキルの対応関係

#### 4.2.1 武器種とマスタリスキルの対応関係
```typescript
// 武器種からマスタリスキルIDを取得するマッピング
const weaponTypeToMasterySkills: Record<WeaponType, string[]> = {
  '素手': ['shield_mastery'],
  '片手剣': ['blade_mastery', 'shield_mastery'],
  '双剣': ['blade_mastery', 'dual_mastery'],
  '両手剣': ['blade_mastery'],
  '手甲': ['martial_mastery', 'shield_mastery'],
  '旋風槍': ['halberd_mastery'],
  '抜刀剣': [], // 該当するマスタリスキルなし
  '弓': ['shoot_mastery'],
  '自動弓': ['shoot_mastery', 'shield_mastery'],
  '杖': ['magic_mastery', 'shield_mastery'],
  '魔導具': ['magic_mastery'],
}
```

#### 4.2.2 武器種と専用スキルの対応関係
```typescript
// 武器種から専用スキルIDを取得するマッピング
const weaponTypeToSpecialSkills: Record<WeaponType, string[]> = {
  '素手': [],
  '片手剣': [],
  '双剣': [],
  '両手剣': [],
  '手甲': [],
  '旋風槍': ['thor_hammer', 'tornado_lance', 'critical_parry'], // トールハンマー、トルネードランス、会心の捌き
  '抜刀剣': [],
  '弓': [],
  '自動弓': [],
  '杖': [],
  '魔導具': [],
}

// マスタリスキルリセット処理
const resetMasterySkills = (skills: BuffSkill[]): BuffSkill[] => {
  return skills.map(skill => {
    if (skill.category === 'mastery') {
      return {
        ...skill,
        isEnabled: false,
        parameters: getDefaultParametersForSkill(skill.id)
      }
    }
    return skill
  })
}

// 武器種専用スキルリセット処理
const resetWeaponSpecificSkills = (skills: BuffSkill[]): BuffSkill[] => {
  const weaponSpecificSkillIds = ['thor_hammer', 'tornado_lance', 'critical_parry'] // 旋風槍専用スキル
  
  return skills.map(skill => {
    if (weaponSpecificSkillIds.includes(skill.id)) {
      return {
        ...skill,
        isEnabled: false,
        parameters: getDefaultParametersForSkill(skill.id)
      }
    }
    return skill
  })
}
```

### 4.3 デフォルト値
```typescript
const getDefaultBuffSkills = (): BuffSkill[] => [
  // 全スキルをisEnabled: false, パラメータは最小値で初期化
]
```

## 5. 実装優先度

### 5.1 フェーズ1（基本機能） ✅ **完了**
- バフスキル一覧の表示
- 有効・無効ボタンによる状態切り替え機能（色分け表示）
- ポップオーバーによるパラメータ入力
- 5カラムフラット表示レイアウト
- Zustand状態管理との統合

**UI仕様**:
- 有効・無効ボタン: 緑色（有効）/グレー色（無効）で視覚的に状態を表示
- スキル名クリックでポップオーバー表示
- パラメータ値をスキル名に併記（例: ハルバードマスタリ/10、熱情の歌×5）

### 5.2 フェーズ2（武器種連動機能） 🔄 **次期実装**
- マスタリスキル自動表示システム
- 武器種変更時の動的表示切り替え
- 非表示スキルの状態保持機能

### 5.3 フェーズ3（高度な機能）
- 検索・絞り込み機能
- プリセット保存・読み込み
- ダメージ計算への統合

### 5.4 フェーズ4（最適化）
- パフォーマンス最適化
- UI/UXの改善
- アクセシビリティ対応

## 6. 注意事項
- スキル効果の詳細な数値計算は、ダメージ計算ロジック実装時に定義
- ゲームバランス調整に応じて効果値は変更される可能性がある
- 新スキル追加時は本仕様書とUIの更新が必要