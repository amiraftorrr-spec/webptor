import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "webptor — Fast Image to WebP Converter",
  description:
    "Convert any image to high-quality WebP format instantly in your browser. 100% private, zero uploads, unlimited batch conversion.",
  keywords: [
    "webptor",
    "webp converter",
    "image to webp",
    "png to webp",
    "jpg to webp",
    "jpeg to webp",
    "heic to webp",
    "convert to webp",
    "windows xp webp converter",
  ],
  authors: [{ name: "amir aftor" }],
  openGraph: {
    title: "webptor — Instant Image to WebP Converter",
    description:
      "Batch convert any image to lightweight WebP format right in your browser.",
    type: "website",
    locale: "en_US",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f19" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem('theme');
                  if (storedTheme === 'win-xp' || storedTheme === 'xp') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('win-xp');
                  } else if (storedTheme === 'light') {
                    document.documentElement.classList.remove('dark', 'win-xp');
                  } else {
                    document.documentElement.classList.remove('win-xp');
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0d14] text-slate-900 dark:text-slate-100 transition-colors duration-200`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
