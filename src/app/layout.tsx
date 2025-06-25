
import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { MainSidebar } from '@/components/layout/main-sidebar';
import { LayoutProvider } from '@/context/LayoutContext';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'Mila - Plantilla Viva',
  description: 'AI-Powered Normative Document Improvement',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 
        nunito.variable applies a class that defines the CSS variable --font-nunito.
        The font-family is now explicitly set in globals.css using this variable.
        The font-sans class is removed from here as it's no longer the primary mechanism.
      */}
      <body className={`${nunito.variable} antialiased`}>
        <LayoutProvider>
          <div className="flex min-h-screen bg-slate-100">
            <MainSidebar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </LayoutProvider>
        <Toaster />
      </body>
    </html>
  );
}
