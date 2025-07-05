# 特殊パラメータバフスキル詳細設計書

## 概要

特殊なパラメータを持つバフスキルの詳細仕様を記述します。
プレイヤー数依存、精錬値依存、SP使用量依存、使用者フラグ依存などの複雑な計算を要するスキルを定義します。

## データ構造

```typescript
interface SpecialBuffSkillDetail {
  id: string                    // data-key値
  name: string                 // 表示名
  category: BuffSkillCategory  // スキル系統
  type: 'special'             // 常にspecial
  order: number               // 表示順序
  weaponRequirement?: WeaponRequirement // 武器要件
  description: string         // スキル説明
  specialParameters: SpecialParameter[] // 特殊パラメータ定義
  effects: SpecialSkillEffect[] // 効果リスト
  calculationFormula: string  // 計算式
  validationRules: ValidationRule[] // 入力値検証ルール
  uiSettings: SpecialUISettings // UI表示設定
}

interface SpecialParameter {
  id: string                  // パラメータID
  name: string               // 表示名
  type: ParameterType        // パラメータタイプ
  defaultValue: number       // デフォルト値
  minValue: number          // 最小値
  maxValue: number          // 最大値
  unit?: string             // 単位
  description: string       // パラメータ説明
  dependsOn?: string[]      // 依存する他パラメータ
}

type ParameterType = 
  | 'playerCount'       // プレイヤー数
  | 'refinement'        // 精錬値
  | 'spUsed'           // 使用SP
  | 'casterFlag'       // 使用者フラグ
  | 'stackLevel'       // 重ね段階
  | 'comboCount'       // コンボ数
  | 'hpPercentage'     // HP割合
  | 'mpPercentage'     // MP割合
  | 'darkPowerLevel'   // ダークパワー合計レベル
  | 'skillLevel'       // 他スキルレベル参照
  | 'distance'         // 距離
  | 'timeElapsed'      // 経過時間

interface SpecialSkillEffect {
  property: EquipmentProperty
  formula: string             // 特殊パラメータを含む計算式
  conditions: string[]        // 適用条件
  scaling?: ScalingRule[]     // スケーリングルール
}

interface ScalingRule {
  parameter: string           // 対象パラメータ
  breakpoints: number[]       // 区切り値
  multipliers: number[]       // 各区間の倍率
  description: string         // スケーリング説明
}

interface ValidationRule {
  parameter: string
  rule: string               // 検証ルール（式で記述）
  errorMessage: string       // エラーメッセージ
}

interface SpecialUISettings {
  modalRequired: true        // 常にモーダル必須
  parameterInputs: ParameterInput[] // パラメータ入力UI設定
  showCalculationPreview: boolean   // 計算結果プレビュー表示
  helpText?: string         // ヘルプテキスト
}

interface ParameterInput {
  parameterId: string
  inputType: 'number' | 'slider' | 'select' | 'toggle'
  step?: number             // 数値入力のステップ
  options?: SelectOption[]  // セレクト用選択肢
}
```

## 特殊パラメータスキル詳細

### 1. プレイヤー数依存スキル

