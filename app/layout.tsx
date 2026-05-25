import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ЕПП — Единый портал поставок | Росреестр',
  description: 'ЕПП — Единый портал поставок Росреестра. Сопровождение закупок через ЕИС и ЕАТ «Берёзка».',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#003087',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="antialiased" style={{ fontFamily: "Inter, Segoe UI, Arial, sans-serif", background: "#f4f6f9", color: "#1a2332" }}>
        {children}
      </body>
    </html>
  );
}
