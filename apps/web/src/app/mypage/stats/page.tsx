import { AnalysisTab } from '@/common/layouts/AnalysisTab';
import StatsContainer from '@/domain/Stats/StatsContainer';

export default function StatsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <AnalysisTab active="stats" />
      <StatsContainer />
    </div>
  );
}
