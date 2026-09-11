import type { Metadata } from "next";
import "./globals.css";
import { AuditProvider } from "@/shared/context";
import ThemeRegistry from "@/theme/ThemeRegistry";

export const metadata: Metadata = {
  title: "Audit Management System | Enterprise Multi-Tenant Platform",
  description: "Enterprise multi-tenant ISO and GMP audit governance and compliance platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-slate-100/70 text-slate-900 transition-colors duration-200">
        <ThemeRegistry>
          <AuditProvider>{children}</AuditProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
