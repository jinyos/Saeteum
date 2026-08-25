import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import { AppShell } from '@/common/layouts/AppShell';
import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
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
        <QueryProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
