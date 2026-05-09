import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from '@/hooks/useAuth';
import { ReduxProvider } from '@/store/ReduxProvider';
import { GlobalToastProvider } from '@/components/layout/GlobalToastProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Multi-Tenant CRM",
  description: "Production-grade CRM system with multi-tenancy support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ReduxProvider>
          <AppProvider>{children}</AppProvider>
          <GlobalToastProvider />
        </ReduxProvider>
      </body>
    </html>
  );
}
