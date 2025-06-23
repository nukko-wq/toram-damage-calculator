# 基本ステータス計算式

## 概要
キャラクターの基本的な生存力を表すHPとMPの計算式について記述する。

## HP（ヒットポイント）計算

### 基本計算式
```
HP = INT(INT(93+(補正後VIT+22.41)*Lv/3)*(1+HP%/100))+HP固定値
```

**注意:** `INT(数値)`は小数点以下を切り捨てる関数（ステータスのINTとは異なる）
- 例: INT(-2.7) = -3

### 詳細計算

#### 1. 補正後VIT計算
```
補正後VIT = ステータスのVIT × (1 + VIT%/100) + VIT固定値
```

**構成要素:**
- **VIT%**: 装備/プロパティとセットしてあるクリスタ、バフアイテムのVIT%の合計
- **VIT固定値**: 装備/プロパティとセットしてあるクリスタ、バフアイテムのVIT固定値の合計

**計算例:**
- ステータスのVIT: 200
- VIT%: 15% (装備+クリスタ)
- VIT固定値: 30 (装備+クリスタ)
- 補正後VIT = 200 × (1 + 15/100) + 30 = 200 × 1.15 + 30 = 230 + 30 = 260

#### 2. HP基本値計算
```
HP基本値 = INT(93 + (補正後VIT + 22.41) × Lv / 3)
```

**計算例:**
- 補正後VIT: 260
- Lv: 150
- HP基本値 = INT(93 + (260 + 22.41) × 150 / 3)
- HP基本値 = INT(93 + 282.41 × 50)
- HP基本値 = INT(93 + 14120.5)
- HP基本値 = INT(14213.5) = 14213

#### 3. HP%補正適用
```
HP%適用後 = INT(HP基本値 × (1 + HP%/100))
```

**構成要素:**
- **HP%**: 装備/プロパティとセットしてあるクリスタ、バフアイテムのHP%の合計

**計算例:**
- HP基本値: 14213
- HP%: 25% (装備+クリスタ+バフアイテム)
- HP%適用後 = INT(14213 × (1 + 25/100))
- HP%適用後 = INT(14213 × 1.25)
- HP%適用後 = INT(17766.25) = 17766

#### 4. 最終HP計算
```
最終HP = HP%適用後 + HP固定値
```

**構成要素:**
- **HP固定値**: 装備/プロパティとセットしてあるクリスタ、バフアイテムのHP固定値の合計

**計算例:**
- HP%適用後: 17766
- HP固定値: 200 (装備+クリスタ+バフアイテム)
- 最終HP = 17766 + 200 = 17966

### 完全計算例
**入力値:**
- ステータスのVIT: 200
- Lv: 150
- VIT%: 15%
- VIT固定値: 30
- HP%: 25%
- HP固定値: 200

**計算手順:**
1. 補正後VIT = 200 × (1 + 15/100) + 30 = 260
2. HP基本値 = INT(93 + (260 + 22.41) × 150 / 3) = INT(14213.5) = 14213
3. HP%適用後 = INT(14213 × (1 + 25/100)) = INT(17766.25) = 17766
4. 最終HP = 17766 + 200 = 17966

## MP（マジックポイント）計算

### 基本計算式
```
最終MP = MP基本値 + 装備MP補正 + クリスタMP補正 + 料理MP補正 + スキルMP補正
```

### 詳細計算

#### 1. MP基本値計算
```
MP基本値 = (INT × 2) + (MEN × 1.5) + (レベル × 2) + 50
```

**計算例:**
- INT: 150, MEN: 100, レベル: 150の場合
- MP基本値 = (150 × 2) + (100 × 1.5) + (150 × 2) + 50
- MP基本値 = 300 + 150 + 300 + 50 = 800

#### 2. 装備MP補正
HPと同様に固定値と%値の2種類:

**a) 固定MP補正**
```
装備MP固定補正 = Σ(各装備のMP固定値)
```

**b) MP%補正**
```
装備MP%補正 = MP基本値 × (Σ(各装備のMP%値) / 100)
```

#### 3. クリスタMP補正
**a) 固定MP補正**
```
クリスタMP固定補正 = Σ(各クリスタのMP固定値)
```

**b) MP%補正**
```
クリスタMP%補正 = MP基本値 × (Σ(各クリスタのMP%値) / 100)
```

#### 4. 最終MP計算
```
最終MP = MP基本値 + 装備MP固定補正 + 装備MP%補正 + クリスタMP固定補正 + クリスタMP%補正 + その他補正
```

**完全計算例:**
- MP基本値: 800
- 装備MP固定補正: +50
- 装備MP%補正: +80 (10%)
- クリスタMP固定補正: +30
- 最終MP = 800 + 50 + 80 + 30 = 960

## 実装における注意点

### 端数処理
- **HP計算**: INT()関数による切り捨て処理を2段階で実施
  - HP基本値計算時: `INT(93+(補正後VIT+22.41)*Lv/3)`
  - HP%適用時: `INT(HP基本値*(1+HP%/100))`
