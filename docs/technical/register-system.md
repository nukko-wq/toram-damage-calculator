# レジスタ他システム

## レジスタ他システム概要

**目的**: レジスタレットとギルド料理効果を装備/プロパティシステムに統合し、タブナビゲーション内で一元管理

**システム構成**:
- レジスタレット効果（18種類）
- ギルド料理効果（2種類）
- 効果のオン/オフ切り替え機能
- レベル設定機能（項目別に範囲制限）
- 運命共同体の特殊設定（レベル + パーティメンバー数）

## タブナビゲーション統合

### タブ配置
```typescript
const equipmentSlots = [
  { key: 'main' as const, label: 'メイン装備' },
  { key: 'body' as const, label: '体装備' },
  { key: 'additional' as const, label: '追加装備' },
  { key: 'special' as const, label: '特殊装備' },
  { key: 'subWeapon' as const, label: 'サブ武器' },
  { key: 'fashion1' as const, label: 'オシャレ1' },
  { key: 'fashion2' as const, label: 'オシャレ2' },
  { key: 'fashion3' as const, label: 'オシャレ3' },
  { key: 'register' as const, label: 'レジスタ他' },  // 新規追加位置
  { key: 'freeInput1' as const, label: '自由入力1' },
  { key: 'freeInput2' as const, label: '自由入力2' },
  { key: 'freeInput3' as const, label: '自由入力3' },
]
```

### レスポンシブ対応
- 12タブ対応のグリッドレイアウト調整
- 6列表示で2行構成（デスクトップ）
- タブレット・モバイルでの適切な折り返し

## データ型定義

### レジスタ他項目の型定義
```typescript
// レジスタ効果項目
export interface RegisterEffect {
  id: string
  name: string
  type: 'registlet' | 'guild_food'
  enabled: boolean
  level: number
  maxLevel: number
  // 運命共同体専用フィールド
  partyMembers?: number
  maxPartyMembers?: number
}

// レジスタ他フォームデータ
export interface RegisterFormData {
  // レジスタレット効果（18種類）
  physicalAttackUp: RegisterEffect
  magicalAttackUp: RegisterEffect
  maxHPUp: RegisterEffect
  maxMPUp: RegisterEffect
  accuracyUp: RegisterEffect
  dodgeUp: RegisterEffect
  attackSpeedUp: RegisterEffect
  magicSpeedUp: RegisterEffect
  fatefulCompanionship: RegisterEffect  // 特殊：レベル1固定 + パーティメンバー数
  voidStance: RegisterEffect
  magicArrowPursuit: RegisterEffect
  airSlideCompression: RegisterEffect
  assassinStabEnhancement: RegisterEffect
  resonancePower: RegisterEffect
  resonanceAcceleration: RegisterEffect
  resonanceConcentration: RegisterEffect
  
  // ギルド料理効果（2種類）
  deliciousIngredientTrade: RegisterEffect
  freshFruitTrade: RegisterEffect
}
```

## UI実装仕様

### メインレイアウト
```typescript
// RegisterForm.tsx
export default function RegisterForm() {
  const [registerData, setRegisterData] = useState<RegisterFormData>()
  const [levelModalState, setLevelModalState] = useState<{
    isOpen: boolean
    effectId: string | null
    currentLevel: number
    maxLevel: number
    partyMembers?: number
  }>()

  return (
    <div className="space-y-3">
      {/* レジスタレット項目リスト */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-800">レジスタレット</h3>
        {registletEffects.map((effect) => (
          <RegisterEffectItem 
            key={effect.id}
            effect={effect}
            onToggle={handleToggle}
            onLevelEdit={handleLevelEdit}
          />
        ))}
      </div>
      
      {/* ギルド料理項目リスト */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-800">ギルド料理</h3>
        {guildFoodEffects.map((effect) => (
          <RegisterEffectItem 
            key={effect.id}
            effect={effect}
            onToggle={handleToggle}
            onLevelEdit={handleLevelEdit}
          />
        ))}
      </div>
      
      {/* レベル設定モーダル */}
      <RegisterLevelModal 
        isOpen={levelModalState.isOpen}
        effect={getCurrentEffect()}
        onConfirm={handleLevelConfirm}
        onCancel={handleLevelCancel}
      />
    </div>
  )
}
```

### 効果項目コンポーネント
```typescript
// RegisterEffectItem.tsx
interface RegisterEffectItemProps {
  effect: RegisterEffect
  onToggle: (effectId: string) => void
  onLevelEdit: (effectId: string) => void
}

export default function RegisterEffectItem({ effect, onToggle, onLevelEdit }: RegisterEffectItemProps) {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
      {/* 効果名とレベル表示 */}
      <button 
        onClick={() => onLevelEdit(effect.id)}
        className="text-left hover:text-blue-600 transition-colors"
      >
        <span className="font-medium">{effect.name}</span>
        <span className="text-gray-500 ml-1">/{effect.level}</span>
        {effect.partyMembers && (
          <span className="text-gray-500 ml-1">({effect.partyMembers}人)</span>
        )}
      </button>
      
      {/* オン/オフトグル */}
      <button
        onClick={() => onToggle(effect.id)}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          effect.enabled 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-300 text-gray-600'
        }`}
      >
        {effect.enabled ? 'ON' : 'OFF'}
      </button>
    </div>
  )
}
```

### レベル設定モーダル
```typescript
// RegisterLevelModal.tsx
interface RegisterLevelModalProps {
  isOpen: boolean
  effect: RegisterEffect | null
  onConfirm: (level: number, partyMembers?: number) => void
  onCancel: () => void
}

