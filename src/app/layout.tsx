import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import ResultToggleBar from '@/components/layout/ResultToggleBar'
import { FloatingMenuSystem } from '@/components/floating-menu'

// Robotoフォントの設定（数字表示用）
const roboto = Roboto({
	weight: ['400', '500', '700'],
	subsets: ['latin'],
	variable: '--font-roboto',
	display: 'swap',
})

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
			<body className={roboto.variable}>
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
