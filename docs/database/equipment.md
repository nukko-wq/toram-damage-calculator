# 装備データベース設計

## ファイル構成・データフロー
**初期データ配置**:
- **プリセットデータ**: `src/data/equipments.ts`（TypeScript静的ファイル）

**アプリ起動時の処理**:
```
アプリ起動 → プリセットTypeScriptモジュールを読み込み → LocalStorageにコピー → 以降はLocalStorageから参照
```

**TypeScript移行の利点**:
- EquipmentPropertiesインターフェースによる厳密な型チェック
- ConditionalEffect配列の型安全性保証
- 装備カテゴリごとの型制約
- エディタでの自動補完とプロパティ検証
- weaponInfoStorageによるIDベース武器情報管理

**ローカルストレージキー**:
- **プリセット装備（コピー済み）**: LocalStorage (`toram_preset_equipments`)
- **ユーザーカスタムデータ**: LocalStorage (`toram_custom_equipments`)
- **武器情報データ**: LocalStorage (`toram_weapon_info_overrides`)
- **防具改造タイプデータ**: LocalStorage (`toram_armor_type_overrides`)
- **統合アクセス**: 装備データ、武器情報、防具改造タイプを統一的にID管理

## TypeScriptデータ構造

**プリセット装備データ構造**（型安全版）:
```typescript
// src/data/equipments.ts
interface EquipmentsData {
  equipments: Record<EquipmentCategory, PresetEquipment[]>
}

export const equipmentsData: EquipmentsData = {
  equipments: {
    mainWeapon: [PresetEquipment配列], // メイン武器装備
    body: [PresetEquipment配列],        // 体装備
    additional: [PresetEquipment配列],  // 追加装備
    special: [PresetEquipment配列],     // 特殊装備
    subWeapon: [PresetEquipment配列],   // サブ武器
    fashion1: [PresetEquipment配列],    // オシャレ装備1
    fashion2: [PresetEquipment配列],    // オシャレ装備2
    fashion3: [PresetEquipment配列],    // オシャレ装備3
    freeInput1: [PresetEquipment配列],  // 自由入力1
    freeInput2: [PresetEquipment配列],  // 自由入力2
    freeInput3: [PresetEquipment配列]   // 自由入力3
  }
} as const
```

**LocalStorage保存時の装備データ構造**:

**プリセット由来装備 (LocalStorageEquipment)**:
```json
{
  "id": "equipment_id",
  "name": "装備名",
  "properties": { /* プロパティ */ },
  "conditionalEffects": [],   // 条件付き効果
  "refinement": 0,            // weaponInfoStorageで上書きされる
  "isPreset": true,           // プリセット由来フラグ
  "isFavorite": false,        // お気に入り設定
  "isModified": false,        // 変更済みフラグ
  "modifiedAt": "ISO string", // 変更日時（オプション）
  "originalChecksum": "hash", // 元データのチェックサム（オプション）
  "createdAt": "ISO string",  // 作成日時
  "updatedAt": "ISO string"   // 更新日時
}
```

**カスタム装備 (CustomEquipment)**:
```json
{
  "id": "equipment_id",
  "name": "装備名",
  "properties": { /* プロパティ */ },
  "conditionalEffects": [],   // 条件付き効果
  "refinement": 0,            // weaponInfoStorageで上書きされる
  "isCustom": true,           // カスタム装備フラグ
  "isPreset": false,          // プリセット由来フラグ
  "isFavorite": false,        // お気に入り設定
  "isModified": false,        // 変更済みフラグ
  "createdAt": "ISO string",  // 作成日時
  "updatedAt": "ISO string"   // 更新日時
}
```

**武器情報データ構造**（IDベース管理）:
```json
{
  "equipment_id": {
    "ATK": 300,
    "stability": 85,
    "refinement": 10,
    "updatedAt": "ISO string"
  }
}
```

**防具改造タイプデータ構造**（IDベース管理）:
```json
{
  "equipment_id": {
    "armorType": "normal",
    "updatedAt": "ISO string"
  }
}
```

## 装備アイテム構造

**プリセット装備インターフェース**（初期配置用）:
```typescript
interface PresetEquipment {
  id: string                    // 一意識別子
  name: string                  // 装備名
  properties: Partial<EquipmentProperties> // 付与プロパティ（PascalCase統一済み）
  conditionalEffects?: ConditionalEffect[] // 条件付き効果
  // 注意: armorType は armorTypeStorage で ID ベース管理
}
```

