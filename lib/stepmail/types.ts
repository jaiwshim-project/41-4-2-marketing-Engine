// =============================================
// 범용 산업 AI 마케팅 엔진 - 스텝메일 타입 정의
// =============================================

// Core enums matching DB
export type FunnelStage = 'AWARENESS' | 'CONSIDERATION' | 'DECISION';
export type EmotionType = 'PROBLEM' | 'TRUST' | 'AUTHORITY' | 'URGENCY';
export type BlockType = 'INTRO' | 'PROBLEM' | 'STORY' | 'PROOF' | 'CTA';
export type SubscriberState = 'COLD' | 'WARM' | 'HOT' | 'DECISION' | 'CONVERTED';
export type SubscriberSource = 'auth_user' | 'landing_form' | 'csv_upload';
export type SequenceStatus = 'draft' | 'active' | 'paused' | 'archived';
export type NodeType = 'trigger' | 'delay' | 'email' | 'condition' | 'action';
export type SendStatus = 'pending' | 'processing' | 'sent' | 'failed' | 'skipped';
export type EventType = 'OPEN' | 'CLICK' | 'VISIT' | 'BOOKING' | 'PURCHASE' | 'UNSUBSCRIBE';

// Engagement score thresholds
export const SCORE_THRESHOLDS = {
  COLD: 0,
  WARM: 20,
  HOT: 50,
  DECISION: 80,
  CONVERTED: 120,
} as const;

// Event score deltas
export const EVENT_SCORES: Record<EventType, number> = {
  OPEN: 5,
  CLICK: 10,
  VISIT: 15,
  BOOKING: 25,
  PURCHASE: 40,
  UNSUBSCRIBE: 0,
};

// State labels for UI
export const STATE_LABELS: Record<SubscriberState, { label: string; color: string }> = {
  COLD: { label: '콜드', color: 'bg-blue-100 text-blue-700' },
  WARM: { label: '웜', color: 'bg-yellow-100 text-yellow-700' },
  HOT: { label: '핫', color: 'bg-orange-100 text-orange-700' },
  DECISION: { label: '결정임박', color: 'bg-red-100 text-red-700' },
  CONVERTED: { label: '전환완료', color: 'bg-green-100 text-green-700' },
};

export const FUNNEL_LABELS: Record<FunnelStage, { label: string; color: string }> = {
  AWARENESS: { label: '인지', color: 'bg-sky-100 text-sky-700' },
  CONSIDERATION: { label: '고려', color: 'bg-amber-100 text-amber-700' },
  DECISION: { label: '결정', color: 'bg-rose-100 text-rose-700' },
};

export const EMOTION_LABELS: Record<EmotionType, { label: string; color: string }> = {
  PROBLEM: { label: '문제제기', color: 'bg-red-50 text-red-600' },
  TRUST: { label: '신뢰', color: 'bg-blue-50 text-blue-600' },
  AUTHORITY: { label: '권위', color: 'bg-purple-50 text-purple-600' },
  URGENCY: { label: '긴급성', color: 'bg-orange-50 text-orange-600' },
};

// =============================================
// DB Table Interfaces
// =============================================

