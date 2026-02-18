'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FunnelStage, EmotionType } from '@/lib/stepmail/types';

export default function NewContentPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    subject_line: '',
    preview_text: '',
    body_markdown: '',
    funnel_stage: '' as FunnelStage | '',
    emotion_type: '' as EmotionType | '',
  });
  const [saving, setSaving] = useState(false);

  // geo-aio 히스토리 임포트 모달
  const [showImport, setShowImport] = useState(false);
  const [historyId, setHistoryId] = useState('');
  const [importing, setImporting] = useState(false);

  const handleSave = async () => {
    if (!form.title || !form.subject_line) {
      alert('제목과 이메일 제목은 필수입니다');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/stepmail/contents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        funnel_stage: form.funnel_stage || undefined,
        emotion_type: form.emotion_type || undefined,
      }),
    });
    if (res.ok) {
      router.push('/stepmail/contents');
    }
    setSaving(false);
  };

  const handleImport = async () => {
    if (!historyId) return;
    setImporting(true);
    const res = await fetch('/api/stepmail/contents/import-from-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history_id: historyId, auto_classify: true }),
    });
    if (res.ok) {
      router.push('/stepmail/contents');
    } else {
      const err = await res.json();
      alert(err.error || '임포트 실패');
    }
    setImporting(false);
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">새 콘텐츠 만들기</h1>
        <button
          onClick={() => setShowImport(true)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          GEOAIO에서 가져오기
        </button>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">콘텐츠 제목 *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="내부 관리용 제목"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일 제목 (Subject) *</label>
          <input
            type="text"
            value={form.subject_line}
            onChange={(e) => setForm(f => ({ ...f, subject_line: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="수신자에게 보여질 이메일 제목"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">미리보기 텍스트</label>
          <input
            type="text"
            value={form.preview_text}
            onChange={(e) => setForm(f => ({ ...f, preview_text: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="이메일 목록에서 미리 보이는 텍스트"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설득 단계</label>
            <select
              value={form.funnel_stage}
              onChange={(e) => setForm(f => ({ ...f, funnel_stage: e.target.value as FunnelStage | '' }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">미분류</option>
              <option value="AWARENESS">인지 (Awareness)</option>
              <option value="CONSIDERATION">고려 (Consideration)</option>
              <option value="DECISION">결정 (Decision)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">감정 유형</label>
            <select
              value={form.emotion_type}
              onChange={(e) => setForm(f => ({ ...f, emotion_type: e.target.value as EmotionType | '' }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">미분류</option>
              <option value="PROBLEM">문제제기</option>
              <option value="TRUST">신뢰</option>
              <option value="AUTHORITY">권위</option>
              <option value="URGENCY">긴급성</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">본문 (Markdown)</label>
          <textarea
            value={form.body_markdown}
            onChange={(e) => setForm(f => ({ ...f, body_markdown: e.target.value }))}
            rows={15}
            className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
            placeholder="이메일 본문을 마크다운으로 작성하세요..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* GEOAIO 임포트 모달 */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">GEOAIO 콘텐츠 가져오기</h3>
            <p className="text-sm text-gray-500 mb-4">
              GEOAIO 대시보드에서 생성한 콘텐츠의 ID를 입력하면 자동으로 가져오고 AI 분류를 적용합니다.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">히스토리 ID</label>
              <input
                type="text"
                value={historyId}
                onChange={(e) => setHistoryId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="GEOAIO 대시보드의 콘텐츠 ID"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowImport(false)} className="px-4 py-2 border rounded-lg text-sm">취소</button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {importing ? '가져오는 중...' : '가져오기 + AI 분류'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
