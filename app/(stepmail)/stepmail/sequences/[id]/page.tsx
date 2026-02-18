'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import type { SmSequence } from '@/lib/stepmail/types';

export default function SequenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [sequence, setSequence] = useState<SmSequence & { nodes: unknown[]; edges: unknown[]; enrolled_count: number } | null>(null);

  useEffect(() => {
    fetch(`/api/stepmail/sequences/${id}`)
      .then(r => r.json())
      .then(setSequence);
  }, [id]);

  const toggleStatus = async (action: 'activate' | 'pause') => {
    await fetch(`/api/stepmail/sequences/${id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const res = await fetch(`/api/stepmail/sequences/${id}`);
    setSequence(await res.json());
  };

  if (!sequence) return <div className="text-center py-12 text-gray-500">로딩 중...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{sequence.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{sequence.description || '설명 없음'}</p>
        </div>
        <div className="flex gap-2">
          {sequence.status === 'active' ? (
            <button
              onClick={() => toggleStatus('pause')}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200"
            >
              일시정지
            </button>
          ) : (
            <button
              onClick={() => toggleStatus('activate')}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200"
            >
              활성화
            </button>
          )}
          <Link
            href={`/stepmail/sequences/${id}/builder`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            빌더 열기
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">상태</p>
          <p className="text-lg font-bold text-gray-900 capitalize">{sequence.status}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">노드 수</p>
          <p className="text-lg font-bold text-gray-900">{sequence.nodes?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">등록된 구독자</p>
          <p className="text-lg font-bold text-gray-900">{sequence.enrolled_count}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">목표</p>
          <p className="text-lg font-bold text-gray-900">{sequence.goal_type}</p>
        </div>
      </div>
    </div>
  );
}
