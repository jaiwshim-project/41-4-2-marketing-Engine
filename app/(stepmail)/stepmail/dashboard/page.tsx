'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { DashboardOverview, SequenceMetrics, SubscriberState } from '@/lib/stepmail/types';
import { STATE_LABELS } from '@/lib/stepmail/types';

const STATE_COLORS: Record<SubscriberState, string> = {
  COLD: '#93c5fd',
  WARM: '#fcd34d',
  HOT: '#fb923c',
  DECISION: '#f87171',
  CONVERTED: '#4ade80',
};

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [sequenceMetrics, setSequenceMetrics] = useState<SequenceMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stepmail/metrics')
      .then(r => r.json())
      .then(data => {
        setOverview(data.overview);
        setSequenceMetrics(data.sequenceMetrics || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">대시보드 로딩 중...</div>;
  if (!overview) return <div className="text-center py-12 text-gray-500">데이터를 불러올 수 없습니다</div>;

  const pieData = Object.entries(overview.state_distribution)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({
      name: STATE_LABELS[k as SubscriberState].label,
      value: v,
      color: STATE_COLORS[k as SubscriberState],
    }));

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">대시보드</h1>

      {/* KPI 카드 */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-500">전체 구독자</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{overview.total_subscribers}</p>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-500">활성 시퀀스</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{overview.active_sequences}</p>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-500">오늘 발송</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{overview.emails_sent_today}</p>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-500">평균 오픈율</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{(overview.avg_open_rate * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-500">평균 클릭율</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{(overview.avg_click_rate * 100).toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* 구독자 상태 분포 */}
        <div className="bg-white rounded-lg border p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">구독자 상태 분포</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400">데이터 없음</div>
          )}
        </div>

        {/* 시퀀스별 성과 */}
        <div className="bg-white rounded-lg border p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">시퀀스별 오픈율</h2>
          {sequenceMetrics.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sequenceMetrics.map(s => ({ name: s.sequence_name.slice(0, 10), openRate: +(s.open_rate * 100).toFixed(1), clickRate: +(s.click_rate * 100).toFixed(1) }))}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="openRate" fill="#818cf8" name="오픈율(%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clickRate" fill="#a78bfa" name="클릭율(%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400">데이터 없음</div>
          )}
        </div>
      </div>

      {/* 시퀀스 성과 테이블 */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-sm font-semibold text-gray-900">시퀀스 성과 상세</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">시퀀스</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">상태</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">등록자</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">발송</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">오픈율</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">클릭율</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sequenceMetrics.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">시퀀스가 없습니다</td></tr>
            ) : sequenceMetrics.map(m => (
              <tr key={m.sequence_id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.sequence_name}</td>
                <td className="px-4 py-3 text-xs capitalize text-gray-500">{m.status}</td>
                <td className="px-4 py-3 text-sm text-right">{m.total_enrolled}</td>
                <td className="px-4 py-3 text-sm text-right">{m.total_sends}</td>
                <td className="px-4 py-3 text-sm text-right font-mono">{(m.open_rate * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-sm text-right font-mono">{(m.click_rate * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
