import { NextResponse } from 'next/server';
import { THEATRES } from '@/lib/config';
import { getFirstBingo, getBingoCount, getMarkedCount } from '@/lib/kv';

export async function GET() {
  try {
    const leaderboard = await Promise.all(
      THEATRES.map(async (theatre) => {
        const firstBingo = await getFirstBingo(theatre);
        const bingoCount = await getBingoCount(theatre);
        const markedCount = await getMarkedCount(theatre);

        return {
          theatre,
          firstBingo,
          bingoCount,
          markedCount,
        };
      })
    );

    // Find first bingo overall
    const firstBingoOverall = leaderboard
      .filter((l) => l.firstBingo)
      .sort((a, b) => (a.firstBingo || '').localeCompare(b.firstBingo || ''))[0];

    // Find most bingos
    const mostBingos = leaderboard.reduce((max, current) => 
      current.bingoCount > max.bingoCount ? current : max,
      leaderboard[0]
    );

    // Find least bingos (or most items marked without bingo)
    const leastBingos = leaderboard.reduce((min, current) => {
      if (current.bingoCount < min.bingoCount) return current;
      if (current.bingoCount === min.bingoCount && current.markedCount > min.markedCount) return current;
      return min;
    }, leaderboard[0]);

    return NextResponse.json({
      leaderboard,
      firstBingoOverall: firstBingoOverall?.theatre || null,
      mostBingos: mostBingos.theatre,
      leastBingos: leastBingos.theatre,
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

