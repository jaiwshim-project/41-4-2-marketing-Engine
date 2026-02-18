'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { FunnelStage, EmotionType } from '@/lib/stepmail/types';

interface HistoryListItem {
  id: string;
  type: 'analysis' | 'generation';
  title: string;
  summary: string;
  date: string;
  category: string;
  target_keyword: string;
  preview: string;
  already_imported: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  blog: '블로그',
  product: '제품',
  faq: 'FAQ',
  howto: '하우투',
  landing: '랜딩',
  technical: '기술',
  social: '소셜',
  email: '이메일',
};

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

  // GEOAIO 임포트 모달
  const [showImport, setShowImport] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryListItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyType, setHistoryType] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    const params = new URLSearchParams();
    if (historyType) params.set('type', historyType);
    if (historySearch) params.set('search', historySearch);
    const res = await fetch(`/api/stepmail/contents/history-list?${params}`);
    const data = await res.json();
    setHistoryItems(data.items || []);
    setHistoryLoading(false);
  }, [historyType, historySearch]);

  useEffect(() => {
    if (showImport) {
      fetchHistory();
    }
  }, [showImport, fetchHistory]);

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

  const handleImport = async (historyId: string) => {
    setImporting(true);
    setSelectedId(historyId);
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
    setSelectedId(null);
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">새 콘텐츠 만들기</h1>
        <button
          onClick={() => setShowImport(true)}
          className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
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

      {/* GEOAIO 콘텐츠 목록 임포트 모달 */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            {/* 모달 헤더 */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">GEOAIO 콘텐츠 가져오기</h3>
                  <p className="text-sm text-gray-500 mt-0.5">생성된 콘텐츠를 선택하면 AI 분류와 함께 자동으로 가져옵니다</p>
                </div>
                <button onClick={() => setShowImport(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>

              {/* 필터 */}
              <div className="flex gap-2 mt-3">
                <select
                  value={historyType}
                  onChange={(e) => setHistoryType(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-sm"
                >
                  <option value="">전체 유형</option>
                  <option value="generation">생성</option>
                  <option value="analysis">분석</option>
                </select>
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="제목 또는 키워드 검색..."
                  className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
                  onKeyDown={(e) => { if (e.key === 'Enter') fetchHistory(); }}
                />
                <button
                  onClick={fetchHistory}
                  className="px-3 py-1.5 bg-gray-100 border rounded-lg text-sm hover:bg-gray-200"
                >
                  검색
                </button>
              </div>
            </div>

            {/* 콘텐츠 목록 */}
            <div className="flex-1 overflow-auto px-6 py-3">
              {historyLoading ? (
                <div className="text-center py-12 text-gray-500">콘텐츠 목록을 불러오는 중...</div>
              ) : historyItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">GEOAIO에서 생성한 콘텐츠가 없습니다</p>
                  <p className="text-sm text-gray-400 mt-1">먼저 GEOAIO에서 콘텐츠를 생성해주세요</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {historyItems.map(item => (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 transition-all ${
                        item.already_imported
                          ? 'bg-gray-50 border-gray-200 opacity-60'
                          : 'hover:border-indigo-300 hover:shadow-sm cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.type === 'generation'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {item.type === 'generation' ? '생성' : '분석'}
                            </span>
                            {item.category && (
                              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                {CATEGORY_LABELS[item.category] || item.category}
                              </span>
                            )}
                            {item.target_keyword && (
                              <span className="text-[10px] text-indigo-500">#{item.target_keyword}</span>
                            )}
                            {item.already_imported && (
                              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">이미 가져옴</span>
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{item.title}</h4>
                          {item.preview && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.preview}</p>
                          )}
                          <p className="text-[10px] text-gray-400 mt-1.5">{item.date}</p>
                        </div>
                        <button
                          onClick={() => handleImport(item.id)}
                          disabled={importing || item.already_imported}
                          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            item.already_imported
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : importing && selectedId === item.id
                              ? 'bg-indigo-200 text-indigo-600'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {importing && selectedId === item.id
                            ? 'AI 분류 중...'
                            : item.already_imported
                            ? '가져옴'
                            : '가져오기'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 모달 푸터 */}
            <div className="px-6 py-3 border-t bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {historyItems.length}개의 콘텐츠 (최대 50개 표시)
                </p>
                <button
                  onClick={() => setShowImport(false)}
                  className="px-4 py-1.5 border rounded-lg text-sm hover:bg-gray-100"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