#### 1.1 インスピレーション (minstrel1)
```typescript
{
  id: 'minstrel1',
  name: 'インスピレーション',
  category: 'minstrel',
  type: 'special',
  order: 2001,
  description: 'パーティプレイヤー数に応じて攻撃力と魔法攻撃力が上昇',
  specialParameters: [
    {
      id: 'playerCount',
      name: 'プレイヤー数',
      type: 'playerCount',
      defaultValue: 1,
      minValue: 1,
      maxValue: 8,
      unit: '人',
      description: 'パーティ内のプレイヤー数（自分含む）'
    }
  ],
  effects: [
    {
      property: 'ATK_Rate',
      formula: 'playerCount * 5',
      conditions: [],
      scaling: [
        {
          parameter: 'playerCount',
          breakpoints: [1, 4, 6, 8],
          multipliers: [3, 5, 7, 10],
          description: '1-3人:×3, 4-5人:×5, 6-7人:×7, 8人:×10'
        }
      ]
    },
    {
      property: 'MATK_Rate',
      formula: 'playerCount * 5',
      conditions: [],
      scaling: [
        {
          parameter: 'playerCount',
          breakpoints: [1, 4, 6, 8],
          multipliers: [3, 5, 7, 10],
          description: '1-3人:×3, 4-5人:×5, 6-7人:×7, 8人:×10'
        }
      ]
    }
  ],
  calculationFormula: 'ATK%/MATK% = playerCount × スケーリング倍率',
  validationRules: [
    {
      parameter: 'playerCount',
      rule: 'value >= 1 && value <= 8',
      errorMessage: 'プレイヤー数は1-8人の範囲で入力してください'
    }
  ],
  uiSettings: {
    modalRequired: true,
    parameterInputs: [
      {
        parameterId: 'playerCount',
        inputType: 'slider',
        step: 1
      }
    ],
    showCalculationPreview: true,
    helpText: 'パーティプレイでより効果的になるスキルです'
  }
}
```

#### 1.2 ウォーソング (minstrel2)
```typescript
{
  id: 'minstrel2',
  name: 'ウォーソング',
  category: 'minstrel',
  type: 'special',
  order: 2002,
  description: 'プレイヤー数に応じてクリティカル率が上昇',
  specialParameters: [
    {
      id: 'playerCount',
      name: 'プレイヤー数',
      type: 'playerCount',
      defaultValue: 1,
      minValue: 1,
      maxValue: 8,
      unit: '人',
      description: 'パーティ内のプレイヤー数（自分含む）'
    }
  ],
  effects: [
    {
      property: 'Critical_Rate',
      formula: 'Math.min(playerCount * 3, 20)',
      conditions: []
    }
  ],
  calculationFormula: 'クリティカル率% = Math.min(playerCount × 3, 20)',
  validationRules: [
    {
      parameter: 'playerCount',
      rule: 'value >= 1 && value <= 8',
      errorMessage: 'プレイヤー数は1-8人の範囲で入力してください'
    }
  ],
  uiSettings: {
    modalRequired: true,
    parameterInputs: [
      {
        parameterId: 'playerCount',
        inputType: 'number',
        step: 1
      }
    ],
    showCalculationPreview: true
  }
}
```

### 2. 精錬値依存スキル

#### 2.1 スミスの技 (smith1)
```typescript
{
  id: 'smith1',
  name: 'スミスの技',
  category: 'support',
  type: 'special',
  order: 1602,
  description: '武器の精錬値に応じて攻撃力が上昇',
  specialParameters: [
    {
      id: 'weaponRefinement',
      name: '武器精錬値',
      type: 'refinement',
      defaultValue: 0,
      minValue: 0,
      maxValue: 15,
      unit: '',
      description: 'メイン武器の精錬値'
    }
  ],
  effects: [
    {
      property: 'ATK_Rate',
      formula: 'Math.floor(weaponRefinement / 2) * 3',
      conditions: []
    }
  ],
  calculationFormula: 'ATK% = Math.floor(weaponRefinement / 2) × 3',
  validationRules: [
    {
      parameter: 'weaponRefinement',
      rule: 'value >= 0 && value <= 15',
      errorMessage: '精錬値は0-15の範囲で入力してください'
    }
  ],
  uiSettings: {
    modalRequired: true,
    parameterInputs: [
      {
        parameterId: 'weaponRefinement',
        inputType: 'select',
        options: Array.from({length: 16}, (_, i) => ({
          value: i,
          label: `+${i}`
        }))
      }
    ],
    showCalculationPreview: true,
    helpText: '精錬値2ごとにATK+3%の効果'
  }
}
```

### 3. SP使用量依存スキル

