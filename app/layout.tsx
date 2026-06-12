import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Veriphy — Veille Réglementaire Pesticides',
  description: 'Alertes réglementaires pesticides en temps réel pour l\'export agricole',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
