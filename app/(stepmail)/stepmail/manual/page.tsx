'use client';

import { useState } from 'react';

const sections = [
  {
    id: 'overview',
    title: '시스템 개요',
    icon: '1',
    content: [
      {
        subtitle: 'StepMail이란?',
        body: `StepMail은 AI 기반 이메일 마케팅 자동화 엔진입니다.
GEOAIO에서 생성한 콘텐츠를 자동으로 설득 단계별로 분류하고, 구독자의 행동에 따라 최적의 타이밍에 이메일을 발송합니다.

핵심 기능:
- GEOAIO 콘텐츠 자동 임포트 + AI 분류
- 구독자 행동 기반 Engagement Score 자동 계산
- 비주얼 드래그앤드롭 시퀀스 빌더
- 오픈/클릭 트래킹 및 성과 분석`,
      },
      {
        subtitle: '전체 워크플로우',
        body: `1. 콘텐츠 준비: GEOAIO에서 생성하거나 직접 작성
2. 구독자 등록: 직접 추가, 공개 폼, CSV 업로드
3. 시퀀스 설계: 비주얼 빌더로 이메일 흐름 구성
4. 활성화: 시퀀스를 활성화하면 자동 발송 시작
5. 분석: 대시보드에서 오픈율, 클릭율, 전환 확인`,
      },
    ],
  },
  {
    id: 'subscribers',
    title: '구독자 관리',
    icon: '2',
    content: [
      {
        subtitle: '구독자 추가 방법',
        body: `3가지 방법으로 구독자를 등록할 수 있습니다:

1. 직접 추가
   - 구독자 목록 → "+ 구독자 추가" 버튼
   - 이메일, 이름 입력 후 저장

2. CSV 대량 업로드
   - 구독자 목록 → "CSV 가져오기" 버튼
   - CSV 파일 업로드 또는 직접 붙여넣기
   - 필수 컬럼: email (또는 이메일)
   - 선택 컬럼: name, tags

3. 공개 구독 폼 (API)
   - 외부 랜딩페이지에서 API 호출로 자동 등록
   - POST /api/stepmail/subscribers/subscribe`,
      },
      {
        subtitle: 'Engagement Score (참여 점수)',
        body: `구독자의 행동에 따라 자동으로 점수가 계산됩니다:

행동별 점수:
- 이메일 열람 (Open): +5점
- 링크 클릭 (Click): +10점
- 페이지 방문 (Visit): +15점
- 상담 신청 (Booking): +25점
- 구매 (Purchase): +40점

시간 감쇠: 활동이 없으면 점수가 서서히 감소합니다.`,
      },
      {
        subtitle: '구독자 상태 (State)',
        body: `점수에 따라 구독자 상태가 자동 전이됩니다:

COLD (차가움): 0~19점 - 관심 없는 상태
WARM (따뜻함): 20~49점 - 관심을 보이기 시작
HOT (뜨거움): 50~79점 - 적극적으로 참여 중
DECISION (결정): 80~119점 - 구매 결정 단계
CONVERTED (전환): 120점 이상 - 전환 완료

이 상태를 활용하여 시퀀스에서 조건 분기를 만들 수 있습니다.`,
      },
      {
        subtitle: '태그 관리',
        body: `구독자에게 태그를 추가하여 세분화할 수 있습니다.

활용 예시:
- "2026년2월캠페인" - 캠페인별 분류
- "블로그유입" - 유입 경로별 분류
- "VIP" - 등급별 분류

태그는 구독자 상세 페이지에서 추가/삭제할 수 있으며,
시퀀스의 조건 노드에서 태그 포함 여부로 분기할 수 있습니다.`,
      },
    ],
  },
  {
    id: 'contents',
    title: '콘텐츠 관리',
    icon: '3',
    content: [
      {
        subtitle: 'GEOAIO에서 콘텐츠 가져오기',
        body: `GEOAIO에서 생성한 콘텐츠를 스텝메일로 가져오는 방법:

1. 콘텐츠 라이브러리 → "+ 새 콘텐츠" 클릭
2. "GEOAIO에서 가져오기" 버튼 클릭
3. 생성/분석 콘텐츠 목록이 표시됨
4. 유형 필터(생성/분석)와 키워드 검색으로 찾기
5. 원하는 콘텐츠의 "가져오기" 버튼 클릭
6. AI가 자동으로 설득 단계, 감정 유형, CTA 강도를 분류

이미 가져온 콘텐츠는 "이미 가져옴"으로 표시되어 중복을 방지합니다.`,
      },
      {
        subtitle: 'AI 콘텐츠 분류',
        body: `Claude AI가 콘텐츠를 자동으로 분류합니다:

설득 단계 (Funnel Stage):
- AWARENESS (인지): 문제를 인식시키는 콘텐츠
- CONSIDERATION (고려): 해결책을 비교/검토하는 콘텐츠
- DECISION (결정): 구매를 결정짓는 콘텐츠

감정 유형 (Emotion Type):
- PROBLEM (문제제기): 고객의 고민을 자극
- TRUST (신뢰): 사회적 증거, 후기
- AUTHORITY (권위): 전문성, 경력, 인증
- URGENCY (긴급성): 한정 혜택, 마감

CTA 강도 (0~100): 행동 유도 강도 수치`,
      },
      {
        subtitle: '콘텐츠 직접 작성',
        body: `GEOAIO를 사용하지 않고 직접 콘텐츠를 작성할 수도 있습니다:

1. 콘텐츠 라이브러리 → "+ 새 콘텐츠" 클릭
2. 콘텐츠 제목 (내부 관리용)
3. 이메일 제목 (수신자에게 보여지는 Subject)
4. 미리보기 텍스트 (수신함에서 미리 보이는 텍스트)
5. 설득 단계 / 감정 유형 선택 (또는 저장 후 AI 분류)
6. 본문을 Markdown으로 작성
7. "저장" 클릭`,
      },
    ],
  },
  {
    id: 'sequences',
    title: '시퀀스 설계',
    icon: '4',
    content: [
      {
        subtitle: '시퀀스란?',
        body: `시퀀스는 구독자에게 자동으로 발송되는 이메일 흐름입니다.
예를 들어:

1일차: 환영 이메일 발송
↓ 2일 대기
3일차: 문제제기 콘텐츠 발송
↓ 이메일 열람했는지 확인
  → 열람함: 해결책 콘텐츠 발송
  → 미열람: 리마인더 발송
↓ 3일 대기
6일차: 할인 제안 발송

이런 흐름을 비주얼 빌더로 드래그앤드롭으로 설계합니다.`,
      },
      {
        subtitle: '시퀀스 만들기',
        body: `1. 시퀀스 목록 → "+ 새 시퀀스" 버튼
2. 시퀀스 이름과 설명 입력
3. 목표 유형 선택:
   - nurture: 리드 육성
   - onboarding: 온보딩
   - promotion: 프로모션
   - reengagement: 재참여
4. "만들기" 클릭 → 시퀀스 상세 페이지로 이동
5. "빌더 열기" 버튼 → 비주얼 워크플로우 빌더`,
      },
      {
        subtitle: '비주얼 빌더 사용법',
        body: `빌더에서 사용할 수 있는 5가지 노드:

1. 트리거 (Trigger) - 초록색
   시퀀스 시작점. 자동으로 생성됩니다.

2. 대기 (Delay) - 노란색
   지정한 시간만큼 대기합니다.
   설정: 시간/일/주 단위로 대기 시간 지정

3. 이메일 (Email) - 파란색
   콘텐츠를 이메일로 발송합니다.
   설정: 콘텐츠 ID (콘텐츠 라이브러리에서 복사), 오픈/클릭 트래킹

4. 조건 (Condition) - 보라색
   조건에 따라 경로를 분기합니다.
   조건: 이메일 열람, 링크 클릭, 점수 이상, 태그 포함
   Yes/No 두 방향으로 연결

5. 액션 (Action) - 청록색
   구독자 데이터를 변경합니다.
   액션: 태그 추가/제거, 점수 변경, 시퀀스 이동`,
      },
      {
        subtitle: '빌더 조작법',
        body: `노드 추가:
  상단 툴바에서 원하는 노드 버튼 클릭

노드 연결:
  노드의 핸들(작은 원)을 드래그하여 다른 노드로 연결

노드 설정:
  노드를 클릭하면 오른쪽에 설정 패널이 나타남

저장:
  상단 "저장" 버튼 클릭 (자동 저장 아님, 반드시 수동 저장)

시퀀스 활성화:
  빌더에서 나와 시퀀스 상세 페이지에서 "활성화" 버튼 클릭`,
      },
    ],
  },
  {
    id: 'activation',
    title: '시퀀스 활성화 & 발송',
    icon: '5',
    content: [
      {
        subtitle: '시퀀스 활성화',
        body: `시퀀스를 활성화하려면:

1. 시퀀스 상세 페이지에서 "활성화" 버튼 클릭
2. 최소 조건 확인:
   - 트리거 노드가 있어야 함
   - 이메일 노드가 1개 이상 있어야 함
3. 활성화 후 구독자를 등록하면 자동 발송 시작

활성화/일시정지 토글로 언제든 중단/재개 가능합니다.`,
      },
      {
        subtitle: '구독자 등록 (Enrollment)',
        body: `활성화된 시퀀스에 구독자를 등록하는 방법:

1. 수동 등록
   - 시퀀스 상세 페이지 → "구독자 등록" 버튼
   - 구독자 이메일 입력 → 등록

2. 자동 등록 (향후 지원)
   - 특정 태그가 추가될 때 자동 등록
   - 공개 구독 폼에서 등록 시 자동 시퀀스 배정

등록된 구독자는 트리거 노드부터 시작하여
시퀀스 흐름을 따라 자동으로 진행됩니다.`,
      },
      {
        subtitle: '발송 처리 (큐 시스템)',
        body: `이메일 발송은 큐 시스템으로 처리됩니다:

1. 이메일 노드에 도달하면 발송 큐에 추가
2. Cron Job이 주기적으로 큐를 처리 (매일 9시 UTC)
3. 한 번에 최대 50건 배치 처리
4. 실패 시 최대 3회 자동 재시도

발송 인프라: Resend API를 사용합니다.
설정 → Resend API Key를 등록해야 발송이 동작합니다.

Vercel Pro 플랜 사용 시 5분마다 처리 가능합니다.`,
      },
    ],
  },
  {
    id: 'tracking',
    title: '트래킹 & 분석',
    icon: '6',
    content: [
      {
        subtitle: '오픈/클릭 트래킹',
        body: `발송된 이메일의 열람과 클릭을 자동으로 추적합니다:

오픈 트래킹:
  이메일에 1x1 투명 이미지(트래킹 픽셀)가 삽입됩니다.
  수신자가 이메일을 열면 이미지가 로드되며 열람이 기록됩니다.

클릭 트래킹:
  이메일의 모든 링크가 트래킹 URL로 변환됩니다.
  수신자가 클릭하면 클릭이 기록된 후 원래 URL로 리다이렉트됩니다.

모든 트래킹 데이터는 구독자의 Engagement Score에 자동 반영됩니다.`,
      },
      {
        subtitle: '대시보드 활용',
        body: `대시보드에서 확인할 수 있는 지표:

KPI 카드:
- 전체 구독자 수
- 활성 시퀀스 수
- 오늘 발송 수
- 평균 오픈율
- 평균 클릭율

차트:
- 구독자 상태 분포 (파이차트): COLD/WARM/HOT/DECISION/CONVERTED
- 시퀀스별 오픈율/클릭율 비교 (바차트)

성과 테이블:
- 각 시퀀스의 등록자, 발송 수, 오픈율, 클릭율 상세`,
      },
      {
        subtitle: '구독자 여정 확인',
        body: `각 구독자의 상세 이벤트 타임라인을 확인할 수 있습니다:

구독자 목록 → 구독자 클릭 → 상세 페이지

확인 가능한 정보:
- 이메일 주소, 이름, 가입일
- 현재 Engagement Score
- 현재 상태 (COLD/WARM/HOT/DECISION/CONVERTED)
- 수신 상태 (활성/수신 거부)
- 태그 목록 (추가/삭제 가능)
- 이벤트 타임라인 (최근 50건)
  - 이메일 열람, 링크 클릭, 페이지 방문 등`,
      },
    ],
  },
  {
    id: 'settings',
    title: '설정 안내',
    icon: '7',
    content: [
      {
        subtitle: 'Resend API 설정',
        body: `이메일 발송을 위해 Resend API 키가 필요합니다:

1. https://resend.com 에서 회원가입
2. 도메인 인증 (Settings → Domains → Add Domain)
3. API Keys 메뉴에서 API Key 생성
4. 설정 페이지에 API Key 입력

또는 Vercel 환경변수에 설정:
  RESEND_API_KEY=re_xxxx
  RESEND_FROM_EMAIL=noreply@yourdomain.com
  RESEND_FROM_NAME=발신자이름`,
      },
      {
        subtitle: '수신 거부',
        body: `모든 발송 이메일에는 수신 거부 링크가 자동으로 포함됩니다.

수신자가 수신 거부를 클릭하면:
1. 구독자의 is_unsubscribed 상태가 true로 변경
2. 이후 발송 큐에서 자동으로 건너뜀
3. UNSUBSCRIBE 이벤트가 기록됨

이는 이메일 마케팅 법규(한국 정보통신망법, CAN-SPAM 등)를
준수하기 위한 필수 기능입니다.`,
      },
      {
        subtitle: '환경변수 전체 목록',
        body: `Vercel 또는 .env.local에 설정할 환경변수:

필수:
  NEXT_PUBLIC_SUPABASE_URL - Supabase 프로젝트 URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY - Supabase 공개 키
  SUPABASE_SERVICE_ROLE_KEY - Supabase 서비스 역할 키
  ANTHROPIC_API_KEY - Claude AI API 키

이메일 발송:
  RESEND_API_KEY - Resend API 키
  RESEND_FROM_EMAIL - 발신자 이메일
  RESEND_FROM_NAME - 발신자 이름

보안:
  TRACKING_SECRET - 트래킹 토큰 서명 키 (랜덤 32자)
  CRON_SECRET - Cron 엔드포인트 인증 키`,
      },
    ],
  },
];

