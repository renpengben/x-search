import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'X-Search',
  description: 'Created with X-Search',
  generator: 'X-Search.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
