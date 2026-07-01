import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Inter, Lora, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/features/theme/components/theme-provider";
import { BibleVersionProvider } from "@/features/bible-reader/context/bible-version-context";
import { ToastProvider } from "@/features/layout/hooks/use-toast";
import { ServiceWorkerRegister } from "@/features/service-worker/components/service-worker-register";
import { UpdateBanner } from "@/features/service-worker/components/update-banner";
import { DevBanner } from "@/features/layout/components/dev-banner";
import { VersionLabel } from "@/features/layout/components/version-label";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ENV_LABEL } from "@/lib/app-env";

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
      <body
        className={cn(
          "font-sans antialiased",
          ENV_LABEL.development || ENV_LABEL.staging ? "pt-6" : "",
        )}
      >
        <DevBanner />
        <VersionLabel />
        <ThemeProvider>
          <BibleVersionProvider>
            <TooltipProvider>
              <ToastProvider>{children}</ToastProvider>
            </TooltipProvider>
          </BibleVersionProvider>
        </ThemeProvider>
        <ServiceWorkerRegister />
        <UpdateBanner />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
