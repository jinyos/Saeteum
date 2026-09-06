import { AnalysisTab } from '@/common/layouts/AnalysisTab';
import InsightsContainer from '@/domain/Insights/InsightsContainer';

export default function InsightsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <AnalysisTab active="insights" />
      <InsightsContainer />
    </div>
  );
}
