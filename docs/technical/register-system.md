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
        <h3 className="text-lg font-medium">{effect?.name} - レベル設定</h3>
        
        {/* レベル入力 */}
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
        
        {/* 運命共同体専用：パーティメンバー数 */}
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
            onClick={() => onConfirm(level, isFatefulCompanionship ? partyMembers : undefined)}
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

1. **StatusPreviewでの統合**: レジスタ効果を`allBonusesWithRegister`に追加
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

レジスタ効果はStatusPreviewで`allBonusesWithRegister`として統合され、HP計算に適用されます。

#### 実装詳細
StatusPreview.tsxで以下のような統合処理が行われます：

```typescript
// レジスタ効果を含むボーナス値を作成
const allBonusesWithRegister = { ...allBonuses }
if (data.register?.effects) {
  const maxHpUpEffect = data.register.effects.find(effect => 
    effect.type === 'maxHpUp' && effect.isEnabled
  )
  if (maxHpUpEffect) {
    allBonusesWithRegister.HP = (allBonusesWithRegister.HP || 0) + (maxHpUpEffect.level * 10)
  }
}

// HP計算でレジスタ効果込みのボーナスを使用
hpCalculation: calculateHP(baseStats, allBonusesWithRegister)

// 装備品補正値もレジスタ効果込みのボーナスから生成
equipmentBonuses: calculateEquipmentBonuses(
  equipmentBonuses, crystalBonuses, foodBonuses, buffBonuses
) // allBonusesWithRegisterを基に計算される
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

1. **StatusPreviewでの統合**: レジスタ効果を`allBonusesWithRegister`に追加
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

レジスタ効果はStatusPreviewで`allBonusesWithRegister`として統合され、MP計算に適用されます。

#### 実装詳細
StatusPreview.tsxで以下のような統合処理が行われます：

```typescript
// レジスタ効果を含むボーナス値を作成
const allBonusesWithRegister = { ...allBonuses }
if (data.register?.effects) {
  const maxMpUpEffect = data.register.effects.find(effect => 
    effect.type === 'maxMpUp' && effect.isEnabled
  )
  if (maxMpUpEffect) {
    allBonusesWithRegister.MP = (allBonusesWithRegister.MP || 0) + (maxMpUpEffect.level * 1)
  }
}

// MP計算でレジスタ効果込みのボーナスを使用
mpCalculation: calculateMP(baseStats, allBonusesWithRegister)

// 装備品補正値もレジスタ効果込みのボーナスから生成
equipmentBonuses: calculateEquipmentBonuses(
  equipmentBonuses, crystalBonuses, foodBonuses, buffBonuses
) // allBonusesWithRegisterを基に計算される
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

1. **StatusPreviewでの統合**: レジスタ効果を`allBonusesWithRegister`に追加
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

レジスタ効果はStatusPreviewで`allBonusesWithRegister`として統合され、ATK計算に適用されます。

#### 実装詳細
StatusPreview.tsxで以下のような統合処理が行われます：

```typescript
// レジスタ効果を含むボーナス値を作成
const allBonusesWithRegister = { ...allBonuses }
if (data.register?.effects) {
  const physicalAttackUpEffect = data.register.effects.find(effect => 
    effect.type === 'physicalAttackUp' && effect.isEnabled
  )
  if (physicalAttackUpEffect) {
    allBonusesWithRegister.ATK = (allBonusesWithRegister.ATK || 0) + (physicalAttackUpEffect.level * 1)
  }
}

// 装備品補正値もレジスタ効果込みのボーナスから生成
equipmentBonuses: calculateEquipmentBonuses(allBonusesWithRegister)
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

1. **StatusPreviewでの統合**: レジスタ効果を`allBonusesWithRegister`に追加
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

**重要**: MATK計算には`allBonusesWithRegister`（レジスタ効果込み）を渡す必要があります。

**修正前の問題**: `calculateMATK`関数に`allBonuses`（レジスタ効果なし）が渡されていたため、魔法攻撃アップ効果が基本ステータスのMATKに反映されませんでした。

**修正後**: `calculateMATK`関数に`allBonusesWithRegister`を渡すことで、レジスタ効果がMATK固定値として正しく適用されます。

### 問題解決の実装詳細

#### 修正前の構造
```typescript
// useMemo内
const calculationResults = useMemo(() => {
  const allBonuses = aggregateAllBonuses(...)
  const allBonusesWithRegister = { ...allBonuses }
  // レジスタ効果を allBonusesWithRegister に追加
  return { /* allBonusesWithRegister含まず */ }
}, [...])

