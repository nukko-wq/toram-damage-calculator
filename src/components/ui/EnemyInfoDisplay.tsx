'use client'

import { getPresetEnemyById } from '@/utils/enemyDatabase'

interface EnemyInfoDisplayProps {
	selectedEnemyId: string | null
	className?: string
}

export default function EnemyInfoDisplay({
	selectedEnemyId,
	className = '',
}: EnemyInfoDisplayProps) {
	// 選択されている敵の名前を取得
	const getSelectedEnemyName = (): string => {
		if (selectedEnemyId) {
			const enemy = getPresetEnemyById(selectedEnemyId)
			if (enemy) {
				return enemy.name
			}
		}
		return '未選択'
	}

	// 選択されている敵のデータを取得
	const selectedEnemy = selectedEnemyId
		? getPresetEnemyById(selectedEnemyId)
		: null

	return (
		<div className={`pb-1 sm:p-2 ${className}`}>
			<p className="text-sm font-medium text-gray-700">
				敵：{getSelectedEnemyName()}
			</p>
			{/* 無属性敵選択時の注意書き */}
			{selectedEnemy?.isNonElemental && (
				<p className="text-xs text-orange-600 mt-1">
					※この敵は属性覚醒の有利+25%が適用されません。
				</p>
			)}
		</div>
	)
}
