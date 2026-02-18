import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import StepMailSidebar from '@/components/stepmail/layout/StepMailSidebar';
import StepMailHeader from '@/components/stepmail/layout/StepMailHeader';

export const metadata = {
  title: 'StepMail - AI 마케팅 엔진',
  description: '범용 산업 AI 마케팅 자동화 플랫폼',
};

export default async function StepMailLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="flex h-screen bg-gray-50">
      <StepMailSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StepMailHeader userName={user.email ?? undefined} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
