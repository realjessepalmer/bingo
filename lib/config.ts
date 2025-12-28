// Configuration for the Film Festival Bingo App

export const LOCK_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes in milliseconds

export const THEATRES = [
  'Theatre 1',
  'Theatre 2',
  'Theatre 3',
  'Theatre 4',
  'Theatre 5',
];

// 5x5 bingo card: 24 items + center free space (index 12)
// Layout: 5 rows x 5 columns
// Indices: 0-4 (row 1), 5-9 (row 2), 10-14 (row 3), 15-19 (row 4), 20-24 (row 5)
// Center square is index 12
export const BINGO_ITEMS = [
  'Film starts late',
  'Someone\'s phone rings',
  'Projector malfunctions',
  'Audience member falls asleep',
  'Standing ovation',
  'Technical difficulty',
  'Director Q&A',
  'Unexpected cameo',
  'Crowd gasps',
  'Mid-film applause',
  'Cell phone light',
  'Loud whisperer',
  'FREE', // Center square (index 12)
  'Crying in audience',
  'Laughing at wrong moment',
  'Film ends early',
  'Post-credits scene',
  'Someone walks out',
  'Encore screening',
  'Special guest appearance',
  'Technical glitch',
  'Perfect silence',
  'Unexpected plot twist',
  'Festival staff cameo',
  'Memorable quote',
];

export const CENTER_SQUARE_INDEX = 12;

// Bingo line types
export type BingoLineType = 'row' | 'col' | 'diag';

// Bingo line definitions
export const BINGO_LINES = {
  rows: [
    [0, 1, 2, 3, 4],      // Row 0
    [5, 6, 7, 8, 9],      // Row 1
    [10, 11, 12, 13, 14], // Row 2 (includes center)
    [15, 16, 17, 18, 19], // Row 3
    [20, 21, 22, 23, 24], // Row 4
  ],
  cols: [
    [0, 5, 10, 15, 20],   // Column 0
    [1, 6, 11, 16, 21],   // Column 1
    [2, 7, 12, 17, 22],   // Column 2 (includes center)
    [3, 8, 13, 18, 23],   // Column 3
    [4, 9, 14, 19, 24],   // Column 4
  ],
  diags: [
    [0, 6, 12, 18, 24],   // Top-left to bottom-right (includes center)
    [4, 8, 12, 16, 20],   // Top-right to bottom-left (includes center)
  ],
};

