import type { Metadata } from 'next'
import './globals.css'

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
			<body>{children}</body>
		</html>
	)
}
