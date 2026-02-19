'use client';

import { usePathname } from 'next/navigation';

const breadcrumbMap: Record<string, string> = {
  '/stepmail': '스텝메일',
  '/stepmail/dashboard': '대시보드',
  '/stepmail/subscribers': '구독자 관리',
  '/stepmail/subscribers/import': 'CSV 가져오기',
  '/stepmail/contents': '콘텐츠 라이브러리',
  '/stepmail/contents/new': '새 콘텐츠',
  '/stepmail/sequences': '시퀀스 관리',
  '/stepmail/sequences/new': '새 시퀀스',
  '/stepmail/settings': '설정',
  '/stepmail/blog': '블로그',
};

export default function StepMailHeader({ userName }: { userName?: string }) {
  const pathname = usePathname();
  const title = (pathname && breadcrumbMap[pathname]) || '스텝메일';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="flex items-center gap-4">
        {userName && (
          <span className="text-sm text-gray-500">{userName}</span>
        )}
      </div>
    </header>
  );
}
