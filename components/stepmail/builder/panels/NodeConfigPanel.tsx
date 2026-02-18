'use client';

import type { Node } from '@xyflow/react';
import type { NodeType } from '@/lib/stepmail/types';

interface NodeConfigPanelProps {
  node: Node;
  onClose: () => void;
  onChange: (data: Record<string, unknown>) => void;
}

export default function NodeConfigPanel({ node, onClose, onChange }: NodeConfigPanelProps) {
  const nodeType = node.type as NodeType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = ((node.data as Record<string, unknown>)?.config || {}) as any;
  const label = (node.data as Record<string, unknown>)?.label as string || '';

  const updateConfig = (key: string, value: unknown) => {
    onChange({ config: { ...config, [key]: value }, label });
  };

  const updateLabel = (newLabel: string) => {
    onChange({ config, label: newLabel });
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full overflow-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900">노드 설정</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">라벨</label>
          <input
            type="text"
            value={label}
            onChange={(e) => updateLabel(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        {nodeType === 'delay' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">대기 시간</label>
              <input
                type="number"
                min={1}
                value={config.amount || 1}
                onChange={(e) => updateConfig('amount', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">단위</label>
              <select
                value={config.unit || 'days'}
                onChange={(e) => updateConfig('unit', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="hours">시간</option>
                <option value="days">일</option>
                <option value="weeks">주</option>
              </select>
            </div>
          </>
        )}

        {nodeType === 'email' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">콘텐츠 ID</label>
              <input
                type="text"
                value={config.content_id || ''}
                onChange={(e) => updateConfig('content_id', e.target.value)}
                placeholder="콘텐츠 라이브러리에서 ID 복사"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.track_opens !== false}
                onChange={(e) => updateConfig('track_opens', e.target.checked)}
                className="rounded"
              />
              <label className="text-xs text-gray-700">오픈 트래킹</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.track_clicks !== false}
                onChange={(e) => updateConfig('track_clicks', e.target.checked)}
                className="rounded"
              />
              <label className="text-xs text-gray-700">클릭 트래킹</label>
            </div>
          </>
        )}

        {nodeType === 'condition' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">조건 유형</label>
              <select
                value={config.condition_type || 'opened'}
                onChange={(e) => updateConfig('condition_type', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="opened">이메일 열람</option>
                <option value="clicked">링크 클릭</option>
                <option value="score_gte">점수 이상</option>
                <option value="tag_contains">태그 포함</option>
              </select>
            </div>
            {(config.condition_type === 'score_gte') && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">점수 임계값</label>
                <input
                  type="number"
                  value={config.threshold || 0}
                  onChange={(e) => updateConfig('threshold', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            )}
            {(config.condition_type === 'tag_contains') && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">태그</label>
                <input
                  type="text"
                  value={config.tag || ''}
                  onChange={(e) => updateConfig('tag', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            )}
          </>
        )}

        {nodeType === 'action' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">액션 유형</label>
              <select
                value={config.action_type || 'add_tag'}
                onChange={(e) => updateConfig('action_type', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="add_tag">태그 추가</option>
                <option value="remove_tag">태그 제거</option>
                <option value="update_score">점수 변경</option>
                <option value="move_sequence">시퀀스 이동</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">값</label>
              <input
                type="text"
                value={String(config.value || '')}
                onChange={(e) => updateConfig('value', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
