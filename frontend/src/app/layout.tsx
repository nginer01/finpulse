import type { Metadata } from "next";
import { Geist, Geist_Mono, Sora, Spectral } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AIChatButton from "@/components/AIChatButton";
import { AuthProvider } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthRedirect";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Voz serif de lectura — solo para el cuerpo del artículo de /resumen (vía --font-serif).
// Nunca global ni en el logo/nav (esos siguen en Helvetica Neue).
const spectral = Spectral({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "FinPulse",
  description: "Aprende mientras inviertes. Tu plataforma personal de inteligencia financiera.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} ${spectral.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Navbar />
          <AuthGuard>
            {children}
          </AuthGuard>
          <AIChatButton />
        </AuthProvider>
      </body>
    </html>
  );
}
