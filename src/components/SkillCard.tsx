"use client";

import { useState } from "react";
import { Popover } from "./Popover";
import { SkillParameterForm } from "./SkillParameterForm";
import ToggleSwitch from "./ToggleSwitch";
import type { BuffSkill, BuffSkillParameters } from "@/types/calculator";

interface SkillCardProps {
	skill: BuffSkill;
	categoryLabel: string;
	onToggle: (skillId: string, enabled: boolean) => void;
	onParameterChange: (skillId: string, parameters: BuffSkillParameters) => void;
}

export default function SkillCard({
	skill,
	categoryLabel,
	onToggle,
	onParameterChange,
}: SkillCardProps) {
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);

	// スキル名の表示形式を決定（パラメータ値付き）
	const getDisplayName = (): string => {
		// 特殊パラメータスキルの表示形式
		switch (skill.id) {
			case "eternal_nightmare":
				if (skill.parameters.skillLevel) {
					return `${skill.name}/${skill.parameters.skillLevel}`;
				}
				return skill.name;

			case "knight_pledge":
				if (skill.parameters.skillLevel) {
					return `${skill.name}/${skill.parameters.skillLevel}`;
				}
				return skill.name;

			case "brave":
				// ブレイブは基本名のみ（isCasterは内部パラメータとして扱う）
				return skill.name;

			case "godspeed_parry":
			case "passion_song":
			case "tornado_lance":
				// 重ねがけスキルは×記号で重ねがけ数を表示
				if (skill.parameters.stackCount) {
					return `${skill.name}×${skill.parameters.stackCount}`;
				}
				return skill.name;

			default:
				// 通常のスキルレベル表示
				if (skill.parameters.skillLevel) {
					return `${skill.name}/${skill.parameters.skillLevel}`;
				}

				// スタックカウント表示
				if (skill.parameters.stackCount) {
					return `${skill.name}(${skill.parameters.stackCount})`;
				}

				// その他は基本名のみ
				return skill.name;
		}
	};

	// パラメータが必要かどうかを判定
	const hasParameters = (): boolean => {
		switch (skill.id) {
			// マスタリスキル
			case "halberd_mastery":
			case "blade_mastery":
			case "shoot_mastery":
			case "magic_mastery":
			case "martial_mastery":
			case "dual_mastery":
			case "shield_mastery":
				return true;

			// レベル設定があるスキル
			case "long_range":
			case "quick_aura":
			case "bushido":
			case "meikyo_shisui":
			case "kairiki_ranshin":
			case "shinsoku_no_kiseki":
			case "philo_eclaire":
			case "eternal_nightmare":
			case "knight_pledge":
			case "camouflage":
			case "nindo":
			case "ninjutsu":
			case "ninjutsu_tanren_1":
			case "ninjutsu_tanren_2":
			case "mp_boost":
			case "hp_boost":
			case "attack_up":
			case "kyoi_no_iryoku":
			case "magic_power_up":
			case "sara_naru_maryoku":
			case "hit_up":
			case "dodge_up":
			case "zensen_iji_2":
			// 重ねがけ系
			case "tornado_lance":
			case "passion_song":
			case "godspeed_parry":
			// 特殊パラメータスキル
			case "brave":
				return true;

			// パラメータ不要（オン/オフのみ）
			default:
				return false;
		}
	};

	const handleParameterSave = (parameters: BuffSkillParameters) => {
		onParameterChange(skill.id, parameters);
		setIsPopoverOpen(false);
	};

	const handleParameterCancel = () => {
		setIsPopoverOpen(false);
	};

	return (
		<div className="border-b-2 border-blue-200">
			{/* カテゴリラベル */}
			<div className="text-xs text-gray-500 font-medium mb-1">
				{categoryLabel}
			</div>

			{/* スキル名とトグルスイッチ */}
			<div className="skill-header flex items-center justify-between mb-1">
				{hasParameters() ? (
					<Popover
						trigger={
							<span className="skill-name text-sm font-medium text-gray-700 flex-1 mr-2 leading-tight hover:text-blue-600 cursor-pointer">
								{getDisplayName()}
							</span>
						}
						isOpen={isPopoverOpen}
						onOpenChange={setIsPopoverOpen}
						placement="center"
					>
						<SkillParameterForm
							skill={skill}
							onSave={handleParameterSave}
							onCancel={handleParameterCancel}
						/>
					</Popover>
				) : (
					<span className="skill-name text-sm font-medium text-gray-700 flex-1 mr-2 leading-tight">
						{getDisplayName()}
					</span>
				)}
				<ToggleSwitch
					checked={skill.isEnabled}
					onChange={(checked) => onToggle(skill.id, checked)}
					size="sm"
				/>
			</div>
		</div>
	);
}
