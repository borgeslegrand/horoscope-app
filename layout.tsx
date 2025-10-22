import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { LanguageProvider } from '@/contexts/LanguageContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HoroscopeMint - Günlük Burç Yorumları',
  description: 'Farcaster entegrasyonu ile günlük burç yorumlarınızı alın. Base ağı üzerinde SDCE fee ödeyerek günlük check-in yapın.',
  keywords: 'horoscope, burç, farcaster, base, blockchain, daily, günlük',
  authors: [{ name: 'HoroscopeMint Team' }],
  openGraph: {
    title: 'HoroscopeMint - Günlük Burç Yorumları',
    description: 'Farcaster entegrasyonu ile günlük burç yorumlarınızı alın.',
    type: 'website',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HoroscopeMint - Günlük Burç Yorumları',
    description: 'Farcaster entegrasyonu ile günlük burç yorumlarınızı alın.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Providers>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  )
}
