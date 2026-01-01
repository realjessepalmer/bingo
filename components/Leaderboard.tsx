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
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🏆 Leaderboard
        </h2>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        🏆 Leaderboard
      </h2>
      
      <div className="space-y-3 sm:space-y-4 mb-6">
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 border-2 border-yellow-500 rounded-xl p-3 sm:p-4 shadow-md">
          <div className="text-xs sm:text-sm font-semibold text-yellow-900">🏆 First Bingo</div>
          <div className="text-base sm:text-lg font-bold text-yellow-950 mt-1">
            {data.firstBingoOverall || 'None yet'}
          </div>
        </div>
        
        {data.mostBingos && (
          <div className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 border-2 border-blue-500 rounded-xl p-3 sm:p-4 shadow-md">
            <div className="text-xs sm:text-sm font-semibold text-blue-900">🥇 Highest Score</div>
            <div className="text-base sm:text-lg font-bold text-blue-950 mt-1">
              {data.mostBingos.join(', ')}
            </div>
          </div>
        )}
        
        {data.leastBingos && (
          <div className="bg-gradient-to-r from-purple-400 via-purple-300 to-purple-400 border-2 border-purple-500 rounded-xl p-3 sm:p-4 shadow-md">
            <div className="text-xs sm:text-sm font-semibold text-purple-900">📊 Least Issues</div>
            <div className="text-base sm:text-lg font-bold text-purple-950 mt-1">
              {data.leastBingos.join(', ')}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">All Theatres</h3>
        <div className="space-y-2">
          {data.leaderboard.map((entry, index) => {
            const getRankEmoji = (rank: number) => {
              if (rank === 0) return '🥇';
              if (rank === 1) return '🥈';
              if (rank === 2) return '🥉';
              return `${rank + 1}.`;
            };
            
            return (
              <div key={entry.theatre} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg p-2 sm:p-3 hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-800">
                  {getRankEmoji(index)} {entry.theatre}
                </span>
                <span className="text-gray-600 font-medium">
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
