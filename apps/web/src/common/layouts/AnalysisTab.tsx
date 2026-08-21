import { IndexMark } from '@/common/components/IndexMark';

type AnalysisTabValue = 'stats' | 'insights';

export function AnalysisTab({ active }: { active: AnalysisTabValue }) {
  return (
    <nav className="-mt-2.5 flex justify-end gap-1.5">
      <IndexMark
        href="/mypage/stats"
        label="통계"
        active={active === 'stats'}
      />
      <IndexMark
        href="/mypage/insights"
        label="AI"
        active={active === 'insights'}
      />
    </nav>
  );
}