// useMemo外
const matkCalculation = calculateMATK(..., allBonuses) // レジスタ効果なし
```

#### 修正後の構造
```typescript
// useMemo内
const calculationResults = useMemo(() => {
  const allBonuses = aggregateAllBonuses(...)
  const allBonusesWithRegister = { ...allBonuses }
  // レジスタ効果を allBonusesWithRegister に追加
  return { 
    allBonuses: allBonusesWithRegister, // レジスタ効果込み
    // その他の計算結果も allBonusesWithRegister を使用
  }
}, [...])

// useMemo外
const { allBonuses: allBonusesWithRegister } = calculationResults
const matkCalculation = calculateMATK(..., allBonusesWithRegister) // レジスタ効果込み
```

これによりMATK計算式の「MATK固定値」部分にレジスタの魔法攻撃アップ効果が正しく反映され、基本ステータスのMATKに変化が現れるようになりました。

### 実装詳細
StatusPreview.tsxで以下のような統合処理が行われます：

```typescript
// レジスタ効果を含むボーナス値を作成
const allBonusesWithRegister = { ...allBonuses }
if (data.register?.effects) {
  const magicalAttackUpEffect = data.register.effects.find(effect => 
    effect.type === 'magicalAttackUp' && effect.isEnabled
  )
  if (magicalAttackUpEffect) {
    allBonusesWithRegister.MATK = (allBonusesWithRegister.MATK || 0) + (magicalAttackUpEffect.level * 1)
  }
}

// 装備品補正値もレジスタ効果込みのボーナスから生成
equipmentBonuses: calculateEquipmentBonuses(allBonusesWithRegister)
```

### StatusPreviewでの表示
- **基本ステータス**: MATK値にレジスタ効果が自動的に反映される
- **装備品補正値1**: MATK(+)項目にレジスタ効果が含まれた値が表示される

### 重要な注意点
- レジスタが無効の場合、効果は0として計算される
- 他の装備・クリスタ・料理・バフアイテムのMATK補正と同等に扱われる
- 装備品補正値1の計算順序は既存システムに従う

### レジスタ効果統合の全体例
```typescript
// StatusPreview.tsx内でのレジスタ効果統合
if (data.register?.effects) {
  // 最大HPアップ
  const maxHpUpEffect = data.register.effects.find(effect => 
    effect.type === 'maxHpUp' && effect.isEnabled
  )
  if (maxHpUpEffect) {
    allBonusesWithRegister.HP = (allBonusesWithRegister.HP || 0) + (maxHpUpEffect.level * 10)
  }

  // 最大MPアップ
  const maxMpUpEffect = data.register.effects.find(effect => 
    effect.type === 'maxMpUp' && effect.isEnabled
  )
  if (maxMpUpEffect) {
    allBonusesWithRegister.MP = (allBonusesWithRegister.MP || 0) + (maxMpUpEffect.level * 1)
  }

  // 物理攻撃アップ
  const physicalAttackUpEffect = data.register.effects.find(effect => 
    effect.type === 'physicalAttackUp' && effect.isEnabled
  )
  if (physicalAttackUpEffect) {
    allBonusesWithRegister.ATK = (allBonusesWithRegister.ATK || 0) + (physicalAttackUpEffect.level * 1)
  }

  // 魔法攻撃アップ
  const magicalAttackUpEffect = data.register.effects.find(effect => 
    effect.type === 'magicalAttackUp' && effect.isEnabled
  )
  if (magicalAttackUpEffect) {
    allBonusesWithRegister.MATK = (allBonusesWithRegister.MATK || 0) + (magicalAttackUpEffect.level * 1)
  }
}
```

## レジスタレット効果一覧

1. **物理攻撃アップ(physicalAttackUp)** - 物理攻撃力向上（装備品補正値1のATK(+)に加算）
2. **魔法攻撃アップ** - 魔法攻撃力向上
3. **最大HPアップ(maxHpUp)** - HP上限値向上（装備品補正値1のHP(+)に加算）
4. **最大MPアップ(maxMpUp)** - MP上限値向上（装備品補正値1のMP(+)に加算）
5. **命中アップ** - 命中率向上
6. **回避アップ** - 回避率向上
7. **攻撃速度アップ** - 攻撃速度向上
8. **魔法速度アップ** - 詠唱速度向上
9. **運命共同体** - パーティメンバー数に応じた特殊効果
10. **虚無の構え** - 特殊戦闘効果
11. **魔矢の追跡** - 魔法矢系効果
12. **エアスライド圧縮** - エアスライド系効果
13. **暗殺突き強化** - 暗殺系効果
14. **共鳴パワー** - 共鳴系パワー効果
15. **共鳴加速** - 共鳴系速度効果
16. **共鳴集中** - 共鳴系集中効果

## ギルド料理効果一覧

1. **おいしい食材取引** - ギルド経済効果
2. **新鮮果実取引** - ギルド経済効果