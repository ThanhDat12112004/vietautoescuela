'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useRouterSearchParams(): [
  ReturnType<typeof useSearchParams>,
  (next: URLSearchParams, opts?: { replace?: boolean }) => void,
] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setSearchParams = useCallback(
    (next: URLSearchParams, opts?: { replace?: boolean }) => {
      const q = next.toString();
      const url = q ? `${pathname}?${q}` : pathname;
      if (opts?.replace) router.replace(url);
      else router.push(url);
    },
    [pathname, router]
  );

  return [searchParams, setSearchParams];
}
