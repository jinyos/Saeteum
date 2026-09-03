import { Header } from '@/common/layouts/Header';

export default function MypageLayout({ children }: LayoutProps<'/mypage'>) {
  return (
    <div className="flex min-h-[calc(100dvh-1.25rem)] flex-col">
      <Header variant="nav" />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
