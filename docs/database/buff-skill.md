# バフスキルシステム設計書（武器対応版）

## 概要

武器種とサブ武器の組み合わせによって動的にスキル選択肢が変化するバフスキルシステムです。
共通バフスキル（35個）+ 武器固有スキル + サブ武器特殊スキルの構成となります。

## データ型定義

```typescript
interface BuffSkillFormData {
  skills: Record<string, BuffSkillState>  // スキルID → 状態のマップ
}

interface BuffSkillState {
  isEnabled: boolean           // オン/オフ状態
  level?: number              // スキルレベル（1-10, 1-15, 1-100等）
  stackCount?: number         // 重ねがけ数（×3, ×10, ×15等）
  specialParam?: number       // 特殊パラメータ（プレイヤー数、精錬値等）
}

interface BuffSkillDefinition {
  id: string                  // data-key値（IsWarcry, mg4等）
  name: string               // 表示名（ウォークライ、チェインキャスト等）
  category: BuffSkillCategory // スキル系統
  type: BuffSkillType        // スキルタイプ
  order: number              // 表示順序番号（昇順ソート用）
  categoryOrder?: number     // カテゴリ内順序番号（省略時はorder使用）
  maxLevel?: number          // 最大レベル（デフォルト10）
  maxStack?: number          // 最大重ねがけ数
  requirements?: WeaponRequirement[] // 武器要件
}

type BuffSkillType = 
  | 'toggle'        // ON/OFF切り替えのみ
  | 'level'         // レベル設定（1-10等）
  | 'stack'         // 重ねがけ設定（×3, ×10等）
  | 'special'       // 特殊パラメータ付き

type BuffSkillCategory = 
  | 'blade' | 'shoot' | 'martial' | 'halberd' | 'mononofu'
  | 'dualSword' | 'sprite' | 'magicBlade' | 'priest' | 'wizard'
  | 'darkPower' | 'shield' | 'knight' | 'hunter' | 'assassin'
  | 'ninja' | 'support' | 'survival' | 'battle' | 'pet'
  | 'minstrel' | 'partisan' | 'mastery' | 'magic' | 'crusher'

interface WeaponRequirement {
  mainWeapon?: MainWeaponType | MainWeaponType[]
  subWeapon?: SubWeaponType | SubWeaponType[]
  exclude?: {
    mainWeapon?: MainWeaponType[]
    subWeapon?: SubWeaponType[]
  }
}

type MainWeaponType = 
  | 'oneHandSword' | 'dualSword' | 'twoHandSword' | 'knuckle'
  | 'halberd' | 'katana' | 'bow' | 'bowgun' | 'staff' | 'magicDevice' | 'bareHands'

type SubWeaponType = 
  | 'none' | 'knife' | 'arrow' | 'shield' | 'knuckle' | 'magicDevice' | 'scroll'
```

## 順序番号体系

### カテゴリ別順序番号ルール

```typescript
const CATEGORY_ORDER_RANGES = {
  mastery: 100,        // 100-199: マスタリスキル
  blade: 200,          // 200-299: ブレードスキル  
  shoot: 300,          // 300-399: シュートスキル
  magic: 400,          // 400-499: マジックスキル
  martial: 500,        // 500-599: マーシャルスキル
  halberd: 600,        // 600-699: ハルバードスキル
  mononofu: 700,       // 700-799: モノノフスキル
  dualSword: 800,      // 800-899: デュアルソードスキル
  crusher: 900,        // 900-999: クラッシャースキル
  sprite: 1000,        // 1000-1099: スプライトスキル
  magicBlade: 1100,    // 1100-1199: マジックブレードスキル
  priest: 1200,        // 1200-1299: プリーストスキル
  wizard: 1300,        // 1300-1399: ウィザードスキル
  darkPower: 1400,     // 1400-1499: ダークパワースキル
  shield: 1500,        // 1500-1599: シールドスキル
  knight: 1600,        // 1600-1699: ナイトスキル
  hunter: 1700,        // 1700-1799: ハンタースキル
  assassin: 1800,      // 1800-1899: アサシンスキル
  ninja: 1900,         // 1900-1999: ニンジャスキル
  support: 2000,       // 2000-2099: サポートスキル
  survival: 2100,      // 2100-2199: サバイバルスキル
  battle: 2200,        // 2200-2299: バトルスキル
  pet: 2300,           // 2300-2399: ペット使用スキル
  minstrel: 2400,      // 2400-2499: ミンストレルスキル
  partisan: 2500       // 2500-2599: パルチザンスキル
} as const

// 順序番号生成ヘルパー
function getSkillOrder(category: BuffSkillCategory, index: number): number {
  return CATEGORY_ORDER_RANGES[category] + index + 1
}
```

