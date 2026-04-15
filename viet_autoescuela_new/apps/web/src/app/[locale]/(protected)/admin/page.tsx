import { Admin } from '@/screens';
import { Suspense } from 'react';

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <Admin />
    </Suspense>
  );
}
