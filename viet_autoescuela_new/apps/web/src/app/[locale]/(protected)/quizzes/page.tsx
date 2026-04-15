import { Quizzes } from '@/screens';
import { Suspense } from 'react';

export default function QuizzesPage() {
  return (
    <Suspense fallback={null}>
      <Quizzes />
    </Suspense>
  );
}
