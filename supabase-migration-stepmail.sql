-- =============================================
-- StepMail System Migration
-- 범용 산업 AI 마케팅 엔진 - 스텝메일 자동화
-- Run in Supabase Dashboard > SQL Editor
-- =============================================

-- ENUMS
CREATE TYPE funnel_stage AS ENUM ('AWARENESS', 'CONSIDERATION', 'DECISION');
CREATE TYPE emotion_type AS ENUM ('PROBLEM', 'TRUST', 'AUTHORITY', 'URGENCY');
CREATE TYPE block_type AS ENUM ('INTRO', 'PROBLEM', 'STORY', 'PROOF', 'CTA');
CREATE TYPE subscriber_state AS ENUM ('COLD', 'WARM', 'HOT', 'DECISION', 'CONVERTED');
CREATE TYPE subscriber_source AS ENUM ('auth_user', 'landing_form', 'csv_upload');
CREATE TYPE sequence_status AS ENUM ('draft', 'active', 'paused', 'archived');
CREATE TYPE node_type AS ENUM ('trigger', 'delay', 'email', 'condition', 'action');
CREATE TYPE send_status AS ENUM ('pending', 'processing', 'sent', 'failed', 'skipped');
CREATE TYPE sm_event_type AS ENUM ('OPEN', 'CLICK', 'VISIT', 'BOOKING', 'PURCHASE', 'UNSUBSCRIBE');

-- =============================================
-- 1. SUBSCRIBERS (구독자)
-- =============================================
CREATE TABLE IF NOT EXISTS sm_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  name text,
  source subscriber_source NOT NULL DEFAULT 'landing_form',
  tags text[] DEFAULT '{}',
  engagement_score numeric(10,4) DEFAULT 0,
  current_state subscriber_state DEFAULT 'COLD',
  score_updated_at timestamptz DEFAULT now(),
  is_unsubscribed boolean DEFAULT false,
  unsubscribed_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE (owner_id, email)
);

-- =============================================
-- 2. CONTENTS (이메일 콘텐츠)
-- =============================================
CREATE TABLE IF NOT EXISTS sm_contents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  subject_line text NOT NULL,
  preview_text text,
  body_html text,
  body_markdown text,
  funnel_stage funnel_stage,
  emotion_type emotion_type,
  cta_strength int DEFAULT 0 CHECK (cta_strength BETWEEN 0 AND 100),
  conversion_weight numeric(5,2) DEFAULT 1.0,
  source_history_id text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- 3. CONTENT BLOCKS (콘텐츠 모듈 블록)
-- =============================================
CREATE TABLE IF NOT EXISTS sm_content_blocks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id uuid REFERENCES sm_contents(id) ON DELETE CASCADE NOT NULL,
  block_type block_type NOT NULL,
  block_text text NOT NULL,
  position_order int NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}'
);

-- =============================================
-- 4. SEQUENCES (시퀀스 정의)
-- =============================================
CREATE TABLE IF NOT EXISTS sm_sequences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  goal_type text DEFAULT 'nurture',
  status sequence_status DEFAULT 'draft',
  trigger_config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- 5. SEQUENCE NODES (ReactFlow 노드)
-- =============================================
CREATE TABLE IF NOT EXISTS sm_sequence_nodes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id uuid REFERENCES sm_sequences(id) ON DELETE CASCADE NOT NULL,
  node_type node_type NOT NULL,
  label text,
  config jsonb DEFAULT '{}',
  position_x numeric DEFAULT 0,
  position_y numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- 6. SEQUENCE EDGES (ReactFlow 엣지)
-- =============================================
CREATE TABLE IF NOT EXISTS sm_sequence_edges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id uuid REFERENCES sm_sequences(id) ON DELETE CASCADE NOT NULL,
  source_node_id uuid REFERENCES sm_sequence_nodes(id) ON DELETE CASCADE NOT NULL,
  target_node_id uuid REFERENCES sm_sequence_nodes(id) ON DELETE CASCADE NOT NULL,
  edge_label text,
  condition jsonb DEFAULT '{}'
);