**ローカルストレージ装備インターフェース**（拡張版）:
```typescript
// プリセット由来の装備
interface LocalStorageEquipment extends PresetEquipment, LocalStoragePresetItemBase {
  refinement?: number // weaponInfoStorageで管理される精錬値
}

// LocalStoragePresetItemBase
interface LocalStoragePresetItemBase {
  isPreset: true
  isFavorite: boolean
  isModified: boolean
  modifiedAt?: string
  originalChecksum?: string
  createdAt: string
  updatedAt: string
}

// カスタム装備インターフェース
interface CustomEquipment extends PresetEquipment, LocalStorageCustomItemBase {
  isCustom: true
  refinement?: number // weaponInfoStorageで管理される精錬値
}

// LocalStorageCustomItemBase
interface LocalStorageCustomItemBase {
  isPreset: false
  isFavorite: boolean
  isModified: boolean
  createdAt: string
  updatedAt: string
}

// 統合型（アプリ内で使用する装備データ型）
type Equipment = LocalStorageEquipment | CustomEquipment

// 武器情報（IDベース管理）
interface WeaponInfo {
  ATK: number
  stability: number
  refinement: number
  updatedAt: string
}

// 防具改造タイプ（IDベース管理）
interface ArmorTypeInfo {
  armorType: ArmorType
  updatedAt: string
}

// mainWeapon, body, additional, special専用のクリスタル枠
interface CrystalSlots {
  slot1?: string     // クリスタルID（省略時は未装着）
  slot2?: string     // クリスタルID（省略時は未装着）
}

// 各装備カテゴリで利用可能なクリスタルタイプ
// main: weapon, normal
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
  
  // ダメージ計算系
  BraveMultiplier: number              // ブレイブ倍率%
  
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
  | 'mainWeapon'  // メイン武器装備
  | 'body'        // 体装備
  | 'additional'  // 追加装備
  | 'special'     // 特殊装備
  | 'subWeapon'   // サブ武器
  | 'fashion1'    // オシャレ装備1
  | 'fashion2'    // オシャレ装備2
  | 'fashion3'    // オシャレ装備3
  | 'freeInput1'  // 自由入力1
  | 'freeInput2'  // 自由入力2
  | 'freeInput3'  // 自由入力3

type EquipmentType = 'weapon' | 'armor' | 'accessory' | 'fashion'
```

## IDベース統一管理システム

**weaponInfoStorage（武器情報管理）**:
- 全ての装備（プリセット・カスタム・仮データ・編集セッション）で統一
- 装備IDをキーとして武器ATK、安定率、精錬値を管理
- LocalStorage: `toram_weapon_info_overrides`

**armorTypeStorage（防具改造タイプ管理）**:
- 全ての装備（プリセット・カスタム・仮データ・編集セッション）で統一
- 装備IDをキーとして防具改造タイプ（normal/light/heavy）を管理
- LocalStorage: `toram_armor_type_overrides`

**データフロー**:
```
WeaponForm ↔ weaponInfoStorage ↔ 装備選択時復元
ArmorTypeSelect ↔ armorTypeStorage ↔ 装備選択時復元
                ↓
        equipmentDatabase.applyWeaponInfoOverlay()
        equipmentDatabase.applyArmorTypeOverlay()
                ↓
        全装備データで武器情報・防具改造タイプをオーバーレイ
```

**武器情報管理の主要関数**:
- `saveWeaponInfo(equipmentId, ATK, stability, refinement)`: 武器情報保存
- `getWeaponInfo(equipmentId)`: 武器情報取得
- `deleteWeaponInfo(equipmentId)`: 武器情報削除
- `applyWeaponInfoOverlay(equipment)`: 装備に武器情報をオーバーレイ

**防具改造タイプ管理の主要関数**:
- `saveArmorType(equipmentId, armorType)`: 防具改造タイプ保存
- `getArmorType(equipmentId)`: 防具改造タイプ取得
- `deleteArmorType(equipmentId)`: 防具改造タイプ削除
- `applyArmorTypeOverlay(equipment)`: 装備に防具改造タイプをオーバーレイ

## 実装上の注意点

**データ構造の整合性**:
- `src/data/equipments.ts`の実際のデータ構造は正しく`PresetEquipment`インターフェースに準拠
- `equipmentDatabase.ts`の`getAllEquipments()`関数は現在レガシー実装を使用（要修正）
- 現在の実装では`type`, `category`, `baseStats`プロパティを追加しているが、これらは`PresetEquipment`インターフェースにない
- 将来的には`getAllEquipments()`を`PresetEquipment`インターフェースに準拠するよう修正が必要

**カテゴリ統一の完了**:
- `main`カテゴリを廃止し、`mainWeapon`に統一
- 全てのコードベースで`main`→`mainWeapon`への移行完了
- 装備カテゴリの一貫性が向上

## アーキテクチャ変更履歴

**v2.0: IDベース統一管理への移行**:
- **削除**: `weaponStats`プロパティ（UserEquipment、PresetEquipment）
- **削除**: `refinement`プロパティ（UserEquipment）
- **追加**: `weaponInfoStorage`による統一管理
- **追加**: `applyWeaponInfoOverlay`による動的オーバーレイ
- **変更**: 武器情報はIDをキーとしたオーバーレイ方式に統一

**v2.1: カテゴリ統一**:
- **削除**: `main`カテゴリを廃止
- **統一**: 全て`mainWeapon`カテゴリに統一
- **修正**: 全コードベースで`main`→`mainWeapon`への移行完了

**v2.2: 防具改造タイプのIDベース管理**:
- **削除**: `armorType`プロパティ（PresetEquipment、UserEquipment）
- **追加**: `armorTypeStorage`による統一管理
- **追加**: `applyArmorTypeOverlay`による動的オーバーレイ
- **変更**: 防具改造タイプはIDをキーとしたオーバーレイ方式に統一

**メリット**:
- プリセット・カスタム装備で同一の武器情報・防具改造タイプ管理システム
- データ整合性の向上（二重管理の解消）
- 武器情報・防具改造タイプの集約管理による拡張性向上
- IDベース管理による一貫したアーキテクチャ
- 移行処理による既存データの保護