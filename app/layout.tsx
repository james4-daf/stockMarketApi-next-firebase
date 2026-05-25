import type { Metadata } from 'next';
import AppContent from './AppContent';
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: '/tikrchecklogo.png',
    shortcut: '/tikrchecklogo.png',
    apple: '/tikrchecklogo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <main className="flex flex-col min-h-screen">
          <AppContent>{children}</AppContent>
        </main>
      </body>
    </html>
  );
}
