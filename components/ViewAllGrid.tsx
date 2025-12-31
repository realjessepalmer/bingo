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
      {/* Mobile: Horizontal scrolling */}
      <div className="overflow-x-auto -mx-2 sm:hidden">
        <div className="flex gap-4 p-4 min-w-max">
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
                  relative transition-all flex-shrink-0 w-[calc(100vw-2rem)]
                  ${isLockedByOther ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                `}
                onClick={() => {
                  if (!isLockedByOther) {
                    onCardClick(theatre);
                  }
                }}
              >
                <div className="mb-2 text-center">
                  <h3 className="font-bold text-lg">{theatre}</h3>
                  {isLockedByOther && (
                    <span className="text-xs text-red-600">🔒 Locked (being edited)</span>
                  )}
                </div>
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
                {isLockedByOther && data.lockRemainingMs !== undefined && data.lockRemainingMs > 0 && (
                  <LockCountdownSmall remainingMs={data.lockRemainingMs} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Desktop: Grid layout */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4 p-4">
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
                relative transition-all
                ${isLockedByOther ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
              `}
              onClick={() => {
                if (!isLockedByOther) {
                  onCardClick(theatre);
                }
              }}
            >
              <div className="mb-2 text-center">
                <h3 className="font-bold text-lg">{theatre}</h3>
                {isLockedByOther && (
                  <span className="text-xs text-red-600">🔒 Locked (being edited)</span>
                )}
              </div>
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

