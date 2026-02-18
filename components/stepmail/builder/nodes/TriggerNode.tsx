'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';

export default function TriggerNode({ data }: NodeProps) {
  return (
    <div className="bg-green-50 border-2 border-green-400 rounded-xl px-4 py-3 shadow-sm min-w-[160px]">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-green-700">트리거</p>
          <p className="text-xs text-green-600">{(data as Record<string, unknown>)?.label as string || '시작'}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-green-500 !w-3 !h-3" />
    </div>
  );
}
