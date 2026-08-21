import { Header } from '@/common/layouts/Header';

export default function MypageLayout({ children }: LayoutProps<'/mypage'>) {
  return (
    <>
      <Header variant="nav" />
      {children}
    </>
  );
}
