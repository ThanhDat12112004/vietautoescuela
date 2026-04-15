import { ResetPassword } from '@/screens';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}
