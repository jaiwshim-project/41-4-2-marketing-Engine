'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';

export default function EmailNode({ data }: NodeProps) {
  const label = (data as Record<string, unknown>)?.label as string || '이메일 발송';

  return (
    <div className="bg-indigo-50 border-2 border-indigo-400 rounded-xl px-4 py-3 shadow-sm min-w-[180px]">
      <Handle type="target" position={Position.Top} className="!bg-indigo-500 !w-3 !h-3" />
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-indigo-700">이메일 발송</p>
          <p className="text-xs text-indigo-600 truncate max-w-[120px]">{label}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-3 !h-3" />
    </div>
  );
}
