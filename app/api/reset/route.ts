import { NextResponse } from 'next/server';
import { THEATRES } from '@/lib/config';
import { kv } from '@/lib/kv';

export async function POST() {
  try {
    // Delete all data for all theatres
    for (const theatre of THEATRES) {
      await Promise.all([
        kv.del(`card:${theatre}`),
        kv.del(`comments:${theatre}`),
        kv.del(`middleSquare:${theatre}`),
        kv.del(`confirmedBingos:${theatre}`),
        kv.del(`lock:${theatre}`),
        kv.del(`firstBingo:${theatre}`),
        kv.del(`bingoCount:${theatre}`),
        kv.del(`markedCount:${theatre}`),
      ]);
    }

    return NextResponse.json({ success: true, message: 'All data reset' });
  } catch (error) {
    console.error('Error resetting data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

