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
  maxLevel?: number          // 最大レベル（デフォルト10）
  maxStack?: number          // 最大重ねがけ数
  description?: string       // 説明文
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

## 武器対応システム

### 共通バフスキル（35個）
全武器種で使用可能な基本スキル群

```typescript
const COMMON_BUFF_SKILLS: BuffSkillDefinition[] = [
  // ブレードスキル
  { id: 'IsWarcry', name: 'ウォークライ', category: 'blade', type: 'toggle' },
  
  // シュートスキル
  { id: 'LongRange', name: 'ロングレンジ', category: 'shoot', type: 'level', maxLevel: 10 },
  
  // ハルバードスキル
  { id: 'hb1', name: 'クイックオーラ', category: 'halberd', type: 'level', maxLevel: 10 },
  { id: 'hb4-1', name: '神速の捌手', category: 'halberd', type: 'stack', maxStack: 3 },
  
  // モノノフスキル
  { id: 'Mononof', name: '武士道', category: 'mononofu', type: 'level', maxLevel: 10 },
  { id: 'mf1-1', name: '明鏡止水', category: 'mononofu', type: 'level', maxLevel: 10 },
  { id: 'mf1', name: '怪力乱神', category: 'mononofu', type: 'level', maxLevel: 10 },
  
  // ... 残り28個のスキル定義
]
```

### 武器固有スキル定義

```typescript
const WEAPON_SPECIFIC_SKILLS: Record<MainWeaponType, BuffSkillDefinition[]> = {
  oneHandSword: [
    { id: 'Ms-blade', name: 'ブレードマスタリ', category: 'mastery', type: 'level' },
    { id: 'sm2', name: '素早い斬撃', category: 'blade', type: 'level' },
    { id: 'sm3-2', name: 'バーサーク', category: 'blade', type: 'toggle' },
    // ... 片手剣固有の23個のスキル
  ],
  
  dualSword: [
    { id: 'Ms-blade', name: 'ブレードマスタリ', category: 'mastery', type: 'level' },
    { id: 'DSpena1', name: 'デュアルマスタリ', category: 'mastery', type: 'level' },
    // ... 双剣固有の14個のスキル
  ],
  
  // ... 他の武器種定義
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
      requirements: [{ 
        mainWeapon: ['oneHandSword', 'halberd', 'staff'] 
      }]
    }
  ],
  
  'magicDevice': [
    { id: 'mg2', name: '急速チャージ', category: 'magic', type: 'stack', maxStack: 15 },
    { id: 'mw1', name: 'P:コンバージョン', category: 'magicBlade', type: 'toggle' },
    { id: 'mw2', name: 'エンチャントバースト', category: 'magicBlade', type: 'toggle' },
    { id: 'mw3', name: 'デュアルブリンガー-旧', category: 'magicBlade', type: 'toggle' },
    { id: 'mw4', name: 'レゾナンス？', category: 'magicBlade', type: 'level' },
  ],
  
  'scroll': [
    { 
      id: 'ninja1', 
      name: '風遁の術', 
      category: 'ninja', 
      type: 'toggle',
      requirements: [{ 
        mainWeapon: ['oneHandSword', 'katana', 'staff', 'magicDevice'] 
      }]
    }
  ],
  
  'bowSpecial': [  // 弓専用の矢/抜刀剣サブ武器
    { id: 'sm3-1', name: 'バーサーク', category: 'blade', type: 'toggle' },
    { id: 'hunter5-1', name: 'フォーカス', category: 'hunter', type: 'level' }
  ]
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
  const availableSkills = useMemo(
    () => getAvailableSkills(mainWeapon, subWeapon),
    [mainWeapon, subWeapon]
  )
  
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
  
  return (
    <div className="space-y-6">
      {SKILL_CATEGORIES.map(category => (
        <BuffSkillSection
          key={category}
          category={category}
          skills={availableSkills.filter(s => s.category === category)}
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