### ソート実装

```typescript
// スキルリストのソート関数
function sortSkills(skills: BuffSkillDefinition[]): BuffSkillDefinition[] {
  return [...skills].sort((a, b) => {
    // 1. カテゴリ順序で比較
    const categoryOrderA = CATEGORY_ORDER_RANGES[a.category]
    const categoryOrderB = CATEGORY_ORDER_RANGES[b.category]
    
    if (categoryOrderA !== categoryOrderB) {
      return categoryOrderA - categoryOrderB
    }
    
    // 2. 同カテゴリ内では個別順序番号で比較
    const orderA = a.categoryOrder ?? a.order
    const orderB = b.categoryOrder ?? b.order
    
    return orderA - orderB
  })
}

// カテゴリ内でのスキルソート
function sortSkillsInCategory(
  skills: BuffSkillDefinition[], 
  category: BuffSkillCategory
): BuffSkillDefinition[] {
  return skills
    .filter(skill => skill.category === category)
    .sort((a, b) => {
      const orderA = a.categoryOrder ?? a.order
      const orderB = b.categoryOrder ?? b.order
      return orderA - orderB
    })
}
```

## 武器対応システム

### 共通バフスキル（35個）
全武器種で使用可能な基本スキル群

```typescript
const COMMON_BUFF_SKILLS: BuffSkillDefinition[] = [
  // ブレードスキル (order: 100番台)
  { id: 'IsWarcry', name: 'ウォークライ', category: 'blade', type: 'toggle', order: 101 },
  
  // シュートスキル (order: 200番台)
  { id: 'LongRange', name: 'ロングレンジ', category: 'shoot', type: 'level', maxLevel: 10, order: 201 },
  
  // ハルバードスキル (order: 400番台)
  { id: 'hb1', name: 'クイックオーラ', category: 'halberd', type: 'level', maxLevel: 10, order: 401 },
  { id: 'hb4-1', name: '神速の捌手', category: 'halberd', type: 'stack', maxStack: 3, order: 402 },
  
  // モノノフスキル (order: 500番台)
  { id: 'Mononof', name: '武士道', category: 'mononofu', type: 'level', maxLevel: 10, order: 501 },
  { id: 'mf1-1', name: '明鏡止水', category: 'mononofu', type: 'level', maxLevel: 10, order: 502 },
  { id: 'mf1', name: '怪力乱神', category: 'mononofu', type: 'level', maxLevel: 10, order: 503 },
  
  // ... 残り28個のスキル定義（各カテゴリで順序番号を指定）
]
```

### 武器固有スキル定義

