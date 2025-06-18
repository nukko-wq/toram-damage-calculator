# EquipmentForm UI改善計画書

## 改善の背景

### 改善前の問題点
- 17のカテゴリが縦に配置され、スクロールが非常に長い
- 全てのプロパティが同じ優先度で表示されている
- よく使用する項目と使用頻度の低い項目が混在している
- ユーザーが目的のプロパティを見つけるのに時間がかかる

### 改善の目標
- ユーザビリティの向上
- よく使用されるプロパティへの素早いアクセス
- UI操作の効率化
- 縦スクロールの大幅削減

## 改善内容

### 1. 横スクロールタブ式レイアウトの採用

**従来:** 縦に17カテゴリを配置
```
攻撃力
├─ ATK%, ATK, MATK%, MATK...
防御力  
├─ DEF%, DEF, MDEF%, MDEF
...（長いスクロール）
```

**改善後:** 水平タブで切り替え
```
[攻撃・威力★] [クリティカル★] [ステータス★] [HP・MP・速度★] → スクロール →
```

### 2. 使用頻度に基づくカテゴリ再編成

#### 高頻度（★ よく使う）- 優先表示
1. **攻撃・威力**
   - ATK%, ATK, MATK%, MATK, 武器ATK%, 武器ATK
   - 物理貫通%, 魔法貫通%, 属性有利%
   - 抜刀威力%, 抜刀威力, 近距離威力%, 遠距離威力%
   - クリティカルダメージ%, クリティカルダメージ
   - クリティカル率%, クリティカル率, 安定率%

2. **ステータス**
   - HP%, HP, MP%, MP
   - STR%, STR, INT%, INT, VIT%, VIT
   - AGI%, AGI, DEX%, DEX
   - 命中%, 命中, 回避%, 回避
   - 攻撃速度%, 攻撃速度, 詠唱速度%, 詠唱速度, 行動速度%

3. **継戦補助**
   - 攻撃MP回復%, 攻撃MP回復
   - 物理耐性%, 魔法耐性%, 異常耐性%
   - ヘイト%, 復帰短縮%
   - HP自然回復%, HP自然回復, MP自然回復%, MP自然回復

4. **戦闘補助**
   - 防御崩し%, 先読み%
   - Guard力%, Guard回復%, Avoid回復%
   - 道具速度
   - 絶対命中%, 絶対回避%

#### 低頻度（使用頻度低）- 後方配置
5. **ステータス連動攻撃力**
6. **属性耐性**
7. **ダメージ軽減**
8. **バリア/追撃**
   - 物理バリア, 魔法バリア, 割合バリア, バリア速度%
   - 物理追撃%, 魔法追撃%

### 3. 視覚的改善

#### 8カラムグリッドレイアウト
- **グリッド構成:** 8カラムの固定グリッド（`grid-cols-8`）
- **横スクロール:** 全体を`overflow-x-auto`で水平スクロール可能
- **タブ廃止:** プロパティタブシステムを廃止し、全カテゴリを同時表示
- **コンパクト設計:** 各カテゴリを縦長のカラムとして配置

#### カテゴリ内レイアウト
- **ラベル統一配置:** 各プロパティのラベルを行の左端に配置し、Inputフィールドを右側に配置
  - **ペア項目例:** 「ATK」ラベル + ATK%入力 + ATK入力（ATK%、ATKの個別ラベルなし）
  - **単独項目例:** 「物理貫通」ラベル + 物理貫通%入力（物理貫通%の個別ラベルなし）
- **カテゴリヘッダー:** 各カテゴリの最上部に「%」「+」の列見出しを表示
  - **3列レイアウト:** [プロパティ名] [%系] [固定値系] の構成
  - **見出し表示:** 1行目のみに「%」「+」を表示、以降の行は入力フィールドのみ
- **関連ペア配置:** 各カテゴリ内でプロパティを関連ペア（%系+固定値）でグループ化
- **単独項目配置:** 
  - **%系単独項目（物理貫通%など）:** %系列に配置、固定値列は空白
  - **固定値単独項目（道具速度など）:** 固定値列に配置、%系列は空白
- **論理的グループ化:** 機能的に関連するプロパティペアを隣接配置
- **一貫性:** 全ての行で3列グリッドを維持し、視覚的な整合性を保つ

#### カテゴリ表示
- **カテゴリヘッダー:** 各カラムの上部にカテゴリ名を表示
- **シンプルデザイン:** 装飾的な優先度表示は廃止
- **統一ボーダー:** 全カテゴリで統一されたグレーボーダー（`border-gray-300`）

