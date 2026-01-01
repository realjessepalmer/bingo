'use client';

import { useState, useEffect } from 'react';
import BingoCard from './BingoCard';
import LockCountdownSmall from './LockCountdownSmall';
import { THEATRES, BINGO_ITEMS, CENTER_SQUARE_INDEX } from '@/lib/config';

interface CardData {
  markedItems: number[];
  comments: Record<string, string>;
  middleSquareText: string;
  confirmedBingos: Array<{ type: 'row' | 'col' | 'diag'; index: number; items: number[] }>;
  isLocked: boolean;
  lockRemainingMs?: number;
  lockSessionId?: string;
}

interface ViewAllGridProps {
  cardsData: Record<string, CardData>;
  onCardClick: (theatreId: string) => void;
  currentSessionId?: string | null;
}

export default function ViewAllGrid({ cardsData, onCardClick, currentSessionId }: ViewAllGridProps) {
  return (
    <>
      {/* Mobile: Enhanced vertical stack with numbers */}
      <div className="sm:hidden space-y-6 px-4">
        <p className="text-sm text-gray-600 text-center mb-2 font-medium">
          Tap theatre to read and edit card
        </p>
        {THEATRES.map((theatre) => {
            const data = cardsData[theatre] || {
              markedItems: [],
              comments: {},
              middleSquareText: 'FREE',
              confirmedBingos: [],
              isLocked: false,
            };
            const isLockedByOther = data.isLocked && data.lockSessionId !== currentSessionId;
            return (
              <div
                key={theatre}
                className={`
                  relative transition-all duration-300 ease-in-out
                  bg-white rounded-xl shadow-md border-2
                  ${isLockedByOther 
                    ? 'opacity-50 cursor-not-allowed grayscale border-gray-300' 
                    : 'cursor-pointer hover:shadow-xl border-transparent hover:border-blue-300 active:scale-[0.98]'}
                `}
                onClick={() => {
                  if (!isLockedByOther) {
                    onCardClick(theatre);
                  }
                }}
              >
                <div className="mb-3 text-center pt-4 px-4">
                  <h3 className="font-bold text-lg text-gray-800">
                    {theatre}{theatre === 'Festival' ? ' 🌭' : ''}
                  </h3>
                  {isLockedByOther && (
                    <span className="text-xs text-red-600 font-medium mt-1 block">
                      🔒 Locked (being edited)
                    </span>
                  )}
                </div>
                <div className="px-4 pb-4">
                  <BingoCard
                    theatreId={theatre}
                    markedItems={data.markedItems}
                    comments={data.comments}
                    middleSquareText={data.middleSquareText}
                    confirmedBingos={data.confirmedBingos}
                    isLocked={isLockedByOther}
                    isEditable={false}
                    compact={true}
                    numbersOnly={true}
                  />
                </div>
                {isLockedByOther && data.lockRemainingMs !== undefined && data.lockRemainingMs > 0 && (
                  <LockCountdownSmall remainingMs={data.lockRemainingMs} />
                )}
              </div>
            );
          })}
      </div>
      {/* Desktop: Enhanced grid layout with text */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {THEATRES.map((theatre) => {
          const data = cardsData[theatre] || {
            markedItems: [],
            comments: {},
            middleSquareText: 'FREE',
            confirmedBingos: [],
            isLocked: false,
          };

          // Card is locked if locked by someone else (not current session)
          const isLockedByOther = data.isLocked && data.lockSessionId !== currentSessionId;

          return (
            <div
              key={theatre}
              className={`
                relative transition-all duration-300 ease-in-out
                bg-white rounded-xl shadow-md border-2
                ${isLockedByOther 
                  ? 'opacity-50 cursor-not-allowed grayscale border-gray-300' 
                  : 'cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 border-transparent hover:border-blue-300'}
              `}
              onClick={() => {
                if (!isLockedByOther) {
                  onCardClick(theatre);
                }
              }}
            >
              <div className="mb-3 text-center pt-4 px-4">
                <h3 className="font-bold text-lg text-gray-800">
                  {theatre}{theatre === 'Festival' ? ' 🌭' : ''}
                </h3>
                {isLockedByOther && (
                  <span className="text-xs text-red-600 font-medium mt-1 block">
                    🔒 Locked (being edited)
                  </span>
                )}
              </div>
              <div className="px-4 pb-4">
                <BingoCard
                  theatreId={theatre}
                  markedItems={data.markedItems}
                  comments={data.comments}
                  middleSquareText={data.middleSquareText}
                  confirmedBingos={data.confirmedBingos}
                  isLocked={isLockedByOther}
                  isEditable={false}
                  compact={true}
                />
              </div>
              {isLockedByOther && data.lockRemainingMs !== undefined && data.lockRemainingMs > 0 && (
                <LockCountdownSmall remainingMs={data.lockRemainingMs} />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

