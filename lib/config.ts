// Configuration for the Film Festival Bingo App

export const LOCK_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes in milliseconds

export const THEATRES = [
  'Annenberg',
  'ARCO',
  'Festival',
  'D\'Place',
  'Cultural Center',
  'High School',
];

// 5x5 bingo card: 24 items + center free space (index 12)
// Layout: 5 rows x 5 columns
// Indices: 0-4 (row 1), 5-9 (row 2), 10-14 (row 3), 15-19 (row 4), 20-24 (row 5)
// Center square is index 12
export const BINGO_ITEMS = [
  'Filmmaker insists on playing at Dolby 7.0',
  'House manager wants mic volume up while talent holds mic at their waist',
  'CPL says F when it\'s clearly a different ratio within a flat container',
  'Subtitles in letterbox bar',
  'KDM issued for wrong window',
  'Filmmaker no-shows tech check they requested',
  'Projector crashes during film',
  'DCP won\'t ingest or play',
  'Talent can\'t be found for intro or Q&A',
  'Projectionist gets sick',
  'Someone on floor staff needed to be removed from their duties',
  'Filmmaker wants volume change during specific part of the film',
  'FREE - I\'m editable!', // Center square (index 12)
  'CPL is simply "dcp_output" or something similar',
  'KDM closes before film ends',
  'Started wrong movie',
  'Hot tub broken',
  'Filmmaker says they\'re bringing the DCP with them',
  'Last minute KDM/print with no chance of testing film',
  'Interesting aspect ratio choices',
  'Filmmaker asks for color correction',
  'Red tail light',
  'Talent complains about spotlight being too bright',
  'Audience complains about volume being too loud after filmmaker tech check',
  'Filmmaker barges in to booth uninvited',
];

export const CENTER_SQUARE_INDEX = 12;

// Unique emojis for each bingo cell (25 total, one per cell)
// Used in view-all mode to replace text and eliminate overflow issues
export const BINGO_EMOJIS = [
  '🎬', // 0: Filmmaker insists on playing at Dolby 7.0
  '🎤', // 1: House manager wants mic volume up
  '📽️', // 2: CPL says F when it's clearly different ratio
  '📺', // 3: Subtitles in letterbox bar
  '🔑', // 4: KDM issued for wrong window
  '❌', // 5: Filmmaker no-shows tech check
  '💥', // 6: Projector crashes during film
  '💾', // 7: DCP won't ingest or play
  '👤', // 8: Talent can't be found
  '🤒', // 9: Projectionist gets sick
  '🚫', // 10: Someone on floor staff needed to be removed
  '🔊', // 11: Filmmaker wants volume change
  '✅', // 12: FREE - Center square
  '📝', // 13: CPL is simply "dcp_output"
  '⏰', // 14: KDM closes before film ends
  '🎞️', // 15: Started wrong movie
  '🛁', // 16: Hot tub broken
  '📦', // 17: Filmmaker says they're bringing the DCP
  '⚡', // 18: Last minute KDM/print
  '📐', // 19: Interesting aspect ratio choices
  '🎨', // 20: Filmmaker asks for color correction
  '🔴', // 21: Red tail light
  '💡', // 22: Talent complains about spotlight
  '📢', // 23: Audience complains about volume
  '🚪', // 24: Filmmaker barges in to booth
];

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

