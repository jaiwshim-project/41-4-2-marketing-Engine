'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SubscriberStateChip from './SubscriberStateChip';
import type { SmSubscriber, SubscriberState } from '@/lib/stepmail/types';

interface SubscriberListResponse {
  subscribers: SmSubscriber[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function SubscriberTable() {
  const [data, setData] = useState<SubscriberListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (stateFilter) params.set('state', stateFilter);

    const res = await fetch(`/api/stepmail/subscribers?${params}`);
    const result = await res.json();
    setData(result);
    setLoading(false);
  }, [page, search, stateFilter]);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const addSubscriber = async () => {
    if (!newEmail) return;
    await fetch('/api/stepmail/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, name: newName || undefined }),
    });
    setNewEmail('');
    setNewName('');
    setShowAddModal(false);
    fetchSubscribers();
  };

  const deleteSubscriber = async (id: string) => {
    if (!confirm('구독자를 삭제하시겠습니까?')) return;
    await fetch(`/api/stepmail/subscribers/${id}`, { method: 'DELETE' });
    fetchSubscribers();
  };

  const states: ('' | SubscriberState)[] = ['', 'COLD', 'WARM', 'HOT', 'DECISION', 'CONVERTED'];

  return (
    <div>
      {/* 상단 툴바 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="이메일 또는 이름 검색..."
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
          />
          <select
            value={stateFilter}
            onChange={(e) => { setStateFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">전체 상태</option>
            {states.filter(Boolean).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Link
            href="/stepmail/subscribers/import"
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            CSV 가져오기
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            + 구독자 추가
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      {data && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">전체 구독자</p>
            <p className="text-2xl font-bold text-gray-900">{data.total}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">활성 구독자</p>
            <p className="text-2xl font-bold text-green-600">
              {data.subscribers.filter(s => !s.is_unsubscribed).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">현재 페이지</p>
            <p className="text-2xl font-bold text-gray-900">{data.page} / {data.totalPages}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">필터 결과</p>
            <p className="text-2xl font-bold text-indigo-600">{data.subscribers.length}건</p>
          </div>
        </div>
      )}

      {/* 테이블 */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">이메일</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">이름</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">상태</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">점수</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">소스</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">태그</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">가입일</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">로딩 중...</td></tr>
            ) : data?.subscribers.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">구독자가 없습니다</td></tr>
            ) : data?.subscribers.map(sub => (
              <tr key={sub.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/stepmail/subscribers/${sub.id}`} className="text-sm text-indigo-600 hover:underline">
                    {sub.email}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{sub.name || '-'}</td>
                <td className="px-4 py-3"><SubscriberStateChip state={sub.current_state} /></td>
                <td className="px-4 py-3 text-sm font-mono text-gray-700">{Math.round(sub.engagement_score)}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{sub.source}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {sub.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-600">{tag}</span>
                    ))}
                    {sub.tags.length > 3 && <span className="text-xs text-gray-400">+{sub.tags.length - 3}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(sub.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => deleteSubscriber(sub.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 border rounded text-sm disabled:opacity-50"
          >
            이전
          </button>
          <span className="text-sm text-gray-600">{page} / {data.totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="px-3 py-1.5 border rounded text-sm disabled:opacity-50"
          >
            다음
          </button>
        </div>
      )}

      {/* 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">구독자 추가</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일 *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="홍길동"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                취소
              </button>
              <button
                onClick={addSubscriber}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
