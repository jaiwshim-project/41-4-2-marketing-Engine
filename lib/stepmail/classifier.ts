import Anthropic from '@anthropic-ai/sdk';
import type { ContentClassification } from './types';

const CLASSIFIER_PROMPT = `당신은 이메일 마케팅 퍼널 전문가입니다.
주어진 마케팅 콘텐츠를 분석하여 다음 JSON 형식으로만 응답하세요.

{
  "funnel_stage": "AWARENESS" | "CONSIDERATION" | "DECISION",
  "emotion_type": "PROBLEM" | "TRUST" | "AUTHORITY" | "URGENCY",
  "cta_strength": 0-100,
  "conversion_weight": 0.1-3.0,
  "blocks": [
    {
      "block_type": "INTRO" | "PROBLEM" | "STORY" | "PROOF" | "CTA",
      "block_text": "이 블록의 핵심 텍스트",
      "position_order": 0
    }
  ],
  "reasoning": "분류 이유 한 문장"
}

분류 기준:
- AWARENESS: 문제 인식, 교육적 콘텐츠, 브랜드 소개
- CONSIDERATION: 솔루션 비교, 기능 설명, 사례 연구
- DECISION: 가격, 특별 제안, 구매 유도, 긴급성
- PROBLEM: 독자의 고통점을 자극
- TRUST: 사회적 증거, 후기, 데이터
- AUTHORITY: 전문성 강조, 수상, 자격증
- URGENCY: 마감, 희소성, 즉각 행동 유도
- cta_strength: CTA의 직접성 (0=CTA없음, 100=매우 강한 직접 구매 유도)
- conversion_weight: 구매 전환 영향력 가중치 (AWARENESS=0.3~0.8, CONSIDERATION=0.8~1.5, DECISION=1.5~3.0)`;

export async function classifyContent(
  title: string,
  bodyMarkdown: string,
  apiKey?: string
): Promise<ContentClassification> {
  const client = new Anthropic({ apiKey: apiKey || process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    system: CLASSIFIER_PROMPT,
    messages: [
      {
        role: 'user',
        content: `제목: ${title}\n\n콘텐츠:\n${bodyMarkdown.slice(0, 4000)}`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('분류 결과 파싱 실패');

  return JSON.parse(match[0]) as ContentClassification;
}
