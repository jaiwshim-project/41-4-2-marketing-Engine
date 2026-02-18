'use client';

import { useState } from 'react';

interface ContentBlock {
  subtitle: string;
  icon?: string;
  body: string;
  type?: 'default' | 'steps' | 'score-table' | 'state-chart' | 'node-cards' | 'code' | 'tip' | 'warning';
}

interface Section {
  id: string;
  title: string;
  emoji: string;
  gradient: string;
  iconBg: string;
  content: ContentBlock[];
}

const sections: Section[] = [
  {
    id: 'overview',
    title: '시스템 개요',
    emoji: '🚀',
    gradient: 'from-indigo-500 to-purple-600',
    iconBg: 'bg-indigo-100 text-indigo-600',
    content: [
      {
        subtitle: 'StepMail이란?',
        icon: '💡',
        body: 'StepMail은 AI 기반 이메일 마케팅 자동화 엔진입니다.\nGEOAIO에서 생성한 콘텐츠를 자동으로 설득 단계별로 분류하고, 구독자의 행동에 따라 최적의 타이밍에 이메일을 발송합니다.',
      },
      {
        subtitle: '핵심 기능',
        icon: '⚡',
        type: 'steps',
        body: 'GEOAIO 콘텐츠 자동 임포트 + AI 분류|구독자 행동 기반 Engagement Score 자동 계산|비주얼 드래그앤드롭 시퀀스 빌더|오픈/클릭 실시간 트래킹 및 성과 분석|상태 기반 자동 발송 (COLD → CONVERTED)',
      },
      {
        subtitle: '전체 워크플로우',
        icon: '🔄',
        type: 'steps',
        body: '콘텐츠 준비: GEOAIO에서 생성하거나 직접 작성|구독자 등록: 직접 추가, 공개 폼, CSV 업로드|시퀀스 설계: 비주얼 빌더로 이메일 흐름 구성|활성화: 시퀀스를 활성화하면 자동 발송 시작|분석: 대시보드에서 오픈율, 클릭율, 전환 확인',
      },
    ],
  },
  {
    id: 'subscribers',
    title: '구독자 관리',
    emoji: '👥',
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-100 text-emerald-600',
    content: [
      {
        subtitle: '구독자 추가 3가지 방법',
        icon: '➕',
        type: 'steps',
        body: '직접 추가: 구독자 목록 → "+ 구독자 추가" → 이메일, 이름 입력|CSV 대량 업로드: "CSV 가져오기" → 파일 업로드 또는 붙여넣기 (필수: email, 선택: name, tags)|공개 구독 폼 (API): 외부 랜딩페이지에서 POST /api/stepmail/subscribers/subscribe 호출',
      },
      {
        subtitle: 'Engagement Score (참여 점수)',
        icon: '📊',
        type: 'score-table',
        body: '이메일 열람 (Open)|+5점|👁️\n링크 클릭 (Click)|+10점|🔗\n페이지 방문 (Visit)|+15점|🌐\n상담 신청 (Booking)|+25점|📅\n구매 (Purchase)|+40점|💳',
      },
      {
        subtitle: '구독자 상태 자동 전이',
        icon: '🔥',
        type: 'state-chart',
        body: 'COLD|차가움|0~19점|관심 없는 상태|bg-blue-100|text-blue-700|border-blue-200\nWARM|따뜻함|20~49점|관심을 보이기 시작|bg-yellow-100|text-yellow-700|border-yellow-200\nHOT|뜨거움|50~79점|적극적으로 참여 중|bg-orange-100|text-orange-700|border-orange-200\nDECISION|결정|80~119점|구매 결정 단계|bg-red-100|text-red-700|border-red-200\nCONVERTED|전환|120점+|전환 완료!|bg-green-100|text-green-700|border-green-200',
      },
      {
        subtitle: '태그로 세분화하기',
        icon: '🏷️',
        type: 'tip',
        body: '구독자에게 태그를 추가하여 세분화할 수 있습니다.\n\n활용 예시:\n• "2026년2월캠페인" → 캠페인별 분류\n• "블로그유입" → 유입 경로별 분류\n• "VIP" → 등급별 분류\n\n태그는 구독자 상세 페이지에서 추가/삭제 가능하며,\n시퀀스의 조건 노드에서 태그 포함 여부로 분기할 수 있습니다.',
      },
    ],
  },
  {
    id: 'contents',
    title: '콘텐츠 관리',
    emoji: '📝',
    gradient: 'from-violet-500 to-fuchsia-600',
    iconBg: 'bg-violet-100 text-violet-600',
    content: [
      {
        subtitle: 'GEOAIO에서 콘텐츠 가져오기',
        icon: '📥',
        type: 'steps',
        body: '콘텐츠 라이브러리 → "+ 새 콘텐츠" 클릭|"GEOAIO에서 가져오기" 버튼 클릭|생성/분석 콘텐츠 목록에서 원하는 항목 찾기|유형 필터(생성/분석)와 키워드 검색 활용|"가져오기" 버튼 클릭 → AI가 자동 분류 적용',
      },
      {
        subtitle: 'AI 자동 분류 체계',
        icon: '🤖',
        body: '',
        type: 'node-cards',
      },
      {
        subtitle: '콘텐츠 직접 작성',
        icon: '✍️',
        type: 'steps',
        body: '콘텐츠 라이브러리 → "+ 새 콘텐츠" 클릭|콘텐츠 제목 (내부 관리용) 입력|이메일 제목 (수신자에게 보여지는 Subject) 입력|설득 단계 / 감정 유형 선택 (또는 저장 후 AI 분류)|본문을 Markdown으로 작성 후 "저장"',
      },
    ],
  },
  {
    id: 'sequences',
    title: '시퀀스 설계',
    emoji: '⚡',
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-100 text-amber-600',
    content: [
      {
        subtitle: '시퀀스 예시 흐름',
        icon: '🎯',
        body: '시퀀스는 구독자에게 자동으로 발송되는 이메일 흐름입니다:\n\n📧 1일차: 환영 이메일 발송\n  ⏱️ 2일 대기\n📧 3일차: 문제제기 콘텐츠 발송\n  🔀 이메일 열람 확인\n    ✅ 열람함 → 해결책 콘텐츠 발송\n    ❌ 미열람 → 리마인더 발송\n  ⏱️ 3일 대기\n📧 6일차: 할인 제안 발송',
      },
      {
        subtitle: '시퀀스 만들기',
        icon: '🛠️',
        type: 'steps',
        body: '시퀀스 목록 → "+ 새 시퀀스" 버튼 클릭|시퀀스 이름과 설명 입력|목표 유형 선택: nurture(리드 육성), onboarding(온보딩), promotion(프로모션), reengagement(재참여)|"만들기" 클릭 → 시퀀스 상세 페이지|"빌더 열기" → 비주얼 워크플로우 빌더 실행',
      },
      {
        subtitle: '비주얼 빌더 - 5가지 노드',
        icon: '🧩',
        body: '',
        type: 'node-cards',
      },
      {
        subtitle: '빌더 조작법',
        icon: '🖱️',
        type: 'tip',
        body: '🔹 노드 추가: 상단 툴바에서 원하는 노드 버튼 클릭\n🔹 노드 연결: 노드의 핸들(작은 원)을 드래그하여 다른 노드로 연결\n🔹 노드 설정: 노드를 클릭하면 오른쪽에 설정 패널 표시\n🔹 저장: 상단 "저장" 버튼 클릭 (자동 저장 아님!)\n🔹 활성화: 빌더를 나와 시퀀스 상세 페이지에서 "활성화" 클릭',
      },
    ],
  },
  {
    id: 'activation',
    title: '활성화 & 발송',
    emoji: '📤',
    gradient: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-cyan-100 text-cyan-600',
    content: [
      {
        subtitle: '시퀀스 활성화 조건',
        icon: '✅',
        type: 'steps',
        body: '시퀀스 상세 페이지에서 "활성화" 버튼 클릭|트리거 노드가 반드시 있어야 함|이메일 노드가 최소 1개 이상 있어야 함|활성화 후 구독자를 등록하면 자동 발송 시작',
      },
      {
        subtitle: '구독자 등록 (Enrollment)',
        icon: '📋',
        body: '활성화된 시퀀스에 구독자를 등록하는 방법:\n\n🔹 수동 등록\n시퀀스 상세 페이지 → "구독자 등록" 버튼 → 이메일 입력\n\n🔹 자동 등록 (향후 지원)\n특정 태그 추가 시 자동 등록 / 공개 구독 폼 연동\n\n등록된 구독자는 트리거 노드부터 시작하여 시퀀스 흐름을 따라 자동 진행됩니다.',
      },
      {
        subtitle: '발송 큐 시스템',
        icon: '⚙️',
        type: 'warning',
        body: '이메일 발송은 큐 시스템으로 처리됩니다:\n\n1. 이메일 노드 도달 → 발송 큐에 추가\n2. Cron Job이 주기적으로 큐 처리 (매일 9시 UTC)\n3. 한 번에 최대 50건 배치 처리\n4. 실패 시 최대 3회 자동 재시도 (지수 백오프)\n\n⚠️ Resend API Key가 설정되어야 발송이 동작합니다\n💡 Vercel Pro 플랜 사용 시 5분마다 처리 가능',
      },
    ],
  },
  {
    id: 'tracking',
    title: '트래킹 & 분석',
    emoji: '📈',
    gradient: 'from-rose-500 to-pink-600',
    iconBg: 'bg-rose-100 text-rose-600',
    content: [
      {
        subtitle: '오픈 & 클릭 트래킹',
        icon: '👁️',
        body: '발송된 이메일의 열람과 클릭을 자동으로 추적합니다:\n\n📬 오픈 트래킹\n이메일에 1x1 투명 이미지(트래킹 픽셀)가 자동 삽입됩니다.\n수신자가 이메일을 열면 이미지가 로드되며 열람이 기록됩니다.\n\n🔗 클릭 트래킹\n이메일의 모든 링크가 트래킹 URL로 자동 변환됩니다.\n수신자가 클릭하면 기록 후 원래 URL로 리다이렉트됩니다.\n\n모든 트래킹 데이터는 Engagement Score에 자동 반영됩니다.',
      },
      {
        subtitle: '대시보드 지표',
        icon: '📊',
        type: 'score-table',
        body: '전체 구독자 수|실시간|👥\n활성 시퀀스 수|실시간|⚡\n오늘 발송 수|일별|📤\n평균 오픈율|%|📬\n평균 클릭율|%|🔗',
      },
      {
        subtitle: '구독자 여정 타임라인',
        icon: '🗺️',
        type: 'tip',
        body: '각 구독자의 상세 이벤트 타임라인을 확인할 수 있습니다.\n\n구독자 목록 → 구독자 클릭 → 상세 페이지에서:\n\n• 이메일 주소, 이름, 가입일\n• 현재 Engagement Score 및 상태\n• 수신 상태 (활성/수신 거부)\n• 태그 목록 (실시간 추가/삭제)\n• 이벤트 타임라인 (최근 50건)\n  - 이메일 열람, 링크 클릭, 페이지 방문 등',
      },
    ],
  },
  {
    id: 'settings',
    title: '설정 안내',
    emoji: '⚙️',
    gradient: 'from-slate-500 to-gray-700',
    iconBg: 'bg-slate-100 text-slate-600',
    content: [
      {
        subtitle: 'Resend API 설정',
        icon: '🔑',
        type: 'steps',
        body: 'https://resend.com 에서 회원가입|도메인 인증: Settings → Domains → Add Domain|API Keys 메뉴에서 API Key 생성|StepMail 설정 페이지에서 API Key 입력',
      },
      {
        subtitle: '수신 거부 (자동)',
        icon: '🚫',
        type: 'warning',
        body: '모든 발송 이메일에는 수신 거부 링크가 자동으로 포함됩니다.\n\n수신자가 수신 거부를 클릭하면:\n1. 구독자 상태가 "수신 거부"로 변경\n2. 이후 발송 큐에서 자동으로 건너뜀\n3. UNSUBSCRIBE 이벤트가 기록됨\n\n⚠️ 이메일 마케팅 법규(정보통신망법, CAN-SPAM)를 준수하는 필수 기능입니다.',
      },
      {
        subtitle: '환경변수 전체 목록',
        icon: '📋',
        type: 'code',
        body: '# 필수 - Supabase\nNEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...\nSUPABASE_SERVICE_ROLE_KEY=eyJ...\n\n# 필수 - AI\nANTHROPIC_API_KEY=sk-ant-...\n\n# 이메일 발송\nRESEND_API_KEY=re_xxxx\nRESEND_FROM_EMAIL=noreply@yourdomain.com\nRESEND_FROM_NAME=GEOAIO 마케팅\n\n# 보안\nTRACKING_SECRET=랜덤32자문자열\nCRON_SECRET=크론인증시크릿',
      },
    ],
  },
];

