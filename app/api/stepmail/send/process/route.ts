import { NextRequest, NextResponse } from 'next/server';
import { processQueue } from '@/lib/stepmail/queue-processor';

export const maxDuration = 60;

// GET /api/stepmail/send/process - Vercel Cron 엔드포인트
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processQueue();
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[StepMail Cron] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Queue processing failed' },
      { status: 500 }
    );
  }
}
