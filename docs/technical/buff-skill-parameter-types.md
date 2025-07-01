# バフスキルパラメータタイプ一覧

## 概要
トーラムオンライン ダメージ計算機のバフスキルシステムにおける、スキルレベル以外のパラメータを設定可能なスキルの詳細一覧。

## スキルタイプ別分類

### 1. stackタイプ（重ねがけ数・カウント数設定）

#### 神速の捌手
- **スキルID**: `godspeed_parry`
- **スキル名**: 神速の捌手
- **カテゴリ**: halberd（ハルバード）
- **設定範囲**: 1-3回
- **UI実装**: ✅ 汎用モーダル（StackCountModal）で対応
- **備考**: スキルレベル10固定

#### 熱情の歌
- **スキルID**: `IsHotKnows`
- **スキル名**: 熱情の歌
- **カテゴリ**: minstrel（ミンストレル）
- **設定範囲**: 1-10カウント
- **UI実装**: ✅ 汎用モーダル（StackCountModal）で対応
- **備考**: スキルレベル10固定

### 2. levelAndStackタイプ（レベル＋重ねがけ数設定）

#### セイバーオーラ
- **スキルID**: `ds6`
- **スキル名**: セイバーオーラ
- **カテゴリ**: dualSword（デュアルソード）
- **スキルレベル**: 1-10
- **カウント数**: 1-100（デフォルト: 100）
- **UI実装**: ✅ 専用モーダル（LevelAndStackModal）作成
- **備考**: レベルとカウント数の両方を設定可能

#### 急速チャージ
- **スキルID**: `mg2`
- **スキル名**: 急速チャージ
- **カテゴリ**: magic（魔法）
- **設定範囲**: 1-15回
- **UI実装**: ✅ 汎用モーダル（StackCountModal）で対応
- **備考**: 魔導具専用スキル

#### オーガスラッシュ
- **スキルID**: `sm1`
- **スキル名**: オーガスラッシュ
- **カテゴリ**: blade（ブレード）
- **設定範囲**: 1-10（消費鬼力数）
- **UI実装**: ✅ 汎用モーダル（StackCountModal）で対応
- **備考**: 消費鬼力数を設定、専用UIテキスト

### 3. levelタイプ（スキルレベル設定）
- **対象スキル数**: 約92個
- **設定範囲**: 1-10（スキルによって最大値は異なる）
- **UI実装**: ✅ SkillParameterModal（統一ボタンUI）
- **表示テキスト**: 「スキルレベルを入力してください。」
- **備考**: 最も一般的なタイプ、LevelAndStackModalと統一されたUI

### 4. toggleタイプ（ON/OFF切り替えのみ）
- **対象スキル数**: 約69個
- **設定項目**: 有効/無効の切り替えのみ
- **UI実装**: ✅ SkillToggleButton
- **備考**: パラメータ設定不要

## UI実装状況

### 完了済み
1. **StackCountModal**: stackタイプ汎用（maxStackプロパティで動的対応）
   - 神速の捌手（1-3回）、熱情の歌（1-10カウント）、急速チャージ（1-15回）、オーガスラッシュ（1-10消費鬼力数）
2. **LevelAndStackModal**: levelAndStackタイプ専用
   - セイバーオーラ（レベル1-10、カウント数1-100、デフォルト100）
3. **SkillParameterModal**: level/stack/specialタイプ汎用（統一ボタンUI）
4. **SkillToggleButton**: toggleタイプ汎用

## 技術仕様

### データ構造
```typescript
interface BuffSkillDefinition {
  id: string
  name: string
  category: BuffSkillCategory
  type: 'level' | 'stack' | 'levelAndStack' | 'toggle' | 'special'
  maxLevel?: number  // level, levelAndStackタイプ用
  maxStack?: number  // stack, levelAndStackタイプ用
  order: number
}
```

### 状態管理
```typescript
interface BuffSkillState {
  isEnabled: boolean
  level?: number        // levelタイプ用
  stackCount?: number   // stackタイプ用
  specialParam?: number // 将来の拡張用
}
```

### モーダル切り替えロジック
```typescript
// SkillCard.tsx内の条件分岐（スキルタイプベース）
{skill.type === 'stack' ? (
  <StackCountModal skill={skill} />
) : skill.type === 'levelAndStack' ? (
  <LevelAndStackModal skill={skill} />
) : (
  <SkillParameterModal skill={skill} />
)}
```

## 今後の改善案

### 1. 特殊パラメータ対応
- 将来的にspecialタイプスキル追加時の対応
- エターナルナイトメア（MP消費）等
- ナイトプレッジ（精錬値）等

### 2. コード最適化
- ✅ モーダル切り替えロジックの簡素化（完了）
- ✅ スキルタイプベースの動的モーダル選択（完了）

## 更新履歴
- 2025-07-01: 初版作成
- 神速の捌手、熱情の歌の専用モーダル実装完了
- SkillParameterModalのボタンデザイン統一
- StackCountModalの汎用化完了（PassionSongModal削除）
- スキルタイプベースのモーダル切り替えに変更
- levelAndStackタイプ追加、セイバーオーラ用LevelAndStackModal実装
- セイバーオーラの重ねがけ数を1-100に変更、デフォルト値100に設定
- オーガスラッシュをlevelタイプからstackタイプに変更（1-10回）
- オーガスラッシュのUI表示を「消費鬼力数を入力してください」に変更
- セイバーオーラのUI表示を「スキルレベルを入力してください」「カウント数を入力してください」に変更
- SkillParameterModalのUIをLevelAndStackModalと統一（ボタン式UI、統一テキスト）
- 入力補助テキスト機能（inputHintText、getInputHint）を削除、UIテキストを直接記述に変更