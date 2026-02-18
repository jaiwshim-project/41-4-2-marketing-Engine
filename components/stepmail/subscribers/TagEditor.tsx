'use client';

import { useState } from 'react';

interface TagEditorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  readonly?: boolean;
}

export default function TagEditor({ tags, onChange, readonly = false }: TagEditorProps) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const tag = input.trim();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {tags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium"
        >
          {tag}
          {!readonly && (
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-indigo-400 hover:text-indigo-600"
            >
              &times;
            </button>
          )}
        </span>
      ))}
      {!readonly && (
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); addTag(); }
          }}
          onBlur={addTag}
          placeholder="태그 추가..."
          className="border-0 bg-transparent text-xs focus:outline-none w-20"
        />
      )}
    </div>
  );
}