export default function RegisterLevelModal({ 
  isOpen, 
  effect, 
  onConfirm, 
  onCancel 
}: RegisterLevelModalProps) {
  const [level, setLevel] = useState(effect?.level || 1)
  const [partyMembers, setPartyMembers] = useState(effect?.partyMembers || 1)
  
  const isFatefulCompanionship = effect?.id === 'fatefulCompanionship'

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-medium">{effect?.name}</h3>
        
        {/* レベル入力（運命共同体以外のみ表示） */}
        {!isFatefulCompanionship && (
          <div>
            <label className="block text-sm font-medium mb-1">レベル</label>
            <input
              type="number"
              min="1"
              max={effect?.maxLevel || 30}
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )}
        
        {/* 運命共同体専用：パーティメンバー数のみ */}
        {isFatefulCompanionship && (
          <div>
            <label className="block text-sm font-medium mb-1">
              自分以外のパーティメンバー数
            </label>
            <input
              type="number"
              min="1"
              max="3"
              value={partyMembers}
              onChange={(e) => setPartyMembers(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )}
        
        {/* 確定・キャンセルボタン */}
        <div className="flex justify-end space-x-2">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md"
          >
            キャンセル
          </button>
          <button 
            onClick={() => onConfirm(
              isFatefulCompanionship ? 1 : level, // 運命共同体は常にレベル1
              isFatefulCompanionship ? partyMembers : undefined
            )}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            確定
          </button>
        </div>
      </div>
    </Modal>
  )
}
```

## 状態管理統合

### CalculatorStore統合
```typescript
interface CalculatorStore {
  data: {
    // 既存データ...
    register: RegisterFormData
  }
  
  // レジスタ他関連アクション
  updateRegisterEffect: (effectId: string, enabled: boolean) => void
  updateRegisterLevel: (effectId: string, level: number, partyMembers?: number) => void
  resetRegisterData: () => void
}
```

## レジスタ効果の詳細仕様

### 最大HPアップ（maxHPUp）

#### 基本仕様
- **効果**: キャラクターの最大HPを増加させる
- **計算方法**: `レジスタレベル × 10` を装備品補正値1のHP(+)に加算
- **適用条件**: レジスタが有効に設定されている場合のみ
- **レベル範囲**: 1-30（想定）

#### 実装方式
最大HPアップ効果は`AllBonuses`システムに統合され、以下の流れで適用されます：

1. **StatusPreviewでの統合**: レジスタ効果を`finalBonuses`に追加
2. **基本ステータス計算**: HP計算で統合済みのボーナス値を使用
3. **装備品補正値表示**: 同じ統合済みボーナス値から装備品補正値1〜3を生成

#### 計算例
**入力値:**
- maxHPUpレベル: 5 (有効)
- 既存の装備品補正値1のHP(+): 500 (装備+クリスタ+料理+バフアイテム)

**計算手順:**
1. maxHPUp効果: 5 × 10 = 50
2. **装備品補正値1のHP(+)合計**: 500 + 50 = 550

#### HP計算への統合
```
HP = INT(INT(93+(補正後VIT+22.41)*Lv/3)*(1+HP%/100))+HP固定値
```

レジスタ効果はStatusPreviewで`finalBonuses`として統合され、HP計算に適用されます。

#### 実装詳細
StatusPreview.tsxで以下のような統合処理が行われます：

```typescript
// レジスタ効果を含むボーナス値を作成
const finalBonuses = { ...allBonuses }
if (data.register?.effects) {
  const maxHpUpEffect = data.register.effects.find(effect => 
    effect.type === 'maxHpUp' && effect.isEnabled
  )
  if (maxHpUpEffect) {
    finalBonuses.HP = (finalBonuses.HP || 0) + (maxHpUpEffect.level * 10)
  }
}

// HP計算でレジスタ効果込みのボーナスを使用
hpCalculation: calculateHP(baseStats, finalBonuses)

// 装備品補正値もレジスタ効果込みのボーナスから生成
equipmentBonuses: calculateEquipmentBonuses(
  equipmentBonuses, crystalBonuses, foodBonuses, buffBonuses
) // finalBonusesを基に計算される
```

#### StatusPreviewでの表示
- **基本ステータス**: HP値にレジスタ効果が自動的に反映される
- **装備品補正値1**: HP(+)項目にレジスタ効果が含まれた値が表示される

#### 重要な注意点
- レジスタが無効の場合、効果は0として計算される
- 他の装備・クリスタ・料理・バフアイテムのHP補正と同等に扱われる
- 装備品補正値1の計算順序は既存システムに従う

## プロパティ変換システム

### 効果からプロパティへの変換
```typescript
// registerEffectConverter.ts
export function convertRegisterEffectsToProperties(
  registerData: RegisterFormData
): Partial<EquipmentProperties> {
  const properties: Partial<EquipmentProperties> = {}
  
  // 物理攻撃アップ
  if (registerData.physicalAttackUp.enabled) {
    properties.ATK = (properties.ATK || 0) + registerData.physicalAttackUp.level
  }
  
  // 魔法攻撃アップ  
  if (registerData.magicalAttackUp.enabled) {
    properties.MATK = (properties.MATK || 0) + registerData.magicalAttackUp.level
  }
  
  // 最大HPアップ（装備品補正値1のHP(+)に加算）
  if (registerData.maxHPUp.enabled) {
    properties.HP = (properties.HP || 0) + (registerData.maxHPUp.level * 10)
  }
  
  // 運命共同体（特殊計算）
  if (registerData.fatefulCompanionship.enabled) {
    const baseBonus = 5  // レベル1固定効果
    const partyBonus = registerData.fatefulCompanionship.partyMembers * 3
    const totalBonus = baseBonus + partyBonus
    
    properties.ATK = (properties.ATK || 0) + totalBonus
    properties.MATK = (properties.MATK || 0) + totalBonus
  }
  
  // その他の効果も同様に変換...
  
  return properties
}
```

## データ永続化

### LocalStorage統合
```typescript
// セーブデータ構造に追加
interface SaveData {
  // 既存フィールド...
  register: RegisterFormData
}

// 初期データ
export const createInitialRegisterData = (): RegisterFormData => ({
  physicalAttackUp: {
    id: 'physicalAttackUp',
    name: '物理攻撃アップ',
    type: 'registlet',
    enabled: false,
    level: 30,        // 最大値で初期化
    maxLevel: 30
  },
  // 他の項目も同様に最大値で初期化...
})
```

### 最大MPアップ（maxMpUp）

#### 基本仕様
- **効果**: キャラクターの最大MPを増加させる
- **計算方法**: `レジスタレベル × 1` を装備品補正値1のMP(+)に加算
- **適用条件**: レジスタが有効に設定されている場合のみ
- **レベル範囲**: 1-100（想定）

#### 実装方式
最大MPアップ効果は`AllBonuses`システムに統合され、以下の流れで適用されます：

1. **StatusPreviewでの統合**: レジスタ効果を`finalBonuses`に追加
2. **基本ステータス計算**: MP計算で統合済みのボーナス値を使用
3. **装備品補正値表示**: 同じ統合済みボーナス値から装備品補正値1〜3を生成

#### 計算例
**入力値:**
- maxMpUpレベル: 50 (有効)
- 既存の装備品補正値1のMP(+): 200 (装備+クリスタ+料理+バフアイテム)

**計算手順:**
1. maxMpUp効果: 50 × 1 = 50
2. **装備品補正値1のMP(+)合計**: 200 + 50 = 250

#### MP計算への統合
```
MP = INT(INT(Lv+99+TEC+補正後INT/10)*(1+MP%/100))+MP固定値
```

レジスタ効果はStatusPreviewで`finalBonuses`として統合され、MP計算に適用されます。

#### 実装詳細
StatusPreview.tsxで以下のような統合処理が行われます：

```typescript
// レジスタ効果を含むボーナス値を作成
const finalBonuses = { ...allBonuses }
if (data.register?.effects) {
  const maxMpUpEffect = data.register.effects.find(effect => 
    effect.type === 'maxMpUp' && effect.isEnabled
  )
  if (maxMpUpEffect) {
    finalBonuses.MP = (finalBonuses.MP || 0) + (maxMpUpEffect.level * 1)
  }
}

// MP計算でレジスタ効果込みのボーナスを使用
mpCalculation: calculateMP(baseStats, finalBonuses)

// 装備品補正値もレジスタ効果込みのボーナスから生成
equipmentBonuses: calculateEquipmentBonuses(
  equipmentBonuses, crystalBonuses, foodBonuses, buffBonuses
) // finalBonusesを基に計算される
```

#### StatusPreviewでの表示
- **基本ステータス**: MP値にレジスタ効果が自動的に反映される
- **装備品補正値1**: MP(+)項目にレジスタ効果が含まれた値が表示される

#### 重要な注意点
- レジスタが無効の場合、効果は0として計算される
- 他の装備・クリスタ・料理・バフアイテムのMP補正と同等に扱われる
- 装備品補正値1の計算順序は既存システムに従う

### 物理攻撃アップ（physicalAttackUp）

#### 基本仕様
- **効果**: キャラクターの物理攻撃力を増加させる
- **計算方法**: `レジスタレベル × 1` を装備品補正値1のATK(+)に加算
- **適用条件**: レジスタが有効に設定されている場合のみ
- **レベル範囲**: 1-30（想定）

#### 実装方式
物理攻撃アップ効果は`AllBonuses`システムに統合され、以下の流れで適用されます：

1. **StatusPreviewでの統合**: レジスタ効果を`finalBonuses`に追加
2. **基本ステータス計算**: ATK計算で統合済みのボーナス値を使用
3. **装備品補正値表示**: 同じ統合済みボーナス値から装備品補正値1〜3を生成

#### 計算例
**入力値:**
- physicalAttackUpレベル: 15 (有効)
- 既存の装備品補正値1のATK(+): 300 (装備+クリスタ+料理+バフアイテム)

**計算手順:**
1. physicalAttackUp効果: 15 × 1 = 15
2. **装備品補正値1のATK(+)合計**: 300 + 15 = 315

#### ATK計算への統合
物理攻撃アップ効果は装備品補正値1のATK固定値として適用され、基本ステータスのATK計算に反映されます。

レジスタ効果はStatusPreviewで`finalBonuses`として統合され、ATK計算に適用されます。

#### 実装詳細
StatusPreview.tsxで以下のような統合処理が行われます：

```typescript
// レジスタ効果を含むボーナス値を作成
const finalBonuses = { ...allBonuses }
if (data.register?.effects) {
  const physicalAttackUpEffect = data.register.effects.find(effect => 
    effect.type === 'physicalAttackUp' && effect.isEnabled
  )
  if (physicalAttackUpEffect) {
    finalBonuses.ATK = (finalBonuses.ATK || 0) + (physicalAttackUpEffect.level * 1)
  }
}

// 装備品補正値もレジスタ効果込みのボーナスから生成
equipmentBonuses: calculateEquipmentBonuses(finalBonuses)
```

#### StatusPreviewでの表示
- **基本ステータス**: ATK値にレジスタ効果が自動的に反映される
- **装備品補正値1**: ATK(+)項目にレジスタ効果が含まれた値が表示される

#### 重要な注意点
- レジスタが無効の場合、効果は0として計算される
- 他の装備・クリスタ・料理・バフアイテムのATK補正と同等に扱われる
- 装備品補正値1の計算順序は既存システムに従う

## 魔法攻撃アップ（magicalAttackUp）

### 基本仕様
- **効果**: キャラクターの魔法攻撃力を増加させる
- **計算方法**: `レジスタレベル × 1` を装備品補正値1のMATK(+)に加算
- **適用条件**: レジスタが有効に設定されている場合のみ
- **レベル範囲**: 1-30（想定）

### 実装方式
魔法攻撃アップ効果は`AllBonuses`システムに統合され、以下の流れで適用されます：

1. **StatusPreviewでの統合**: レジスタ効果を`finalBonuses`に追加
2. **基本ステータス計算**: MATK計算で統合済みのボーナス値を使用
3. **装備品補正値表示**: 同じ統合済みボーナス値から装備品補正値1〜3を生成

### 計算例
**入力値:**
- magicalAttackUpレベル: 12 (有効)
- 既存の装備品補正値1のMATK(+): 250 (装備+クリスタ+料理+バフアイテム)

**計算手順:**
1. magicalAttackUp効果: 12 × 1 = 12
2. **装備品補正値1のMATK(+)合計**: 250 + 12 = 262

### MATK計算への統合
魔法攻撃アップ効果は装備品補正値1のMATK固定値として適用され、基本ステータスのMATK計算に反映されます。

**重要**: MATK計算には`finalBonuses`（全ての効果を統合した最終ボーナス値）を渡す必要があります。

**修正前の問題**: `calculateMATK`関数に`allBonuses`（基本ボーナスのみ）が渡されていたため、魔法攻撃アップ効果が基本ステータスのMATKに反映されませんでした。

**修正後**: `calculateMATK`関数に`finalBonuses`を渡すことで、レジスタ効果がMATK固定値として正しく適用されます。

### 問題解決の実装詳細

#### 修正前の構造
```typescript
// useMemo内
const calculationResults = useMemo(() => {
  const allBonuses = aggregateAllBonuses(...)
  const finalBonuses = { ...allBonuses }
  // レジスタ効果を finalBonuses に追加
  return { /* finalBonuses含まず */ }
}, [...])

// useMemo外
const matkCalculation = calculateMATK(..., allBonuses) // 基本ボーナスのみ
```

#### 修正後の構造
```typescript
// useMemo内
const calculationResults = useMemo(() => {
  const allBonuses = aggregateAllBonuses(...)
  const finalBonuses = { ...allBonuses }
  // レジスタ効果を finalBonuses に追加
  return { 
    allBonuses: finalBonuses, // 全ての効果を統合した最終ボーナス値
    // その他の計算結果も finalBonuses を使用
  }
}, [...])

// useMemo外
const { allBonuses: finalBonuses } = calculationResults
const matkCalculation = calculateMATK(..., finalBonuses) // 全ての効果込み
```

これによりMATK計算式の「MATK固定値」部分にレジスタの魔法攻撃アップ効果が正しく反映され、基本ステータスのMATKに変化が現れるようになりました。

### 命名の変更について

`finalBonuses`という名前は将来的な拡張性を考慮して選択されました：

- **レジスタ効果**: 現在実装済み
- **ギルド料理効果**: 将来実装予定
- **バフスキル効果**: 将来実装予定  
- **その他の効果**: 将来実装予定

この命名により、どのような効果が追加されても一貫した構造を維持できます。

### 実装詳細
StatusPreview.tsxで以下のような統合処理が行われます：

```typescript
// レジスタ効果を含むボーナス値を作成
const finalBonuses = { ...allBonuses }
if (data.register?.effects) {
  const magicalAttackUpEffect = data.register.effects.find(effect => 
    effect.type === 'magicalAttackUp' && effect.isEnabled
  )
  if (magicalAttackUpEffect) {
    finalBonuses.MATK = (finalBonuses.MATK || 0) + (magicalAttackUpEffect.level * 1)
  }
}

// 装備品補正値もレジスタ効果込みのボーナスから生成
equipmentBonuses: calculateEquipmentBonuses(finalBonuses)
```

### StatusPreviewでの表示
- **基本ステータス**: MATK値にレジスタ効果が自動的に反映される
- **装備品補正値1**: MATK(+)項目にレジスタ効果が含まれた値が表示される

### 重要な注意点
- レジスタが無効の場合、効果は0として計算される
- 他の装備・クリスタ・料理・バフアイテムのMATK補正と同等に扱われる
- 装備品補正値1の計算順序は既存システムに従う

## 命中アップ（accuracyUp）

### 基本仕様
- **効果**: キャラクターの命中率を増加させる
- **計算方法**: `レジスタレベル × 1` を装備品補正値1の命中(+)に加算
- **適用条件**: レジスタが有効に設定されている場合のみ
- **レベル範囲**: 1-30（想定）

### 実装方式
命中アップ効果は`finalBonuses`システムに統合され、以下の流れで適用されます：

1. **StatusPreviewでの統合**: レジスタ効果を`finalBonuses`に追加
2. **基本ステータス計算**: HIT計算で統合済みのボーナス値を使用
3. **装備品補正値表示**: 同じ統合済みボーナス値から装備品補正値1〜3を生成

### 計算例
**入力値:**
- accuracyUpレベル: 20 (有効)
- 既存の装備品補正値1の命中(+): 150 (装備+クリスタ+料理+バフアイテム)

**計算手順:**
1. accuracyUp効果: 20 × 1 = 20
2. **装備品補正値1の命中(+)合計**: 150 + 20 = 170

### 実装詳細
```typescript
// StatusPreview.tsx内
const accuracyUpEffect = data.register.effects.find(effect => 
  effect.type === 'accuracyUp' && effect.isEnabled
)
if (accuracyUpEffect) {
  finalBonuses.Accuracy = (finalBonuses.Accuracy || 0) + (accuracyUpEffect.level * 1)
}
```

## 回避アップ（evasionUp）

### 基本仕様
- **効果**: キャラクターの回避率を増加させる
- **計算方法**: `レジスタレベル × 1` を装備品補正値1の回避(+)に加算
- **適用条件**: レジスタが有効に設定されている場合のみ
- **レベル範囲**: 1-30（想定）

### 実装方式
回避アップ効果は`finalBonuses`システムに統合され、以下の流れで適用されます：

1. **StatusPreviewでの統合**: レジスタ効果を`finalBonuses`に追加
2. **基本ステータス計算**: FLEE計算で統合済みのボーナス値を使用
3. **装備品補正値表示**: 同じ統合済みボーナス値から装備品補正値1〜3を生成

### 計算例
**入力値:**
- evasionUpレベル: 18 (有効)
- 既存の装備品補正値1の回避(+): 100 (装備+クリスタ+料理+バフアイテム)

**計算手順:**
1. evasionUp効果: 18 × 1 = 18
2. **装備品補正値1の回避(+)合計**: 100 + 18 = 118

### 実装詳細
```typescript
// StatusPreview.tsx内
const evasionUpEffect = data.register.effects.find(effect => 
  effect.type === 'evasionUp' && effect.isEnabled
)
if (evasionUpEffect) {
  finalBonuses.Dodge = (finalBonuses.Dodge || 0) + (evasionUpEffect.level * 1)
}
```

## 攻撃速度アップ（attackSpeedUp）

### 基本仕様
- **効果**: キャラクターの攻撃速度を増加させる
- **計算方法**: `レジスタレベル × 1` を装備品補正値1のASPD(+)に加算
- **適用条件**: レジスタが有効に設定されている場合のみ
- **レベル範囲**: 1-30（想定）

### 実装方式
攻撃速度アップ効果は`finalBonuses`システムに統合され、以下の流れで適用されます：

1. **StatusPreviewでの統合**: レジスタ効果を`finalBonuses`に追加
2. **基本ステータス計算**: ASPD計算で統合済みのボーナス値を使用
3. **装備品補正値表示**: 同じ統合済みボーナス値から装備品補正値1〜3を生成

### 計算例
**入力値:**
- attackSpeedUpレベル: 25 (有効)
- 既存の装備品補正値1のASPD(+): 80 (装備+クリスタ+料理+バフアイテム)

**計算手順:**
1. attackSpeedUp効果: 25 × 1 = 25
2. **装備品補正値1のASPD(+)合計**: 80 + 25 = 105

### 実装詳細
```typescript
// StatusPreview.tsx内
const attackSpeedUpEffect = data.register.effects.find(effect => 
  effect.type === 'attackSpeedUp' && effect.isEnabled
)
if (attackSpeedUpEffect) {
  finalBonuses.AttackSpeed = (finalBonuses.AttackSpeed || 0) + (attackSpeedUpEffect.level * 1)
}
```

## 魔法速度アップ（magicalSpeedUp）

### 基本仕様
- **効果**: キャラクターの詠唱速度を増加させる
- **計算方法**: `レジスタレベル × 1` を装備品補正値1のCSPD(+)に加算
- **適用条件**: レジスタが有効に設定されている場合のみ
- **レベル範囲**: 1-30（想定）

### 実装方式
魔法速度アップ効果は`finalBonuses`システムに統合され、以下の流れで適用されます：

1. **StatusPreviewでの統合**: レジスタ効果を`finalBonuses`に追加
2. **基本ステータス計算**: CSPD計算で統合済みのボーナス値を使用
3. **装備品補正値表示**: 同じ統合済みボーナス値から装備品補正値1〜3を生成

### 計算例
**入力値:**
- magicalSpeedUpレベル: 22 (有効)
- 既存の装備品補正値1のCSPD(+): 60 (装備+クリスタ+料理+バフアイテム)

**計算手順:**
1. magicalSpeedUp効果: 22 × 1 = 22
2. **装備品補正値1のCSPD(+)合計**: 60 + 22 = 82

### 実装詳細
```typescript
// StatusPreview.tsx内
const magicalSpeedUpEffect = data.register.effects.find(effect => 
  effect.type === 'magicalSpeedUp' && effect.isEnabled
)
if (magicalSpeedUpEffect) {
  finalBonuses.CastingSpeed = (finalBonuses.CastingSpeed || 0) + (magicalSpeedUpEffect.level * 1)
}
```

### レジスタ効果統合の全体例
```typescript
// StatusPreview.tsx内でのレジスタ効果統合
if (data.register?.effects) {
  // 最大HPアップ
  const maxHpUpEffect = data.register.effects.find(effect => 
    effect.type === 'maxHpUp' && effect.isEnabled
  )
  if (maxHpUpEffect) {
    finalBonuses.HP = (finalBonuses.HP || 0) + (maxHpUpEffect.level * 10)
  }

  // 最大MPアップ
  const maxMpUpEffect = data.register.effects.find(effect => 
    effect.type === 'maxMpUp' && effect.isEnabled
  )
  if (maxMpUpEffect) {
    finalBonuses.MP = (finalBonuses.MP || 0) + (maxMpUpEffect.level * 1)
  }

  // 物理攻撃アップ
  const physicalAttackUpEffect = data.register.effects.find(effect => 
    effect.type === 'physicalAttackUp' && effect.isEnabled
  )
  if (physicalAttackUpEffect) {
    finalBonuses.ATK = (finalBonuses.ATK || 0) + (physicalAttackUpEffect.level * 1)
  }

  // 魔法攻撃アップ
  const magicalAttackUpEffect = data.register.effects.find(effect => 
    effect.type === 'magicalAttackUp' && effect.isEnabled
  )
  if (magicalAttackUpEffect) {
    finalBonuses.MATK = (finalBonuses.MATK || 0) + (magicalAttackUpEffect.level * 1)
  }

  // 命中アップ
  const accuracyUpEffect = data.register.effects.find(effect => 
    effect.type === 'accuracyUp' && effect.isEnabled
  )
  if (accuracyUpEffect) {
    finalBonuses.Accuracy = (finalBonuses.Accuracy || 0) + (accuracyUpEffect.level * 1)
  }

  // 回避アップ
  const evasionUpEffect = data.register.effects.find(effect => 
    effect.type === 'evasionUp' && effect.isEnabled
  )
  if (evasionUpEffect) {
    finalBonuses.Dodge = (finalBonuses.Dodge || 0) + (evasionUpEffect.level * 1)
  }

  // 攻撃速度アップ
  const attackSpeedUpEffect = data.register.effects.find(effect => 
    effect.type === 'attackSpeedUp' && effect.isEnabled
  )
  if (attackSpeedUpEffect) {
    finalBonuses.AttackSpeed = (finalBonuses.AttackSpeed || 0) + (attackSpeedUpEffect.level * 1)
  }

  // 魔法速度アップ
  const magicalSpeedUpEffect = data.register.effects.find(effect => 
    effect.type === 'magicalSpeedUp' && effect.isEnabled
  )
  if (magicalSpeedUpEffect) {
    finalBonuses.CastingSpeed = (finalBonuses.CastingSpeed || 0) + (magicalSpeedUpEffect.level * 1)
  }

  // 運命共同体
  const fateCompanionshipEffect = data.register.effects.find(effect => 
    effect.type === 'fateCompanionship' && effect.isEnabled
  )
  if (fateCompanionshipEffect) {
    const bonusPercent = (fateCompanionshipEffect.partyMembers || 1) * 1
    finalBonuses.ATK_Rate = (finalBonuses.ATK_Rate || 0) + bonusPercent
    finalBonuses.MATK_Rate = (finalBonuses.MATK_Rate || 0) + bonusPercent
  }
}
```

## 運命共同体（fateCompanionship）

### 基本仕様
- **効果**: パーティメンバー数に応じてATK%とMATK%を増加させる
- **計算方法**: `パーティメンバー数（1-3） × 1` を装備品補正値1のATK(%)とMATK(%)に加算
- **適用条件**: レジスタが有効に設定されている場合のみ
- **レベル**: 1で固定（レベル入力フォーム不要）
- **パーティメンバー数**: 1-3人（自分以外のパーティメンバー数）

### 実装方式
運命共同体効果は`finalBonuses`システムに統合され、以下の流れで適用されます：

1. **StatusPreviewでの統合**: レジスタ効果を`finalBonuses`に追加
2. **基本ステータス計算**: ATK%とMATK%として統合済みのボーナス値を使用
3. **装備品補正値表示**: 同じ統合済みボーナス値から装備品補正値1〜3を生成

### 計算例
**入力値:**
- fateCompanionshipが有効
- パーティメンバー数: 3人
- 既存の装備品補正値1のATK(%): 20% (装備+クリスタ+料理+バフアイテム)
- 既存の装備品補正値1のMATK(%): 15% (装備+クリスタ+料理+バフアイテム)

**計算手順:**
1. fateCompanionship効果: 3 × 1 = 3%
2. **装備品補正値1のATK(%)合計**: 20% + 3% = 23%
3. **装備品補正値1のMATK(%)合計**: 15% + 3% = 18%

### 特殊な仕様
- **レベル固定**: 運命共同体のレベルは常に1（入力不要）
- **パーティメンバー数**: 1-3人の範囲で設定可能
- **双方同時適用**: ATK%とMATK%の両方に同じ値が加算される

### 実装詳細
```typescript
// StatusPreview.tsx内
const fateCompanionshipEffect = data.register.effects.find(effect => 
  effect.type === 'fateCompanionship' && effect.isEnabled
)
if (fateCompanionshipEffect) {
  const bonusPercent = (fateCompanionshipEffect.partyMembers || 1) * 1
  finalBonuses.ATK_Rate = (finalBonuses.ATK_Rate || 0) + bonusPercent
  finalBonuses.MATK_Rate = (finalBonuses.MATK_Rate || 0) + bonusPercent
}
```

### データ構造
```typescript
interface RegisterEffect {
  id: string
  name: string
  type: 'fateCompanionship'
  isEnabled: boolean
  level: 1 // 常に1で固定
  maxLevel: 1 // 常に1で固定
  partyMembers: number // 1-3の範囲
  maxPartyMembers: 3 // 最大3人
}
```

### UI仕様
- **モーダルタイトル**: レジスタ名のみ（例: "運命共同体"）
- **レベル入力フィールド**: 非表示（他のレジスタ効果のみ表示）
- **パーティメンバー数入力**: 1-3の数値入力フィールド
- **確定ボタン**: 常にレベル1で送信
- **表示**: "運命共同体 (パーティメンバー数: 3人)" のような形式

### モーダルの条件分岐
```typescript
// モーダル内での条件分岐
const isFatefulCompanionship = effect?.id === 'fatefulCompanionship'

// タイトルはレジスタ名のみ
<h3 className="text-lg font-medium">{effect?.name}</h3>

// レベル入力フィールド分岐
{!isFatefulCompanionship && (
  // レベル入力フィールド
)}

// 確定時の値分岐
onConfirm(
  isFatefulCompanionship ? 1 : level, // 運命共同体は常にレベル1
  isFatefulCompanionship ? partyMembers : undefined
)
```

## ギルド料理効果

### おいしい食材取引（deliciousIngredientTrade）

#### 基本仕様
- **効果**: キャラクターの最大HPを増加させる
- **計算方法**: `レジスタレベル × 100` を装備品補正値1のHP(+)に加算
- **適用条件**: レジスタが有効に設定されている場合のみ
- **レベル範囲**: 1-30（想定）

#### 実装方式
おいしい食材取引効果は`finalBonuses`システムに統合され、以下の流れで適用されます：

1. **StatusPreviewでの統合**: ギルド料理効果を`finalBonuses`に追加
2. **基本ステータス計算**: HP計算で統合済みのボーナス値を使用
3. **装備品補正値表示**: 同じ統合済みボーナス値から装備品補正値1〜3を生成

#### 計算例
**入力値:**
- deliciousIngredientTradeレベル: 5 (有効)
- 既存の装備品補正値1のHP(+): 800 (装備+クリスタ+料理+バフアイテム+レジスタ)

**計算手順:**
1. deliciousIngredientTrade効果: 5 × 100 = 500
2. **装備品補正値1のHP(+)合計**: 800 + 500 = 1300

#### 実装詳細
```typescript
// StatusPreview.tsx内
const deliciousIngredientTradeEffect = data.register.effects.find(effect => 
  effect.type === 'deliciousIngredientTrade' && effect.isEnabled
)
if (deliciousIngredientTradeEffect) {
  finalBonuses.HP = (finalBonuses.HP || 0) + (deliciousIngredientTradeEffect.level * 100)
}
```

### 新鮮な果物取引（freshFruitTrade）

#### 基本仕様
- **効果**: キャラクターの最大MPを増加させる
- **計算方法**: `レジスタレベル × 10` を装備品補正値1のMP(+)に加算
- **適用条件**: レジスタが有効に設定されている場合のみ
- **レベル範囲**: 1-30（想定）

#### 実装方式
新鮮な果物取引効果は`finalBonuses`システムに統合され、以下の流れで適用されます：

1. **StatusPreviewでの統合**: ギルド料理効果を`finalBonuses`に追加
2. **基本ステータス計算**: MP計算で統合済みのボーナス値を使用
3. **装備品補正値表示**: 同じ統合済みボーナス値から装備品補正値1〜3を生成

#### 計算例
**入力値:**
- freshFruitTradeレベル: 8 (有効)
- 既存の装備品補正値1のMP(+): 200 (装備+クリスタ+料理+バフアイテム+レジスタ)

**計算手順:**
1. freshFruitTrade効果: 8 × 10 = 80
2. **装備品補正値1のMP(+)合計**: 200 + 80 = 280

#### 実装詳細
```typescript
// StatusPreview.tsx内
const freshFruitTradeEffect = data.register.effects.find(effect => 
  effect.type === 'freshFruitTrade' && effect.isEnabled
)
if (freshFruitTradeEffect) {
  finalBonuses.MP = (finalBonuses.MP || 0) + (freshFruitTradeEffect.level * 10)
}
```

### ギルド料理効果統合の全体例
```typescript
// StatusPreview.tsx内でのギルド料理効果統合
if (data.register?.effects) {
  // レジスタ効果の処理...（既存のレジスタ効果）

  // おいしい食材取引
  const deliciousIngredientTradeEffect = data.register.effects.find(effect => 
    effect.type === 'deliciousIngredientTrade' && effect.isEnabled
  )
  if (deliciousIngredientTradeEffect) {
    finalBonuses.HP = (finalBonuses.HP || 0) + (deliciousIngredientTradeEffect.level * 100)
  }

  // 新鮮な果物取引
  const freshFruitTradeEffect = data.register.effects.find(effect => 
    effect.type === 'freshFruitTrade' && effect.isEnabled
  )
  if (freshFruitTradeEffect) {
    finalBonuses.MP = (finalBonuses.MP || 0) + (freshFruitTradeEffect.level * 10)
  }
}
```

## レジスタレット効果一覧

1. **物理攻撃アップ(physicalAttackUp)** - 物理攻撃力向上（装備品補正値1のATK(+)に加算）
2. **魔法攻撃アップ(magicalAttackUp)** - 魔法攻撃力向上（装備品補正値1のMATK(+)に加算）
3. **最大HPアップ(maxHpUp)** - HP上限値向上（装備品補正値1のHP(+)に加算）
4. **最大MPアップ(maxMpUp)** - MP上限値向上（装備品補正値1のMP(+)に加算）
5. **命中アップ(accuracyUp)** - 命中率向上（装備品補正値1の命中(+)に加算）
6. **回避アップ(evasionUp)** - 回避率向上（装備品補正値1の回避(+)に加算）
7. **攻撃速度アップ(attackSpeedUp)** - 攻撃速度向上（装備品補正値1のASPD(+)に加算）
8. **魔法速度アップ(magicalSpeedUp)** - 詠唱速度向上（装備品補正値1のCSPD(+)に加算）
9. **運命共同体(fateCompanionship)** - パーティメンバー数×1%をATK%とMATK%に加算（レベル1固定）
10. **無の構え(voidStance)** - ダメージ計算時のコンボ倍率に影響（DamagePreviewのコンボ:強打無効時のみ）
11. **術式アロー・追撃** - 術式アローに追加効果
12. **エアスライド・圧縮** - エアスライドに追加効果
13. **アサシンスタブ・強化** - アサシンスタブに追加効果
14. **レゾナンス・火力** - レゾナンスに追加効果
15. **レゾナンス・加速** - レゾナンスに追加効果
16. **レゾナンス・集中** - レゾナンスに追加効果

## 無の構え（voidStance）

### 基本仕様
- **効果**: ダメージ計算時のコンボ倍率を増加させる
- **適用条件**: 
  - 無の構えが有効に設定されている
  - DamagePreviewのコンボ設定で「強打」が無効になっている
- **計算方法**: `1 + (スキルレベル × 0.01)` 倍の倍率
- **レベル範囲**: 1-10（最大1.10倍）

### 実装方式
無の構えは通常のレジスタ効果とは異なり、ダメージ計算エンジンで直接コンボ倍率に影響を与えます：

1. **条件判定**: DamagePreviewでコンボ「強打」が無効かどうかを確認
2. **倍率計算**: 無の構えのレベルに応じてコンボ倍率を調整
3. **ダメージ適用**: 最終ダメージ計算でコンボ倍率として適用

### 計算例
**入力値:**
- 無の構えレベル: 7 (有効)
- DamagePreviewのコンボ設定: 強打が無効
- 基本コンボ倍率: 1.0

**計算手順:**
1. 無の構え倍率: 1 + (7 × 0.01) = 1.07
2. **最終コンボ倍率**: 1.0 × 1.07 = 1.07倍

**レベル別倍率表:**
- レベル1: 1.01倍
- レベル5: 1.05倍  
- レベル10: 1.10倍（最大）

### 実装詳細
```typescript
// ダメージ計算エンジン内
function calculateComboMultiplier(
  comboSettings: ComboSettings,
  registerData: RegisterFormData
): number {
  let comboMultiplier = 1.0
  
  // 強打コンボの判定
  const hasStrongAttack = comboSettings.strongAttack?.enabled || false
  
  // 無の構えの効果（強打が無効の場合のみ）
  if (!hasStrongAttack) {
    const voidStanceEffect = registerData.effects.find(effect => 
      effect.type === 'voidStance' && effect.isEnabled
    )
    if (voidStanceEffect) {
      const voidStanceMultiplier = 1 + (voidStanceEffect.level * 0.01)
      comboMultiplier *= voidStanceMultiplier
    }
  }
  
  return comboMultiplier
}
```

### 特殊な仕様
- **相互排他**: 強打コンボと無の構えは同時に適用されない
- **UI連動**: DamagePreviewのコンボ設定UIと連動して効果の有無を判定
- **計算タイミング**: ダメージ計算の最終段階でコンボ倍率として適用

### StatusPreviewでの扱い
無の構えは基本ステータス（HP、MP、ATK等）には影響を与えないため、StatusPreviewでの統合処理は不要です。ダメージ計算エンジンでのみ使用されます。

## ギルド料理効果一覧

1. **おいしい食材取引(deliciousIngredientTrade)** - HP上限値向上（装備品補正値1のHP(+)に加算、レベル×100）
2. **新鮮な果物取引(freshFruitTrade)** - MP上限値向上（装備品補正値1のMP(+)に加算、レベル×10）

## データ移行システム

### 移行の必要性
レジスタシステムに新しい効果（特にギルド料理効果）が追加された際、既存ユーザーのセーブデータには新効果が含まれていないため、UIで表示されない問題が発生する。

### 移行機能の実装

#### migrateRegisterEffects関数
```typescript
// レジスタ効果の移行用関数（既存セーブデータに新効果を追加）
export const migrateRegisterEffects = (existingData: RegisterFormData): RegisterFormData => {
  const currentEffects = createInitialRegisterFormData().effects
  const existingEffects = existingData.effects || []
  
  // 既存効果をIDでマップ化
  const existingEffectMap = new Map(existingEffects.map(effect => [effect.id, effect]))
  
  // 新しい効果配列を作成（既存効果を保持し、不足分を補完）
  const migratedEffects = currentEffects.map(currentEffect => {
    // 既存データにある場合はそれを使用、ない場合は新規効果を追加
    return existingEffectMap.get(currentEffect.id) || currentEffect
  })
  
  return { effects: migratedEffects }
}
```

#### 移行実行タイミング
1. **アプリ初期化時** (`calculatorStore.initialize()`)
   ```typescript
   // レジスタ効果の移行（新効果があれば追加）
   const migratedData = { ...currentSave.data }
   if (migratedData.register) {
     migratedData.register = migrateRegisterEffects(migratedData.register)
   }
   ```

2. **セーブデータ読み込み時** (`calculatorStore.loadSaveData()`)
   ```typescript
   const validData = isValidCalculatorData(data)
     ? (() => {
         // 既存データのレジスタ効果を移行（新効果があれば追加）
         const migratedData = { ...data }
         if (migratedData.register) {
           migratedData.register = migrateRegisterEffects(migratedData.register)
         }
         return migratedData
       })()
     : createInitialCalculatorData()
   ```

### 移行の動作仕様
- **既存効果の保持**: ユーザーが設定した既存のレジスタ効果（レベル、有効/無効状態）は完全に保持
- **新効果の追加**: 不足している新しい効果はデフォルト値（無効状態、標準レベル）で自動追加
- **透明な実行**: ユーザーからは見えない形でバックグラウンドで実行
- **冪等性**: 複数回実行しても同じ結果になる安全な設計

### 移行対象効果
現在の移行システムで自動追加される効果：
- `deliciousIngredientTrade` (おいしい食材取引)
- `freshFruitTrade` (新鮮な果物取引)

今後新しいレジスタ効果が追加された場合も、`createInitialRegisterFormData()`に定義するだけで自動的に移行対象となる。