# BuffSkillForm UI改善計画書

## 1. 現状分析

### 1.1 現在のUI構造
- **レイアウト**: カテゴリ別の折りたたみ式セクション
- **表示方式**: 縦積みの階層構造
- **操作方法**: カテゴリごとの開閉 + 個別スキル設定
- **問題点**:
  - カテゴリを開閉する手間
  - 全スキルを一覧できない
  - 画面占有率が高い

### 1.2 現在のコード構造
```typescript
// 現在の表示ロジック
const skillsByCategory = useMemo(() => {
  // カテゴリ別にグループ化
}, [dependencies])

// カテゴリ別レンダリング
{Object.entries(skillsByCategory).map(([category, skills]) => (
  <SkillCategorySection key={category} />
))}
```

## 2. 改善目標

### 2.1 新しいUI要件
- **レイアウト**: 5カラムのグリッド表示
- **表示方式**: 全スキルを平坦に一覧表示
- **操作方法**: 直接的なスキル設定（カテゴリ開閉なし）
- **利点**:
  - 全スキルが一目で確認可能
  - 操作ステップの削減
  - コンパクトな画面利用

### 2.2 技術要件
- **レスポンシブ対応**: 画面サイズに応じたカラム数調整
- **武器種連動**: マスタリスキルの動的表示は維持
- **アクセシビリティ**: キーボード操作・スクリーンリーダー対応
- **パフォーマンス**: 大量スキル表示時の最適化

## 3. 新しいUI設計

