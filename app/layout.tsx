import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NEWFACE | Discover Tomorrow\'s Faces Today',
  description:
    'Premium fashion talent scouting platform with AI-powered analysis. Discover, analyze, and manage modeling talent with cutting-edge technology.',
  keywords: [
    'modeling agency',
    'talent scouting',
    'fashion',
    'AI analysis',
    'talent management',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
