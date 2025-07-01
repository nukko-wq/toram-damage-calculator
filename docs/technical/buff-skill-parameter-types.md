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

#### 急速チャージ
- **スキルID**: `mg2`
- **スキル名**: 急速チャージ
- **カテゴリ**: magic（魔法）
- **設定範囲**: 1-15（MP回復量）
- **デフォルト値**: 15
- **UI実装**: ✅ 汎用モーダル（StackCountModal）で対応
- **表示テキスト**: 「MP回復量を入力してください。(15→回復量1500)」
- **備考**: 魔導具専用スキル、MP回復量 = スタック数 × 100

#### オーガスラッシュ
- **スキルID**: `sm1`
- **スキル名**: オーガスラッシュ
- **カテゴリ**: blade（ブレード）
- **設定範囲**: 1-10（消費鬼力数）
- **UI実装**: ✅ 汎用モーダル（StackCountModal）で対応
- **表示テキスト**: 「消費鬼力数を入力してください。」
- **備考**: 消費鬼力数を設定、専用UIテキスト

### 2. multiParamタイプ（複数パラメータ設定）

#### キャストマスタリ
- **スキルID**: `mg4`
- **スキル名**: キャストマスタリ
- **カテゴリ**: wizard（ウィザード）
- **パラメータ1**: スキルレベル（1-10）
- **パラメータ2**: ウィザードスキル習得数（0-50）
- **パラメータ3**: 使用全スキルポイント（0-999）
- **UI実装**: 🚧 専用モーダル（MultiParamModal）作成予定
- **備考**: 3つのパラメータを独立して設定可能、将来的に他の複雑なスキルにも対応

### 3. levelAndStackタイプ（レベル＋重ねがけ数設定）

#### セイバーオーラ
- **スキルID**: `ds6`
- **スキル名**: セイバーオーラ
- **カテゴリ**: dualSword（デュアルソード）
- **スキルレベル**: 1-10
- **カウント数**: 1-100（デフォルト: 100）
- **UI実装**: ✅ 専用モーダル（LevelAndStackModal）作成
- **備考**: レベルとカウント数の両方を設定可能


### 4. levelタイプ（スキルレベル設定）
- **対象スキル数**: 約92個
- **設定範囲**: 1-10（スキルによって最大値は異なる）
- **UI実装**: ✅ SkillParameterModal（統一ボタンUI）
- **表示テキスト**: 「スキルレベルを入力してください。」
- **備考**: 最も一般的なタイプ、LevelAndStackModalと統一されたUI

### 5. toggleタイプ（ON/OFF切り替えのみ）
- **対象スキル数**: 約69個
- **設定項目**: 有効/無効の切り替えのみ
- **UI実装**: ✅ SkillToggleButton
- **備考**: パラメータ設定不要

## UI実装状況

### 完了済み
1. **StackCountModal**: stackタイプ汎用（maxStackプロパティで動的対応）
   - 神速の捌手（1-3回）、熱情の歌（1-10カウント）、急速チャージ（1-15回、MP回復量表示）、オーガスラッシュ（1-10消費鬼力数）
2. **LevelAndStackModal**: levelAndStackタイプ専用
   - セイバーオーラ（レベル1-10、カウント数1-100、デフォルト100）
3. **SkillParameterModal**: level/stack/specialタイプ汎用（統一ボタンUI）
4. **SkillToggleButton**: toggleタイプ汎用

### 実装予定
5. **MultiParamModal**: multiParamタイプ専用（3パラメータ対応）
   - キャストマスタリ（スキルレベル1-10、ウィザードスキル習得数0-50、使用全スキルポイント0-999）
   - 将来的に他の複数パラメータスキルにも対応可能な汎用設計

## 技術仕様

### データ構造
```typescript
interface BuffSkillDefinition {
  id: string
  name: string
  category: BuffSkillCategory
  type: 'level' | 'stack' | 'levelAndStack' | 'multiParam' | 'toggle' | 'special'
  maxLevel?: number  // level, levelAndStack, multiParamタイプ用
  maxStack?: number  // stack, levelAndStackタイプ用
  multiParams?: MultiParamConfig  // multiParamタイプ用
  order: number
}

interface MultiParamConfig {
  param1: {
    name: string      // パラメータ名（例: "スキルレベル"）
    min: number       // 最小値
    max: number       // 最大値
    default: number   // デフォルト値
    unit?: string     // 単位（例: "Lv", "個", "pt"）
  }
  param2: {
    name: string
    min: number
    max: number
    default: number
    unit?: string
  }
  param3: {
    name: string
    min: number
    max: number
    default: number
    unit?: string
  }
}
```