#### 3.1 SPブースト (support2)
```typescript
{
  id: 'support2',
  name: 'SPブースト',
  category: 'support',
  type: 'special',
  order: 1603,
  description: '使用したSPに応じて各種ステータスが上昇',
  specialParameters: [
    {
      id: 'spUsed',
      name: '使用SP',
      type: 'spUsed',
      defaultValue: 0,
      minValue: 0,
      maxValue: 1000,
      unit: 'SP',
      description: '現在使用しているSP総量'
    }
  ],
  effects: [
    {
      property: 'ATK_Rate',
      formula: 'Math.floor(spUsed / 20)',
      conditions: []
    },
    {
      property: 'MATK_Rate',
      formula: 'Math.floor(spUsed / 20)',
      conditions: []
    },
    {
      property: 'Critical_Rate',
      formula: 'Math.floor(spUsed / 50)',
      conditions: []
    }
  ],
  calculationFormula: 'ATK%/MATK% = Math.floor(spUsed / 20), クリティカル率% = Math.floor(spUsed / 50)',
  validationRules: [
    {
      parameter: 'spUsed',
      rule: 'value >= 0 && value <= 1000',
      errorMessage: '使用SPは0-1000の範囲で入力してください'
    }
  ],
  uiSettings: {
    modalRequired: true,
    parameterInputs: [
      {
        parameterId: 'spUsed',
        inputType: 'number',
        step: 10
      }
    ],
    showCalculationPreview: true,
    helpText: 'SPを多く使うほど効果が高くなります'
  }
}
```

### 4. 使用者フラグ依存スキル

#### 4.1 マジックブースト (mg5)
```typescript
{
  id: 'mg5',
  name: 'マジックブースト',
  category: 'wizard',
  type: 'special',
  order: 905,
  description: '自己使用時と他者使用時で効果が変動',
  specialParameters: [
    {
      id: 'isCaster',
      name: '使用者',
      type: 'casterFlag',
      defaultValue: 1,
      minValue: 0,
      maxValue: 1,
      description: '0:他者使用, 1:自己使用'
    },
    {
      id: 'skillLevel',
      name: 'スキルレベル',
      type: 'skillLevel',
      defaultValue: 1,
      minValue: 1,
      maxValue: 10,
      unit: 'Lv',
      description: 'マジックブーストのスキルレベル'
    }
  ],
  effects: [
    {
      property: 'MATK_Rate',
      formula: 'isCaster === 1 ? skillLevel * 5 : skillLevel * 3',
      conditions: []
    },
    {
      property: 'CastingSpeed_Rate',
      formula: 'isCaster === 1 ? skillLevel * 3 : skillLevel * 2',
      conditions: []
    }
  ],
  calculationFormula: '自己使用: MATK% = skillLevel × 5, 詠唱速度% = skillLevel × 3\n他者使用: MATK% = skillLevel × 3, 詠唱速度% = skillLevel × 2',
  validationRules: [
    {
      parameter: 'skillLevel',
      rule: 'value >= 1 && value <= 10',
      errorMessage: 'スキルレベルは1-10の範囲で入力してください'
    }
  ],
  uiSettings: {
    modalRequired: true,
    parameterInputs: [
      {
        parameterId: 'isCaster',
        inputType: 'toggle'
      },
      {
        parameterId: 'skillLevel',
        inputType: 'number',
        step: 1
      }
    ],
    showCalculationPreview: true,
    helpText: '自分で使用する場合により高い効果を得られます'
  }
}
```

### 5. HP/MP割合依存スキル

