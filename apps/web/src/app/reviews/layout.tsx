import { Header } from '@/common/layouts/Header';

export default function ReviewsLayout({ children }: LayoutProps<'/reviews'>) {
  return (
    <div className="flex min-h-[calc(100dvh-1.25rem)] flex-col">
      <Header variant="icon" />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
