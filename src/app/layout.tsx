import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import ResultToggleBar from '@/components/layout/ResultToggleBar'
import { FloatingMenuSystem } from '@/components/floating-menu'

export const metadata: Metadata = {
	title: 'トーラムダメージ計算',
	description: 'トーラムダメージ計算',
	robots: {
		index: false,
		follow: false,
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="ja">
			<body>
				<div className="min-h-screen">
					<Header />
					<ResultToggleBar />
					<main>{children}</main>
					<FloatingMenuSystem />
				</div>
			</body>
		</html>
	)
}
