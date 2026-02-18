'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ActionNodeConfig } from '@/lib/stepmail/types';

const actionLabels: Record<string, string> = {
  add_tag: '태그 추가',
  remove_tag: '태그 제거',
  update_score: '점수 변경',
  move_sequence: '시퀀스 이동',
};

export default function ActionNode({ data }: NodeProps) {
  const config = (data as Record<string, unknown>)?.config as ActionNodeConfig | undefined;
  const actionType = config?.action_type || 'add_tag';

  return (
    <div className="bg-teal-50 border-2 border-teal-400 rounded-xl px-4 py-3 shadow-sm min-w-[160px]">
      <Handle type="target" position={Position.Top} className="!bg-teal-500 !w-3 !h-3" />
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-teal-700">액션</p>
          <p className="text-xs text-teal-600">{actionLabels[actionType]}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-teal-500 !w-3 !h-3" />
    </div>
  );
}
