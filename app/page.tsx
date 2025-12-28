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
  mostBingos: string;
  leastBingos: string;
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

      // Refresh lock timestamp
      await acquireLock(selectedTheatre);

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
              setLockRemainingMs(data.lockRemainingMs);
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

  // Refresh lock on interaction
  useEffect(() => {
    if (viewMode === 'editing' && selectedTheatre && sessionId) {
      const refreshInterval = setInterval(async () => {
        await acquireLock(selectedTheatre);
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(refreshInterval);
    }
  }, [viewMode, selectedTheatre, sessionId, acquireLock]);

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
      <header className="bg-white shadow-md p-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">Film Festival Bingo</h1>
      </header>

      <main className="container mx-auto p-4">
        {viewMode === 'view-all' ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors font-bold text-lg shadow-lg"
              >
                🔴 RESET ALL DATA (Testing Only)
              </button>
            </div>
            <ViewAllGrid cardsData={cardsData} onCardClick={handleCardClick} currentSessionId={sessionId} />
            <Leaderboard data={leaderboardData} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <button
                onClick={handleBackToViewAll}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                ← View All
              </button>
              {selectedTheatre && (
                <div>
                  <h2 className="text-xl font-bold">{selectedTheatre}</h2>
                </div>
              )}
              {lockRemainingMs > 0 && (
                <LockCountdown remainingMs={lockRemainingMs} onExpire={handleLockExpire} />
              )}
            </div>

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold mb-4">Edit Middle Square</h3>
            <input
              type="text"
              value={middleSquareDialog.text}
              onChange={(e) => setMiddleSquareDialog({ ...middleSquareDialog, text: e.target.value })}
              maxLength={50}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              placeholder="FREE"
              autoFocus
            />
            <div className="text-xs text-gray-500 mb-4 text-right">
              {middleSquareDialog.text.length}/50
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMiddleSquareDialog({ isOpen: false, text: 'FREE' })}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSaveMiddleSquare(middleSquareDialog.text);
                  setMiddleSquareDialog({ isOpen: false, text: 'FREE' });
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
