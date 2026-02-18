'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { SmSequence } from '@/lib/stepmail/types';

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: '초안', color: 'bg-gray-100 text-gray-600' },
  active: { label: '활성', color: 'bg-green-100 text-green-700' },
  paused: { label: '일시정지', color: 'bg-yellow-100 text-yellow-700' },
  archived: { label: '보관', color: 'bg-red-100 text-red-600' },
};

export default function SequencesPage() {
  const [sequences, setSequences] = useState<(SmSequence & { enrolled_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGoal, setNewGoal] = useState('nurture');

  const fetchSequences = async () => {
    setLoading(true);
    const res = await fetch('/api/stepmail/sequences');
    const data = await res.json();
    setSequences(data.sequences || []);
    setLoading(false);
  };

  useEffect(() => { fetchSequences(); }, []);

  const createSequence = async () => {
    if (!newName) return;
    const res = await fetch('/api/stepmail/sequences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, goal_type: newGoal }),
    });
    if (res.ok) {
      setNewName('');
      setShowCreateModal(false);
      fetchSequences();
    }
  };

  const deleteSequence = async (id: string) => {
    if (!confirm('시퀀스를 삭제하시겠습니까?')) return;
    await fetch(`/api/stepmail/sequences/${id}`, { method: 'DELETE' });
    fetchSequences();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">시퀀스 관리</h1>
          <p className="text-sm text-gray-500 mt-1">자동 이메일 시퀀스를 만들고 관리합니다</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + 새 시퀀스
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">로딩 중...</div>
      ) : sequences.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">아직 시퀀스가 없습니다</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
          >
            첫 시퀀스 만들기
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sequences.map(seq => {
            const st = statusLabels[seq.status] || statusLabels.draft;
            return (
              <div key={seq.id} className="bg-white rounded-lg border p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link href={`/stepmail/sequences/${seq.id}`} className="text-lg font-semibold text-gray-900 hover:text-indigo-600">
                      {seq.name}
                    </Link>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/stepmail/sequences/${seq.id}/builder`}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium hover:bg-indigo-100"
                    >
                      빌더 열기
                    </Link>
                    <button
                      onClick={() => deleteSequence(seq.id)}
                      className="px-3 py-1.5 text-red-500 hover:text-red-700 text-xs"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                  <span>목표: {seq.goal_type}</span>
                  <span>등록: {seq.enrolled_count}명</span>
                  <span>생성: {new Date(seq.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
                {seq.description && (
                  <p className="mt-2 text-sm text-gray-600">{seq.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">새 시퀀스 만들기</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시퀀스 이름 *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="예: 신규 가입자 온보딩"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">목표</label>
                <select
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="nurture">리드 육성</option>
                  <option value="convert">전환 유도</option>
                  <option value="onboard">온보딩</option>
                  <option value="reactivate">재활성화</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-lg text-sm">취소</button>
              <button onClick={createSequence} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">만들기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
