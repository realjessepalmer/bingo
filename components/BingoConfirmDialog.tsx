'use client';

import { useState, useRef, useEffect } from 'react';
import { getBingoLineName, BingoLine } from '@/lib/bingo';

interface BingoConfirmDialogProps {
  isOpen: boolean;
  bingoLine: BingoLine | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function BingoConfirmDialog({
  isOpen,
  bingoLine,
  onConfirm,
  onCancel,
}: BingoConfirmDialogProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
      // Center the dialog on first open only
      setPosition({
        x: window.innerWidth / 2,
        y: 20, // Top of screen
      });
      hasInitialized.current = true;
    } else if (!isOpen) {
      // Reset when dialog closes
      hasInitialized.current = false;
      setPosition(null);
    }
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (dialogRef.current && position) {
      const rect = dialogRef.current.getBoundingClientRect();
      // Calculate offset from the center of the dialog (since we use translate -50%)
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
      setIsDragging(true);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && position) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, position]);

  if (!isOpen || !bingoLine || !position) return null;

  const lineName = getBingoLineName(bingoLine.type, bingoLine.index);

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onConfirm();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel();
  };

  return (
    <div
      ref={dialogRef}
      className="fixed z-50 w-full max-w-xs px-4 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, 0)',
      }}
    >
      <div
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 relative border-2 border-green-500 pointer-events-auto animate-scale-in"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="text-center mb-3">
          <div className="text-4xl sm:text-5xl mb-1">🎉</div>
          <h2 className="text-xl sm:text-2xl font-bold text-green-600 mb-1">BINGO!</h2>
          <p className="text-sm sm:text-base text-gray-700">
            Completed: <strong>{lineName}</strong>
          </p>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mb-2 text-center">
          Review your card below, then confirm.
        </p>
        <p className="text-xs text-red-600 mb-4 text-center font-semibold">
          ⚠️ Bingos are not reversible once confirmed
        </p>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={handleCancel}
            type="button"
            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-gray-200 text-gray-700 
              rounded-lg hover:bg-gray-300 active:scale-95 transition-all duration-200 
              font-medium text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            type="button"
            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 
              text-white rounded-lg hover:from-green-600 hover:to-green-700 active:scale-95 
              transition-all duration-200 font-medium text-sm sm:text-base shadow-md"
          >
            Confirm
          </button>
        </div>
        <div className="absolute top-2 right-2 text-gray-400 text-xs">
          ╬ (drag to move)
        </div>
      </div>
    </div>
  );
}
