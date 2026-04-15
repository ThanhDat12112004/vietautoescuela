'use client';

import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuthSessionManager } from '@/hooks/useAuthSessionManager';
import { LanguageProvider, useLanguage } from '@/hooks/useLanguage';
import type { Language } from '@/lib/api/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

function AuthSessionManager() {
  const { tk } = useLanguage();
  useAuthSessionManager(tk);
  return null;
}

export function AppProviders({
  children,
  initialLang,
}: {
  children: ReactNode;
  initialLang: Language;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider initialLang={initialLang}>
        <TooltipProvider>
          <AuthSessionManager />
          <Toaster />
          <Sonner />
          {children}
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