#### スクロール機能
- 水平スクロール対応（`overflow-x-auto`）
- スクロールバー表示（ユーザビリティのため）
- タッチデバイス対応
- 左端に重要カテゴリ、右端に低頻度カテゴリを配置

### 4. 技術実装

#### フレックスレイアウト
```typescript
// フレックスレイアウトでカテゴリを横並び配置
<div className="overflow-x-auto w-full">
  <div className="flex gap-4 min-w-max">
    {propertyGroups.map((group) => (
      <div key={group.title} className="w-48 flex-shrink-0 border border-gray-300 rounded-lg p-3">
        <h4 className="font-medium text-gray-700 mb-3 text-sm sticky top-0 bg-white">
          {group.title}
        </h4>
        {/* 列見出し */}
        <div className="grid grid-cols-3 gap-1 mb-2 text-xs text-gray-500 font-medium">
          <div>プロパティ</div>
          <div className="text-center">%</div>
          <div className="text-center">+</div>
        </div>
        {/* プロパティ行 */}
        <div className="space-y-1">
          {group.propertyPairs.map((pair) => (
            <div key={pair.properties[0]} className="grid grid-cols-3 gap-1 items-center">
              <div className="text-xs text-gray-700 font-medium">
                {getBasePropertyLabel(pair.properties[0])} {/* プロパティ名のみ */}
              </div>
              {pair.type === 'pair' ? (
                // ペア項目: %系と固定値系
                <>
                  <PropertyInput property={pair.properties[0]} hideLabel /> {/* %系 */}
                  <PropertyInput property={pair.properties[1]} hideLabel /> {/* 固定値 */}
                </>
              ) : pair.type === 'percent' ? (
                // %系単独項目: %列に配置
                <>
                  <PropertyInput property={pair.properties[0]} hideLabel />
                  <div /> {/* 空白の固定値列 */}
                </>
              ) : (
                // 固定値単独項目: 固定値列に配置
                <>
                  <div /> {/* 空白の%列 */}
                  <PropertyInput property={pair.properties[0]} hideLabel />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
</div>
```

#### データ構造
```typescript
const propertyGroups = [
  {
    title: '攻撃・威力',
    propertyPairs: [
      { properties: ['ATK_Rate', 'ATK'], type: 'pair' },              // ATK%とATKのペア
      { properties: ['MATK_Rate', 'MATK'], type: 'pair' },            // MATK%とMATKのペア
      { properties: ['WeaponATK_Rate', 'WeaponATK'], type: 'pair' },  // 武器ATK%と武器ATKのペア
      { properties: ['PhysicalPenetration_Rate'], type: 'percent' },  // 物理貫通%（単独）
      { properties: ['MagicalPenetration_Rate'], type: 'percent' },   // 魔法貫通%（単独）
      { properties: ['ElementAdvantage_Rate'], type: 'percent' },     // 属性有利%（単独）
      { properties: ['UnsheatheAttack_Rate', 'UnsheatheAttack'], type: 'pair' }, // 抜刀威力%と抜刀威力のペア
      { properties: ['ShortRangeDamage_Rate'], type: 'percent' },     // 近距離威力%（単独）
      { properties: ['LongRangeDamage_Rate'], type: 'percent' },      // 遠距離威力%（単独）
      { properties: ['CriticalDamage_Rate', 'CriticalDamage'], type: 'pair' }, // クリティカルダメージ%とクリティカルダメージのペア
      { properties: ['Critical_Rate', 'Critical'], type: 'pair' },    // クリティカル率%とクリティカル率のペア
      { properties: ['Stability_Rate'], type: 'percent' },            // 安定率%（単独）
    ] as const,
  },
  {
    title: 'ステータス',
    propertyPairs: [
      { properties: ['HP_Rate', 'HP'], type: 'pair' },               // HP%とHPのペア
      { properties: ['MP_Rate', 'MP'], type: 'pair' },               // MP%とMPのペア
      { properties: ['STR_Rate', 'STR'], type: 'pair' },             // STR%とSTRのペア
      { properties: ['INT_Rate', 'INT'], type: 'pair' },             // INT%とINTのペア
      { properties: ['VIT_Rate', 'VIT'], type: 'pair' },             // VIT%とVITのペア
      { properties: ['AGI_Rate', 'AGI'], type: 'pair' },             // AGI%とAGIのペア
      { properties: ['DEX_Rate', 'DEX'], type: 'pair' },             // DEX%とDEXのペア
      { properties: ['Accuracy_Rate', 'Accuracy'], type: 'pair' },   // 命中%と命中のペア
      { properties: ['Dodge_Rate', 'Dodge'], type: 'pair' },         // 回避%と回避のペア
      { properties: ['AttackSpeed_Rate', 'AttackSpeed'], type: 'pair' }, // 攻撃速度%と攻撃速度のペア
      { properties: ['CastingSpeed_Rate', 'CastingSpeed'], type: 'pair' }, // 詠唱速度%と詠唱速度のペア
      { properties: ['MotionSpeed_Rate'], type: 'percent' },         // 行動速度%（単独）
    ] as const,
  },
  // ... 計8カテゴリ
] as const

// プロパティのベース名を取得する関数
const getBasePropertyLabel = (property: keyof EquipmentProperties): string => {
  const baseLabels: Record<string, string> = {
    'ATK_Rate': 'ATK',      'ATK': 'ATK',
    'MATK_Rate': 'MATK',    'MATK': 'MATK',
    'WeaponATK_Rate': '武器ATK', 'WeaponATK': '武器ATK',
    'PhysicalPenetration_Rate': '物理貫通',
    'MagicalPenetration_Rate': '魔法貫通',
    'ElementAdvantage_Rate': '属性有利',
    'UnsheatheAttack_Rate': '抜刀威力', 'UnsheatheAttack': '抜刀威力',
    'ShortRangeDamage_Rate': '近距離威力',
    'LongRangeDamage_Rate': '遠距離威力',
    'CriticalDamage_Rate': 'クリティカルダメージ', 'CriticalDamage': 'クリティカルダメージ',
    'Critical_Rate': 'クリティカル率', 'Critical': 'クリティカル率',
    'Stability_Rate': '安定率',
    'ItemCooldown': '道具速度',
    // ... その他のプロパティ
  }
  
  // プロパティ名から_Rate, _などの接尾辞を除去してベース名を返す
  for (const [key, label] of Object.entries(baseLabels)) {
    if (property === key) return label
  }
  
  // フォールバック: _Rateを除去してベース名を生成
  return property.replace(/_Rate$/, '').replace(/_/g, '')
}
```