// AI 분류 카드 (콘텐츠 섹션용)
function ClassificationCards() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <div className="text-xs font-bold text-blue-600 mb-2">설득 단계 (Funnel)</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-400" /><span className="text-xs text-gray-700">AWARENESS - 문제 인식</span></div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-xs text-gray-700">CONSIDERATION - 해결책 비교</span></div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-600" /><span className="text-xs text-gray-700">DECISION - 구매 결정</span></div>
        </div>
      </div>
      <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4">
        <div className="text-xs font-bold text-purple-600 mb-2">감정 유형 (Emotion)</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400" /><span className="text-xs text-gray-700">PROBLEM - 고민 자극</span></div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs text-gray-700">TRUST - 사회적 증거</span></div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-xs text-gray-700">AUTHORITY - 전문성</span></div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500" /><span className="text-xs text-gray-700">URGENCY - 긴급성</span></div>
        </div>
      </div>
      <div className="col-span-2 rounded-xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-emerald-600 mb-1">CTA 강도</div>
            <div className="text-xs text-gray-600">행동 유도 강도를 0~100 수치로 자동 측정</div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-16 h-3 rounded-full bg-gradient-to-r from-emerald-200 via-yellow-300 to-red-400" />
            <span className="text-[10px] text-gray-400 ml-1">0 → 100</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 빌더 노드 카드 (시퀀스 섹션용)
