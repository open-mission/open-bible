import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Lora, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { BibleVersionProvider } from '@/lib/bible-version-context'
import { ServiceWorkerRegister } from '@/components/service-worker-register'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Open Bible',
  description: 'Leia, destaque e anote os textos bíblicos de forma simples e focada.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Open Bible',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f4ef' },
    { media: '(prefers-color-scheme: dark)', color: '#231f1a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`bg-background ${inter.variable} ${lora.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider>
          <BibleVersionProvider>
            {children}
          </BibleVersionProvider>
        </ThemeProvider>
        <ServiceWorkerRegister />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
