# バフスキル詳細設計書 - 分割版

## 概要

共通バフスキルの詳細設計書を系統ごとに分割整理したファイル群です。
各ファイルには対応するスキル系統の詳細仕様、計算式、実装関数が記載されています。

## ファイル構造

```
buff-skills-common/
├── README.md                    # このファイル
├── blade-skills.md             # ブレードスキル系統
├── halberd-skills.md           # ハルバードスキル系統
├── mononofu-skills.md          # モノノフスキル系統
├── survival-skills.md          # サバイバルスキル系統
├── battle-skills.md            # バトルスキル系統
├── shoot-skills.md             # シュートスキル系統（予定）
├── dualSword-skills.md         # デュアルソードスキル系統（予定）
└── ... (他の系統)
```

## 分割済みファイル

### ✅ blade-skills.md
- **スキル系統**: ブレードスキル (category: 'blade')
- **含まれるスキル**: 1スキル
  - ウォークライ (IsWarcry)

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

## 分割予定ファイル

### 🔄 shoot-skills.md (未実装)
- **スキル系統**: シュートスキル (category: 'shoot')
- **含まれるスキル**: ロングレンジ、パワーショット等

### ✅ battle-skills.md
- **スキル系統**: バトルスキル (category: 'battle')
- **含まれるスキル**: 5スキル
  - クリティカルup (oh1)
  - 攻撃力up (exATK1)
  - 魔法力up (exMATK1)
  - 驚異の威力 (exATK2)
  - 更なる魔力 (exMATK2)

## 使用方法

1. **メインドキュメント**: `../buff-skill-details-common.md` で全体構造を確認
2. **詳細確認**: 各系統の詳細は個別ファイルで確認
3. **実装時**: 各ファイル内の実装用関数を参考に実装

## メンテナンス

- 新しいスキルが追加された場合は、対応する系統ファイルに追加
- 新しい系統が追加された場合は、新しいファイルを作成
- メインドキュメントの参照リンクも更新

## 関連ファイル

- **メインドキュメント**: `../buff-skill-details-common.md`
- **実装ファイル**: `../../src/utils/buffSkillCalculation.ts`
- **データ定義**: `../../src/data/buffSkills.ts`
- **型定義**: `../../src/types/buffSkill.ts`