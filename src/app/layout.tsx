import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Banner } from "@/components/Banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PI III — Cadastro de Colaboradores",
  description:
    "Sistema de cadastro de colaboradores — Projeto Interdisciplinar III",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <Banner />
        <header className="border-b bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold">
              Cadastro de Colaboradores
            </Link>
            <nav className="text-sm flex gap-4">
              <Link href="/colaboradores" className="hover:underline">
                Colaboradores
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
          {children}
        </main>
        <footer className="border-t text-xs text-gray-500 py-3 text-center">
          Projeto Interdisciplinar III — UniCEUMA — Igor Fiquene Pessoa (RA
          007747)
        </footer>
      </body>
    </html>
  );
}
