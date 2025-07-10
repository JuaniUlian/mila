
import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LayoutProvider } from '@/context/LayoutContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import MainContent from '@/components/layout/MainContent'; // Cambiado de AppLayout a MainContent

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'MILA | Gobernar bien es revisar bien',
  description: 'AI-Powered Normative Document Improvement',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} antialiased`}>
        <LanguageProvider>
          <LayoutProvider>
            <AuthProvider>
              <MainContent>{children}</MainContent>
            </AuthProvider>
          </LayoutProvider>
        </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}
