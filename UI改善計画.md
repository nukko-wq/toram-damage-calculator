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
- **関連ペア配置:** 各カテゴリ内でプロパティを関連ペア（%系+固定値）でグループ化
- **ペア配置:** ATK% + ATK、MATK% + MATKなど関連する項目を横並び
- **単独項目配置:** 
  - **%系単独項目（物理貫通%など）:** 左カラムに配置、右カラムは空白
  - **固定値単独項目（道具速度など）:** 右カラムに配置、左カラムは空白
  - **横幅統一:** ペア項目と同じ2カラムグリッド内で配置し、横幅を統一
- **論理的グループ化:** 機能的に関連するプロパティペアを隣接配置
- **一貫性:** 全ての行で2カラムグリッドを維持し、視覚的な整合性を保つ

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
        {/* 関連ペア配置 */}
        <div className="space-y-2">
          {group.propertyPairs.map((pair, index) => (
            <div key={index} className="grid grid-cols-2 gap-1">
              {pair.length === 2 ? (
                // ペア項目: %系と固定値系
                <>
                  <PropertyInput property={pair[0]} /> {/* %系 */}
                  <PropertyInput property={pair[1]} /> {/* 固定値 */}
                </>
              ) : pair.type === 'percent' ? (
                // %系単独項目: 左カラムに配置
                <>
                  <PropertyInput property={pair[0]} />
                  <div /> {/* 空白の右カラム */}
                </>
              ) : (
                // 固定値単独項目: 右カラムに配置
                <>
                  <div /> {/* 空白の左カラム */}
                  <PropertyInput property={pair[0]} />
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
      ['ATK_Rate', 'ATK'],                    // ATK%とATKのペア
      ['MATK_Rate', 'MATK'],                  // MATK%とMATKのペア
      ['WeaponATK_Rate', 'WeaponATK'],        // 武器ATK%と武器ATKのペア
      ['PhysicalPenetration_Rate'],           // 物理貫通%（単独）
      ['MagicalPenetration_Rate'],            // 魔法貫通%（単独）
      ['ElementAdvantage_Rate'],              // 属性有利%（単独）
      ['UnsheatheAttack_Rate', 'UnsheatheAttack'], // 抜刀威力%と抜刀威力のペア
      ['ShortRangeDamage_Rate'],              // 近距離威力%（単独）
      ['LongRangeDamage_Rate'],               // 遠距離威力%（単独）
      ['CriticalDamage_Rate', 'CriticalDamage'], // クリティカルダメージ%とクリティカルダメージのペア
      ['Critical_Rate', 'Critical'],          // クリティカル率%とクリティカル率のペア
      ['Stability_Rate'],                     // 安定率%（単独）
    ] as const,
  },
  {
    title: 'ステータス',
    propertyPairs: [
      ['HP_Rate', 'HP'],                      // HP%とHPのペア
      ['MP_Rate', 'MP'],                      // MP%とMPのペア
      ['STR_Rate', 'STR'],                    // STR%とSTRのペア
      ['INT_Rate', 'INT'],                    // INT%とINTのペア
      ['VIT_Rate', 'VIT'],                    // VIT%とVITのペア
      ['AGI_Rate', 'AGI'],                    // AGI%とAGIのペア
      ['DEX_Rate', 'DEX'],                    // DEX%とDEXのペア
      ['Accuracy_Rate', 'Accuracy'],          // 命中%と命中のペア
      ['Dodge_Rate', 'Dodge'],                // 回避%と回避のペア
      ['AttackSpeed_Rate', 'AttackSpeed'],    // 攻撃速度%と攻撃速度のペア
      ['CastingSpeed_Rate', 'CastingSpeed'],  // 詠唱速度%と詠唱速度のペア
      ['MotionSpeed_Rate'],                   // 行動速度%（単独）
    ] as const,
  },
  // ... 計8カテゴリ
] as const
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
- **関連ペア配置:** ATK%とATKなど関連項目が隣接配置され、関連性が明確
- **入力効率:** 同じステータスの%と固定値を連続して設定可能
- **柔軟なレイアウト:** ペア項目は横並び、単独項目は1列で最適配置
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