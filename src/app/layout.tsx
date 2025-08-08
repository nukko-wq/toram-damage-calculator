import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import { FloatingMenuSystem } from '@/components/floating-menu'
import FloatingSavePanel from '@/components/layout/FloatingSavePanel'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import ResultToggleBar from '@/components/layout/ResultToggleBar'

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
	icons: {
		icon: [
			{
				url: '/icon.png',
				sizes: '192x192',
				type: 'image/png',
			},
			{
				url: '/icon-512.png',
				sizes: '512x512',
				type: 'image/png',
			},
		],
		apple: [
			{
				url: '/apple-icon.png',
				sizes: '180x180',
				type: 'image/png',
			},
		],
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
					<FloatingSavePanel />
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