#### レスポンシブ対応
```css
/* モバイル対応 */
.property-grid {
  min-width: 800px; /* 最小幅を設定 */
  grid-template-columns: repeat(8, minmax(120px, 1fr));
}

/* スクロールバー表示 */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}
```

## 実装結果

### 達成された改善点
1. **一覧性向上:** 8カテゴリを同時表示、タブ切り替え不要
2. **横スクロール設計:** 縦長レイアウトから横長レイアウトに変更
3. **論理的配置:** 重要カテゴリを左側、低頻度カテゴリを右側に配置
4. **シンプルデザイン:** 統一されたボーダーでスッキリとした見た目
5. **コンパクト化:** 8カテゴリに統合し、関連項目をグループ化

### ユーザーエクスペリエンス向上
- **一目で把握:** 全カテゴリが一覧できるため、どこに何があるかすぐわかる
- **効率的編集:** タブ切り替えなしで複数カテゴリの値を連続編集可能
- **直感的配置:** 左から右へ使用頻度順に配置
- **スムーズなスクロール:** 横スクロールで自然なナビゲーション
- **統一ラベル:** プロパティ名を行の左端に統一配置し、視覚的整理を実現
- **列見出し:** 各カテゴリ上部の「%」「+」見出しで入力内容が一目で分かる
- **入力効率:** 同じプロパティの%と固定値を横並びで連続設定可能
- **ラベル簡略化:** 「ATK%」「ATK」→「ATK」として冗長性を排除
- **3列レイアウト:** [プロパティ名][%系][固定値系]の論理的な列構成
- **視覚的整理:** 関連性に基づく論理的なグループ化でズレを防止

## 今後の拡張可能性

### カスタマイズ機能
- ユーザー独自の優先度設定
- よく使うプロパティのお気に入り機能
- カテゴリの並び順カスタマイズ

### 検索・フィルタ機能
- プロパティ名での検索
- 値が設定されているプロパティのハイライト
- ゼロ以外の値のみ表示するフィルタ

---

**実装日:** 2025-06-18  
**対象ファイル:** `src/components/EquipmentForm.tsx`, `src/app/globals.css`  
**実装者:** Claude Code  
**ステータス:** 完了