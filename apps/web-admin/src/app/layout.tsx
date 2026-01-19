import type { Metadata } from 'next'
import { Cinzel_Decorative, Manrope } from 'next/font/google'
import './globals.css'

const cinzelDecorative = Cinzel_Decorative({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-cinzel-decorative',
  display: 'swap',
})

const manrope = Manrope({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Angeline NJ Live - Admin',
  description: 'Dashboard admin pour le live IA Angeline NJ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${cinzelDecorative.variable} ${manrope.variable}`}>
      <body className="star-field grain-overlay">
        <div className="glow-blobs"></div>
        {children}
      </body>
    </html>
  )
}
