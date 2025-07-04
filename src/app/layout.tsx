import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import ResultToggleBar from '@/components/layout/ResultToggleBar'
import Footer from '@/components/layout/Footer'
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
			<body className={`${roboto.variable}`}>
				<div className="min-h-screen bg-gray-50 grid grid-custom-layout">
					<Header />
					<ResultToggleBar />
					<main className="col-start-1 col-end-5 row-start-4 row-end-5">
						{children}
					</main>
					<FloatingMenuSystem />
					<Footer />
				</div>
			</body>
		</html>
	)
}
