'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { SmContent, FunnelStage } from '@/lib/stepmail/types';
import { FUNNEL_LABELS, EMOTION_LABELS } from '@/lib/stepmail/types';

export default function ContentsPage() {
  const [contents, setContents] = useState<SmContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('');

  const fetchContents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (stageFilter) params.set('stage', stageFilter);
    const res = await fetch(`/api/stepmail/contents?${params}`);
    const data = await res.json();
    setContents(data.contents || []);
    setLoading(false);
  }, [stageFilter]);

  useEffect(() => { fetchContents(); }, [fetchContents]);

  const deleteContent = async (id: string) => {
    if (!confirm('콘텐츠를 삭제하시겠습니까?')) return;
    await fetch(`/api/stepmail/contents/${id}`, { method: 'DELETE' });
    fetchContents();
  };

  const classifyContent = async (id: string) => {
    await fetch('/api/stepmail/contents/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_id: id }),
    });
    fetchContents();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">콘텐츠 라이브러리</h1>
          <p className="text-sm text-gray-500 mt-1">스텝메일에 사용할 이메일 콘텐츠를 관리합니다</p>
        </div>
        <div className="flex gap-2">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">전체 단계</option>
            <option value="AWARENESS">인지</option>
            <option value="CONSIDERATION">고려</option>
            <option value="DECISION">결정</option>
          </select>
          <Link
            href="/stepmail/contents/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            + 새 콘텐츠
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">로딩 중...</div>
      ) : contents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">아직 콘텐츠가 없습니다</p>
          <Link href="/stepmail/contents/new" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
            첫 콘텐츠 만들기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {contents.map(content => (
            <div key={content.id} className="bg-white rounded-lg border p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{content.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">제목: {content.subject_line}</p>
                </div>
                <div className="flex gap-1">
                  {content.funnel_stage && (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${FUNNEL_LABELS[content.funnel_stage as FunnelStage].color}`}>
                      {FUNNEL_LABELS[content.funnel_stage as FunnelStage].label}
                    </span>
                  )}
                  {content.emotion_type && (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${EMOTION_LABELS[content.emotion_type].color}`}>
                      {EMOTION_LABELS[content.emotion_type].label}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>CTA: {content.cta_strength}/100</span>
                  <span>가중치: {content.conversion_weight}</span>
                  <span>{new Date(content.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
                <div className="flex gap-2">
                  {!content.funnel_stage && (
                    <button
                      onClick={() => classifyContent(content.id)}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      AI 분류
                    </button>
                  )}
                  <button
                    onClick={() => deleteContent(content.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 font-mono">ID: {content.id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
