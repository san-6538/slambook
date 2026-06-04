import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Providers from './Providers';
import Header from './components/Header';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Slambook',
  description: 'Create personalized, emotional memories for your friends.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-slate-50 min-h-screen text-slate-900`}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
