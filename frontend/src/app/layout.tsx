import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/use-auth";
import { SandboxProvider } from "@/hooks/use-sandbox";


const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CloudCart Control Panel — Distributed Commerce Platform",
  description: "Developer console for monitoring and orchestrating cloud-native microservices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FFFDF9] text-[#2E2522] selection:bg-pink-500/20 selection:text-pink-700">
        <SandboxProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SandboxProvider>
      </body>
    </html>
  );
}
