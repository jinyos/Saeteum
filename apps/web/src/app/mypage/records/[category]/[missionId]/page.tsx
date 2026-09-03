import { notFound } from 'next/navigation';
import MissionRecordContainer from '@/domain/Records/MissionRecordContainer';

export default async function RecordsDetailPage({
  params,
}: PageProps<'/mypage/records/[category]/[missionId]'>) {
  const { missionId } = await params;
  const parsedMissionId = Number(missionId);

  if (!Number.isInteger(parsedMissionId)) {
    notFound();
  }

  return <MissionRecordContainer missionId={parsedMissionId} />;
}
