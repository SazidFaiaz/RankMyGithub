"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  resolvedTheme: "light" | "dark";
  ready: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  resolvedTheme: "light",
  ready: false,
  toggleTheme: () => undefined,
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 5 * 60_000, retry: 1 } },
  }));
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const systemPreference = window.matchMedia("(prefers-color-scheme: dark)");
    let storedTheme: string | null = null;
    try {
      storedTheme = window.localStorage.getItem("gitrate-theme");
    } catch {
      storedTheme = null;
    }
    const initialTheme: Theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : "system";
    const initialResolved = initialTheme === "system" ? systemPreference.matches ? "dark" : "light" : initialTheme;
    setTheme(initialTheme);
    setResolvedTheme(initialResolved);
    document.documentElement.dataset.theme = initialResolved;
    document.documentElement.style.colorScheme = initialResolved;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const systemPreference = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const resolved = theme === "system" ? systemPreference.matches ? "dark" : "light" : theme;
      document.documentElement.dataset.theme = resolved;
      document.documentElement.style.colorScheme = resolved;
      setResolvedTheme(resolved);
    };

    applyTheme();
    systemPreference.addEventListener("change", applyTheme);
    return () => systemPreference.removeEventListener("change", applyTheme);
  }, [ready, theme]);

  const toggleTheme = () => {
    if (!ready) return;
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    try {
      window.localStorage.setItem("gitrate-theme", nextTheme);
    } catch {
      setTheme(nextTheme);
      return;
    }
    setTheme(nextTheme);
  };

  return <ThemeContext.Provider value={{ resolvedTheme, ready, toggleTheme }}>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </ThemeContext.Provider>;
}