export interface SmSubscriber {
  id: string;
  owner_id: string;
  email: string;
  name?: string;
  source: SubscriberSource;
  tags: string[];
  engagement_score: number;
  current_state: SubscriberState;
  score_updated_at: string;
  is_unsubscribed: boolean;
  unsubscribed_at?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SmContent {
  id: string;
  owner_id: string;
  title: string;
  subject_line: string;
  preview_text?: string;
  body_html?: string;
  body_markdown?: string;
  funnel_stage?: FunnelStage;
  emotion_type?: EmotionType;
  cta_strength: number;
  conversion_weight: number;
  source_history_id?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  blocks?: SmContentBlock[];
}

export interface SmContentBlock {
  id: string;
  content_id: string;
  block_type: BlockType;
  block_text: string;
  position_order: number;
  metadata?: Record<string, unknown>;
}

export interface SmSequence {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  goal_type: string;
  status: SequenceStatus;
  trigger_config: TriggerConfig;
  created_at: string;
  updated_at: string;
}

export interface TriggerConfig {
  type: 'signup' | 'tag_added' | 'manual' | 'score_threshold';
  tag?: string;
  score_threshold?: number;
}

export interface SmSequenceNode {
  id: string;
  sequence_id: string;
  node_type: NodeType;
  label?: string;
  config: NodeConfig;
  position_x: number;
  position_y: number;
  created_at?: string;
}

export type NodeConfig =
  | TriggerNodeConfig
  | DelayNodeConfig
  | EmailNodeConfig
  | ConditionNodeConfig
  | ActionNodeConfig;

export interface TriggerNodeConfig {
  trigger_type: string;
  conditions?: Record<string, unknown>;
}

export interface DelayNodeConfig {
  amount: number;
  unit: 'hours' | 'days' | 'weeks';
}

export interface EmailNodeConfig {
  content_id: string;
  track_opens: boolean;
  track_clicks: boolean;
}

export interface ConditionNodeConfig {
  condition_type: 'opened' | 'clicked' | 'score_gte' | 'tag_contains';
  threshold?: number;
  content_id?: string;
  tag?: string;
}

export interface ActionNodeConfig {
  action_type: 'add_tag' | 'remove_tag' | 'update_score' | 'move_sequence';
  value: string | number;
}

export interface SmSequenceEdge {
  id: string;
  sequence_id: string;
  source_node_id: string;
  target_node_id: string;
  edge_label?: string;
  condition: Record<string, unknown>;
}

export interface SmEnrollment {
  id: string;
  subscriber_id: string;
  sequence_id: string;
  current_node_id?: string;
  status: 'active' | 'completed' | 'paused' | 'exited';
  enrolled_at: string;
  next_step_at?: string;
  completed_at?: string;
}

export interface SmSendQueueItem {
  id: string;
  subscriber_id: string;
  content_id: string;
  sequence_id?: string;
  node_id?: string;
  enrollment_id?: string;
  scheduled_at: string;
  sent_at?: string;
  status: SendStatus;
  retry_count: number;
  error_message?: string;
  resend_message_id?: string;
  created_at: string;
}

export interface SmEvent {
  id: string;
  subscriber_id: string;
  event_type: EventType;
  content_id?: string;
  sequence_id?: string;
  node_id?: string;
  score_delta: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SmPerformanceMetric {
  id: string;
  sequence_id?: string;
  node_id?: string;
  content_id?: string;
  period_date: string;
  sends_count: number;
  opens_count: number;
  clicks_count: number;
  unsubscribes_count: number;
  open_rate: number;
  click_rate: number;
  unsubscribe_rate: number;
  updated_at: string;
}

// =============================================
// API Request/Response Types
// =============================================

export interface CreateSubscriberRequest {
  email: string;
  name?: string;
  source?: SubscriberSource;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateSubscriberRequest {
  name?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  is_unsubscribed?: boolean;
}

export interface CreateContentRequest {
  title: string;
  subject_line: string;
  preview_text?: string;
  body_html?: string;
  body_markdown?: string;
  funnel_stage?: FunnelStage;
  emotion_type?: EmotionType;
  cta_strength?: number;
  tags?: string[];
}

export interface CreateSequenceRequest {
  name: string;
  description?: string;
  goal_type?: string;
  trigger_config?: TriggerConfig;
}

export interface SaveFlowRequest {
  nodes: Array<{
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data: { label?: string; config: NodeConfig };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    data?: Record<string, unknown>;
  }>;
}

// Content classifier output
export interface ContentClassification {
  funnel_stage: FunnelStage;
  emotion_type: EmotionType;
  cta_strength: number;
  conversion_weight: number;
  blocks: {
    block_type: BlockType;
    block_text: string;
    position_order: number;
  }[];
  reasoning: string;
}

// Dashboard metrics
export interface SequenceMetrics {
  sequence_id: string;
  sequence_name: string;
  status: SequenceStatus;
  total_enrolled: number;
  total_sends: number;
  open_rate: number;
  click_rate: number;
  unsubscribe_rate: number;
}

export interface DashboardOverview {
  total_subscribers: number;
  active_sequences: number;
  emails_sent_today: number;
  avg_open_rate: number;
  avg_click_rate: number;
  state_distribution: Record<SubscriberState, number>;
}
