import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Transcrição de Áudio",
    description: "Transcreva áudios para texto de forma simples e rápida",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body
            className="bg-[url('/fundo.jpg')] bg-cover bg-center flex items-center justify-center min-h-screen"
        >
        {children}
        </body>
        </html>
    );
}
