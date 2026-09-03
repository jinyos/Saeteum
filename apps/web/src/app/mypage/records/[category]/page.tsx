import { notFound } from 'next/navigation';
import { isMissionCategory } from '@/common/constants';
import CategoryDetailContainer from '@/domain/Records/CategoryDetailContainer';

export default async function CategoryDetailPage({
  params,
}: PageProps<'/mypage/records/[category]'>) {
  const { category } = await params;

  if (!isMissionCategory(category)) {
    notFound();
  }

  return <CategoryDetailContainer category={category} />;
}
