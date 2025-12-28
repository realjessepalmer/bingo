'use client';

import { useState, useEffect } from 'react';
import { BINGO_ITEMS, CENTER_SQUARE_INDEX } from '@/lib/config';
import { detectBingos, isItemLocked, getBingoLineName, BingoLine } from '@/lib/bingo';

interface BingoCardProps {
  theatreId: string;
  markedItems: number[];
  comments: Record<string, string>;
  middleSquareText: string;
  confirmedBingos: Array<{ type: 'row' | 'col' | 'diag'; index: number; items: number[] }>;
  isLocked: boolean;
  isEditable: boolean;
  onMarkItem?: (itemIndex: number) => void;
  onEditComment?: (cellIndex: number) => void;
  onEditMiddleSquare?: () => void;
  onBingoDetected?: (bingoLine: BingoLine) => void;
}

export default function BingoCard({
  theatreId,
  markedItems,
  comments,
  middleSquareText,
  confirmedBingos,
  isLocked,
  isEditable,
  onMarkItem,
  onEditComment,
  onEditMiddleSquare,
  onBingoDetected,
}: BingoCardProps) {
  const [newBingos, setNewBingos] = useState<BingoLine[]>([]);

  useEffect(() => {
    const detected = detectBingos(markedItems, confirmedBingos);
    setNewBingos(detected);
    
    // Notify parent of first new bingo
    if (detected.length > 0 && onBingoDetected) {
      onBingoDetected(detected[0]);
    }
  }, [markedItems, confirmedBingos, onBingoDetected]);

  const handleCellClick = (index: number) => {
    if (!isEditable || isLockedItem(index)) return;
    
    if (index === CENTER_SQUARE_INDEX) {
      // Center square is always marked (free space)
      if (onEditMiddleSquare) {
        onEditMiddleSquare();
      }
    } else {
      if (onMarkItem) {
        onMarkItem(index);
      }
    }
  };

  const handleCellLongPress = (index: number, e: React.MouseEvent | React.TouchEvent) => {
    // Allow comments on all cells, even locked ones
    e.preventDefault();
    if (onEditComment) {
      onEditComment(index);
    }
  };

  const isLockedItem = (index: number) => {
    return isItemLocked(index, confirmedBingos);
  };

  const isMarked = (index: number) => {
    if (index === CENTER_SQUARE_INDEX) return true; // Center square is always marked
    return markedItems.includes(index);
  };

  const hasComment = (index: number) => {
    return !!comments[index.toString()];
  };

  return (
    <div className={`bingo-card ${isLocked ? 'opacity-50' : ''} ${!isEditable ? 'pointer-events-none' : ''}`}>
      <div className="grid grid-cols-5 gap-1 p-2 bg-white rounded-lg shadow-md">
        {BINGO_ITEMS.map((item, index) => {
          const isCenter = index === CENTER_SQUARE_INDEX;
          const marked = isMarked(index);
          const locked = isLockedItem(index);
          const hasCommentIcon = hasComment(index);
          const canEdit = isEditable && !locked;

          return (
            <div
              key={index}
              className={`
                relative aspect-square border-2 rounded p-1 text-xs sm:text-sm
                flex flex-col items-center justify-center text-center
                min-h-[44px] sm:min-h-[60px]
                transition-all
                ${marked || isCenter ? 'bg-green-200 border-green-500' : 'bg-gray-50 border-gray-300'}
                ${locked ? 'opacity-75' : ''}
                ${canEdit ? 'cursor-pointer hover:bg-gray-100 active:bg-gray-200' : 'cursor-default'}
                ${isCenter ? 'font-bold' : ''}
              `}
              onClick={() => handleCellClick(index)}
              onMouseDown={(e) => {
                // Allow long-press for comments on all cells
                const timer = setTimeout(() => {
                  handleCellLongPress(index, e);
                }, 500);
                const cleanup = () => clearTimeout(timer);
                e.currentTarget.addEventListener('mouseup', cleanup, { once: true });
                e.currentTarget.addEventListener('mouseleave', cleanup, { once: true });
              }}
              onTouchStart={(e) => {
                // Allow long-press for comments on all cells
                const timer = setTimeout(() => {
                  handleCellLongPress(index, e);
                }, 500);
                const cleanup = () => clearTimeout(timer);
                e.currentTarget.addEventListener('touchend', cleanup, { once: true });
                e.currentTarget.addEventListener('touchcancel', cleanup, { once: true });
              }}
            >
              {isCenter ? (
                <div className="w-full h-full flex items-center justify-center">
                  <input
                    type="text"
                    value={middleSquareText}
                    readOnly={!isEditable}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onEditMiddleSquare) onEditMiddleSquare();
                    }}
                    className="w-full h-full text-center bg-transparent border-none outline-none font-bold text-xs sm:text-sm"
                    placeholder="FREE"
                  />
                </div>
              ) : (
                <>
                  <div className="text-[10px] sm:text-xs leading-tight">{item}</div>
                  {marked && (
                    <div className="absolute top-0 left-0 text-xs font-bold text-green-600" title="Marked">
                      ✓
                    </div>
                  )}
                </>
              )}
              {hasCommentIcon && (
                <div className="absolute top-0 right-0 text-xs" title="Has comment">
                  💬
                </div>
              )}
              {!hasCommentIcon && (
                <div className="absolute top-0 right-0 text-xs opacity-50" title="Long-press to add comment">
                  💬
                </div>
              )}
              {locked && (
                <div className="absolute bottom-0 left-0 text-xs" title="Locked (part of confirmed bingo)">
                  🔒
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

