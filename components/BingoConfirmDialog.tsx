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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 relative">
        <div className="text-center mb-4">
          <div className="text-6xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">BINGO!</h2>
          <p className="text-lg text-gray-700">
            You completed: <strong>{lineName}</strong>
          </p>
        </div>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Review your card, then confirm to lock this bingo line.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium"
          >
            Confirm Bingo
          </button>
        </div>
      </div>
    </div>
  );
}

