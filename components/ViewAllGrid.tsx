'use client';

import { useState, useEffect } from 'react';
import BingoCard from './BingoCard';
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
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
            />
            {isLockedByOther && data.lockRemainingMs !== undefined && (
              <div className="text-xs text-center mt-1 text-gray-500">
                Lock expires in {Math.floor(data.lockRemainingMs / 60000)}:
                {Math.floor((data.lockRemainingMs % 60000) / 1000).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