-- =============================================
-- 7. ENROLLMENTS (구독자-시퀀스 등록)
-- =============================================
CREATE TABLE IF NOT EXISTS sm_enrollments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id uuid REFERENCES sm_subscribers(id) ON DELETE CASCADE NOT NULL,
  sequence_id uuid REFERENCES sm_sequences(id) ON DELETE CASCADE NOT NULL,
  current_node_id uuid REFERENCES sm_sequence_nodes(id),
  status text DEFAULT 'active',
  enrolled_at timestamptz DEFAULT now(),
  next_step_at timestamptz,
  completed_at timestamptz,
  UNIQUE (subscriber_id, sequence_id)
);

-- =============================================
-- 8. EVENTS (행동 이벤트)
-- =============================================
CREATE TABLE IF NOT EXISTS sm_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id uuid REFERENCES sm_subscribers(id) ON DELETE CASCADE NOT NULL,
  event_type sm_event_type NOT NULL,
  content_id uuid REFERENCES sm_contents(id),
  sequence_id uuid REFERENCES sm_sequences(id),
  node_id uuid REFERENCES sm_sequence_nodes(id),
  score_delta numeric(6,2) DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- 9. SEND QUEUE (발송 큐)
-- =============================================
CREATE TABLE IF NOT EXISTS sm_send_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id uuid REFERENCES sm_subscribers(id) ON DELETE CASCADE NOT NULL,
  content_id uuid REFERENCES sm_contents(id) NOT NULL,
  sequence_id uuid REFERENCES sm_sequences(id),
  node_id uuid REFERENCES sm_sequence_nodes(id),
  enrollment_id uuid REFERENCES sm_enrollments(id),
  scheduled_at timestamptz NOT NULL,
  sent_at timestamptz,
  status send_status DEFAULT 'pending',
  retry_count int DEFAULT 0,
  error_message text,
  resend_message_id text,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- 10. PERFORMANCE METRICS (성과 메트릭 캐시)
-- =============================================
CREATE TABLE IF NOT EXISTS sm_performance_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id uuid REFERENCES sm_sequences(id) ON DELETE CASCADE,
  node_id uuid REFERENCES sm_sequence_nodes(id) ON DELETE CASCADE,
  content_id uuid REFERENCES sm_contents(id) ON DELETE CASCADE,
  period_date date NOT NULL DEFAULT CURRENT_DATE,
  sends_count int DEFAULT 0,
  opens_count int DEFAULT 0,
  clicks_count int DEFAULT 0,
  unsubscribes_count int DEFAULT 0,
  open_rate numeric(6,4) DEFAULT 0,
  click_rate numeric(6,4) DEFAULT 0,
  unsubscribe_rate numeric(6,4) DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (sequence_id, node_id, period_date)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_sm_send_queue_scheduled ON sm_send_queue (scheduled_at, status) WHERE status = 'pending';
CREATE INDEX idx_sm_events_subscriber ON sm_events (subscriber_id, created_at DESC);
CREATE INDEX idx_sm_enrollments_next_step ON sm_enrollments (next_step_at, status) WHERE status = 'active';
CREATE INDEX idx_sm_subscribers_owner ON sm_subscribers (owner_id, current_state);
CREATE INDEX idx_sm_subscribers_email_owner ON sm_subscribers (owner_id, email);

-- =============================================
-- POSTGRES FUNCTION: 이벤트 기록 + 점수 업데이트 + 상태 전이
-- =============================================
CREATE OR REPLACE FUNCTION sm_record_event(
  p_subscriber_id uuid,
  p_event_type sm_event_type,
  p_content_id uuid DEFAULT NULL,
  p_sequence_id uuid DEFAULT NULL,
  p_node_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
) RETURNS uuid AS $$
DECLARE
  v_score_delta numeric;
  v_event_id uuid;
