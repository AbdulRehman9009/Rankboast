"use client";
import { ThemeProvider as NextThemeProvider } from "next-themes"
import { useEffect, useState } from "react";
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const id = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(id);
    }, []);

    if (!mounted) return null;
    return <NextThemeProvider defaultTheme="system" enableSystem attribute="class">{children}</NextThemeProvider>
}