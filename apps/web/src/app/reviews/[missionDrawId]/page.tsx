import ReviewDetailContainer from '@/domain/Reviews/ReviewDetailContainer';

export default async function ReviewsDetailPage({
  params,
}: PageProps<'/reviews/[missionDrawId]'>) {
  const { missionDrawId } = await params;

  return <ReviewDetailContainer missionDrawId={missionDrawId} />;
}
