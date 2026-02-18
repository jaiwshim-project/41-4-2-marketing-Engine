'use client';

import type { NodeType } from '@/lib/stepmail/types';

interface BuilderToolbarProps {
  onAddNode: (type: NodeType) => void;
  onSave: () => void;
  isSaving: boolean;
}

const nodeButtons: { type: NodeType; label: string; color: string }[] = [
  { type: 'delay', label: '대기', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
  { type: 'email', label: '이메일', color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' },
  { type: 'condition', label: '조건', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  { type: 'action', label: '액션', color: 'bg-teal-100 text-teal-700 hover:bg-teal-200' },
];

export default function BuilderToolbar({ onAddNode, onSave, isSaving }: BuilderToolbarProps) {
  return (
    <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white rounded-lg shadow-lg border px-3 py-2">
      <span className="text-xs font-medium text-gray-500 mr-1">노드 추가:</span>
      {nodeButtons.map(btn => (
        <button
          key={btn.type}
          onClick={() => onAddNode(btn.type)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${btn.color}`}
        >
          + {btn.label}
        </button>
      ))}
      <div className="w-px h-6 bg-gray-200 mx-1" />
      <button
        onClick={onSave}
        disabled={isSaving}
        className="px-4 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {isSaving ? '저장 중...' : '저장'}
      </button>
    </div>
  );
}
