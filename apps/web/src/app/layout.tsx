import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalDB Hub",
  description: "Local database control plane for developers and teams"
};

const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("localdb-hub-theme");
    var preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    var theme = stored || preferred;
    document.documentElement.dataset.theme = theme;
  } catch (_) {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