### 3.1 レイアウト構造
```
┌─────────────────────────────────────────────────────────────┐
│ バフスキル設定                                                │
├─────────────────────────────────────────────────────────────┤
│ [スキル1] [スキル2] [スキル3] [スキル4] [スキル5]               │
│ [スキル6] [スキル7] [スキル8] [スキル9] [スキル10]              │
│ [スキル11] [スキル12] [スキル13] [スキル14] [スキル15]          │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 個別スキルカードデザイン
```
┌─────────────────────────┐
│ マスタリ                 │  ← カテゴリラベル
│ ─────────────────────── │
│ スキル名          [●○]  │  ← トグルスイッチ（●=ON, ○=OFF）
│ ┌─────────┐             │
│ │レベル: 5│             │  ← パラメータがある場合のみ表示
│ └─────────┘             │
└─────────────────────────┘
```

### 3.3 レスポンシブブレークポイント
- **大画面 (≥1200px)**: 5カラム
- **中画面 (768-1199px)**: 4カラム  
- **小画面 (576-767px)**: 3カラム
- **極小画面 (≤575px)**: 2カラム

## 4. 技術実装設計

### 4.1 新しいコンポーネント構造
```typescript
// メインコンポーネント
export default function BuffSkillForm() {
  // 既存ロジック維持
  const flatSkillsList = useMemo(() => {
    // 武器種フィルタリングを適用した平坦なリストを生成
    // カテゴリ情報も含めて返す
    return storeBuffSkills.skills
      .filter(skill => {
        if (skill.category === 'mastery') {
          const visibleMasterySkills = getVisibleMasterySkills(mainWeaponType)
          if (visibleMasterySkills.length === 0) return false
          if (!visibleMasterySkills.includes(skill.id)) return false
        }
        return true
      })
      .map(skill => ({
        ...skill,
        categoryLabel: categoryNameMap[skill.category]
      }))
  }, [storeBuffSkills.skills, mainWeaponType])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">バフスキル設定</h2>
      
      <div className="grid grid-cols-5 gap-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
        {flatSkillsList.map(skill => (
          <SkillCard
            key={skill.id}
            skill={skill}
            categoryLabel={skill.categoryLabel}
            onToggle={handleSkillToggle}
            onParameterChange={handleParameterChange}
          />
        ))}
      </div>
    </div>
  )
}
```

### 4.2 CSS Grid実装
```css
.buff-skill-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  
  /* レスポンシブ */
  @media (max-width: 1199px) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  @media (max-width: 767px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 575px) {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### 4.3 スキルカードコンポーネント
```typescript
interface SkillCardProps {
  skill: BuffSkill
  categoryLabel: string  // カテゴリの日本語ラベル
  onToggle: (skillId: string, enabled: boolean) => void
  onParameterChange: (skillId: string, paramName: string, value: number) => void
}

function SkillCard({ skill, categoryLabel, onToggle, onParameterChange }: SkillCardProps) {
  const hasParameters = Object.keys(skill.parameters).length > 0
  
  return (
    <div className="skill-card border rounded-lg p-3 bg-white shadow-sm">
      {/* カテゴリラベル */}
      <div className="category-label text-xs text-gray-500 font-medium mb-2 pb-1 border-b border-gray-200">
        {categoryLabel}
      </div>
      
      {/* スキル名とトグルスイッチ */}
      <div className="skill-header flex items-center justify-between mb-2">
        <span className="skill-name text-sm font-medium text-gray-700 flex-1 mr-2">
          {skill.name}
        </span>
        <ToggleSwitch
          checked={skill.isEnabled}
          onChange={(checked) => onToggle(skill.id, checked)}
          size="sm"
        />
      </div>
      
      {/* パラメータ入力（有効時のみ表示） */}
      {skill.isEnabled && hasParameters && (
        <div className="skill-parameters space-y-2">
          {Object.entries(skill.parameters).map(([paramName, value]) => (
            <ParameterInput
              key={paramName}
              paramName={paramName}
              value={value}
              onChange={(newValue) => onParameterChange(skill.id, paramName, newValue)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// トグルスイッチコンポーネント
interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

function ToggleSwitch({ checked, onChange, size = 'md', disabled = false }: ToggleSwitchProps) {
  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-10 h-5', 
    lg: 'w-12 h-6'
  }
  
  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex ${sizeClasses[size]} rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 
        focus:ring-blue-500 focus:ring-offset-2
        ${checked ? 'bg-blue-600' : 'bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          ${thumbSizeClasses[size]} inline-block rounded-full bg-white shadow transform 
          transition duration-200 ease-in-out
          ${checked ? 'translate-x-4' : 'translate-x-0'}
        `}
      />
    </button>
  )
}
```

## 5. 実装手順

### 5.1 Phase 1: コアロジック変更
1. **スキルリスト平坦化**
   - `skillsByCategory` → `flatSkillsList`に変更
   - カテゴリ情報は保持しつつフラット配列生成
   - カテゴリラベルを各スキルに付与

2. **コンポーネント分離**
   - `SkillCard`コンポーネント作成
   - `ToggleSwitch`コンポーネント作成
   - `ParameterInput`コンポーネント作成

3. **UIロジック変更**
   - チェックボックス → トグルスイッチ変更
   - ラベル関連付けエラー修正

### 5.2 Phase 2: スタイリング実装
1. **CSS Gridレイアウト**
   - レスポンシブグリッド実装
   - カードデザイン作成（カテゴリラベル + スキル名 + トグル）

2. **トグルスイッチスタイリング**
   - 3サイズ対応（sm/md/lg）
   - 滑らかなアニメーション
   - アクセシビリティ配慮

3. **アクセシビリティ対応**
   - トグルスイッチの適切なARIA属性
   - キーボードナビゲーション実装
   - フォーカス管理

### 5.3 Phase 3: パフォーマンス最適化
1. **仮想化検討**
   - 大量スキル表示時の最適化
   - React.memo適用

2. **状態管理最適化**
   - 不要な依存関係削除
   - レンダリング回数削減

## 6. 品質保証

### 6.1 テスト項目
- **機能テスト**:
  - スキルオン/オフ切り替え
  - パラメータ変更
  - 武器種連動表示

- **UI/UXテスト**:
  - レスポンシブ動作
  - アクセシビリティ
  - パフォーマンス

### 6.2 ブラウザ対応
- Chrome, Firefox, Safari, Edge
- モバイルブラウザ対応
- 画面サイズ: 320px〜1920px

## 7. 実装上の注意点

### 7.1 既存機能との互換性
- 武器種連動フィルタリング機能は維持
- Zustand状態管理は変更なし
- マスタリスキルリセット機能は維持

### 7.2 ユーザビリティ配慮
- カテゴリラベルによる分類視認性
- スキル名の視認性確保
- トグルスイッチの操作性（チェックボックスより直感的）
- パラメータ入力の使いやすさ
- 誤操作防止（トグルスイッチの適切なサイズ）

### 7.3 パフォーマンス考慮
- 58スキル同時表示での性能
- リアルタイム更新の応答性
- メモリ使用量の最適化

## 8. 将来的な拡張性

### 8.1 フィルタリング機能
- スキル名検索
- カテゴリフィルタ
- 有効スキルのみ表示

### 8.2 表示オプション
- カード/リスト表示切り替え
- カラム数カスタマイズ
- スキル並び順変更

### 8.3 エクスポート機能
- スキル設定の共有
- プリセット保存
- 設定のインポート

---

この計画書に基づいて、段階的にBuffSkillFormのUI改善を実装します。