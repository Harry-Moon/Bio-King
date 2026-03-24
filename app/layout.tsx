import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { AuthProvider } from '@/components/auth/auth-provider';
import { LanguageProvider } from '@/lib/i18n/language-context';
import { ThemeProvider } from '@/lib/theme/theme-context';

const satoshi = localFont({
  src: [
    {
      path: '../assets/fonts/Satoshi-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Satoshi-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Satoshi-Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../assets/fonts/Satoshi-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Satoshi-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-satoshi',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BioKing',
  description: 'Application de gestion biologique',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={satoshi.variable}>
      <body className="font-sans">
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <AppLayout>{children}</AppLayout>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
