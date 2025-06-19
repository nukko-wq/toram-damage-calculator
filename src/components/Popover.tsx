"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface PopoverProps {
	children: React.ReactNode;
	trigger: React.ReactNode;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	placement?: "top" | "bottom" | "left" | "right" | "center";
	className?: string;
}

export function Popover({
	children,
	trigger,
	isOpen,
	onOpenChange,
	placement = "bottom",
	className = "",
}: PopoverProps) {
	const triggerRef = useRef<HTMLButtonElement>(null);
	const popoverRef = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState({ top: 0, left: 0 });

	// ポップオーバーの位置を計算
	useEffect(() => {
		if (!isOpen) return;

		const updatePosition = () => {
			if (placement === "center") {
				// 画面中央に固定（スクロール位置に影響されない）
				const viewportWidth = window.innerWidth;
				const viewportHeight = window.innerHeight;

				const top = viewportHeight / 2;
				const left = viewportWidth / 2;

				setPosition({ top, left });
				return;
			}

			// トリガー要素が必要な場合
			if (!triggerRef.current) return;
			const triggerRect = triggerRef.current.getBoundingClientRect();
			const scrollX = window.scrollX;
			const scrollY = window.scrollY;

			let top = 0;
			let left = 0;

			switch (placement) {
				case "bottom":
					top = triggerRect.bottom + scrollY + 8;
					left = triggerRect.left + scrollX;
					break;
				case "top":
					top = triggerRect.top + scrollY - 8;
					left = triggerRect.left + scrollX;
					break;
				case "left":
					top = triggerRect.top + scrollY;
					left = triggerRect.left + scrollX - 8;
					break;
				case "right":
					top = triggerRect.top + scrollY;
					left = triggerRect.right + scrollX + 8;
					break;
			}

			setPosition({ top, left });
		};

		updatePosition();

		// 中央表示の場合はリサイズイベントのみ監視
		if (placement === "center") {
			window.addEventListener("resize", updatePosition);
			return () => {
				window.removeEventListener("resize", updatePosition);
			};
		}

		// その他の配置の場合はスクロール・リサイズ両方を監視
		window.addEventListener("scroll", updatePosition);
		window.addEventListener("resize", updatePosition);

		return () => {
			window.removeEventListener("scroll", updatePosition);
			window.removeEventListener("resize", updatePosition);
		};
	}, [isOpen, placement]);

	// 外部クリックでポップオーバーを閉じる
	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(event.target as Node) &&
				triggerRef.current &&
				!triggerRef.current.contains(event.target as Node)
			) {
				onOpenChange(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen, onOpenChange]);

	// Escapeキーでポップオーバーを閉じる
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onOpenChange(false);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onOpenChange]);

	const handleTriggerClick = () => {
		onOpenChange(!isOpen);
	};

	const handleTriggerKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onOpenChange(!isOpen);
		}
	};

	const popoverContent = isOpen
		? createPortal(
				<>
					{/* 中央表示の場合は背景オーバーレイを追加 */}
					{placement === "center" && (
						<div className="fixed inset-0 z-40 bg-black/50" />
					)}
					<div
						ref={popoverRef}
						className={`
							fixed z-50 
							bg-white border border-gray-300 rounded-lg shadow-lg
							min-w-64 max-w-sm
							${placement === "top" ? "mb-2" : ""}
							${placement === "bottom" ? "mt-2" : ""}
							${placement === "left" ? "mr-2" : ""}
							${placement === "right" ? "ml-2" : ""}
							${className}
						`}
						style={{
							top: `${position.top}px`,
							left: `${position.left}px`,
							transform:
								placement === "center"
									? "translate(-50%, -50%)"
									: placement === "top"
										? "translateY(-100%)"
										: placement === "left"
											? "translateX(-100%)"
											: "none",
						}}
					>
						{children}
					</div>
				</>,
				document.body,
			)
		: null;

	return (
		<>
			<button
				ref={triggerRef}
				onClick={handleTriggerClick}
				onKeyDown={handleTriggerKeyDown}
				className="cursor-pointer border-0 bg-transparent text-left"
				type="button"
				aria-expanded={isOpen}
			>
				{trigger}
			</button>
			{popoverContent}
		</>
	);
}