BEGIN
  -- Score delta per event type
  v_score_delta := CASE p_event_type
    WHEN 'OPEN'      THEN 5
    WHEN 'CLICK'     THEN 10
    WHEN 'VISIT'     THEN 15
    WHEN 'BOOKING'   THEN 25
    WHEN 'PURCHASE'  THEN 40
    ELSE 0
  END;

  -- Insert event
  INSERT INTO sm_events (subscriber_id, event_type, content_id, sequence_id, node_id, score_delta, metadata)
  VALUES (p_subscriber_id, p_event_type, p_content_id, p_sequence_id, p_node_id, v_score_delta, p_metadata)
  RETURNING id INTO v_event_id;

  -- Update subscriber score and state
  UPDATE sm_subscribers
  SET
    engagement_score = engagement_score + v_score_delta,
    score_updated_at = now(),
    current_state = CASE
      WHEN (engagement_score + v_score_delta) < 20   THEN 'COLD'::subscriber_state
      WHEN (engagement_score + v_score_delta) < 50   THEN 'WARM'::subscriber_state
      WHEN (engagement_score + v_score_delta) < 80   THEN 'HOT'::subscriber_state
      WHEN (engagement_score + v_score_delta) < 120  THEN 'DECISION'::subscriber_state
      ELSE                                               'CONVERTED'::subscriber_state
    END
  WHERE id = p_subscriber_id;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- POSTGRES FUNCTION: 시간 감쇠 적용
-- S(t) = S(t-1) * e^(-lambda * dt/24)
-- lambda = 0.03, dt = hours elapsed
-- =============================================
CREATE OR REPLACE FUNCTION sm_apply_score_decay()
RETURNS void AS $$
DECLARE
  lambda CONSTANT numeric := 0.03;
BEGIN
  UPDATE sm_subscribers
  SET
    engagement_score = GREATEST(
      engagement_score * EXP(-lambda * EXTRACT(EPOCH FROM (now() - score_updated_at)) / 86400.0),
      0
    ),
    current_state = CASE
      WHEN GREATEST(engagement_score * EXP(-lambda * EXTRACT(EPOCH FROM (now() - score_updated_at)) / 86400.0), 0) < 20
        THEN 'COLD'::subscriber_state
      WHEN GREATEST(engagement_score * EXP(-lambda * EXTRACT(EPOCH FROM (now() - score_updated_at)) / 86400.0), 0) < 50
        THEN 'WARM'::subscriber_state
      WHEN GREATEST(engagement_score * EXP(-lambda * EXTRACT(EPOCH FROM (now() - score_updated_at)) / 86400.0), 0) < 80
        THEN 'HOT'::subscriber_state
      WHEN GREATEST(engagement_score * EXP(-lambda * EXTRACT(EPOCH FROM (now() - score_updated_at)) / 86400.0), 0) < 120
        THEN 'DECISION'::subscriber_state
      ELSE 'CONVERTED'::subscriber_state
    END,
    score_updated_at = now()
  WHERE engagement_score > 0.01
    AND score_updated_at < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE sm_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_sequence_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_sequence_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_send_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Owner-scoped policies
CREATE POLICY "sm_subscribers_owner" ON sm_subscribers
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "sm_contents_owner" ON sm_contents
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "sm_content_blocks_owner" ON sm_content_blocks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM sm_contents WHERE id = content_id AND owner_id = auth.uid())
  );

CREATE POLICY "sm_sequences_owner" ON sm_sequences
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "sm_sequence_nodes_owner" ON sm_sequence_nodes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM sm_sequences WHERE id = sequence_id AND owner_id = auth.uid())
  );

CREATE POLICY "sm_sequence_edges_owner" ON sm_sequence_edges
  FOR ALL USING (
    EXISTS (SELECT 1 FROM sm_sequences WHERE id = sequence_id AND owner_id = auth.uid())
  );

CREATE POLICY "sm_enrollments_owner" ON sm_enrollments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM sm_sequences WHERE id = sequence_id AND owner_id = auth.uid())
  );

CREATE POLICY "sm_events_owner" ON sm_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM sm_subscribers WHERE id = subscriber_id AND owner_id = auth.uid())
  );

CREATE POLICY "sm_send_queue_owner" ON sm_send_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM sm_sequences WHERE id = sequence_id AND owner_id = auth.uid())
  );

CREATE POLICY "sm_performance_metrics_owner" ON sm_performance_metrics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM sm_sequences WHERE id = sequence_id AND owner_id = auth.uid())
  );
