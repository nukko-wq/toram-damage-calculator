# StatusPreview フィルター機能設計書

## 概要

StatusPreviewコンポーネントの装備品補正値1〜3セクションに、データソース別フィルター機能を追加します。各補正値のタイトル右側にフィルタードロップダウンを配置し、選択したソースの合計値のみを表示できるようにします。

**重要**: このフィルター機能は**表示専用**であり、基本ステータス、補正後ステータス、ダメージ計算などの計算ロジックには一切影響しません。計算は常に全データソースの合計値を使用します。

## 要求仕様

### フィルターオプション
1. **全ての合計値** - 現在の表示（デフォルト）
2. **メイン装備** - main装備スロットの補正値のみ
3. **サブ装備** - subWeapon装備スロットの補正値のみ
4. **体装備** - body装備スロットの補正値のみ
5. **追加装備** - additional装備スロットの補正値のみ
6. **特殊装備** - special装備スロットの補正値のみ
7. **エンチャント** - fashion1〜3の合計補正値
8. **自由入力1** - freeInput1の補正値のみ
9. **自由入力2** - freeInput2の補正値のみ
10. **自由入力3** - freeInput3の補正値のみ
11. **クリスタ** - 全クリスタルスロットの合計補正値
12. **料理** - 全料理効果の合計補正値
13. **アイテムバフ** - バフアイテムの合計補正値
14. **スキルバフ** - バフスキルの合計補正値

## 技術設計

### 1. データソース分離の実装

#### 新規関数の追加（dataSourceIntegration.ts）

```typescript
/**
 * 装備スロット別の補正値を取得
 */
export function getEquipmentSlotBonuses(equipmentData: any): Record<string, Partial<AllBonuses>> {
  const bonuses: Record<string, Partial<AllBonuses>> = {
    main: {},
    body: {},
    additional: {},
    special: {},
    subWeapon: {},
    fashion1: {},
    fashion2: {},
    fashion3: {},
    freeInput1: {},
    freeInput2: {},
    freeInput3: {},
  }

  // 各スロットごとに個別計算
  const slots = [
    { key: 'main', data: equipmentData.main },
    { key: 'body', data: equipmentData.body },
    { key: 'additional', data: equipmentData.additional },
    { key: 'special', data: equipmentData.special },
    { key: 'subWeapon', data: equipmentData.subWeapon },
    { key: 'fashion1', data: equipmentData.fashion1 },
    { key: 'fashion2', data: equipmentData.fashion2 },
    { key: 'fashion3', data: equipmentData.fashion3 },
    { key: 'freeInput1', data: equipmentData.freeInput1 },
    { key: 'freeInput2', data: equipmentData.freeInput2 },
    { key: 'freeInput3', data: equipmentData.freeInput3 },
  ]

  for (const slot of slots) {
    if (slot.data?.properties) {
      for (const [propertyKey, value] of Object.entries(slot.data.properties)) {
        if (typeof value === 'number' && value !== 0) {
          const validatedValue = validatePropertyValue(value, propertyKey)
          const normalizedKey = normalizePropertyKey(propertyKey)
          bonuses[slot.key][normalizedKey as keyof AllBonuses] = validatedValue
        }
      }
    }
  }

  return bonuses
}

/**
 * エンチャント（オシャレ装備）の合計補正値を取得
 */
export function getEnchantmentBonuses(equipmentData: any): Partial<AllBonuses> {
  const bonuses: Partial<AllBonuses> = {}
  const slots = [equipmentData.fashion1, equipmentData.fashion2, equipmentData.fashion3]

  for (const slot of slots) {
    if (slot?.properties) {
      for (const [propertyKey, value] of Object.entries(slot.properties)) {
        if (typeof value === 'number' && value !== 0) {
          const validatedValue = validatePropertyValue(value, propertyKey)
          const normalizedKey = normalizePropertyKey(propertyKey)
          bonuses[normalizedKey as keyof AllBonuses] = 
            (bonuses[normalizedKey as keyof AllBonuses] || 0) + validatedValue
        }
      }
    }
  }

  return bonuses
}

/**
 * データソース別補正値を一括取得
 */
export function getDetailedDataSourceBonuses(data: CalculatorData): DetailedDataSourceBonuses {
  const equipmentSlots = getEquipmentSlotBonuses(data.equipment)
  
  return {
    equipment: {
      main: equipmentSlots.main,
      body: equipmentSlots.body,
      additional: equipmentSlots.additional,
      special: equipmentSlots.special,
      subWeapon: equipmentSlots.subWeapon,
      fashion1: equipmentSlots.fashion1,
      fashion2: equipmentSlots.fashion2,
      fashion3: equipmentSlots.fashion3,
      freeInput1: equipmentSlots.freeInput1,
      freeInput2: equipmentSlots.freeInput2,
      freeInput3: equipmentSlots.freeInput3,
      enchantment: getEnchantmentBonuses(data.equipment),
    },
    crystal: getCrystalBonuses(data.crystals),
    food: getFoodBonuses(data.food),
    buffItems: getBuffBonuses(data.buffItems),
    buffSkills: getBuffSkillBonuses(data.buffSkills?.skills || null, data.mainWeapon?.weaponType || null),
  }
}
```

#### 型定義の追加（types/bonusCalculation.ts）

