import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'AI Club | For Student Success',
  description: 'Register for AI Club and get meeting directions in seconds.',
  openGraph: {
    title: 'AI Club | For Student Success',
    description: 'Register for AI Club and get meeting directions in seconds.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'AI Club — For Student Success' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Club | For Student Success',
    description: 'Register for AI Club and get meeting directions in seconds.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
