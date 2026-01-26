import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";
import { generateWebsiteStructuredData } from "@/lib/seo";
import { authOptions } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LouWill's Tech Blog",
    template: "%s | LouWill's Tech Blog"
  },
  description: "AI Algorithm Engineer sharing insights on technology, AI algorithms, and product reviews. Deep dives into machine learning, web development, and industry insights.",
  authors: [{ name: "LouWill", url: "https://www.louwill.com" }],
  keywords: ["AI", "Algorithm", "Technology", "Blog", "Machine Learning", "Deep Learning", "Web Development", "Full Stack", "React", "Next.js"],
  creator: "LouWill",
  publisher: "LouWill",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.louwill.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.louwill.com',
    title: "LouWill's Tech Blog",
    description: "AI Algorithm Engineer sharing insights on technology, AI algorithms, and product reviews.",
    siteName: "LouWill's Tech Blog",
  },
  twitter: {
    card: 'summary_large_image',
    title: "LouWill's Tech Blog",
    description: "AI Algorithm Engineer sharing insights on technology, AI algorithms, and product reviews.",
    creator: '@louwill',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteStructuredData = generateWebsiteStructuredData()
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LocaleProvider>
              <AnalyticsTracker />
              {children}
              <Toaster />
            </LocaleProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