```typescript
export interface DetailedDataSourceBonuses {
  equipment: {
    main: Partial<AllBonuses>
    body: Partial<AllBonuses>
    additional: Partial<AllBonuses>
    special: Partial<AllBonuses>
    subWeapon: Partial<AllBonuses>
    fashion1: Partial<AllBonuses>
    fashion2: Partial<AllBonuses>
    fashion3: Partial<AllBonuses>
    freeInput1: Partial<AllBonuses>
    freeInput2: Partial<AllBonuses>
    freeInput3: Partial<AllBonuses>
    enchantment: Partial<AllBonuses>
  }
  crystal: Partial<AllBonuses>
  food: Partial<AllBonuses>
  buffItems: Partial<AllBonuses>
  buffSkills: Partial<AllBonuses>
}

export type FilterOption = 
  | 'all'
  | 'main'
  | 'subWeapon' 
  | 'body'
  | 'additional'
  | 'special'
  | 'enchantment'
  | 'freeInput1'
  | 'freeInput2'
  | 'freeInput3'
  | 'crystal'
  | 'food'
  | 'buffItems'
  | 'buffSkills'
```

### 2. UIコンポーネントの実装

#### フィルタードロップダウンコンポーネント

```typescript
interface FilterDropdownProps {
  value: FilterOption
  onChange: (value: FilterOption) => void
  className?: string
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ value, onChange, className }) => {
  const options = [
    { value: 'all', label: '全ての合計値' },
    { value: 'main', label: 'メイン装備' },
    { value: 'subWeapon', label: 'サブ装備' },
    { value: 'body', label: '体装備' },
    { value: 'additional', label: '追加装備' },
    { value: 'special', label: '特殊装備' },
    { value: 'enchantment', label: 'エンチャント' },
    { value: 'freeInput1', label: '自由入力1' },
    { value: 'freeInput2', label: '自由入力2' },
    { value: 'freeInput3', label: '自由入力3' },
    { value: 'crystal', label: 'クリスタ' },
    { value: 'food', label: '料理' },
    { value: 'buffItems', label: 'アイテムバフ' },
    { value: 'buffSkills', label: 'スキルバフ' },
  ]

  return (
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value as FilterOption)}
      className={`px-2 py-1 text-xs border rounded ${className}`}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
```

### 3. StatusPreviewの更新

#### 状態管理の追加

```typescript
const [filters, setFilters] = useState({
  equipmentBonus1: 'all' as FilterOption,
  equipmentBonus2: 'all' as FilterOption,
  equipmentBonus3: 'all' as FilterOption,
})

const handleFilterChange = (section: keyof typeof filters, value: FilterOption) => {
  setFilters(prev => ({
    ...prev,
    [section]: value
  }))
}
```

#### フィルター適用ロジック

```typescript
const getFilteredBonuses = (
  detailedBonuses: DetailedDataSourceBonuses,
  filter: FilterOption
): Partial<AllBonuses> => {
  switch (filter) {
    case 'all':
      // 既存のロジック（全ての合計）
      return getAllDataSourceBonusesWithBuffSkills(data)
    case 'main':
      return detailedBonuses.equipment.main
    case 'subWeapon':
      return detailedBonuses.equipment.subWeapon
    case 'body':
      return detailedBonuses.equipment.body
    case 'additional':
      return detailedBonuses.equipment.additional
    case 'special':
      return detailedBonuses.equipment.special
    case 'enchantment':
      return detailedBonuses.equipment.enchantment
    case 'freeInput1':
      return detailedBonuses.equipment.freeInput1
    case 'freeInput2':
      return detailedBonuses.equipment.freeInput2
    case 'freeInput3':
      return detailedBonuses.equipment.freeInput3
    case 'crystal':
      return detailedBonuses.crystal
    case 'food':
      return detailedBonuses.food
    case 'buffItems':
      return detailedBonuses.buffItems
    case 'buffSkills':
      return detailedBonuses.buffSkills
    default:
      return {}
  }
}
```

#### タイトル部分の更新

```typescript
// StatSectionコンポーネントにフィルター機能を追加
const StatSectionWithFilter: React.FC<{
  title: string
  stats: Record<string, any>
  labels: Record<string, string>
  displayMode: string
  propertyOrder: string[]
  propertyConfigs: Record<string, any>
  className: string
  filter: FilterOption
  onFilterChange: (value: FilterOption) => void
}> = ({ title, filter, onFilterChange, ...props }) => {
  return (
    <div className="stat-section">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <FilterDropdown 
          value={filter}
          onChange={onFilterChange}
          className="ml-2"
        />
      </div>
      <StatSection {...props} />
    </div>
  )
}
```

## 実装手順

1. **型定義の追加** - `types/bonusCalculation.ts`に新しい型を追加
2. **データソース分離関数の実装** - `dataSourceIntegration.ts`に新機能を追加
3. **FilterDropdownコンポーネントの作成** - 新規ファイルまたはStatusPreview内に実装
4. **StatusPreviewの更新** - フィルター状態管理とUI統合
5. **StatSectionコンポーネントの拡張** - フィルター機能対応

## UI/UX仕様

- フィルタードロップダウンは各補正値セクションのタイトル右側に配置
- デフォルトは「全ての合計値」
- フィルター変更時は即座に表示内容が更新される
- フィルター選択状態は各セクション独立して管理

## 計算への影響

**フィルター機能は表示のみに影響し、計算ロジックには一切影響しません**：

### 影響しない計算
- 基本ステータス計算（HP、MP、ATK、MATK等）
- 補正後ステータス計算（STR、AGI、INT等）
- ダメージ計算
- クリティカル率・ダメージ計算
- その他全ての計算

### 影響する表示
- 装備品補正値1〜3セクションの表示データのみ

この設計により、ユーザーは各データソースの個別寄与度を詳細に確認できるようになり、同時に計算の正確性も保たれます。