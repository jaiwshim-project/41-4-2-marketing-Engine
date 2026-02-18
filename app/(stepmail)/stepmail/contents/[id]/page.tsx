'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import type { SmContent, FunnelStage, EmotionType } from '@/lib/stepmail/types';

export default function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    subject_line: '',
    preview_text: '',
    body_markdown: '',
    funnel_stage: '' as FunnelStage | '',
    emotion_type: '' as EmotionType | '',
    cta_strength: 0,
    conversion_weight: 1,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/stepmail/contents/${id}`)
      .then(r => r.json())
      .then((data: { content: SmContent }) => {
        const c = data.content;
        setForm({
          title: c.title,
          subject_line: c.subject_line,
          preview_text: c.preview_text || '',
          body_markdown: c.body_markdown || '',
          funnel_stage: (c.funnel_stage as FunnelStage) || '',
          emotion_type: (c.emotion_type as EmotionType) || '',
          cta_strength: c.cta_strength || 0,
          conversion_weight: c.conversion_weight || 1,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!form.title || !form.subject_line) {
      alert('제목과 이메일 제목은 필수입니다');
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/stepmail/contents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        funnel_stage: form.funnel_stage || null,
        emotion_type: form.emotion_type || null,
      }),
    });
    if (res.ok) {
      router.push('/stepmail/contents');
    }
    setSaving(false);
  };

  const handleClassify = async () => {
    const res = await fetch('/api/stepmail/contents/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_id: id }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.classification) {
        setForm(f => ({
          ...f,
          funnel_stage: data.classification.funnel_stage || f.funnel_stage,
          emotion_type: data.classification.emotion_type || f.emotion_type,
          cta_strength: data.classification.cta_strength ?? f.cta_strength,
          conversion_weight: data.classification.conversion_weight ?? f.conversion_weight,
        }));
      }
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">로딩 중...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">콘텐츠 편집</h1>
        <button
          onClick={handleClassify}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          AI 재분류
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
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일 제목 (Subject) *</label>
          <input
            type="text"
            value={form.subject_line}
            onChange={(e) => setForm(f => ({ ...f, subject_line: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">미리보기 텍스트</label>
          <input
            type="text"
            value={form.preview_text}
            onChange={(e) => setForm(f => ({ ...f, preview_text: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg text-sm"
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CTA 강도 (0-100)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.cta_strength}
              onChange={(e) => setForm(f => ({ ...f, cta_strength: Number(e.target.value) }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전환 가중치</label>
            <input
              type="number"
              min={0}
              step={0.1}
              value={form.conversion_weight}
              onChange={(e) => setForm(f => ({ ...f, conversion_weight: Number(e.target.value) }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">본문 (Markdown)</label>
          <textarea
            value={form.body_markdown}
            onChange={(e) => setForm(f => ({ ...f, body_markdown: e.target.value }))}
            rows={15}
            className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
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

      <p className="text-xs text-gray-400 mt-4 font-mono">ID: {id}</p>
    </div>
  );
}
