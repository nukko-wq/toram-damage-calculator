'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface PopoverProps {
	children: React.ReactNode
	trigger: React.ReactNode
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	placement?: 'top' | 'bottom' | 'left' | 'right'
	className?: string
}

export function Popover({
	children,
	trigger,
	isOpen,
	onOpenChange,
	placement = 'bottom',
	className = '',
}: PopoverProps) {
	const triggerRef = useRef<HTMLButtonElement>(null)
	const popoverRef = useRef<HTMLDivElement>(null)
	const [position, setPosition] = useState({ top: 0, left: 0 })

	// ポップオーバーの位置を計算
	useEffect(() => {
		if (!isOpen || !triggerRef.current) return

		const updatePosition = () => {
			if (!triggerRef.current) return
			const triggerRect = triggerRef.current.getBoundingClientRect()
			const scrollX = window.scrollX
			const scrollY = window.scrollY

			let top = 0
			let left = 0

			switch (placement) {
				case 'bottom':
					top = triggerRect.bottom + scrollY + 8
					left = triggerRect.left + scrollX
					break
				case 'top':
					top = triggerRect.top + scrollY - 8
					left = triggerRect.left + scrollX
					break
				case 'left':
					top = triggerRect.top + scrollY
					left = triggerRect.left + scrollX - 8
					break
				case 'right':
					top = triggerRect.top + scrollY
					left = triggerRect.right + scrollX + 8
					break
			}

			setPosition({ top, left })
		}

		updatePosition()
		window.addEventListener('scroll', updatePosition)
		window.addEventListener('resize', updatePosition)

		return () => {
			window.removeEventListener('scroll', updatePosition)
			window.removeEventListener('resize', updatePosition)
		}
	}, [isOpen, placement])

	// 外部クリックでポップオーバーを閉じる
	useEffect(() => {
		if (!isOpen) return

		const handleClickOutside = (event: MouseEvent) => {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(event.target as Node) &&
				triggerRef.current &&
				!triggerRef.current.contains(event.target as Node)
			) {
				onOpenChange(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [isOpen, onOpenChange])

	// Escapeキーでポップオーバーを閉じる
	useEffect(() => {
		if (!isOpen) return

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onOpenChange(false)
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [isOpen, onOpenChange])

	const handleTriggerClick = () => {
		onOpenChange(!isOpen)
	}

	const handleTriggerKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			onOpenChange(!isOpen)
		}
	}

	const popoverContent = isOpen
		? createPortal(
				<div
					ref={popoverRef}
					className={`
						fixed z-50 
						bg-white border border-gray-300 rounded-lg shadow-lg
						min-w-64 max-w-sm
						${placement === 'top' ? 'mb-2' : ''}
						${placement === 'bottom' ? 'mt-2' : ''}
						${placement === 'left' ? 'mr-2' : ''}
						${placement === 'right' ? 'ml-2' : ''}
						${className}
					`}
					style={{
						top: `${position.top}px`,
						left: `${position.left}px`,
						transform:
							placement === 'top'
								? 'translateY(-100%)'
								: placement === 'left'
									? 'translateX(-100%)'
									: 'none',
					}}
				>
					{children}
				</div>,
				document.body,
			)
		: null

	return (
		<>
			<button
				ref={triggerRef}
				onClick={handleTriggerClick}
				onKeyDown={handleTriggerKeyDown}
				className="cursor-pointer border-0 bg-transparent p-0 w-full text-left"
				type="button"
				aria-expanded={isOpen}
			>
				{trigger}
			</button>
			{popoverContent}
		</>
	)
}