#### 5.1 デスペレート (survival3)
```typescript
{
  id: 'survival3',
  name: 'デスペレート',
  category: 'survival',
  type: 'special',
  order: 1703,
  description: 'HPが低いほど攻撃力が上昇',
  specialParameters: [
    {
      id: 'currentHpPercentage',
      name: '現在HP割合',
      type: 'hpPercentage',
      defaultValue: 100,
      minValue: 1,
      maxValue: 100,
      unit: '%',
      description: '現在のHP割合'
    }
  ],
  effects: [
    {
      property: 'ATK_Rate',
      formula: 'Math.max(0, 100 - currentHpPercentage)',
      conditions: [],
      scaling: [
        {
          parameter: 'currentHpPercentage',
          breakpoints: [1, 25, 50, 75, 100],
          multipliers: [2.0, 1.5, 1.2, 1.0, 0.5],
          description: 'HP25%以下で効果2倍、50%以下で1.5倍'
        }
      ]
    }
  ],
  calculationFormula: 'ATK% = (100 - currentHpPercentage) × スケーリング倍率',
  validationRules: [
    {
      parameter: 'currentHpPercentage',
      rule: 'value >= 1 && value <= 100',
      errorMessage: 'HP割合は1-100%の範囲で入力してください'
    }
  ],
  uiSettings: {
    modalRequired: true,
    parameterInputs: [
      {
        parameterId: 'currentHpPercentage',
        inputType: 'slider',
        step: 5
      }
    ],
    showCalculationPreview: true,
    helpText: 'HPが低いほど攻撃力が上昇します（危険な戦術）'
  }
}
```

### 6. ダークパワーレベル依存スキル

#### 6.1 エターナルナイトメア (dark1)
```typescript
{
  id: 'dark1',
  name: 'エターナルナイトメア',
  category: 'darkPower',
  type: 'special',
  order: 1002,
  description: 'ダークパワー系スキルの合計レベルに応じて効果が変動',
  specialParameters: [
    {
      id: 'darkPowerLevel',
      name: 'ダークパワー合計レベル',
      type: 'darkPowerLevel',
      defaultValue: 0,
      minValue: 0,
      maxValue: 100,
      unit: 'Lv',
      description: '他のダークパワー系スキルの合計レベル'
    },
    {
      id: 'skillLevel',
      name: 'エターナルナイトメアレベル',
      type: 'skillLevel',
      defaultValue: 1,
      minValue: 1,
      maxValue: 10,
      unit: 'Lv',
      description: 'このスキル自体のレベル'
    }
  ],
  effects: [
    {
      property: 'MATK_Rate',
      formula: 'skillLevel * 3 + Math.floor(darkPowerLevel / 5) * 2',
      conditions: []
    }
  ],
  calculationFormula: 'MATK% = skillLevel × 3 + Math.floor(darkPowerLevel / 5) × 2',
  validationRules: [
    {
      parameter: 'darkPowerLevel',
      rule: 'value >= 0 && value <= 100',
      errorMessage: 'ダークパワー合計レベルは0-100の範囲で入力してください'
    },
    {
      parameter: 'skillLevel',
      rule: 'value >= 1 && value <= 10',
      errorMessage: 'スキルレベルは1-10の範囲で入力してください'
    }
  ],
  uiSettings: {
    modalRequired: true,
    parameterInputs: [
      {
        parameterId: 'skillLevel',
        inputType: 'number',
        step: 1
      },
      {
        parameterId: 'darkPowerLevel',
        inputType: 'number',
        step: 5
      }
    ],
    showCalculationPreview: true,
    helpText: '他のダークパワースキルと組み合わせることで真価を発揮'
  }
}
```

### 7. 距離依存スキル

