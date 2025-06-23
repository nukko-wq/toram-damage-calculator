import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import ResultToggleBar from '@/components/layout/ResultToggleBar'

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
				<Header />
				<ResultToggleBar />
				<main>{children}</main>
			</body>
		</html>
	)
}