```typescript
const WEAPON_SPECIFIC_SKILLS: Record<MainWeaponType, BuffSkillDefinition[]> = {
  oneHandSword: [
    // マスタリ
    { id: 'Ms-blade', name: 'ブレードマスタリ', category: 'mastery', type: 'level', order: 101 },
    
    // ブレードスキル（固有順序）
    { id: 'sm2', name: '素早い斬撃', category: 'blade', type: 'level', order: 202 },
    { id: 'sm3-2', name: 'バーサーク', category: 'blade', type: 'toggle', order: 203 },
    { id: 'sm4', name: '匠の剣術', category: 'blade', type: 'toggle', order: 204 },
    { id: 'sm5', name: 'P:オーラブレード', category: 'blade', type: 'level', order: 205 },
    { id: '4-OH', name: 'オーラブレード', category: 'blade', type: 'toggle', order: 206 },
    { id: '5-BusterBlade', name: 'バスターブレード', category: 'blade', type: 'toggle', order: 207 },
    
    // シュートスキル
    { id: 'ar1', name: '武士弓術', category: 'shoot', type: 'toggle', order: 301 },
    
    // マーシャルスキル  
    { id: 'ma2-2', name: '強力な追撃', category: 'martial', type: 'level', order: 401 },
    
    // モノノフスキル
    { id: 'sm1-1', name: '両手持ち', category: 'mononofu', type: 'toggle', order: 604 },
    
    // マジックブレードスキル
    { id: 'MagicWarrior', name: '魔法戦士の心得', category: 'magicBlade', type: 'level', order: 1001 },
    { id: 'oh3', name: 'コンバージョン', category: 'magicBlade', type: 'toggle', order: 1002 },
    
    // ウィザードスキル
    { id: 'mg3', name: 'ファミリア', category: 'wizard', type: 'level', order: 1201 },
    
    // シールドスキル
    { id: 'shield1', name: 'フォースシールド', category: 'shield', type: 'level', order: 1501 },
    { id: 'shield2', name: 'マジカルシールド', category: 'shield', type: 'level', order: 1502 }
    
    // ... 残り8個のスキル
  ],
  
  dualSword: [
    // マスタリ（双剣固有の順序）
    { id: 'Ms-blade', name: 'ブレードマスタリ', category: 'mastery', type: 'level', order: 101 },
    { id: 'DSpena1', name: 'デュアルマスタリ', category: 'mastery', type: 'level', order: 102 },
    
    // ブレードスキル
    { id: 'sm2', name: '素早い斬撃', category: 'blade', type: 'level', order: 202 },
    { id: 'sm3-2', name: 'バーサーク', category: 'blade', type: 'toggle', order: 203 },
    // ...
    
    // デュアルソードスキル（双剣専用）
    { id: 'DSpena2', name: '双剣の鍛錬', category: 'dualSword', type: 'level', order: 701 },
    { id: 'ds1-1', name: '神速の軌跡', category: 'dualSword', type: 'level', order: 702 },
    { id: '2-DSeclair', name: 'フィロエクレール', category: 'dualSword', type: 'toggle', order: 703 },
    { id: 'ds3', name: 'シュツルムリーパー', category: 'dualSword', type: 'level', maxLevel: 100, order: 704 },
    { id: 'ds4', name: 'パリングソード', category: 'dualSword', type: 'level', order: 705 },
    { id: 'ds5', name: 'ツインスラッシュ', category: 'dualSword', type: 'toggle', order: 706 },
    { id: 'ds6', name: 'セイバーオーラ', category: 'dualSword', type: 'stack', maxStack: 10, order: 707 },
    { id: 'ds7', name: 'アークセイバー', category: 'dualSword', type: 'level', order: 708 }
    
    // ... 残りのスキル
  ],
  
  // ... 他の武器種定義（各スキルに適切な順序番号を設定）
}
```

### サブ武器特殊スキル

```typescript
const SUB_WEAPON_SKILLS: Record<string, BuffSkillDefinition[]> = {
  'arrow': [
    { 
      id: 'bw1', 
      name: 'パライズショット', 
      category: 'shoot', 
      type: 'toggle',
      order: 302,  // シュートスキル内の2番目に配置
      requirements: [{ 
        mainWeapon: ['oneHandSword', 'halberd', 'staff'] 
      }]
    }
  ],
  
  'magicDevice': [
    { id: 'mg2', name: '急速チャージ', category: 'magic', type: 'stack', maxStack: 15, order: 1301 },
    { id: 'mw1', name: 'P:コンバージョン', category: 'magicBlade', type: 'toggle', order: 1003 },
    { id: 'mw2', name: 'エンチャントバースト', category: 'magicBlade', type: 'toggle', order: 1004 },
    { id: 'mw3', name: 'デュアルブリンガー-旧', category: 'magicBlade', type: 'toggle', order: 1005 },
    { id: 'mw4', name: 'レゾナンス？', category: 'magicBlade', type: 'level', order: 1006 },
  ],
  
  'scroll': [
    { 
      id: 'ninja1', 
      name: '風遁の術', 
      category: 'ninja', 
      type: 'toggle',
      order: 1905,  // 忍術スキル内の5番目に配置
      requirements: [{ 
        mainWeapon: ['oneHandSword', 'katana', 'staff', 'magicDevice'] 
      }]
    }
  ],
  
  'bowSpecial': [  // 弓専用の矢/抜刀剣サブ武器
    { 
      id: 'sm3-1', 
      name: 'バーサーク', 
      category: 'blade', 
      type: 'toggle', 
      order: 208,  // ブレードスキル内の8番目
      categoryOrder: 1  // 弓専用として最優先表示したい場合
    },
    { 
      id: 'hunter5-1', 
      name: 'フォーカス', 
      category: 'hunter', 
      type: 'level', 
      order: 1701,
      categoryOrder: 1  // ハンタースキル内の最優先
    }
  ]
}
```

