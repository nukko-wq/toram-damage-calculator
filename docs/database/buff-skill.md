# バフスキルシステム構造

## バフスキルデータ型定義

```typescript
interface BuffSkillFormData {
  skills: BuffSkill[]
}

interface BuffSkill {
  id: string                    // スキル識別子
  name: string                  // スキル名
  category: BuffSkillCategory   // スキル系統
  isEnabled: boolean            // オン/オフ状態
  parameters: BuffSkillParameters  // パラメータ設定
}

interface BuffSkillParameters {
  skillLevel?: number      // スキルレベル（1-10）
  stackCount?: number      // 重ねがけ数（トルネードランス等）
  playerCount?: number     // プレイヤー数（ナイトプレッジ等）
  refinement?: number      // 精錬値（ナイトプレッジ等）
  spUsed?: number         // 使用SP（エターナルナイトメア等）
  isCaster?: number       // 使用者フラグ（ブレイブ等）
}

type BuffSkillCategory = 
  | 'mastery' | 'blade' | 'shoot' | 'halberd' | 'mononofu'
  | 'dualSword' | 'sprite' | 'darkPower' | 'shield' | 'knight'
  | 'hunter' | 'assassin' | 'ninja' | 'support' | 'survival'
  | 'battle' | 'pet' | 'minstrel' | 'partisan'
```

## バフスキルシステム設計

**UI構成**:
- 19のスキル系統別にセクション分割
- 各セクションは折りたたみ可能
- スキルごとにオン/オフスイッチ + パラメータ入力
- リアルタイムバリデーションとエラー表示

**データ管理**:
- セーブデータに各スキルの設定状態を保存
- Zustand CalculatorStoreで状態管理
- React Hook Formとの統合による型安全な操作

**バリデーション**:
```typescript
export const buffSkillSchema = z.object({
  skills: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.enum(['mastery', 'blade', /* ... */]),
    isEnabled: z.boolean(),
    parameters: z.object({
      skillLevel: z.number().min(1).max(10).optional(),
      stackCount: z.number().min(1).max(10).optional(),
      playerCount: z.number().min(0).max(4).optional(),
      refinement: z.number().min(1).max(15).optional(),
      spUsed: z.number().min(25).max(80).optional(),
      isCaster: z.number().min(0).max(1).optional(),
    })
  }))
})
```

## デフォルト値

```typescript
const getDefaultBuffSkills = (): BuffSkillFormData => ({
  skills: [
    // 全58種類のバフスキル（詳細はbuff-skill.mdを参照）
    // 全てisEnabled: false、パラメータは最小値で初期化
  ]
})
```

## スキル系統一覧

1. **Mastery（マスタリー）** - 武器・防具マスタリースキル
2. **Blade（片手剣）** - 片手剣系統のバフスキル
3. **Shoot（弓）** - 弓系統のバフスキル
4. **Halberd（両手剣）** - 両手剣系統のバフスキル
5. **Mononofu（武士道）** - 武士道系統のバフスキル
6. **DualSword（双剣）** - 双剣系統のバフスキル
7. **Sprite（魔法）** - 魔法系統のバフスキル
8. **DarkPower（黒魔法）** - 黒魔法系統のバフスキル
9. **Shield（盾）** - 盾系統のバフスキル
10. **Knight（騎士）** - 騎士系統のバフスキル
11. **Hunter（狩人）** - 狩人系統のバフスキル
12. **Assassin（暗殺）** - 暗殺系統のバフスキル
13. **Ninja（忍術）** - 忍術系統のバフスキル
14. **Support（補助）** - 補助系統のバフスキル
15. **Survival（生存）** - 生存系統のバフスキル
16. **Battle（戦闘）** - 戦闘系統のバフスキル
17. **Pet（使い魔）** - 使い魔系統のバフスキル
18. **Minstrel（吟遊詩人）** - 吟遊詩人系統のバフスキル
19. **Partisan（パルチザン）** - パルチザン系統のバフスキル