#### 7.1 レンジマスタリ (hunter2)
```typescript
{
  id: 'hunter2',
  name: 'レンジマスタリ',
  category: 'hunter',
  type: 'special',
  order: 1303,
  description: '敵との距離に応じて攻撃力が変動',
  specialParameters: [
    {
      id: 'distance',
      name: '敵との距離',
      type: 'distance',
      defaultValue: 5,
      minValue: 0,
      maxValue: 20,
      unit: 'm',
      description: '敵との距離（メートル）'
    }
  ],
  effects: [
    {
      property: 'ATK_Rate',
      formula: 'distance >= 10 ? 20 : distance >= 5 ? 10 : 0',
      conditions: [],
      scaling: [
        {
          parameter: 'distance',
          breakpoints: [0, 5, 10, 20],
          multipliers: [0, 10, 20, 20],
          description: '5m未満:0%, 5-9m:10%, 10m以上:20%'
        }
      ]
    }
  ],
  calculationFormula: 'ATK% = 距離に応じたボーナス（5m未満:0%, 5-9m:10%, 10m以上:20%）',
  validationRules: [
    {
      parameter: 'distance',
      rule: 'value >= 0 && value <= 20',
      errorMessage: '距離は0-20mの範囲で入力してください'
    }
  ],
  uiSettings: {
    modalRequired: true,
    parameterInputs: [
      {
        parameterId: 'distance',
        inputType: 'slider',
        step: 1
      }
    ],
    showCalculationPreview: true,
    helpText: '遠距離からの攻撃でボーナスを得られます'
  }
}
```

### 8. 重ね段階依存スキル

#### 8.1 ブラッドルーン (dark2)
```typescript
{
  id: 'dark2',
  name: 'ブラッドルーン',
  category: 'darkPower',
  type: 'special',
  order: 1003,
  description: '重ね段階に応じて効果が累積上昇、自HP減少',
  specialParameters: [
    {
      id: 'stackLevel',
      name: '重ね段階',
      type: 'stackLevel',
      defaultValue: 1,
      minValue: 1,
      maxValue: 5,
      unit: '段階',
      description: 'ブラッドルーンの重ね段階'
    }
  ],
  effects: [
    {
      property: 'MATK_Rate',
      formula: 'stackLevel * 15',
      conditions: []
    },
    {
      property: 'HP_Rate',
      formula: 'stackLevel * -5',
      conditions: []
    }
  ],
  calculationFormula: 'MATK% = stackLevel × 15, HP% = stackLevel × -5',
  validationRules: [
    {
      parameter: 'stackLevel',
      rule: 'value >= 1 && value <= 5',
      errorMessage: '重ね段階は1-5の範囲で入力してください'
    }
  ],
  uiSettings: {
    modalRequired: true,
    parameterInputs: [
      {
        parameterId: 'stackLevel',
        inputType: 'select',
        options: [
          { value: 1, label: '1段階' },
          { value: 2, label: '2段階' },
          { value: 3, label: '3段階' },
          { value: 4, label: '4段階' },
          { value: 5, label: '5段階（最大）' }
        ]
      }
    ],
    showCalculationPreview: true,
    helpText: 'MATK上昇と引き換えにHPが減少します'
  }
}
```

## 特殊パラメータUI実装

### 1. モーダルレイアウト

```typescript
const SpecialParameterModal: React.FC<{
  skill: SpecialBuffSkillDetail
  isOpen: boolean
  onClose: () => void
}> = ({ skill, isOpen, onClose }) => {
  const currentState = useCalculatorStore(state => 
    state.data.buffSkills.skills[skill.id] || getDefaultSpecialSkillState(skill)
  )
  
  const updateParameter = useCalculatorStore(state => state.updateSkillParameter)
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6 max-w-2xl">
        <h3 className="text-xl font-bold mb-4">{skill.name}</h3>
        <p className="text-gray-600 mb-6">{skill.description}</p>
        
        {/* パラメータ入力セクション */}
        <div className="space-y-6">
          {skill.specialParameters.map(param => (
            <ParameterInput
              key={param.id}
              parameter={param}
              value={currentState[param.id] || param.defaultValue}
              onChange={(value) => updateParameter(skill.id, param.id, value)}
              inputSettings={skill.uiSettings.parameterInputs.find(
                input => input.parameterId === param.id
              )}
            />
          ))}
        </div>
        
        {/* 計算結果プレビュー */}
        {skill.uiSettings.showCalculationPreview && (
          <CalculationPreview
            skill={skill}
            parameters={currentState}
          />
        )}
        
        {/* ヘルプテキスト */}
        {skill.uiSettings.helpText && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">{skill.uiSettings.helpText}</p>
          </div>
        )}
        
        {/* ボタン */}
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
          >
            閉じる
          </button>
        </div>
      </div>
    </Modal>
  )
}
```

