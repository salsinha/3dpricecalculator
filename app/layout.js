import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata = {
  title: {
    default: "3D J.A. – Price Calculator",
    template: "%s · 3D J.A.",
  },
  description:
    "Gestão e cálculo de preços de peças impressas em 3D para a 3D J.A. Create & Print Studio.",
  icons: { icon: "/logo.jpg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
