'use client';

import { useState, useEffect, use } from 'react';
import SubscriberStateChip from '@/components/stepmail/subscribers/SubscriberStateChip';
import TagEditor from '@/components/stepmail/subscribers/TagEditor';
import type { SmSubscriber, SmEvent } from '@/lib/stepmail/types';

const eventTypeLabels: Record<string, { label: string; icon: string }> = {
  OPEN: { label: '이메일 열람', icon: '👁' },
  CLICK: { label: '링크 클릭', icon: '🔗' },
  VISIT: { label: '페이지 방문', icon: '🌐' },
  BOOKING: { label: '상담 신청', icon: '📅' },
  PURCHASE: { label: '구매', icon: '💳' },
  UNSUBSCRIBE: { label: '수신 거부', icon: '🚫' },
};

export default function SubscriberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [subscriber, setSubscriber] = useState<SmSubscriber | null>(null);
  const [events, setEvents] = useState<SmEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch(`/api/stepmail/subscribers/${id}`);
    const data = await res.json();
    setSubscriber(data.subscriber);
    setEvents(data.events || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const updateTags = async (newTags: string[]) => {
    await fetch(`/api/stepmail/subscribers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: newTags }),
    });
    fetchData();
  };

  if (loading || !subscriber) return <div className="text-center py-12 text-gray-500">로딩 중...</div>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">구독자 상세</h1>

      {/* 프로필 카드 */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{subscriber.email}</h2>
            {subscriber.name && <p className="text-sm text-gray-500 mt-1">{subscriber.name}</p>}
          </div>
          <SubscriberStateChip state={subscriber.current_state} />
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Engagement Score</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{Math.round(subscriber.engagement_score)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">소스</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{subscriber.source}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">가입일</p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {new Date(subscriber.created_at).toLocaleDateString('ko-KR')}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">수신 상태</p>
            <p className={`text-sm font-medium mt-1 ${subscriber.is_unsubscribed ? 'text-red-600' : 'text-green-600'}`}>
              {subscriber.is_unsubscribed ? '수신 거부' : '활성'}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500 mb-2">태그</p>
          <TagEditor tags={subscriber.tags} onChange={updateTags} />
        </div>
      </div>

      {/* 이벤트 타임라인 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">이벤트 타임라인 (최근 50건)</h3>
        {events.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">이벤트가 없습니다</p>
        ) : (
          <div className="space-y-3">
            {events.map(event => {
              const config = eventTypeLabels[event.event_type] || { label: event.event_type, icon: '📌' };
              return (
                <div key={event.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                  <span className="text-lg">{config.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{config.label}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.created_at).toLocaleString('ko-KR')}
                      {event.score_delta > 0 && (
                        <span className="ml-2 text-green-600">+{event.score_delta} 점</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
