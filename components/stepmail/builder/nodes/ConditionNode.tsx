'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ConditionNodeConfig } from '@/lib/stepmail/types';

const conditionLabels: Record<string, string> = {
  opened: '메일 열람',
  clicked: '링크 클릭',
  score_gte: '점수 이상',
  tag_contains: '태그 포함',
};

export default function ConditionNode({ data }: NodeProps) {
  const config = (data as Record<string, unknown>)?.config as ConditionNodeConfig | undefined;
  const condType = config?.condition_type || 'opened';

  return (
    <div className="bg-purple-50 border-2 border-purple-400 rounded-xl px-4 py-3 shadow-sm min-w-[160px]">
      <Handle type="target" position={Position.Top} className="!bg-purple-500 !w-3 !h-3" />
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center rotate-45">
          <svg className="w-3.5 h-3.5 text-white -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-purple-700">조건</p>
          <p className="text-xs text-purple-600">{conditionLabels[condType]}</p>
        </div>
      </div>
      <div className="flex justify-between mt-2 text-[10px]">
        <span className="text-green-600 font-medium">Yes</span>
        <span className="text-red-500 font-medium">No</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        className="!bg-green-500 !w-3 !h-3"
        style={{ left: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        className="!bg-red-500 !w-3 !h-3"
        style={{ left: '70%' }}
      />
    </div>
  );
}