### 2. パラメータ入力コンポーネント

```typescript
const ParameterInput: React.FC<{
  parameter: SpecialParameter
  value: number
  onChange: (value: number) => void
  inputSettings?: ParameterInput
}> = ({ parameter, value, onChange, inputSettings }) => {
  const inputType = inputSettings?.inputType || 'number'
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        {parameter.name}
        {parameter.unit && <span className="text-gray-500"> ({parameter.unit})</span>}
      </label>
      <p className="text-xs text-gray-600">{parameter.description}</p>
      
      {inputType === 'slider' && (
        <div className="space-y-2">
          <input
            type="range"
            min={parameter.minValue}
            max={parameter.maxValue}
            step={inputSettings?.step || 1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{parameter.minValue}</span>
            <span className="font-medium">{value}</span>
            <span>{parameter.maxValue}</span>
          </div>
        </div>
      )}
      
      {inputType === 'number' && (
        <input
          type="number"
          min={parameter.minValue}
          max={parameter.maxValue}
          step={inputSettings?.step || 1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full p-2 border rounded"
        />
      )}
      
      {inputType === 'select' && inputSettings?.options && (
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full p-2 border rounded"
        >
          {inputSettings.options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      
      {inputType === 'toggle' && (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onChange(0)}
            className={`px-3 py-1 rounded text-sm ${
              value === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            他者使用
          </button>
          <button
            onClick={() => onChange(1)}
            className={`px-3 py-1 rounded text-sm ${
              value === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            自己使用
          </button>
        </div>
      )}
    </div>
  )
}
```

### 3. 計算結果プレビュー

```typescript
const CalculationPreview: React.FC<{
  skill: SpecialBuffSkillDetail
  parameters: Record<string, number>
}> = ({ skill, parameters }) => {
  const calculatedEffects = useMemo(() => {
    return skill.effects.map(effect => {
      const value = evaluateSpecialFormula(effect.formula, parameters)
      return {
        property: effect.property,
        value,
        propertyName: getPropertyDisplayName(effect.property)
      }
    })
  }, [skill.effects, parameters])
  
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h4 className="text-sm font-medium mb-3">計算結果プレビュー</h4>
      <div className="space-y-2">
        {calculatedEffects.map((effect, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span>{effect.propertyName}</span>
            <span className="font-medium">
              {effect.value > 0 ? '+' : ''}{effect.value}
              {effect.property.includes('Rate') ? '%' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 計算エンジン統合

### 1. 特殊計算式評価

```typescript
function evaluateSpecialFormula(
  formula: string,
  parameters: Record<string, number>
): number {
  // 安全な数式評価（eval使用せず）
  const context = {
    ...parameters,
    Math: Math,
    // 追加の関数定義
    min: Math.min,
    max: Math.max,
    floor: Math.floor,
    ceil: Math.ceil,
    round: Math.round
  }
  
  // 計算式パーサーを使用して安全に評価
  return parseAndEvaluate(formula, context)
}
```

### 2. スケーリング適用

```typescript
function applyScaling(
  baseValue: number,
  parameter: string,
  parameterValue: number,
  scalingRules: ScalingRule[]
): number {
  const rule = scalingRules.find(r => r.parameter === parameter)
  if (!rule) return baseValue
  
  for (let i = 0; i < rule.breakpoints.length; i++) {
    if (parameterValue <= rule.breakpoints[i]) {
      return baseValue * rule.multipliers[i]
    }
  }
  
  // 最大値を超えた場合は最後の倍率を使用
  return baseValue * rule.multipliers[rule.multipliers.length - 1]
}
```

この設計書により、複雑な特殊パラメータを持つバフスキルの完全な実装仕様が定義されます。プレイヤー数やHP割合など、動的に変化する要素に対応したスキルシステムが構築可能になります。