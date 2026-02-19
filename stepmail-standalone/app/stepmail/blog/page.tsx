'use client';

import { useState } from 'react';

const tabs = [
  { id: 'geo-aio', label: 'GEO-AIO' },
  { id: 'regenmed', label: '리젠메드컨설팅' },
  { id: 'beer', label: '대전맥주장 수제맥주' },
  { id: 'dental', label: '치과병원' },
];

// 임시 샘플 데이터
const samplePosts: Record<string, { id: number; title: string; excerpt: string; date: string; author: string }[]> = {
  'geo-aio': [
    { id: 1, title: 'AI 검색 최적화(GEO)란 무엇인가?', excerpt: 'AI 검색 시대에 맞는 새로운 SEO 전략을 알아봅니다.', date: '2026-02-19', author: '관리자' },
    { id: 2, title: 'AIO 콘텐츠 전략 가이드', excerpt: 'AI Overview에 노출되기 위한 콘텐츠 작성법을 소개합니다.', date: '2026-02-18', author: '관리자' },
  ],
  'regenmed': [
    { id: 3, title: '리젠메드컨설팅 소개', excerpt: '리젠메드컨설팅의 서비스와 비전을 안내합니다.', date: '2026-02-19', author: '관리자' },
  ],
  'beer': [
    { id: 4, title: '대전맥주장 수제맥주 추천', excerpt: '이번 달 새로 출시된 수제맥주를 소개합니다.', date: '2026-02-19', author: '관리자' },
  ],
  'dental': [
    { id: 5, title: '치과 정기검진의 중요성', excerpt: '정기적인 치과 검진이 왜 중요한지 알아봅니다.', date: '2026-02-19', author: '관리자' },
  ],
};

export default function BlogPage() {
  const [activeTab, setActiveTab] = useState('geo-aio');
  const posts = samplePosts[activeTab] || [];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">블로그</h1>
        <p className="text-sm text-gray-500 mt-1">카테고리별 블로그 콘텐츠를 관리합니다.</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-0 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 글쓰기 버튼 */}
      <div className="flex justify-end mb-4">
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 글 작성
        </button>
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-gray-500 text-sm">아직 작성된 글이 없습니다.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{post.excerpt}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {post.date}
                    </span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
