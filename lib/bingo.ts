import { BINGO_LINES, BingoLineType, CENTER_SQUARE_INDEX } from './config';

export interface BingoLine {
  type: BingoLineType;
  index: number;
  items: number[];
}

/**
 * Check if a bingo line is complete (all items marked)
 * Center square is always considered marked
 */
export function isBingoLineComplete(markedItems: number[], lineItems: number[]): boolean {
  return lineItems.every((item) => {
    if (item === CENTER_SQUARE_INDEX) return true; // Center square is always marked
    return markedItems.includes(item);
  });
}

/**
 * Detect all new bingo lines in a card
 * Returns array of bingo lines that are complete but not yet confirmed
 */
export function detectBingos(
  markedItems: number[],
  confirmedBingos: Array<{ type: BingoLineType; index: number; items: number[] }>
): BingoLine[] {
  const newBingos: BingoLine[] = [];

  // Check rows
  BINGO_LINES.rows.forEach((rowItems, index) => {
    const isComplete = isBingoLineComplete(markedItems, rowItems);
    const isConfirmed = confirmedBingos.some((b) => b.type === 'row' && b.index === index);

    if (isComplete && !isConfirmed) {
      newBingos.push({ type: 'row', index, items: rowItems });
    }
  });

  // Check columns
  BINGO_LINES.cols.forEach((colItems, index) => {
    const isComplete = isBingoLineComplete(markedItems, colItems);
    const isConfirmed = confirmedBingos.some((b) => b.type === 'col' && b.index === index);

    if (isComplete && !isConfirmed) {
      newBingos.push({ type: 'col', index, items: colItems });
    }
  });

  // Check diagonals
  BINGO_LINES.diags.forEach((diagItems, index) => {
    const isComplete = isBingoLineComplete(markedItems, diagItems);
    const isConfirmed = confirmedBingos.some((b) => b.type === 'diag' && b.index === index);

    if (isComplete && !isConfirmed) {
      newBingos.push({ type: 'diag', index, items: diagItems });
    }
  });

  return newBingos;
}

/**
 * Get the display name for a bingo line
 */
export function getBingoLineName(type: BingoLineType, index: number): string {
  if (type === 'row') {
    return `Row ${index + 1}`;
  } else if (type === 'col') {
    return `Column ${index + 1}`;
  } else {
    return index === 0 ? 'Diagonal (top-left to bottom-right)' : 'Diagonal (top-right to bottom-left)';
  }
}

/**
 * Check if an item is part of a confirmed bingo line (and thus locked)
 */
export function isItemLocked(
  itemIndex: number,
  confirmedBingos: Array<{ type: BingoLineType; index: number; items: number[] }>
): boolean {
  return confirmedBingos.some((bingo) => bingo.items.includes(itemIndex));
}

