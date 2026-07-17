import type { Metadata, Viewport } from "next";
import { AnalyticsGate } from "@/features/layout/components/analytics-gate";
import { OpfsStatusGate } from "@/features/layout/components/opfs-status-gate";
import { TauriMenuListener } from "@/features/layout/components/tauri-menu-listener";
import { Inter, Lora, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/features/theme/components/theme-provider";
import { BibleVersionProvider } from "@/features/bible-reader/context/bible-version-context";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegister } from "@/features/service-worker/components/service-worker-register";
import { UpdateBanner } from "@/features/service-worker/components/update-banner";
import { VersionLabel } from "@/features/layout/components/version-label";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ReleaseNotesProvider } from "@/features/release-notes/components/release-notes-provider";
import { ReleaseNotesToast } from "@/features/release-notes/components/release-notes-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Open Bible",
  description:
    "Leia, destaque e anote os textos bíblicos de forma simples e focada.",
  generator: "v0.app",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Open Bible",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#231f1a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`bg-background ${inter.variable} ${lora.variable} ${geistMono.variable}`}
    >
      <body className={cn("font-sans antialiased")}>
        <VersionLabel />
        <TauriMenuListener />
        <ThemeProvider>
          <BibleVersionProvider>
            <TooltipProvider>
              <ReleaseNotesProvider>
                {children}
                <ReleaseNotesToast />
              </ReleaseNotesProvider>
              <OpfsStatusGate />
              <Toaster position="bottom-right" />
            </TooltipProvider>
          </BibleVersionProvider>
        </ThemeProvider>
        <ServiceWorkerRegister />
        <UpdateBanner />
        <AnalyticsGate />
      </body>
    </html>
  );
}
