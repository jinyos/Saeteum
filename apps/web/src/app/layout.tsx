import type { Metadata, Viewport } from 'next';
import { AppShell } from '@/common/layouts/AppShell';
import { fontVariables } from '@/styles/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: '새틈',
};

export const viewport: Viewport = {
  viewportFit: 'cover',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className={`${fontVariables} h-full antialiased`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
