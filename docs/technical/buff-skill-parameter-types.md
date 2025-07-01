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
- **UI実装**: ✅ 専用モーダル（StackCountModal）作成済み
- **備考**: スキルレベル10固定

#### 熱情の歌
- **スキルID**: `IsHotKnows`
- **スキル名**: 熱情の歌
- **カテゴリ**: minstrel（ミンストレル）
- **設定範囲**: 1-10カウント
- **UI実装**: ✅ 専用モーダル（PassionSongModal）作成済み
- **備考**: スキルレベル10固定

#### セイバーオーラ
- **スキルID**: `ds6`
- **スキル名**: セイバーオーラ
- **カテゴリ**: dualSword（デュアルソード）
- **設定範囲**: 1-10回
- **UI実装**: ❌ 汎用stackモーダルで対応予定
- **備考**: デュアルソード専用スキル

#### 急速チャージ
- **スキルID**: `mg2`
- **スキル名**: 急速チャージ
- **カテゴリ**: magic（魔法）
- **設定範囲**: 1-15回
- **UI実装**: ❌ 汎用stackモーダルで対応予定
- **備考**: 魔導具専用スキル

### 2. levelタイプ（スキルレベル設定）
- **対象スキル数**: 約93個
- **設定範囲**: 1-10（スキルによって最大値は異なる）
- **UI実装**: ✅ SkillParameterModal（ボタン式UI）
- **備考**: 最も一般的なタイプ

### 3. toggleタイプ（ON/OFF切り替えのみ）
- **対象スキル数**: 約69個
- **設定項目**: 有効/無効の切り替えのみ
- **UI実装**: ✅ SkillToggleButton
- **備考**: パラメータ設定不要

## UI実装状況

### 完了済み
1. **StackCountModal**: 神速の捌手専用（1-3回）
2. **PassionSongModal**: 熱情の歌専用（1-10カウント）
3. **SkillParameterModal**: levelタイプ汎用（ボタンUI）
4. **SkillToggleButton**: toggleタイプ汎用

### 未実装
1. **汎用StackModal**: セイバーオーラ、急速チャージ用
   - 設定範囲可変対応（1-10, 1-15）
   - 既存の専用モーダルと同一デザイン

## 技術仕様

### データ構造
```typescript
interface BuffSkillDefinition {
  id: string
  name: string
  category: BuffSkillCategory
  type: 'level' | 'stack' | 'toggle'
  maxLevel?: number  // levelタイプ用
  maxStack?: number  // stackタイプ用
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
// SkillCard.tsx内の条件分岐
{skill.id === 'godspeed_parry' ? (
  <StackCountModal />
) : skill.id === 'IsHotKnows' ? (
  <PassionSongModal />
) : (
  <SkillParameterModal />
)}
```

## 今後の改善案

### 1. 汎用StackModalの作成
- セイバーオーラ、急速チャージ対応
- maxStackプロパティによる動的な最大値設定
- 既存モーダルとの統一デザイン

### 2. 特殊パラメータ対応
- 将来的にspecialタイプスキル追加時の対応
- エターナルナイトメア（MP消費）等
- ナイトプレッジ（精錬値）等

### 3. コード最適化
- モーダル切り替えロジックの簡素化
- スキルタイプベースの動的モーダル選択

## 更新履歴
- 2025-07-01: 初版作成
- 神速の捌手、熱情の歌の専用モーダル実装完了
- SkillParameterModalのボタンデザイン統一