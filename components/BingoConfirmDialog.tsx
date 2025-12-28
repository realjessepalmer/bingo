'use client';

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
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center z-50 p-4 pt-8 sm:pt-16">
      <div className="bg-white rounded-lg shadow-xl max-w-xs w-full p-4 sm:p-6 relative border-2 border-green-500">
        <div className="text-center mb-3">
          <div className="text-4xl sm:text-5xl mb-1">🎉</div>
          <h2 className="text-xl sm:text-2xl font-bold text-green-600 mb-1">BINGO!</h2>
          <p className="text-sm sm:text-base text-gray-700">
            Completed: <strong>{lineName}</strong>
          </p>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mb-4 text-center">
          Review your card below, then confirm.
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
      </div>
    </div>
  );
}

