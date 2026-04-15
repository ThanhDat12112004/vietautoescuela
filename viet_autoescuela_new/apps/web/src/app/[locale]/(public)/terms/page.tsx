import { buildLegalMetadata, LegalDocScreen } from '@/features/legal';

export function generateMetadata({ params }: { params: { locale: string } }) {
  return buildLegalMetadata('terms', params.locale);
}

export default function TermsPage() {
  return <LegalDocScreen docId="terms" />;
}