### categoryOrderの使用ケース

```typescript
// 例：特定の武器でスキルの表示順序を変更したい場合
const knuckleSpecificSkills = [
  {
    id: 'ma2',
    name: 'アシュラオーラ',
    category: 'martial',
    type: 'toggle',
    order: 403,           // 通常はマーシャルスキル3番目
    categoryOrder: 1      // 手甲では最優先表示
  }
]

// ソート時の優先順位：
// 1. categoryOrder が設定されていればそれを使用
// 2. categoryOrder が未設定なら order を使用
function getEffectiveOrder(skill: BuffSkillDefinition): number {
  return skill.categoryOrder ?? skill.order
}
```

## 動的スキル選択ロジック

```typescript
function getAvailableSkills(
  mainWeapon: MainWeaponType | null,
  subWeapon: SubWeaponType | null
): BuffSkillDefinition[] {
  const skills: BuffSkillDefinition[] = []
  
  // 1. 共通バフスキル（35個）を追加
  skills.push(...COMMON_BUFF_SKILLS)
  
  // 2. ほぼ共通スキル（武士弓術）を追加（素手以外）
  if (mainWeapon !== 'bareHands') {
    skills.push({
      id: 'ar1',
      name: '武士弓術',
      category: 'shoot',
      type: 'toggle'
    })
  }
  
  // 3. 武器固有スキルを追加
  if (mainWeapon && WEAPON_SPECIFIC_SKILLS[mainWeapon]) {
    skills.push(...WEAPON_SPECIFIC_SKILLS[mainWeapon])
  }
  
  // 4. サブ武器特殊スキルを追加
  if (subWeapon && subWeapon !== 'none') {
    const subWeaponSkills = getSubWeaponSkills(mainWeapon, subWeapon)
    skills.push(...subWeaponSkills)
  }
  
  // 5. 重複除去（IDベース）
  return deduplicateSkills(skills)
}

function getSubWeaponSkills(
  mainWeapon: MainWeaponType | null,
  subWeapon: SubWeaponType
): BuffSkillDefinition[] {
  const skills: BuffSkillDefinition[] = []
  
  // 特殊ケース：弓 + 矢/抜刀剣
  if (mainWeapon === 'bow' && (subWeapon === 'arrow' || subWeapon === 'katana')) {
    skills.push(...SUB_WEAPON_SKILLS.bowSpecial)
    return skills
  }
  
  // 一般的なサブ武器スキル
  if (SUB_WEAPON_SKILLS[subWeapon]) {
    const candidateSkills = SUB_WEAPON_SKILLS[subWeapon]
    
    // 武器要件をチェックして適用可能なスキルのみ追加
    for (const skill of candidateSkills) {
      if (isSkillCompatible(skill, mainWeapon, subWeapon)) {
        skills.push(skill)
      }
    }
  }
  
  return skills
}
```

## フォーム実装

### React Hook Form統合

