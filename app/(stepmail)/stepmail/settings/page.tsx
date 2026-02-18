'use client';

import { useState, useEffect } from 'react';

interface Settings {
  resend_api_key: string;
  from_email: string;
  from_name: string;
  tracking_domain: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    resend_api_key: '',
    from_email: '',
    from_name: '',
    tracking_domain: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stepmail/settings')
      .then(r => r.json())
      .then(data => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const res = await fetch('/api/stepmail/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestSend = async () => {
    if (!testEmail) return;
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/stepmail/settings/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail }),
      });
      const data = await res.json();
      setTestResult(res.ok ? '테스트 이메일이 발송되었습니다!' : `오류: ${data.error}`);
    } catch {
      setTestResult('발송 실패');
    }
    setTestSending(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-2">설정</h1>
      <p className="text-sm text-gray-500 mb-6">이메일 발송 인프라 및 트래킹 설정을 관리합니다</p>

      {/* Resend API 설정 */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Resend API 설정</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={settings.resend_api_key}
              onChange={(e) => setSettings(s => ({ ...s, resend_api_key: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
              placeholder="re_xxxxxxxxxxxx"
            />
            <p className="text-xs text-gray-400 mt-1">
              <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
                Resend 대시보드
              </a>에서 API 키를 생성하세요
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">발신자 이메일</label>
            <input
              type="email"
              value={settings.from_email}
              onChange={(e) => setSettings(s => ({ ...s, from_email: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="noreply@yourdomain.com"
            />
            <p className="text-xs text-gray-400 mt-1">Resend에 등록된 도메인의 이메일 주소를 입력하세요</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">발신자 이름</label>
            <input
              type="text"
              value={settings.from_name}
              onChange={(e) => setSettings(s => ({ ...s, from_name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="GEOAIO 마케팅"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">트래킹 도메인 (선택)</label>
            <input
              type="text"
              value={settings.tracking_domain}
              onChange={(e) => setSettings(s => ({ ...s, tracking_domain: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="https://yourdomain.com"
            />
            <p className="text-xs text-gray-400 mt-1">오픈/클릭 트래킹에 사용할 도메인. 비워두면 기본 도메인 사용</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
          {saved && <span className="text-sm text-green-600">저장되었습니다</span>}
        </div>
      </div>

      {/* 테스트 발송 */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">테스트 발송</h2>
        <p className="text-sm text-gray-500 mb-3">설정이 올바른지 테스트 이메일을 발송하여 확인합니다</p>
        <div className="flex gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg text-sm"
            placeholder="test@example.com"
          />
          <button
            onClick={handleTestSend}
            disabled={testSending || !testEmail}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {testSending ? '발송 중...' : '테스트 발송'}
          </button>
        </div>
        {testResult && (
          <p className={`text-sm mt-2 ${testResult.startsWith('오류') || testResult === '발송 실패' ? 'text-red-600' : 'text-green-600'}`}>
            {testResult}
          </p>
        )}
      </div>

      {/* 환경변수 안내 */}
      <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
        <h2 className="text-sm font-semibold text-amber-900 mb-2">환경변수 설정 안내</h2>
        <p className="text-sm text-amber-700 mb-3">
          Vercel 또는 .env.local에 다음 환경변수를 설정해야 합니다:
        </p>
        <div className="bg-white rounded-lg p-3 font-mono text-xs text-gray-700 space-y-1">
          <p>RESEND_API_KEY=re_xxxx</p>
          <p>RESEND_FROM_EMAIL=noreply@yourdomain.com</p>
          <p>RESEND_FROM_NAME=GEOAIO 마케팅</p>
          <p>TRACKING_SECRET=랜덤32자문자열</p>
          <p>CRON_SECRET=크론인증시크릿</p>
        </div>
        <p className="text-xs text-amber-600 mt-2">
          환경변수가 설정되면 위 UI 설정보다 환경변수가 우선합니다
        </p>
      </div>
    </div>
  );
}
