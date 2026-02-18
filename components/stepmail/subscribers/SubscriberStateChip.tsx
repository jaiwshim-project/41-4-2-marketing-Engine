'use client';

import { STATE_LABELS, type SubscriberState } from '@/lib/stepmail/types';

export default function SubscriberStateChip({ state }: { state: SubscriberState }) {
  const config = STATE_LABELS[state];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
