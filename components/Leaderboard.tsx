'use client';

interface LeaderboardData {
  leaderboard: Array<{
    theatre: string;
    firstBingo: string | null;
    bingoCount: number;
    markedCount: number;
  }>;
  firstBingoOverall: string | null;
  mostBingos: string[] | null;
  leastBingos: string[] | null;
}

interface LeaderboardProps {
  data: LeaderboardData | null;
}

export default function Leaderboard({ data }: LeaderboardProps) {
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Leaderboard</h2>
      
      <div className="space-y-4 mb-6">
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3">
          <div className="text-sm font-semibold text-yellow-800">🏆 First Bingo</div>
          <div className="text-lg font-bold text-yellow-900">
            {data.firstBingoOverall || 'None yet'}
          </div>
        </div>
        
        {data.mostBingos && (
          <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-3">
            <div className="text-sm font-semibold text-blue-800">🥇 Highest Score</div>
            <div className="text-lg font-bold text-blue-900">
              {data.mostBingos.join(', ')}
            </div>
          </div>
        )}
        
        {data.leastBingos && (
          <div className="bg-purple-50 border-2 border-purple-400 rounded-lg p-3">
            <div className="text-sm font-semibold text-purple-800">📊 Least Issues</div>
            <div className="text-lg font-bold text-purple-900">
              {data.leastBingos.join(', ')}
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">All Theatres</h3>
        <div className="space-y-2">
          {data.leaderboard.map((entry, index) => {
            const getRankEmoji = (rank: number) => {
              if (rank === 0) return '🥇';
              if (rank === 1) return '🥈';
              if (rank === 2) return '🥉';
              return `${rank + 1}.`;
            };
            
            return (
              <div key={entry.theatre} className="flex justify-between items-center text-sm">
                <span className="font-medium">
                  {getRankEmoji(index)} {entry.theatre}
                </span>
                <span className="text-gray-600">
                  {entry.bingoCount} bingo{entry.bingoCount !== 1 ? 's' : ''} • {entry.markedCount} marked
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

