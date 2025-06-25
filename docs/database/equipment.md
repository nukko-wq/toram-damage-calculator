# 装備データベース設計

## ファイル構成・データフロー
**初期データ配置**:
- **プリセットデータ**: `src/data/equipments.json`（静的ファイル）

**アプリ起動時の処理**:
```
アプリ起動 → プリセットJSONを読み込み → LocalStorageにコピー → 以降はLocalStorageから参照
```

**ローカルストレージキー**:
- **プリセット装備（コピー済み）**: LocalStorage (`preset_equipments`)
- **ユーザーカスタムデータ**: LocalStorage (`custom_equipments`)
- **統合アクセス**: 両方のデータを統一的に管理

## JSON構造

**プリセット装備データ構造**（初期配置用）:
```json
{
  "equipments": {
    "mainWeapon": [装備アイテム配列],
    "body": [装備アイテム配列],
    "additional": [装備アイテム配列],
    "special": [装備アイテム配列],
    "subWeapon": [装備アイテム配列],
    "fashion1": [装備アイテム配列],
    "fashion2": [装備アイテム配列],
    "fashion3": [装備アイテム配列],
    "freeInput1": [装備アイテム配列],
    "freeInput2": [装備アイテム配列],
    "freeInput3": [装備アイテム配列]
  }
}
```

**LocalStorage保存時の装備データ構造**（拡張版）:
```json
{
  "id": "equipment_id",
  "name": "装備名",
  "properties": { /* プロパティ */ },
  "source": "入手方法",
  "weaponStats": { /* mainWeapon専用 */ },
  "crystalSlots": { /* クリスタルスロット */ },
  "isPreset": true,           // プリセット由来フラグ
  "isFavorite": false,        // お気に入り設定
  "createdAt": "ISO string",  // 作成日時
  "updatedAt": "ISO string"   // 更新日時
}
```

## 装備アイテム構造

**プリセット装備インターフェース**（初期配置用）:
```typescript
interface PresetEquipment {
  id: string                    // 一意識別子
  name: string                  // 装備名
  properties: Partial<EquipmentProperties> // 付与プロパティ（PascalCase統一済み）
  source?: string              // 入手方法
  weaponStats?: WeaponStats    // mainWeaponカテゴリ専用：武器基本ステータス（オプション）
  crystalSlots?: CrystalSlots  // mainWeapon, body, additional, special専用：クリスタル枠（オプション）
}
```

**ローカルストレージ装備インターフェース**（拡張版）:
```typescript
interface LocalStorageEquipment extends PresetEquipment {
  isPreset: boolean            // プリセット由来かどうか
  isFavorite: boolean          // お気に入り設定
  createdAt: string           // 作成日時 (ISO string)
  updatedAt: string           // 更新日時 (ISO string)
}

// 統合型（アプリ内で使用する装備データ型）
type Equipment = LocalStorageEquipment

// mainWeaponカテゴリ専用の武器基本ステータス
interface WeaponStats {
  ATK?: number       // 武器ATK（省略時はWeaponFormの値を使用）
  stability?: number // 安定率（省略時はWeaponFormの値を使用）
  refinement?: number // 精錬値（省略時はWeaponFormの値を使用）
}

// mainWeapon, body, additional, special専用のクリスタル枠
interface CrystalSlots {
  slot1?: string     // クリスタルID（省略時は未装着）
  slot2?: string     // クリスタルID（省略時は未装着）
}

// 各装備カテゴリで利用可能なクリスタルタイプ
// mainWeapon: weapon, normal
// body: armor, normal  
// additional: additional, normal
// special: special, normal
```

## 装備プロパティ設定値範囲

**プロパティ値設定範囲**
- %系プロパティ: -1000 ～ 1000
- 固定値プロパティ: -99999 ～ 99999

## 装備プロパティ完全定義

