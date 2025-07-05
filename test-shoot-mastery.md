# シュートマスタリ動作確認テスト

## 実装内容
- シュートマスタリの効果計算関数を実装
- BuffSkillFormからStatusPreviewへの統合を実装
- 弓、自動弓装備時のみ効果が適用される仕組みを実装

## テスト手順

### 1. 弓での動作確認
1. メイン武器を「弓」に設定
2. BuffSkillFormでシュートマスタリを有効化
3. スキルレベルを設定（1-10）
4. StatusPreviewで効果が反映されているか確認

### 2. 自動弓での動作確認
1. メイン武器を「自動弓」に設定
2. BuffSkillFormでシュートマスタリを有効化
3. スキルレベルを設定（1-10）
4. StatusPreviewで効果が反映されているか確認

### 3. 効果値確認

#### Lv1の場合
- WeaponATK_Rate: +3%
- ATK_Rate: +1%

#### Lv5の場合  
- WeaponATK_Rate: +15%
- ATK_Rate: +2%

#### Lv10の場合
- WeaponATK_Rate: +30%
- ATK_Rate: +3%

### 4. 武器種制限確認
1. メイン武器を「片手剣」に変更
2. シュートマスタリが無効になることを確認
3. StatusPreviewで効果が反映されなくなることを確認

### 5. 計算式確認
- WeaponATK_Rate = スキルレベル × 3
- ATK_Rate = 段階別固定値
  - Lv1-2: 1%
  - Lv3-7: 2%
  - Lv8-10: 3%

## 実装箇所
- `src/utils/buffSkillCalculation.ts`: 計算ロジック実装
- `src/data/buffSkills.ts`: maxLevel設定追加（2つの武器種）
- `docs/database/buff-skill-details-weapon.md`: 設計書更新

## 注意点
- シュートマスタリは2つの武器種（弓、自動弓）で共通のスキルID 'Ms-shoot' を使用
- 各武器種のWEAPON_SPECIFIC_SKILLSに個別に定義されている
- StatusPreviewでは武器種に関係なく同じ効果が適用される

## 他のマスタリスキルとの組み合わせテスト
- ハルバードマスタリ、ブレードマスタリ、シュートマスタリが同時に実装されているため、武器種を変更した際に正しいマスタリだけが有効になることを確認