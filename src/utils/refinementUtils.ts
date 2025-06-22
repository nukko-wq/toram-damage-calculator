// 精錬値表示形式の型定義
export type RefinementDisplay =
	| '未精錬'
	| '1'
	| '2'
	| '3'
	| '4'
	| '5'
	| '6'
	| '7'
	| '8'
	| '9'
	| 'E'
	| 'D'
	| 'C'
	| 'B'
	| 'A'
	| 'S'

// 精錬値内部計算値の型定義
export type RefinementValue =
	| 0
	| 1
	| 2
	| 3
	| 4
	| 5
	| 6
	| 7
	| 8
	| 9
	| 10
	| 11
	| 12
	| 13
	| 14
	| 15

// 精錬値表示形式から内部計算値への変換マップ
export const REFINEMENT_DISPLAY_MAP: Record<
	RefinementDisplay,
	RefinementValue
> = {
	未精錬: 0,
	'1': 1,
	'2': 2,
	'3': 3,
	'4': 4,
	'5': 5,
	'6': 6,
	'7': 7,
	'8': 8,
	'9': 9,
	E: 10,
	D: 11,
	C: 12,
	B: 13,
	A: 14,
	S: 15,
}

// 精錬値内部計算値から表示形式への変換マップ
export const REFINEMENT_VALUE_MAP: Record<RefinementValue, RefinementDisplay> =
	{
		0: '未精錬',
		1: '1',
		2: '2',
		3: '3',
		4: '4',
		5: '5',
		6: '6',
		7: '7',
		8: '8',
		9: '9',
		10: 'E',
		11: 'D',
		12: 'C',
		13: 'B',
		14: 'A',
		15: 'S',
	}

/**
 * 表示形式から内部計算値への変換
 */
export function refinementDisplayToValue(
	display: RefinementDisplay,
): RefinementValue {
	return REFINEMENT_DISPLAY_MAP[display]
}

/**
 * 内部計算値から表示形式への変換
 */
export function refinementValueToDisplay(
	value: RefinementValue,
): RefinementDisplay {
	return REFINEMENT_VALUE_MAP[value]
}

/**
 * 選択可能な精錬値表示形式のリストを取得
 */
export function getRefinementDisplayOptions(): RefinementDisplay[] {
	return [
		'未精錬',
		'1',
		'2',
		'3',
		'4',
		'5',
		'6',
		'7',
		'8',
		'9',
		'E',
		'D',
		'C',
		'B',
		'A',
		'S',
	]
}

/**
 * 精錬値が有効な範囲内かチェック
 */
export function isValidRefinementDisplay(
	display: string,
): display is RefinementDisplay {
	return display in REFINEMENT_DISPLAY_MAP
}

/**
 * 精錬値が有効な範囲内かチェック
 */
export function isValidRefinementValue(
	value: number,
): value is RefinementValue {
	return Number.isInteger(value) && value >= 0 && value <= 15
}

/**
 * レガシー数値精錬値から表示形式への変換（後方互換性用）
 */
export function legacyRefinementToDisplay(
	legacyValue: number,
): RefinementDisplay {
	if (!isValidRefinementValue(legacyValue)) {
		return '未精錬'
	}
	return refinementValueToDisplay(legacyValue as RefinementValue)
}
