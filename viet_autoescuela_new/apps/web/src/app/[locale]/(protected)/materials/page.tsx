import { Materials } from '@/screens';
import { Suspense } from 'react';

export default function MaterialsPage() {
  return (
    <Suspense fallback={null}>
      <Materials />
    </Suspense>
  );
}