- **MP計算**: 従来通り小数点以下切り捨て
- **負数の切り捨て**: INT(-2.7) = -3（より小さい整数）

### HP計算順序（新計算式）
1. **VIT補正計算**: ステータスVIT × (1 + VIT%/100) + VIT固定値
2. **HP基本値計算**: INT(93 + (補正後VIT + 22.41) × Lv / 3)
3. **HP%補正適用**: INT(HP基本値 × (1 + HP%/100))
4. **HP固定値加算**: HP%適用後 + HP固定値

### MP計算順序（従来通り）
1. MP基本値計算（INT、MEN、レベルから）
2. 装備固定値補正の加算
3. 装備%補正の計算と加算
4. クリスタ固定値補正の加算
5. クリスタ%補正の計算と加算
6. その他バフ補正の加算

### TypeScript実装例
```typescript
interface BasicStatsCalculation {
  calculateHP(stats: BaseStats, allBonuses: AllBonuses): number {
    // 1. 補正後VIT計算
    const vitPercent = allBonuses.VIT_Rate || 0
    const vitFixed = allBonuses.VIT || 0
    const adjustedVIT = stats.VIT * (1 + vitPercent / 100) + vitFixed
    
    // 2. HP基本値計算
    const baseHP = Math.floor(93 + (adjustedVIT + 22.41) * stats.level / 3)
    
    // 3. HP%補正適用
    const hpPercent = allBonuses.HP_Rate || 0
    const hpAfterPercent = Math.floor(baseHP * (1 + hpPercent / 100))
    
    // 4. HP固定値加算
    const hpFixed = allBonuses.HP || 0
    
    // 5. 最終HP
    return hpAfterPercent + hpFixed
  }

  calculateMP(stats: BaseStats, equipmentBonus: EquipmentBonus, crystalBonus: CrystalBonus): number {
    // MP基本値
    const baseMP = Math.floor(stats.INT * 2) + Math.floor(stats.MEN * 1.5) + (stats.level * 2) + 50
    
    // 装備補正（HPと同様の処理）
    const equipmentFixedMP = equipmentBonus.MP || 0
    const equipmentPercentMP = Math.floor(baseMP * (equipmentBonus.MP_Rate || 0) / 100)
    
    // クリスタ補正
    const crystalFixedMP = crystalBonus.MP || 0
    const crystalPercentMP = Math.floor(baseMP * (crystalBonus.MP_Rate || 0) / 100)
    
    // 最終MP
    return baseMP + equipmentFixedMP + equipmentPercentMP + crystalFixedMP + crystalPercentMP
  }
}

// AllBonusesはequipment, crystal, food, buffの全補正値をまとめたもの
interface AllBonuses {
  VIT?: number          // VIT固定値の合計
  VIT_Rate?: number     // VIT%の合計
  HP?: number           // HP固定値の合計
  HP_Rate?: number      // HP%の合計
  // その他のステータス...
}
```

## 検証データ

### HP計算検証例（新計算式）
| VIT | Lv | VIT% | VIT固定 | HP% | HP固定 | 期待HP | 実測HP | 状態 |
|-----|----|----- |---------|-----|--------|--------|--------|------|
| 100 | 100 | 0% | 0 | 0% | 0 | 4776 | - | 🔄 |
| 200 | 150 | 15% | 30 | 25% | 200 | 17966 | - | 🔄 |
| 300 | 200 | 20% | 50 | 30% | 300 | 33614 | - | 🔄 |

**計算詳細例（VIT:200, Lv:150）:**
1. 補正後VIT = 200 × 1.15 + 30 = 260
2. HP基本値 = INT(93 + (260 + 22.41) × 150 / 3) = 14213
3. HP%適用後 = INT(14213 × 1.25) = 17766
4. 最終HP = 17766 + 200 = 17966

### MP計算検証例
| INT | MEN | レベル | 装備MP | 装備MP% | 期待MP | 実測MP | 状態 |
|-----|-----|-------|--------|---------|--------|--------|------|
| 100 | 50  | 100   | 0      | 0%      | 525    | 525    | ✅   |
| 150 | 100 | 150   | 50     | 10%     | 960    | -      | 🔄   |
| 200 | 150 | 200   | 100    | 15%     | 1365   | -      | 🔄   |

**凡例:**
- ✅: 検証済み（正確）
- 🔄: 検証待ち
- ❌: 要修正

## 更新履歴

| 日付 | 更新内容 | 備考 |
|------|----------|------|
| 2024-06-23 | HP・MP計算式の初期作成 | 基本的な計算式を記述 |
| 2024-06-23 | HP計算式を正確な式に修正 | INT()関数使用、補正後VIT導入、2段階計算に変更 |

## 関連ドキュメント
- [計算式概要](./overview.md)
- [装備品補正値計算](./equipment-bonuses.md)
- [クリスタ効果計算](./crystal-effects.md)