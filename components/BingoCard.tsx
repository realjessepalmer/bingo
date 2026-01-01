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
  compact?: boolean; // For view-all mode
  numbersOnly?: boolean; // Show numbers instead of text (for mobile view-all)
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
  compact = false,
  numbersOnly = false,
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
      <div className={numbersOnly ? '' : 'overflow-x-auto -mx-2 sm:mx-0'}>
        <div className={`grid grid-cols-5 gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-white rounded-lg shadow-md ${numbersOnly ? '' : 'min-w-[750px] sm:min-w-0'}`}>
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
                relative aspect-square border-2 rounded-lg
                flex flex-col text-center overflow-hidden
                transition-all duration-200 ease-in-out
                ${compact ? 'min-h-[50px] sm:min-h-[60px]' : 'min-h-[70px] sm:min-h-[80px]'}
                ${compact ? 'p-1 sm:p-1.5 text-[10px] sm:text-[11px]' : 'p-2 sm:p-3 text-sm sm:text-base'}
                ${marked || isCenter 
                  ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-400 shadow-md' 
                  : 'bg-white border-gray-200 hover:border-gray-300'}
                ${locked ? 'opacity-60 grayscale' : ''}
                ${canEdit ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]' : 'cursor-default'}
                ${isCenter ? 'font-bold bg-gradient-to-br from-blue-100 to-blue-200 border-blue-400 shadow-md' : ''}
              `}
              title={item} // Show full text on hover
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
                    className="w-full h-full text-center bg-transparent border-none outline-none font-bold text-sm sm:text-lg"
                    placeholder="FREE"
                  />
                </div>
              ) : (
                <>
                  {numbersOnly ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className={`
                        text-2xl sm:text-3xl font-bold
                        ${marked ? 'text-green-700' : 'text-gray-600'}
                        transition-colors duration-200
                      `}>
                        {index + 1}
                      </div>
                    </div>
                  ) : compact ? (
                    <div className="w-full h-full flex items-center justify-center px-1">
                      <div className="w-full overflow-hidden leading-tight line-clamp-3 break-words text-center" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                        {item}
                      </div>
                    </div>
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isEditable ? 'px-4 py-2' : 'px-2 py-2'}`} style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>
                      <span className="break-words text-center text-xs sm:text-base leading-tight">{item}</span>
                    </div>
                  )}
                </>
              )}
              {isEditable && (
                <>
                  {hasCommentIcon ? (
                    <div 
                      className="absolute top-0.5 right-0.5 text-xs sm:text-base cursor-pointer hover:scale-110 transition-transform bg-blue-100 border border-blue-500 rounded-full p-0.5 z-10 touch-none" 
                      title="Has comment - long press to edit"
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        const timer = setTimeout(() => {
                          if (onEditComment) onEditComment(index);
                        }, 500);
                        const cleanup = () => clearTimeout(timer);
                        e.currentTarget.addEventListener('touchend', cleanup, { once: true });
                        e.currentTarget.addEventListener('touchcancel', cleanup, { once: true });
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Only allow click on desktop
                        if (window.innerWidth >= 640 && onEditComment) {
                          onEditComment(index);
                        }
                      }}
                    >
                      💬
                    </div>
                  ) : (
                    <div 
                      className="absolute top-0.5 right-0.5 text-xs sm:text-base opacity-30 sm:opacity-50 cursor-pointer hover:opacity-100 hover:scale-110 transition-all z-10 touch-none" 
                      title="Long press to add comment"
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        const timer = setTimeout(() => {
                          if (onEditComment) onEditComment(index);
                        }, 500);
                        const cleanup = () => clearTimeout(timer);
                        e.currentTarget.addEventListener('touchend', cleanup, { once: true });
                        e.currentTarget.addEventListener('touchcancel', cleanup, { once: true });
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Only allow click on desktop
                        if (window.innerWidth >= 640 && onEditComment) {
                          onEditComment(index);
                        }
                      }}
                    >
                      💬
                    </div>
                  )}
                  {locked && (
                    <div className="absolute bottom-0.5 left-0.5 text-xs sm:text-base z-10 touch-none" title="Locked (part of confirmed bingo)">
                      🔒
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