```typescript
interface EquipmentProperties {
  // 基本攻撃力系
  ATK_Rate: number                     // ATK%
  ATK: number                          // ATK
  MATK_Rate: number                    // MATK%
  MATK: number                         // MATK
  WeaponATK_Rate: number               // 武器ATK%
  WeaponATK: number                    // 武器ATK
  
  // 防御力系
  DEF_Rate: number                     // DEF%
  DEF: number                          // DEF
  MDEF_Rate: number                    // MDEF%
  MDEF: number                         // MDEF
  
  // 貫通系
  PhysicalPenetration_Rate: number     // 物理貫通%
  MagicalPenetration_Rate: number      // 魔法貫通%
  ElementAdvantage_Rate: number        // 属性有利%
  
  // 威力系
  UnsheatheAttack_Rate: number         // 抜刀威力%
  UnsheatheAttack: number              // 抜刀威力
  ShortRangeDamage_Rate: number        // 近距離威力%
  LongRangeDamage_Rate: number         // 遠距離威力%
  
  // クリティカル系
  CriticalDamage_Rate: number          // クリティカルダメージ%
  CriticalDamage: number               // クリティカルダメージ
  Critical_Rate: number            // クリティカル率%
  Critical: number                 // クリティカル率
  
  // 安定率
  Stability_Rate: number               // 安定率%
  
  // HP/MP系
  HP_Rate: number                      // HP%
  HP: number                           // HP
  MP_Rate: number                      // MP%
  MP: number                           // MP
  
  // ステータス系
  STR_Rate: number                     // STR%
  STR: number                          // STR
  INT_Rate: number                     // INT%
  INT: number                          // INT
  VIT_Rate: number                     // VIT%
  VIT: number                          // VIT
  AGI_Rate: number                     // AGI%
  AGI: number                          // AGI
  DEX_Rate: number                     // DEX%
  DEX: number                          // DEX
  CRT_Rate: number                     // CRT%
  CRT: number                          // CRT
  MEN_Rate: number                     // MEN%
  MEN: number                          // MEN
  TEC_Rate: number                     // TEC%
  TEC: number                          // TEC
  
  // 命中・回避系
  Accuracy_Rate: number                // 命中%
  Accuracy: number                     // 命中
  Dodge_Rate: number                   // 回避%
  Dodge: number                        // 回避
  
  // 速度系
  AttackSpeed_Rate: number             // 攻撃速度%
  AttackSpeed: number                  // 攻撃速度
  CastingSpeed_Rate: number            // 詠唱速度%
  CastingSpeed: number                 // 詠唱速度
  MotionSpeed_Rate: number             // 行動速度%
  
  // MP回復系
  AttackMPRecovery_Rate: number        // 攻撃MP回復%
  AttackMPRecovery: number             // 攻撃MP回復
  
  // 耐性系
  PhysicalResistance_Rate: number      // 物理耐性%
  MagicalResistance_Rate: number       // 魔法耐性%
  AilmentResistance_Rate: number       // 異常耐性%
  
  // その他戦闘系
  Aggro_Rate: number                   // ヘイト%
  RevivalTime_Rate: number             // 復帰短縮%
  
  // 自然回復系
  NaturalHPRecovery_Rate: number       // HP自然回復%
  NaturalHPRecovery: number            // HP自然回復
  NaturalMPRecovery_Rate: number       // MP自然回復%
  NaturalMPRecovery: number            // MP自然回復
  
  // 特殊系
  ArmorBreak_Rate: number              // 防御崩し%
  Anticipate_Rate: number              // 先読み%
  GuardPower_Rate: number              // Guard力%
  GuardRecharge_Rate: number           // Guard回復%
  AvoidRecharge_Rate: number           // Avoid回復%
  ItemCooldown: number                 // 道具速度
  AbsoluteAccuracy_Rate: number        // 絶対命中%
  AbsoluteDodge_Rate: number           // 絶対回避%
  
  // ステータス連動攻撃力
  ATK_STR_Rate: number                 // ATK+(STR)%
  ATK_INT_Rate: number                 // ATK+(INT)%
  ATK_VIT_Rate: number                 // ATK+(VIT)%
  ATK_AGI_Rate: number                 // ATK+(AGI)%
  ATK_DEX_Rate: number                 // ATK+(DEX)%
  MATK_STR_Rate: number                // MATK+(STR)%
  MATK_INT_Rate: number                // MATK+(INT)%
  MATK_VIT_Rate: number                // MATK+(VIT)%
  MATK_AGI_Rate: number                // MATK+(AGI)%
  MATK_DEX_Rate: number                // MATK+(DEX)%
  
  // 属性耐性
  FireResistance_Rate: number          // 火耐性%
  WaterResistance_Rate: number         // 水耐性%
  WindResistance_Rate: number          // 風耐性%
  EarthResistance_Rate: number         // 地耐性%
  LightResistance_Rate: number         // 光耐性%
  DarkResistance_Rate: number          // 闇耐性%
  NeutralResistance_Rate: number       // 無耐性%
  
  // ダメージ軽減系
  LinearReduction_Rate: number         // 直線軽減%
  RushReduction_Rate: number           // 突進軽減%
  BulletReduction_Rate: number         // 弾丸軽減%
  ProximityReduction_Rate: number      // 周囲軽減%
  AreaReduction_Rate: number           // 範囲軽減%
  FloorTrapReduction_Rate: number      // 痛床軽減%
  MeteorReduction_Rate: number         // 隕石軽減%
  BladeReduction_Rate: number          // 射刃軽減%
  SuctionReduction_Rate: number        // 吸引軽減%
  ExplosionReduction_Rate: number      // 爆発軽減%
  
  // バリア系
  PhysicalBarrier: number              // 物理バリア
  MagicalBarrier: number               // 魔法バリア
  FractionalBarrier: number            // 割合バリア
  BarrierCooldown_Rate: number         // バリア速度%
  
  // 追撃系
  PhysicalFollowup_Rate: number        // 物理追撃%
  MagicalFollowup_Rate: number         // 魔法追撃%
}
```

## 装備カテゴリ定義

```typescript
type EquipmentCategory = 
  | 'mainWeapon'      // メイン装備
  | 'body'      // 体装備
  | 'additional' // 追加装備
  | 'special'   // 特殊装備
  | 'subWeapon' // サブ武器
  | 'fashion1'  // オシャレ装備1
  | 'fashion2'  // オシャレ装備2
  | 'fashion3'  // オシャレ装備3
  | 'freeInput1' // 自由入力1
  | 'freeInput2' // 自由入力2
  | 'freeInput3' // 自由入力3
```