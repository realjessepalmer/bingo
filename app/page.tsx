'use client';

import { useState, useEffect, useCallback } from 'react';
import ViewAllGrid from '@/components/ViewAllGrid';
import BingoCard from '@/components/BingoCard';
import Leaderboard from '@/components/Leaderboard';
import LockCountdown from '@/components/LockCountdown';
import BingoConfirmDialog from '@/components/BingoConfirmDialog';
import CommentDialog from '@/components/CommentDialog';
import { THEATRES, BINGO_ITEMS, CENTER_SQUARE_INDEX, LOCK_TIMEOUT_MS } from '@/lib/config';
import { BingoLine } from '@/lib/bingo';

type ViewMode = 'view-all' | 'editing';

interface CardData {
  markedItems: number[];
  comments: Record<string, string>;
  middleSquareText: string;
  confirmedBingos: Array<{ type: 'row' | 'col' | 'diag'; index: number; items: number[] }>;
  isLocked: boolean;
  lockRemainingMs?: number;
  lockSessionId?: string;
}

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

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('view-all');
  const [selectedTheatre, setSelectedTheatre] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cardsData, setCardsData] = useState<Record<string, CardData>>({});
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [lockRemainingMs, setLockRemainingMs] = useState<number>(0);
  const [pendingBingo, setPendingBingo] = useState<BingoLine | null>(null);
  const [commentDialog, setCommentDialog] = useState<{
    isOpen: boolean;
    cellIndex: number;
    comment: string;
  }>({ isOpen: false, cellIndex: -1, comment: '' });
  const [middleSquareDialog, setMiddleSquareDialog] = useState<{
    isOpen: boolean;
    text: string;
  }>({ isOpen: false, text: 'FREE' });

  // Initialize session ID
  useEffect(() => {
    let stored = localStorage.getItem('bingoSessionId');
    if (!stored) {
      stored = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('bingoSessionId', stored);
    }
    setSessionId(stored);
  }, []);

  // Fetch all card data
  const fetchCardData = useCallback(async (theatreId: string) => {
    try {
      const [cardRes, commentsRes, middleSquareRes, bingosRes, lockRes] = await Promise.all([
        fetch(`/api/card?theatreId=${encodeURIComponent(theatreId)}`),
        fetch(`/api/comments?theatreId=${encodeURIComponent(theatreId)}`),
        fetch(`/api/middle-square?theatreId=${encodeURIComponent(theatreId)}`),
        fetch(`/api/bingo?theatreId=${encodeURIComponent(theatreId)}`),
        fetch(`/api/lock?theatreId=${encodeURIComponent(theatreId)}`),
      ]);

      const cardData = await cardRes.json();
      const commentsData = await commentsRes.json();
      const middleSquareData = await middleSquareRes.json();
      const bingosData = await bingosRes.json();
      const lockData = await lockRes.json();

      // Check if lock belongs to current session
      const isLockedByMe = lockData.locked && lockData.sessionId === sessionId;
      const isLockedByOther = lockData.locked && lockData.sessionId !== sessionId;

      return {
        markedItems: cardData.markedItems || [],
        comments: commentsData.comments || {},
        middleSquareText: middleSquareData.text || 'FREE',
        confirmedBingos: bingosData.confirmedBingos || [],
        isLocked: isLockedByOther, // Only locked if locked by someone else
        isLockedByMe: isLockedByMe, // Track if locked by current user
        lockRemainingMs: lockData.remainingMs || 0,
        lockSessionId: lockData.sessionId,
      };
    } catch (error) {
      console.error('Error fetching card data:', error);
      return null;
    }
  }, [sessionId]);

  // Fetch all cards data for view-all mode
  const fetchAllCardsData = useCallback(async () => {
    const data: Record<string, CardData> = {};
    for (const theatre of THEATRES) {
      const cardData = await fetchCardData(theatre);
      if (cardData) {
        data[theatre] = cardData;
      }
    }
    setCardsData(data);
  }, [fetchCardData]);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  }, []);

  // Acquire lock for a theatre
  const acquireLock = useCallback(async (theatreId: string): Promise<boolean> => {
    if (!sessionId) return false;
    
    try {
      const res = await fetch('/api/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theatreId, sessionId }),
      });

      if (res.status === 409) {
        // Locked by another session
        return false;
      }

      const data = await res.json();
      if (data.success) {
        setLockRemainingMs(LOCK_TIMEOUT_MS);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error acquiring lock:', error);
      return false;
    }
  }, [sessionId]);

  // Release lock
  const releaseLock = useCallback(async (theatreId: string) => {
    if (!sessionId) return;
    
    try {
      await fetch(`/api/lock?theatreId=${encodeURIComponent(theatreId)}&sessionId=${encodeURIComponent(sessionId)}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error releasing lock:', error);
    }
  }, [sessionId]);

  // Handle card click in view-all mode
  const handleCardClick = useCallback(async (theatreId: string) => {
    const cardData = cardsData[theatreId];
    if (cardData?.isLocked) {
      alert('This card is currently being edited by another user. Please wait.');
      return;
    }

    const acquired = await acquireLock(theatreId);
    if (acquired) {
      setSelectedTheatre(theatreId);
      setViewMode('editing');
      // Refresh card data
      const data = await fetchCardData(theatreId);
      if (data) {
        setCardsData((prev) => ({ ...prev, [theatreId]: data }));
      }
    } else {
      alert('Could not acquire lock. The card may be locked by another user.');
    }
  }, [cardsData, acquireLock, fetchCardData]);

  // Handle marking an item
  const handleMarkItem = useCallback(async (itemIndex: number) => {
    if (!selectedTheatre) return;
    if (itemIndex === CENTER_SQUARE_INDEX) return; // Center square is always marked, can't toggle

    const currentData = cardsData[selectedTheatre];
    if (!currentData) return;

    const markedItems = currentData.markedItems.includes(itemIndex)
      ? currentData.markedItems.filter((i) => i !== itemIndex)
      : [...currentData.markedItems, itemIndex];

    try {
      await fetch('/api/card', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theatreId: selectedTheatre, markedItems }),
      });

      // Refresh lock timestamp on user interaction
      const lockAcquired = await acquireLock(selectedTheatre);
      if (lockAcquired) {
        // Reset timer to full 3 minutes when user interacts
        setLockRemainingMs(LOCK_TIMEOUT_MS);
      }

      // Refresh card data
      const data = await fetchCardData(selectedTheatre);
      if (data) {
        setCardsData((prev) => ({ ...prev, [selectedTheatre]: data }));
      }
    } catch (error) {
      console.error('Error marking item:', error);
    }
  }, [selectedTheatre, cardsData, acquireLock, fetchCardData]);

  // Handle bingo detection
  const handleBingoDetected = useCallback((bingoLine: BingoLine) => {
    setPendingBingo(bingoLine);
  }, []);

  // Handle bingo confirmation
  const handleConfirmBingo = useCallback(async () => {
    if (!selectedTheatre || !pendingBingo) return;

    try {
      const res = await fetch('/api/bingo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theatreId: selectedTheatre,
          bingoLine: pendingBingo,
        }),
      });

      if (res.ok) {
        setPendingBingo(null);
        // Refresh card data and leaderboard
        const data = await fetchCardData(selectedTheatre);
        if (data) {
          setCardsData((prev) => ({ ...prev, [selectedTheatre]: data }));
        }
        fetchLeaderboard();
      }
    } catch (error) {
      console.error('Error confirming bingo:', error);
    }
  }, [selectedTheatre, pendingBingo, fetchCardData, fetchLeaderboard]);

  // Handle bingo cancel
  const handleCancelBingo = useCallback(async () => {
    if (!selectedTheatre || !pendingBingo) return;

    // Unmark the last item that triggered the bingo
    const currentData = cardsData[selectedTheatre];
    if (currentData && pendingBingo.items.length > 0) {
      const lastItem = pendingBingo.items[pendingBingo.items.length - 1];
      await handleMarkItem(lastItem);
    }

    setPendingBingo(null);
  }, [selectedTheatre, pendingBingo, cardsData, handleMarkItem]);

  // Handle comment edit
  const handleEditComment = useCallback((cellIndex: number) => {
    const currentData = cardsData[selectedTheatre || ''];
    const comment = currentData?.comments[cellIndex.toString()] || '';
    setCommentDialog({ isOpen: true, cellIndex, comment });
  }, [selectedTheatre, cardsData]);

  // Handle comment save
  const handleSaveComment = useCallback(async (comment: string) => {
    if (!selectedTheatre) return;

    try {
      await fetch('/api/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theatreId: selectedTheatre,
          cellIndex: commentDialog.cellIndex,
          comment,
        }),
      });

      // Refresh card data
      const data = await fetchCardData(selectedTheatre);
      if (data) {
        setCardsData((prev) => ({ ...prev, [selectedTheatre]: data }));
      }
    } catch (error) {
      console.error('Error saving comment:', error);
    }
  }, [selectedTheatre, commentDialog.cellIndex, fetchCardData]);

  // Handle comment delete
  const handleDeleteComment = useCallback(async () => {
    if (!selectedTheatre) return;

    try {
      await fetch(`/api/comments?theatreId=${encodeURIComponent(selectedTheatre)}&cellIndex=${commentDialog.cellIndex}`, {
        method: 'DELETE',
      });

      // Refresh card data
      const data = await fetchCardData(selectedTheatre);
      if (data) {
        setCardsData((prev) => ({ ...prev, [selectedTheatre]: data }));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }, [selectedTheatre, commentDialog.cellIndex, fetchCardData]);

  // Handle middle square edit
  const handleEditMiddleSquare = useCallback(() => {
    const currentData = cardsData[selectedTheatre || ''];
    const text = currentData?.middleSquareText || 'FREE';
    setMiddleSquareDialog({ isOpen: true, text });
  }, [selectedTheatre, cardsData]);

  // Handle middle square save
  const handleSaveMiddleSquare = useCallback(async (text: string) => {
    if (!selectedTheatre) return;

    try {
      await fetch('/api/middle-square', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theatreId: selectedTheatre,
          text,
        }),
      });

      // Refresh card data
      const data = await fetchCardData(selectedTheatre);
      if (data) {
        setCardsData((prev) => ({ ...prev, [selectedTheatre]: data }));
      }
    } catch (error) {
      console.error('Error saving middle square:', error);
    }
  }, [selectedTheatre, fetchCardData]);

  // Handle lock expiration
  const handleLockExpire = useCallback(() => {
    if (selectedTheatre) {
      releaseLock(selectedTheatre);
      setViewMode('view-all');
      setSelectedTheatre(null);
      setLockRemainingMs(0);
    }
  }, [selectedTheatre, releaseLock]);

  // Handle back to view-all
  const handleBackToViewAll = useCallback(async () => {
    if (selectedTheatre) {
      await releaseLock(selectedTheatre);
    }
    setViewMode('view-all');
    setSelectedTheatre(null);
    setLockRemainingMs(0);
  }, [selectedTheatre, releaseLock]);

  // Initial load and polling
  useEffect(() => {
    fetchAllCardsData();
    fetchLeaderboard();

    const interval = setInterval(() => {
      if (viewMode === 'view-all') {
        fetchAllCardsData();
      } else if (selectedTheatre && sessionId) {
        fetchCardData(selectedTheatre).then((data) => {
          if (data) {
            setCardsData((prev) => ({ ...prev, [selectedTheatre]: data }));
            // Check if we still have the lock (lockSessionId matches our session)
            const hasLock = data.lockSessionId === sessionId && data.lockRemainingMs !== undefined && data.lockRemainingMs > 0;
            if (hasLock) {
              // Only update timer if server time is less than our current time (countdown)
              // This prevents the timer from jumping backwards/resetting
              if (data.lockRemainingMs < lockRemainingMs || lockRemainingMs === 0) {
                setLockRemainingMs(data.lockRemainingMs);
              }
            } else if (data.lockSessionId && data.lockSessionId !== sessionId) {
              // Locked by someone else, return to view-all
              handleLockExpire();
            } else if (!data.lockSessionId || (data.lockRemainingMs !== undefined && data.lockRemainingMs <= 0)) {
              // Lock expired or released, return to view-all
              handleLockExpire();
            }
          }
        });
      }
      fetchLeaderboard();
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [viewMode, selectedTheatre, sessionId, fetchAllCardsData, fetchCardData, fetchLeaderboard, handleLockExpire]);

  // Note: Lock is refreshed on user interactions (marking items, etc.), not automatically
  // This prevents the timer from resetting unnecessarily

  const currentCardData = selectedTheatre ? cardsData[selectedTheatre] : null;

  // Handle reset (for testing)
  const handleReset = useCallback(async () => {
    if (!confirm('Are you sure you want to reset ALL data? This cannot be undone!')) {
      return;
    }

    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        alert('All data has been reset!');
        // Refresh the page to reload all data
        window.location.reload();
      } else {
        alert('Error resetting data');
      }
    } catch (error) {
      console.error('Error resetting:', error);
      alert('Error resetting data');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Development Notice Banner */}
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 border-b-2 border-yellow-500 shadow-md">
        <div className="container mx-auto px-4 py-2 sm:py-3">
          <p className="text-center text-xs sm:text-sm font-semibold text-yellow-900">
            🚧 This app is still actively being developed and bugs are getting fixed 🚧
          </p>
        </div>
      </div>

      <header 
        className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 shadow-lg sticky top-0 z-40 cursor-pointer hover:from-blue-700 hover:via-blue-800 hover:to-blue-700 transition-all duration-200"
        onClick={handleBackToViewAll}
      >
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white text-center drop-shadow-md">
            🎬 Booth Bingo
          </h1>
          <p className="text-blue-100 text-center mt-1 sm:mt-2 text-xs sm:text-base">
            PSIFF 2026 Edition
          </p>
        </div>
      </header>

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl">
        {viewMode === 'view-all' ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg 
                  hover:from-red-700 hover:to-red-800 active:scale-95 
                  transition-all duration-200 font-bold text-base sm:text-lg 
                  shadow-lg hover:shadow-xl"
              >
                🔴 RESET ALL DATA (Testing Only)
              </button>
            </div>
            <ViewAllGrid cardsData={cardsData} onCardClick={handleCardClick} currentSessionId={sessionId} />
            <Leaderboard data={leaderboardData} />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mobile: View All button on left, lock on right */}
            {/* Desktop: All items in a row */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <button
                onClick={handleBackToViewAll}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white 
                  rounded-lg hover:from-gray-600 hover:to-gray-700 active:scale-95 
                  transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                ← View All
              </button>
              {selectedTheatre && (
                <div className="hidden sm:block">
                  <h2 className="text-xl sm:text-2xl font-bold">{selectedTheatre}{selectedTheatre === 'Festival' ? ' 🌭' : ''}</h2>
                </div>
              )}
              {lockRemainingMs > 0 && (
                <LockCountdown remainingMs={lockRemainingMs} onExpire={handleLockExpire} />
              )}
            </div>
            {/* Mobile: Theatre name centered above bingo card */}
            {selectedTheatre && (
              <div className="text-center sm:hidden">
                <h2 className="text-xl font-bold">{selectedTheatre}{selectedTheatre === 'Festival' ? ' 🌭' : ''}</h2>
              </div>
            )}

            {currentCardData && selectedTheatre && (
              <BingoCard
                theatreId={selectedTheatre}
                markedItems={currentCardData.markedItems}
                comments={currentCardData.comments}
                middleSquareText={currentCardData.middleSquareText}
                confirmedBingos={currentCardData.confirmedBingos}
                isLocked={currentCardData.isLocked}
                isEditable={true} // Always editable in editing mode (we have the lock)
                onMarkItem={handleMarkItem}
                onEditComment={handleEditComment}
                onEditMiddleSquare={handleEditMiddleSquare}
                onBingoDetected={handleBingoDetected}
              />
            )}
          </div>
        )}
      </main>

      <BingoConfirmDialog
        isOpen={pendingBingo !== null}
        bingoLine={pendingBingo}
        onConfirm={handleConfirmBingo}
        onCancel={handleCancelBingo}
      />

      <CommentDialog
        isOpen={commentDialog.isOpen}
        cellIndex={commentDialog.cellIndex}
        cellItem={BINGO_ITEMS[commentDialog.cellIndex] || ''}
        existingComment={commentDialog.comment}
        onClose={() => setCommentDialog({ isOpen: false, cellIndex: -1, comment: '' })}
        onSave={handleSaveComment}
        onDelete={handleDeleteComment}
      />

      {middleSquareDialog.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-sm w-full p-4 sm:p-6 border border-gray-200 animate-scale-in">
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">Edit Middle Square</h3>
            <input
              type="text"
              value={middleSquareDialog.text}
              onChange={(e) => setMiddleSquareDialog({ ...middleSquareDialog, text: e.target.value })}
              maxLength={50}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2 transition-all duration-200"
              placeholder="FREE"
              autoFocus
            />
            <div className="text-xs text-gray-500 mb-4 text-right">
              {middleSquareDialog.text.length}/50
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setMiddleSquareDialog({ isOpen: false, text: 'FREE' })}
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg 
                  hover:bg-gray-300 active:scale-95 transition-all duration-200 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSaveMiddleSquare(middleSquareDialog.text);
                  setMiddleSquareDialog({ isOpen: false, text: 'FREE' });
                }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                  rounded-lg hover:from-blue-600 hover:to-blue-700 active:scale-95 
                  transition-all duration-200 font-semibold shadow-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-gray-200 py-4 sm:py-6 mt-8 sm:mt-12">
        <div className="container mx-auto px-4 text-center text-xs sm:text-sm text-gray-600 space-y-2">
          <div>
            Vibe coded by{' '}
            <a
              href="https://loveandscience.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
            >
              Jesse Palmer
            </a>
          </div>
          <div>
            Hey! We're looking for designers: UI/UX, branding, etc.
          </div>
        </div>
      </footer>
    </div>
  );
}
