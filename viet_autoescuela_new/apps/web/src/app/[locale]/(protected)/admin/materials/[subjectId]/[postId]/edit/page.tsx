import { AdminMaterialPostEdit } from '@/screens';

type Props = { params: { subjectId: string; postId: string } };

export default function AdminMaterialPostEditPage({ params }: Props) {
  const subjectId = Number(params.subjectId);
  const postId = Number(params.postId);
  return <AdminMaterialPostEdit subjectId={subjectId} postId={postId} />;
}
