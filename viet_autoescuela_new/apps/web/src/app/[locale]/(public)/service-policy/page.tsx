import { buildLegalMetadata, LegalDocScreen } from '@/features/legal';

export function generateMetadata({ params }: { params: { locale: string } }) {
  return buildLegalMetadata('service', params.locale);
}

export default function ServicePolicyPage() {
  return <LegalDocScreen docId="service" />;
}
