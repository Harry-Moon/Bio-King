import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { AuthProvider } from '@/components/auth/auth-provider';
import { LanguageProvider } from '@/lib/i18n/language-context';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            <AppLayout>{children}</AppLayout>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
