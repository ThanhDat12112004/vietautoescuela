import { QuizTake } from '@/screens';
import { Suspense } from 'react';

export default function QuizTakePage() {
  return (
    <Suspense fallback={null}>
      <QuizTake />
    </Suspense>
  );
}
