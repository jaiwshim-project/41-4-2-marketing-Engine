'use client';

import dynamic from 'next/dynamic';
import { use } from 'react';

const SequenceBuilder = dynamic(
  () => import('@/components/stepmail/builder/SequenceBuilder'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-gray-500">빌더 로딩 중...</div> }
);

export default function SequenceBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="h-[calc(100vh-8rem)] -m-6 border rounded-lg overflow-hidden">
      <SequenceBuilder sequenceId={id} />
    </div>
  );
}
