import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"], // sesuaikan dengan yang kamu pakai
});

export const metadata: Metadata = {
  title: "Ediganu - Editor Gambar Menu",
  description: "Aplikasi untuk mengedit gambar menu harian MBG BGN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>{children}</body>
    </html>
  );
}
