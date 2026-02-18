'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CsvImportPage() {
  const router = useRouter();
  const [csvText, setCsvText] = useState('');
  const [defaultTags, setDefaultTags] = useState('');
  const [result, setResult] = useState<{
    total: number;
    imported: number;
    duplicates: number;
    invalid: { row: number; reason: string }[];
  } | null>(null);
  const [importing, setImporting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
  };

  const handleImport = async () => {
    if (!csvText) return;
    setImporting(true);
    setResult(null);

    const res = await fetch('/api/stepmail/subscribers/import-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        csv_text: csvText,
        default_tags: defaultTags ? defaultTags.split(',').map(t => t.trim()) : [],
      }),
    });

    const data = await res.json();
    setResult(data);
    setImporting(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-2">CSV 가져오기</h1>
      <p className="text-sm text-gray-500 mb-6">
        CSV 파일로 구독자를 대량 등록합니다. 필수 컬럼: email (또는 이메일). 선택 컬럼: name, tags
      </p>

      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CSV 파일 업로드</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">또는 직접 붙여넣기</label>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
            placeholder="email,name,tags&#10;user@example.com,홍길동,태그1&#10;test@test.com,김철수,태그2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">기본 태그 (쉼표 구분)</label>
          <input
            type="text"
            value={defaultTags}
            onChange={(e) => setDefaultTags(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="예: 2026년2월, 캠페인A"
          />
        </div>

        <button
          onClick={handleImport}
          disabled={!csvText || importing}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {importing ? '가져오는 중...' : '가져오기'}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">결과</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">전체:</span>{' '}
                <span className="font-bold">{result.total}</span>
              </div>
              <div>
                <span className="text-gray-500">등록:</span>{' '}
                <span className="font-bold text-green-600">{result.imported}</span>
              </div>
              <div>
                <span className="text-gray-500">중복:</span>{' '}
                <span className="font-bold text-yellow-600">{result.duplicates}</span>
              </div>
            </div>
            {result.invalid.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-red-600 mb-1">오류 ({result.invalid.length}건)</p>
                <div className="max-h-32 overflow-auto text-xs text-gray-600 space-y-0.5">
                  {result.invalid.map((inv, i) => (
                    <div key={i}>행 {inv.row}: {inv.reason}</div>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={() => router.push('/stepmail/subscribers')}
              className="mt-3 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium"
            >
              구독자 목록으로 이동
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
