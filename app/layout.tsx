import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

function resolveSiteUrl(): string {
  // Prefer an explicitly configured SITE_URL, then Vercel's own deployment
  // domain, then localhost. Guard against empty or malformed values so the
  // build never crashes on `new URL(...)`.
  const configured = process.env.SITE_URL?.trim();
  if (configured) {
    try {
      return new URL(configured).toString();
    } catch {
      // Ignore an invalid SITE_URL and fall back below.
    }
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl}`;

  return 'http://localhost:3000';
}

const siteUrl = resolveSiteUrl();

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
