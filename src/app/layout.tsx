import type { Metadata, Viewport } from 'next';
import '../app-globals.css';

export const metadata: Metadata = {
  title: 'Tadika Ceria',
  description: 'Demo sistem pengurusan tadika untuk pentadbir, guru dan ibu bapa.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d9488',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  );
}
