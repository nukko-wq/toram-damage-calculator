# バフスキル詳細設計書 - 分割版

## 概要

共通バフスキルの詳細設計書を系統ごとに分割整理したファイル群です。
各ファイルには対応するスキル系統の詳細仕様、計算式、実装関数が記載されています。

## ファイル構造

```
buff-skills/
├── README.md                    # このファイル
├── blade-skills.md             # ブレードスキル系統
├── halberd-skills.md           # ハルバードスキル系統
├── mononofu-skills.md          # モノノフスキル系統
├── survival-skills.md          # サバイバルスキル系統
├── battle-skills.md            # バトルスキル系統
├── hunter-skills.md            # ハンタースキル系統
├── dualsword-skills.md         # デュアルソードスキル系統
├── support-skills.md           # サポートスキル系統
├── partisan-skills.md          # パルチザンスキル系統
├── darkpower-skills.md         # ダークパワースキル系統
├── assassin-skills.md          # アサシンスキル系統
├── sprite-skills.md            # スプライトスキル系統
├── minstrel-skills.md          # ミンストレルスキル系統
├── shoot-skills.md             # シュートスキル系統
├── pet-skills.md               # ペット使用スキル系統
├── shield-skills.md            # シールドスキル系統
└── ... (他の系統)
```

## 分割済みファイル

### ✅ blade-skills.md
- **スキル系統**: ブレードスキル (category: 'blade')
- **含まれるスキル**: 4スキル
  - ブレードマスタリ (Ms-blade)
  - ウォークライ (IsWarcry)
  - バーサーク (Berserk)
  - オーラブレード (AuraBlade) ★新規追加

### ✅ halberd-skills.md
- **スキル系統**: ハルバードスキル (category: 'halberd')
- **含まれるスキル**: 2スキル
  - クイックオーラ (hb1)
  - 神速の捌手 (godspeed_parry)

### ✅ mononofu-skills.md
- **スキル系統**: モノノフスキル (category: 'mononofu')
- **含まれるスキル**: 4スキル
  - 武士道 (Mononof)
  - 明鏡止水 (mf1-1)
  - 怪力乱神 (mf1)
  - 両手持ち (sm1-1)

### ✅ survival-skills.md
- **スキル系統**: サバイバルスキル (category: 'survival')
- **含まれるスキル**: 2スキル
  - HPブースト (oh4)
  - MPブースト (oh2)

### ✅ shoot-skills.md
- **スキル系統**: シュートスキル (category: 'shoot')
- **含まれるスキル**: 2スキル
  - ロングレンジ (LongRange)
  - 武士弓術 (ar1)

### ✅ battle-skills.md
- **スキル系統**: バトルスキル (category: 'battle')
- **含まれるスキル**: 7スキル
  - クリティカルup (oh1)
  - 攻撃力up (exATK1)
  - 魔法力up (exMATK1)
  - 驚異の威力 (exATK2)
  - 更なる魔力 (exMATK2)
  - 命中up (exHIT)
  - 回避up (exFREE)

### ✅ hunter-skills.md
- **スキル系統**: ハンタースキル (category: 'hunter')
- **含まれるスキル**: 1スキル
  - カムフラージュ (hunter5-2)

### ✅ dualsword-skills.md
- **スキル系統**: デュアルソードスキル (category: 'dualSword')
- **含まれるスキル**: 1スキル
  - 神速の軌跡 (ds1-2)

### ✅ support-skills.md
- **スキル系統**: サポートスキル (category: 'support')
- **含まれるスキル**: 2スキル
  - ブレイブオーラ (IsBrave)
  - マナリチャージ (IsManaReCharge)

### ✅ partisan-skills.md
- **スキル系統**: パルチザンスキル (category: 'partisan')
- **含まれるスキル**: 1スキル
  - 前線維持Ⅱ (pal1)

### ✅ darkpower-skills.md
- **スキル系統**: ダークパワースキル (category: 'darkPower')
- **含まれるスキル**: 1スキル
  - エターナルナイトメア (dp1)

### ✅ assassin-skills.md
- **スキル系統**: アサシンスキル (category: 'assassin')
- **含まれるスキル**: 2スキル
  - シーカーリウス (oh1-2)
  - 暗殺の極意 (assassin5-1)

### ✅ sprite-skills.md
- **スキル系統**: スプライトスキル (category: 'sprite')
- **含まれるスキル**: 1スキル
  - エンハンス (IsEnhance)

### ✅ minstrel-skills.md
- **スキル系統**: ミンストレルスキル (category: 'minstrel')
- **含まれるスキル**: 1スキル
  - 熱情の歌 (IsHotKnows)

### ✅ pet-skills.md
- **スキル系統**: ペット使用スキル (category: 'pet')
- **含まれるスキル**: 4スキル
  - ブレイブアップ (IsPetBrave)
  - マインドアップ (IsPetMind)
  - カットアップ (IsPetCut)
  - クリティカルアップ (IsPetCri)

### ✅ shield-skills.md
- **スキル系統**: シールドスキル (category: 'shield')
- **含まれるスキル**: 2スキル
  - プロテクション (IsProtect)
  - イージス (IsAegis)

## 使用方法

1. **メインドキュメント**: `../buff-skill-details.md` で全体構造を確認
2. **詳細確認**: 各系統の詳細は個別ファイルで確認
3. **実装時**: 各ファイル内の実装用関数を参考に実装

## メンテナンス

- 新しいスキルが追加された場合は、対応する系統ファイルに追加
- 新しい系統が追加された場合は、新しいファイルを作成
- メインドキュメントの参照リンクも更新

### 最新の更新

**2025-08-02**: ブレードスキル系統にオーラブレード (AuraBlade) を追加
- 武器種別ブレイブ倍率効果 (片手剣+20%, 両手剣+30%, 双剣+10%)
- 設計完了・実装待ち状態

## 関連ファイル

- **メインドキュメント**: `../buff-skill-details.md`
- **実装ファイル**: `../../src/utils/buffSkillCalculation.ts`
- **データ定義**: `../../src/data/buffSkills.ts`
- **型定義**: `../../src/types/buffSkill.ts`