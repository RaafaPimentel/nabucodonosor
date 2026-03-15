import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Oraculum",
  description: "A premium global technology intelligence dashboard."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 font-sans text-white antialiased">{children}</body>
    </html>
  );
}