### 状態管理
```typescript
interface BuffSkillState {
  isEnabled: boolean
  level?: number        // level, levelAndStack, multiParamタイプ用
  stackCount?: number   // stack, levelAndStackタイプ用
  multiParam1?: number  // multiParamタイプ用（パラメータ1）
  multiParam2?: number  // multiParamタイプ用（パラメータ2）
  multiParam3?: number  // multiParamタイプ用（パラメータ3）
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
) : skill.type === 'multiParam' ? (
  <MultiParamModal skill={skill} />
) : (
  <SkillParameterModal skill={skill} />
)}
```

## MultiParamModal 設計仕様

### UI レイアウト
```typescript
// MultiParamModal.tsx の構成
const MultiParamModal: React.FC<MultiParamModalProps> = ({ skill, isOpen, onClose }) => {
  return (
    <Modal>
      <Header>
        {skill.name} - 複数パラメータ設定
      </Header>
      
      {/* パラメータ1: スキルレベル */}
      <ParamSection>
        <Label>{skill.multiParams.param1.name}</Label>
        <ButtonControls>
          <Button>-10</Button>
          <Button>-1</Button>
          <Display>{currentValue}{unit}</Display>
          <Button>+1</Button>
          <Button>+10</Button>
        </ButtonControls>
        <Range>({min}-{max})</Range>
      </ParamSection>
      
      {/* パラメータ2: ウィザードスキル習得数 */}
      <ParamSection>
        <Label>{skill.multiParams.param2.name}</Label>
        <ButtonControls>...</ButtonControls>
      </ParamSection>
      
      {/* パラメータ3: 使用全スキルポイント */}
      <ParamSection>
        <Label>{skill.multiParams.param3.name}</Label>
        <ButtonControls>...</ButtonControls>
      </ParamSection>
    </Modal>
  )
}
```

### キャストマスタリ専用設定例
```typescript
// buffSkills.ts での定義例
{
  id: 'mg4',
  name: 'キャストマスタリ',
  category: 'wizard',
  type: 'multiParam',
  multiParams: {
    param1: {
      name: 'スキルレベル',
      min: 1,
      max: 10,
      default: 10,
      unit: 'Lv'
    },
    param2: {
      name: 'ウィザードスキル習得数',
      min: 0,
      max: 50,
      default: 20,
      unit: '個'
    },
    param3: {
      name: '使用全スキルポイント',
      min: 0,
      max: 999,
      default: 200,
      unit: 'pt'
    }
  },
  order: 1301
}
```

### 状態管理統合
```typescript
// buffSkillUtils.ts での状態管理
function getDefaultSkillState(skill: BuffSkillDefinition): BuffSkillState {
  if (skill.type === 'multiParam') {
    return {
      isEnabled: false,
      level: skill.multiParams.param1.default,
      multiParam1: skill.multiParams.param1.default,
      multiParam2: skill.multiParams.param2.default,
      multiParam3: skill.multiParams.param3.default
    }
  }
  // 既存の処理...
}
```

### 表示形式
```typescript
// SkillCard.tsx での表示
function getDisplayName(skill: BuffSkillDefinition, state: BuffSkillState): string {
  if (skill.type === 'multiParam') {
    // キャストマスタリの場合: "キャストマスタリ/10"（スキルレベルのみ表示）
    return `${skill.name}/${state.level || skill.multiParams.param1.default}`
  }
  // 既存の処理...
}
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
- 急速チャージをlevelタイプからstackタイプに変更（1-15回、デフォルト15）
- 急速チャージのUI表示を「MP回復量を入力してください。(15→回復量1500)」に変更、動的計算表示追加
- バフスキルカテゴリ順序を変更：magic（400番台）をshoot後に移動、martial以降を100ずつシフト
- multiParamタイプの設計追加：3つのパラメータを持つスキル用（キャストマスタリ対応）
- MultiParamModal設計仕様追加：汎用的な複数パラメータ対応モーダル