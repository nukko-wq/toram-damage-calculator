# ブレードマスタリ動作確認テスト

## 実装内容
- ブレードマスタリの効果計算関数を実装
- BuffSkillFormからStatusPreviewへの統合を実装
- 片手剣、両手剣、双剣装備時のみ効果が適用される仕組みを実装

## テスト手順

### 1. 片手剣での動作確認
1. メイン武器を「片手剣」に設定
2. BuffSkillFormでブレードマスタリを有効化
3. スキルレベルを設定（1-10）
4. StatusPreviewで効果が反映されているか確認

### 2. 両手剣での動作確認
1. メイン武器を「両手剣」に設定
2. BuffSkillFormでブレードマスタリを有効化
3. スキルレベルを設定（1-10）
4. StatusPreviewで効果が反映されているか確認

### 3. 双剣での動作確認
1. メイン武器を「双剣」に設定
2. BuffSkillFormでブレードマスタリを有効化
3. スキルレベルを設定（1-10）
4. StatusPreviewで効果が反映されているか確認

### 4. 効果値確認

#### Lv1の場合
- WeaponATK_Rate: +3%
- ATK_Rate: +1%

#### Lv5の場合  
- WeaponATK_Rate: +15%
- ATK_Rate: +2%

#### Lv10の場合
- WeaponATK_Rate: +30%
- ATK_Rate: +3%

### 5. 武器種制限確認
1. メイン武器を「手甲」に変更
2. ブレードマスタリが無効になることを確認
3. StatusPreviewで効果が反映されなくなることを確認

### 6. 計算式確認
- WeaponATK_Rate = スキルレベル × 3
- ATK_Rate = 段階別固定値
  - Lv1-2: 1%
  - Lv3-7: 2%
  - Lv8-10: 3%

## 実装箇所
- `src/utils/buffSkillCalculation.ts`: 計算ロジック実装
- `src/data/buffSkills.ts`: maxLevel設定追加（3つの武器種）
- `docs/database/buff-skill-details-weapon.md`: 設計書更新

## 注意点
- ブレードマスタリは3つの武器種（片手剣、両手剣、双剣）で共通のスキルID 'Ms-blade' を使用
- 各武器種のWEAPON_SPECIFIC_SKILLSに個別に定義されている
- StatusPreviewでは武器種に関係なく同じ効果が適用される