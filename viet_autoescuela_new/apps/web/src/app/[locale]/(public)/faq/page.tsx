import { buildLegalMetadata, FaqScreen } from '@/features/legal';

export function generateMetadata({ params }: { params: { locale: string } }) {
  return buildLegalMetadata('faq', params.locale);
}

export default function FaqPage() {
  return <FaqScreen />;
}