export default function StepMailManualPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const currentSection = sections.find(s => s.id === activeSection)!;

  return (
    <div className="flex gap-6 max-w-6xl">
      {/* 좌측 목차 */}
      <div className="w-56 shrink-0">
        <div className="sticky top-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3">사용 매뉴얼</h2>
          <nav className="space-y-0.5">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === section.id
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeSection === section.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {section.icon}
                </span>
                {section.title}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 우측 콘텐츠 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
            {currentSection.icon}
          </span>
          <h1 className="text-xl font-bold text-gray-900">{currentSection.title}</h1>
        </div>

        <div className="space-y-6">
          {currentSection.content.map((block, i) => (
            <div key={i} className="bg-white rounded-lg border p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3">{block.subtitle}</h3>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {block.body}
              </div>
            </div>
          ))}
        </div>

        {/* 하단 네비게이션 */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          {(() => {
            const idx = sections.findIndex(s => s.id === activeSection);
            const prev = idx > 0 ? sections[idx - 1] : null;
            const next = idx < sections.length - 1 ? sections[idx + 1] : null;
            return (
              <>
                {prev ? (
                  <button
                    onClick={() => setActiveSection(prev.id)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {prev.title}
                  </button>
                ) : <div />}
                {next ? (
                  <button
                    onClick={() => setActiveSection(next.id)}
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {next.title}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