function BuilderNodeCards() {
  const nodes = [
    { name: '트리거', desc: '시퀀스 시작점', color: 'from-green-400 to-emerald-500', border: 'border-green-300', icon: '▶️' },
    { name: '대기', desc: '시간/일/주 대기', color: 'from-amber-400 to-yellow-500', border: 'border-amber-300', icon: '⏱️' },
    { name: '이메일', desc: '콘텐츠 발송', color: 'from-blue-400 to-indigo-500', border: 'border-blue-300', icon: '📧' },
    { name: '조건', desc: 'Yes/No 분기', color: 'from-purple-400 to-violet-500', border: 'border-purple-300', icon: '🔀' },
    { name: '액션', desc: '태그/점수 변경', color: 'from-teal-400 to-cyan-500', border: 'border-teal-300', icon: '⚡' },
  ];
  return (
    <div className="grid grid-cols-5 gap-2">
      {nodes.map(n => (
        <div key={n.name} className={`rounded-xl border-2 ${n.border} overflow-hidden text-center`}>
          <div className={`bg-gradient-to-br ${n.color} py-3 text-white text-2xl`}>{n.icon}</div>
          <div className="py-2 px-1 bg-white">
            <div className="text-xs font-bold text-gray-800">{n.name}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{n.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function renderBlock(block: ContentBlock, sectionId: string, index: number) {
  // 스텝 리스트
  if (block.type === 'steps') {
    const items = block.body.split('|');
    return (
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {i + 1}
            </span>
            <p className="text-sm text-gray-700 pt-1 leading-relaxed">{item.trim()}</p>
          </div>
        ))}
      </div>
    );
  }

  // 점수 테이블
  if (block.type === 'score-table') {
    const rows = block.body.split('\n').map(r => r.split('|'));
    return (
      <div className="rounded-xl overflow-hidden border">
        {rows.map((row, i) => (
          <div key={i} className={`flex items-center px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${i < rows.length - 1 ? 'border-b' : ''}`}>
            <span className="text-xl mr-3">{row[2]?.trim()}</span>
            <span className="flex-1 text-sm font-medium text-gray-800">{row[0]?.trim()}</span>
            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{row[1]?.trim()}</span>
          </div>
        ))}
      </div>
    );
  }

  // 상태 차트
  if (block.type === 'state-chart') {
    const states = block.body.split('\n').map(r => r.split('|'));
    return (
      <div className="space-y-2">
        {states.map((s, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${s[6]?.trim()} ${s[4]?.trim()}`}>
            <div className={`text-lg font-black ${s[5]?.trim()}`}>{s[0]?.trim()}</div>
            <div className="w-px h-8 bg-current opacity-20" />
            <div className="flex-1">
              <span className={`text-sm font-semibold ${s[5]?.trim()}`}>{s[1]?.trim()}</span>
              <span className="text-xs text-gray-500 ml-2">{s[3]?.trim()}</span>
            </div>
            <div className={`text-xs font-bold px-3 py-1 rounded-full bg-white/60 ${s[5]?.trim()}`}>{s[2]?.trim()}</div>
            {i < states.length - 1 && (
              <div className="absolute -bottom-2 left-1/2 text-gray-300 text-lg">↓</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // 노드 카드 (섹션별 다른 카드)
  if (block.type === 'node-cards') {
    if (sectionId === 'contents') return <ClassificationCards />;
    if (sectionId === 'sequences') return <BuilderNodeCards />;
    return null;
  }

  // 코드 블록
  if (block.type === 'code') {
    return (
      <div className="rounded-xl bg-gray-900 text-gray-100 p-5 font-mono text-xs leading-relaxed overflow-x-auto">
        {block.body.split('\n').map((line, i) => (
          <div key={i} className={line.startsWith('#') ? 'text-emerald-400 mt-2 first:mt-0' : 'text-gray-300'}>
            {line}
          </div>
        ))}
      </div>
    );
  }

  // 팁 박스
  if (block.type === 'tip') {
    return (
      <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border-2 border-indigo-100 p-5">
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{block.body}</div>
      </div>
    );
  }

  // 경고 박스
  if (block.type === 'warning') {
    return (
      <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 p-5">
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{block.body}</div>
      </div>
    );
  }

  // 기본 텍스트
  return (
    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{block.body}</div>
  );
}

export default function StepMailManualPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const currentSection = sections.find(s => s.id === activeSection)!;

  return (
    <div className="flex gap-6 max-w-6xl">
      {/* 좌측 목차 */}
      <div className="w-56 shrink-0">
        <div className="sticky top-4">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-4 mb-4 text-white">
            <div className="text-lg font-bold">StepMail</div>
            <div className="text-xs text-indigo-200 mt-0.5">사용 매뉴얼 v1.0</div>
          </div>
          <nav className="space-y-1">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  activeSection === section.id
                    ? `bg-gradient-to-r ${section.gradient} text-white font-semibold shadow-md`
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-base">{section.emoji}</span>
                {section.title}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 우측 콘텐츠 */}
      <div className="flex-1 min-w-0">
        {/* 섹션 헤더 */}
        <div className={`bg-gradient-to-r ${currentSection.gradient} rounded-2xl p-6 mb-6 text-white shadow-lg`}>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{currentSection.emoji}</span>
            <div>
              <h1 className="text-2xl font-bold">{currentSection.title}</h1>
              <p className="text-sm text-white/70 mt-0.5">
                {currentSection.id === 'overview' && '스텝메일 시스템의 전체적인 구조와 흐름을 이해합니다'}
                {currentSection.id === 'subscribers' && '구독자를 등록하고 참여도를 추적하는 방법을 알아봅니다'}
                {currentSection.id === 'contents' && 'GEOAIO 콘텐츠를 가져오고 AI로 분류하는 방법입니다'}
                {currentSection.id === 'sequences' && '비주얼 빌더로 이메일 자동화 흐름을 설계합니다'}
                {currentSection.id === 'activation' && '시퀀스를 활성화하고 이메일 발송을 시작합니다'}
                {currentSection.id === 'tracking' && '이메일 성과를 추적하고 데이터를 분석합니다'}
                {currentSection.id === 'settings' && '이메일 발송 인프라와 환경을 설정합니다'}
              </p>
            </div>
          </div>
        </div>

        {/* 콘텐츠 블록들 */}
        <div className="space-y-5">
          {currentSection.content.map((block, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                {block.icon && <span className="text-xl">{block.icon}</span>}
                <h3 className="text-base font-bold text-gray-900">{block.subtitle}</h3>
              </div>
              <div className="px-6 py-5">
                {renderBlock(block, currentSection.id, i)}
              </div>
            </div>
          ))}
        </div>

        {/* 하단 네비게이션 */}
        <div className="flex items-center justify-between mt-8 mb-4">
          {(() => {
            const idx = sections.findIndex(s => s.id === activeSection);
            const prev = idx > 0 ? sections[idx - 1] : null;
            const next = idx < sections.length - 1 ? sections[idx + 1] : null;
            return (
              <>
                {prev ? (
                  <button
                    onClick={() => { setActiveSection(prev.id); window.scrollTo(0, 0); }}
                    className="flex items-center gap-3 px-5 py-3 rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                  >
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <div className="text-left">
                      <div className="text-[10px] text-gray-400">이전</div>
                      <div className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">{prev.emoji} {prev.title}</div>
                    </div>
                  </button>
                ) : <div />}
                {next ? (
                  <button
                    onClick={() => { setActiveSection(next.id); window.scrollTo(0, 0); }}
                    className={`flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r ${next.gradient} text-white shadow-md hover:shadow-lg transition-all`}
                  >
                    <div className="text-right">
                      <div className="text-[10px] text-white/60">다음</div>
                      <div className="text-sm font-semibold">{next.emoji} {next.title}</div>
                    </div>
                    <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : <div />}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
