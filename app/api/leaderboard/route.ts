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

    // Sort by Mario Party-style ranking: bingos (stars) first, then marks (coins) as tiebreaker
    const rankedLeaderboard = [...leaderboard].sort((a, b) => {
      // Primary: bingo count (descending)
      if (b.bingoCount !== a.bingoCount) {
        return b.bingoCount - a.bingoCount;
      }
      // Tiebreaker: marked count (descending)
      return b.markedCount - a.markedCount;
    });

    // Highest Score = all theatres tied for first place (same bingo count and marked count)
    // Only calculate if there's at least one bingo somewhere (makes sense to rank)
    const hasAnyBingos = rankedLeaderboard.some(entry => entry.bingoCount > 0);
    let highestScore: string[] | null = null;
    if (hasAnyBingos) {
      const topScore = rankedLeaderboard[0];
      highestScore = rankedLeaderboard.filter(
        entry => entry.bingoCount === topScore.bingoCount && entry.markedCount === topScore.markedCount
      ).map(entry => entry.theatre);
    }

    // Least Issues = all theatres tied for last place (least bingos, or least marks if tied on bingos)
    // Only calculate if there's at least one bingo somewhere (makes sense to rank)
    let leastIssues: string[] | null = null;
    if (hasAnyBingos) {
      const bottomScore = rankedLeaderboard[rankedLeaderboard.length - 1];
      leastIssues = rankedLeaderboard.filter(
        entry => entry.bingoCount === bottomScore.bingoCount && entry.markedCount === bottomScore.markedCount
      ).map(entry => entry.theatre);
    }

    return NextResponse.json({
      leaderboard: rankedLeaderboard,
      firstBingoOverall: firstBingoOverall?.theatre || null,
      mostBingos: highestScore,
      leastBingos: leastIssues,
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

