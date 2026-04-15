import { MaterialPost } from '@/screens';

type Props = { params: { subjectId: string; postId: string } };

export default function MaterialPostPage({ params }: Props) {
  const subjectId = Number(params.subjectId);
  const postId = Number(params.postId);
  return <MaterialPost subjectId={subjectId} postId={postId} />;
}