```typescript
const BuffSkillForm: React.FC = () => {
  const { mainWeapon, subWeapon } = useCalculatorData()
  
  // 武器に応じたスキルを取得してソート
  const availableSkills = useMemo(() => {
    const skills = getAvailableSkills(mainWeapon, subWeapon)
    return sortSkills(skills)  // 順序番号でソート
  }, [mainWeapon, subWeapon])
  
  // カテゴリ別スキルマップ（ソート済み）
  const skillsByCategory = useMemo(() => {
    const categoryMap = new Map<BuffSkillCategory, BuffSkillDefinition[]>()
    
    for (const skill of availableSkills) {
      if (!categoryMap.has(skill.category)) {
        categoryMap.set(skill.category, [])
      }
      categoryMap.get(skill.category)!.push(skill)
    }
    
    // 各カテゴリ内でもソート
    for (const [category, skills] of categoryMap) {
      categoryMap.set(category, sortSkillsInCategory(skills, category))
    }
    
    return categoryMap
  }, [availableSkills])
  
  const { control, watch, setValue } = useForm<BuffSkillFormData>({
    defaultValues: {
      skills: getDefaultSkillStates(availableSkills)
    }
  })
  
  // 武器変更時にスキル状態をリセット
  useEffect(() => {
    const newSkills = getAvailableSkills(mainWeapon, subWeapon)
    const currentStates = watch('skills')
    const newStates = mergeSkillStates(currentStates, newSkills)
    setValue('skills', newStates)
  }, [mainWeapon, subWeapon])
  
  // カテゴリを順序番号順で表示
  const sortedCategories = Array.from(skillsByCategory.keys()).sort((a, b) => 
    CATEGORY_ORDER_RANGES[a] - CATEGORY_ORDER_RANGES[b]
  )
  
  return (
    <div className="space-y-6">
      {sortedCategories.map(category => (
        <BuffSkillSection
          key={category}
          category={category}
          skills={skillsByCategory.get(category) || []}
          control={control}
        />
      ))}
    </div>
  )
}
```

### スキルセクション実装

