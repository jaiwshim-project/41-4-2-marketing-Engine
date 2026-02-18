'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DelayNodeConfig } from '@/lib/stepmail/types';

const unitLabels: Record<string, string> = { hours: '시간', days: '일', weeks: '주' };

export default function DelayNode({ data }: NodeProps) {
  const config = (data as Record<string, unknown>)?.config as DelayNodeConfig | undefined;
  const amount = config?.amount || 1;
  const unit = config?.unit || 'days';

  return (
    <div className="bg-amber-50 border-2 border-amber-400 rounded-xl px-4 py-3 shadow-sm min-w-[160px]">
      <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-3 !h-3" />
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-amber-700">대기</p>
          <p className="text-xs text-amber-600">{amount}{unitLabels[unit]} 후</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-amber-500 !w-3 !h-3" />
    </div>
  );
}
