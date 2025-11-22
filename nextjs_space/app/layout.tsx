
export const dynamic = "force-dynamic"

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import { SessionProvider } from '@/components/session-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Odin\'s Almanac - Restaurant Intelligence Platform',
  description: 'Advanced food safety and inventory management for restaurants',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Odin\'s Almanac - Restaurant Intelligence Platform',
    description: 'Advanced food safety and inventory management for restaurants',
    images: ['/og-image.png'],
  },
  icons: [
    { rel: 'icon', url: '/favicon.svg' },
    { rel: 'shortcut icon', url: '/favicon.svg' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
