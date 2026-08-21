import { Header } from '@/common/layouts/Header';

export default function ReviewsLayout({ children }: LayoutProps<'/reviews'>) {
  return (
    <>
      <Header variant="icon" />
      {children}
    </>
  );
}
