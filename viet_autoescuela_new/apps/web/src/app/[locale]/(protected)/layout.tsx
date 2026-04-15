import { RequireAuthClient } from '@/components/shell';
import type { ReactNode } from 'react';
import { Suspense } from 'react';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <RequireAuthClient>{children}</RequireAuthClient>
    </Suspense>
  );
}