```typescript
const BuffSkillSection: React.FC<{
  category: BuffSkillCategory
  skills: BuffSkillDefinition[]
  control: Control<BuffSkillFormData>
}> = ({ category, skills, control }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  if (skills.length === 0) return null
  
  return (
    <div className="border rounded-lg">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-left flex justify-between items-center"
      >
        <h3 className="text-lg font-medium">
          {CATEGORY_LABELS[category]} ({skills.length})
        </h3>
        <ChevronDownIcon 
          className={`w-5 h-5 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      {isOpen && (
        <div className="p-4 border-t space-y-4">
          {skills.map(skill => (
            <BuffSkillControl
              key={skill.id}
              skill={skill}
              control={control}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

### 個別スキル制御

```typescript
const BuffSkillControl: React.FC<{
  skill: BuffSkillDefinition
  control: Control<BuffSkillFormData>
}> = ({ skill, control }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Controller
          name={`skills.${skill.id}.isEnabled`}
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <span className="text-sm font-medium">{skill.name}</span>
      </div>
      
      <div className="flex items-center space-x-2">
        {skill.type === 'level' && (
          <Controller
            name={`skills.${skill.id}.level`}
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                min={1}
                max={skill.maxLevel || 10}
                value={field.value || 1}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="w-20"
                disabled={!watch(`skills.${skill.id}.isEnabled`)}
              />
            )}
          />
        )}
        
        {skill.type === 'stack' && (
          <Controller
            name={`skills.${skill.id}.stackCount`}
            control={control}
            render={({ field }) => (
              <Select
                value={String(field.value || 1)}
                onValueChange={(value) => field.onChange(Number(value))}
                disabled={!watch(`skills.${skill.id}.isEnabled`)}
              >
                {Array.from(
                  { length: skill.maxStack || 10 }, 
                  (_, i) => i + 1
                ).map(num => (
                  <SelectItem key={num} value={String(num)}>
                    ×{num}
                  </SelectItem>
                ))}
              </Select>
            )}
          />
        )}
      </div>
    </div>
  )
}
```

## バリデーション

```typescript
export const buffSkillSchema = z.object({
  skills: z.record(z.object({
    isEnabled: z.boolean(),
    level: z.number().min(1).max(100).optional(),
    stackCount: z.number().min(1).max(15).optional(),
    specialParam: z.number().optional()
  }))
})
```

## 状態管理

```typescript
interface CalculatorStore {
  buffSkills: BuffSkillFormData
  updateBuffSkills: (skills: BuffSkillFormData) => void
  
  // 武器変更時の自動更新
  setMainWeapon: (weapon: MainWeaponType | null) => void
  setSubWeapon: (weapon: SubWeaponType | null) => void
}

const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  buffSkills: { skills: {} },
  
  updateBuffSkills: (skills) => set({ buffSkills: skills }),
  
  setMainWeapon: (weapon) => {
    set({ mainWeapon: weapon })
    // スキル状態を武器に合わせて更新
    const currentSkills = get().buffSkills
    const availableSkills = getAvailableSkills(weapon, get().subWeapon)
    const updatedSkills = adaptSkillsToWeapon(currentSkills, availableSkills)
    set({ buffSkills: updatedSkills })
  },
  
  setSubWeapon: (weapon) => {
    set({ subWeapon: weapon })
    // スキル状態を武器に合わせて更新
    const currentSkills = get().buffSkills
    const availableSkills = getAvailableSkills(get().mainWeapon, weapon)
    const updatedSkills = adaptSkillsToWeapon(currentSkills, availableSkills)
    set({ buffSkills: updatedSkills })
  }
}))
```

## パフォーマンス最適化

### メモ化
- `getAvailableSkills`の結果をuseMemoでキャッシュ
- 武器変更時のみスキル再計算実行

### 段階的レンダリング
- スキルセクションの折りたたみ機能
- 仮想化（大量スキル表示時）

### 差分更新
- 武器変更時は設定済みスキルを保持
- 新規追加スキルのみデフォルト値で初期化

## エラーハンドリング

### バリデーション
- スキルレベル範囲チェック
- 武器互換性チェック
- 必須パラメータ検証

### フォールバック
- 不正な武器組み合わせ時の安全な状態復元
- データ破損時のデフォルト値復元

## モーダル機能設計

### モーダル表示仕様

スキル名をクリックすることで、スキルパラメータ入力用のモーダルが開きます。

```typescript
interface SkillParameterModalProps {
  skill: BuffSkillDefinition
  currentState: BuffSkillState
  isOpen: boolean
  onClose: () => void
  onSave: (newState: BuffSkillState) => void
}

const SkillParameterModal: React.FC<SkillParameterModalProps> = ({
  skill,
  currentState,
  isOpen,
  onClose,
  onSave
}) => {
  const [tempState, setTempState] = useState<BuffSkillState>(currentState)
  
  const handleSave = () => {
    onSave(tempState)
    onClose()
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-w-md">
        <h3 className="text-lg font-bold mb-4">{skill.name}</h3>
        
        
        {/* パラメータ入力フォーム */}
        <div className="space-y-4">
          {/* ON/OFF設定 */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">スキル有効化</label>
            <Switch
              checked={tempState.isEnabled}
              onCheckedChange={(enabled) => 
                setTempState(prev => ({ ...prev, isEnabled: enabled }))
              }
            />
          </div>
          
          {/* レベル設定（toggle以外） */}
          {skill.type !== 'toggle' && tempState.isEnabled && (
            <>
              {skill.type === 'level' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    スキルレベル (1-{skill.maxLevel || 10})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={skill.maxLevel || 10}
                    value={tempState.level || 1}
                    onChange={(e) => setTempState(prev => ({
                      ...prev,
                      level: Number(e.target.value)
                    }))}
                    className="w-full p-2 border rounded"
                    placeholder="スキルレベルを入力してください"
                  />
                </div>
              )}
              
              {skill.type === 'stack' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    重ねがけ数 (1-{skill.maxStack || 10})
                  </label>
                  <select
                    value={tempState.stackCount || 1}
                    onChange={(e) => setTempState(prev => ({
                      ...prev,
                      stackCount: Number(e.target.value)
                    }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="" disabled>重ね掛け回数を選択してください</option>
                    {Array.from({ length: skill.maxStack || 10 }, (_, i) => i + 1)
                      .map(num => (
                        <option key={num} value={num}>×{num}</option>
                      ))
                    }
                  </select>
                </div>
              )}
              
              {skill.type === 'special' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    特殊パラメータ
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={tempState.specialParam || 0}
                    onChange={(e) => setTempState(prev => ({
                      ...prev,
                      specialParam: Number(e.target.value)
                    }))}
                    className="w-full p-2 border rounded"
                    placeholder="値を入力してください"
                  />
                </div>
              )}
            </>
          )}
        </div>
        
        {/* ボタン */}
        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            保存
          </button>
        </div>
      </div>
    </Modal>
  )
}
```

### モーダル開閉ロジック

```typescript
// NewSkillCard コンポーネントの更新
export default function NewSkillCard({ skill, control, watch }: NewSkillCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const currentState = watch(`skills.${skill.id}`) as BuffSkillState || {
    isEnabled: false,
    level: 1,
    stackCount: 1,
    specialParam: 0
  }
  
  const handleSkillNameClick = () => {
    // toggle以外のスキルのみモーダルを開く
    if (skill.type !== 'toggle') {
      setIsModalOpen(true)
    }
  }
  
  const handleModalSave = (newState: BuffSkillState) => {
    // React Hook Form の setValue を使用して状態を更新
    setValue(`skills.${skill.id}`, newState)
  }
  
  return (
    <div className="border-b-2 border-blue-200">
      {/* カテゴリラベル */}
      <div className="text-[10px] text-gray-500">{categoryLabel}</div>
      
      {/* スキル名とトグルスイッチ */}
      <div className="skill-header flex items-center justify-between mb-1">
        <span 
          className={`skill-name text-[13px] font-medium text-gray-700 flex-1 mr-2 leading-tight ${
            skill.type !== 'toggle' ? 'hover:text-blue-500/90 cursor-pointer' : ''
          }`}
          onClick={handleSkillNameClick}
        >
          {getDisplayName()}
        </span>
        
        <Controller
          name={`skills.${skill.id}.isEnabled`}
          control={control}
          render={({ field }) => (
            <NewSkillToggleButton
              isEnabled={field.value || false}
              onToggle={field.onChange}
            />
          )}
        />
      </div>
      
      {/* モーダル */}
      <SkillParameterModal
        skill={skill}
        currentState={currentState}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
      />
    </div>
  )
}
```


### モーダル表示条件

```typescript
// スキルタイプによるモーダル表示制御
function shouldShowModal(skill: BuffSkillDefinition): boolean {
  // toggleタイプのスキルはモーダル表示しない（ON/OFFのみ）
  if (skill.type === 'toggle') {
    return false
  }
  
  // level, stack, specialタイプはモーダル表示
  return ['level', 'stack', 'special'].includes(skill.type)
}

// スキル名のクリック可能性を示すUI
function getSkillNameClassName(skill: BuffSkillDefinition): string {
  const baseClass = 'skill-name text-[13px] font-medium text-gray-700 flex-1 mr-2 leading-tight'
  
  if (shouldShowModal(skill)) {
    return `${baseClass} hover:text-blue-600 cursor-pointer`
  }
  
  return baseClass
}
```

### アクセシビリティ対応

```typescript
// スキル名にaria属性を追加
<span 
  className={getSkillNameClassName(skill)}
  onClick={handleSkillNameClick}
  role={shouldShowModal(skill) ? 'button' : undefined}
  tabIndex={shouldShowModal(skill) ? 0 : undefined}
  onKeyDown={(e) => {
    if (shouldShowModal(skill) && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      handleSkillNameClick()
    }
  }}
  aria-label={shouldShowModal(skill) ? `${skill.name}の詳細設定を開く` : undefined}
>
  {getDisplayName()}
</span>
```

## 今後の拡張

### 計算エンジン統合
- スキル効果値の自動計算
- リアルタイムダメージプレビュー

### プリセット機能
- ビルド別スキル設定保存
- クイックロード機能

### 上級者向け機能
- スキル効果の詳細表示
- ビルド最適化提案

### モーダル機能の拡張
- スキル効果の数値計算結果表示
- 関連スキルとの相性情報
- おすすめレベル設定の提案

## Zustand統合設計

### バフスキルのZustand統合

#### 状態管理アーキテクチャ

```typescript
// CalculatorStore内のバフスキル状態管理
interface CalculatorStore {
  // バフスキルデータ
  data: {
    buffSkills: BuffSkillFormData
    // ... 他のデータ
  }
  
  // バフスキル更新メソッド
  updateBuffSkills: (buffSkills: BuffSkillFormData) => void
  updateBuffSkillState: (skillId: string, state: BuffSkillState) => void
  
  // 個別パラメータ更新（モーダル用）
  updateSkillParameter: (skillId: string, paramType: 'level' | 'stackCount' | 'specialParam', value: number) => void
}
```

#### SkillParameterModalのZustand統合

```typescript
// SkillParameterModalでの直接Zustand操作
const SkillParameterModal: React.FC<SkillParameterModalProps> = ({
  skill,
  isOpen,
  onClose
}) => {
  // Zustandから現在の状態を取得
  const currentState = useCalculatorStore(state => 
    state.data.buffSkills.skills[skill.id] || getDefaultSkillState(skill)
  )
  
  // Zustandの更新メソッド
  const updateSkillParameter = useCalculatorStore(state => state.updateSkillParameter)
  
  // ローカル状態は使わず、直接Zustand経由で更新
  const handleLevelChange = (newLevel: number) => {
    updateSkillParameter(skill.id, 'level', newLevel)
  }
  
  const handleStackCountChange = (newStackCount: number) => {
    updateSkillParameter(skill.id, 'stackCount', newStackCount)
  }
  
  const handleSpecialParamChange = (newValue: number) => {
    updateSkillParameter(skill.id, 'specialParam', newValue)
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* レベル設定UI */}
      <div className="flex items-center justify-center space-x-1">
        <button onClick={() => handleLevelChange(Math.max(1, currentState.level - 10))}>
          -10
        </button>
        <button onClick={() => handleLevelChange(Math.max(1, currentState.level - 1))}>
          -1
        </button>
        <div className="level-display">{currentState.level}</div>
        <button onClick={() => handleLevelChange(Math.min(skill.maxLevel || 10, currentState.level + 1))}>
          +1
        </button>
        <button onClick={() => handleLevelChange(Math.min(skill.maxLevel || 10, currentState.level + 10))}>
          +10
        </button>
      </div>
    </Modal>
  )
}
```

#### CalculatorStoreの実装

```typescript
// zustandストア内の実装
const useCalculatorStore = create<CalculatorStore>()((set, get) => ({
  // ... 既存の状態
  
  updateSkillParameter: (skillId: string, paramType: 'level' | 'stackCount' | 'specialParam', value: number) => {
    set((state) => {
      const currentSkills = state.data.buffSkills.skills
      const updatedSkills = {
        ...currentSkills,
        [skillId]: {
          ...currentSkills[skillId],
          [paramType]: value
        }
      }
      
      return {
        ...state,
        data: {
          ...state.data,
          buffSkills: {
            ...state.data.buffSkills,
            skills: updatedSkills
          }
        },
        hasUnsavedChanges: true
      }
    }, false, `updateSkillParameter:${skillId}:${paramType}`)
  },
  
  updateBuffSkillState: (skillId: string, newState: BuffSkillState) => {
    set((state) => {
      const currentSkills = state.data.buffSkills.skills
      const updatedSkills = {
        ...currentSkills,
        [skillId]: newState
      }
      
      return {
        ...state,
        data: {
          ...state.data,
          buffSkills: {
            ...state.data.buffSkills,
            skills: updatedSkills
          }
        },
        hasUnsavedChanges: true
      }
    }, false, `updateBuffSkillState:${skillId}`)
  }
}))
```

#### SkillCardとの連携

```typescript
// SkillCardでの統合
const SkillCard: React.FC<SkillCardProps> = ({ skill }) => {
  // Zustandから状態を直接取得
  const currentState = useCalculatorStore(state => 
    state.data.buffSkills.skills[skill.id] || getDefaultSkillState(skill)
  )
  
  const updateSkillState = useCalculatorStore(state => state.updateBuffSkillState)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // モーダルは必要最小限のpropsのみ
  return (
    <div>
      {/* スキル表示UI */}
      <SkillParameterModal
        skill={skill}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        // currentStateやonSaveは不要（Zustand直接操作）
      />
    </div>
  )
}
```

#### フォーム統合の排除

React Hook Formは使用せず、Zustand直接操作に統一:

```typescript
// BuffSkillFormの簡素化
const BuffSkillForm: React.FC = () => {
  const availableSkills = useMemo(() => {
    // 武器に応じたスキル取得
  }, [mainWeapon, subWeapon])
  
  return (
    <div>
      {availableSkills.map(skill => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  )
}
```

### データフローの特徴

1. **リアルタイム更新**: モーダル内のボタンクリック → Zustand即座更新 → UI自動反映
2. **状態同期**: 複数コンポーネント間での状態の自動同期
3. **未保存変更検知**: パラメータ変更時の自動フラグ設定
4. **パフォーマンス**: 必要最小限の再レンダリング