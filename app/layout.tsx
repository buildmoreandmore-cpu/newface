import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Next New Face | AI-Powered Model Discovery',
  description:
    'Next New Face scans millions of profiles to find unsigned talent with model potential — so your agency can reach them first.',
  keywords: [
    'modeling agency',
    'talent scouting',
    'fashion',
    'AI discovery',
    'model scouting',
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
      <head>
        <style>{`
          .font-editorial {
            font-family: var(--font-playfair), 'Playfair Display', serif;
          }
        `}</style>
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
