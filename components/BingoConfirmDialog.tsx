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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isDragging) {
      // Center the dialog on first open
      setPosition({
        x: window.innerWidth / 2,
        y: 20, // Top of screen
      });
    }
  }, [isOpen, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (dialogRef.current) {
      const rect = dialogRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - (rect.width / 2), // Account for transform center
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
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
  }, [isDragging, dragOffset]);

  if (!isOpen || !bingoLine) return null;

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
        className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 relative border-2 border-green-500 pointer-events-auto"
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
            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 active:bg-gray-500 transition-colors font-medium text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            type="button"
            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-green-500 text-white rounded-md hover:bg-green-600 active:bg-green-700 transition-colors font-medium text-sm sm:text-base"
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
