import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'

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
				<main>{children}</main>
			</body>
		</html>
	)
}
