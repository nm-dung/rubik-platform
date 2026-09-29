/**
 * 3x3 Rubik's Cube Scramble Generator
 * Generates valid WCA-style scrambles using standard notation
 */

export type Move = 'U' | 'D' | 'F' | 'B' | 'R' | 'L';
export type Modifier = '' | "'" | '2';
export type ScrambleMove = `${Move}${Modifier}`;

const MOVES: Move[] = ['U', 'D', 'R', 'L', 'F', 'B'];
const MODIFIERS: Modifier[] = ['', "'", '2'];

/**
 * Generates a valid WCA-style scramble
 * @param length - Number of moves in the scramble (default 20 for WCA)
 * @returns A valid scramble string
 */
export function generateScramble(length: number = 21): string {
  const scramble: ScrambleMove[] = [];
  let lastMove: Move | null = null;
  let lastLastMove: Move | null = null;

  for (let i = 0; i < length; i++) {
    let move = MOVES[Math.floor(Math.random() * MOVES.length)];
    while (
      move === lastMove ||
      (lastMove && isOppositeFace(move, lastMove) && lastLastMove === move)
    ) {
      move = MOVES[Math.floor(Math.random() * MOVES.length)];
    }

    const modifier = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
    scramble.push(`${move}${modifier}` as ScrambleMove);

    lastLastMove = lastMove;
    lastMove = move;
  }

  return scramble.join(' ');
}

/**
 * Checks if two faces are opposite (U-D, F-B, R-L)
 */
function isOppositeFace(move1: Move, move2: Move): boolean {
  const opposites: Record<Move, Move> = {
    'U': 'D',
    'D': 'U',
    'F': 'B',
    'B': 'F',
    'R': 'L',
    'L': 'R'
  };
  return opposites[move1] === move2;
}

/**
 * Generates a scramble with specific difficulty
 * @param difficulty - 'beginner' (shorter, simpler), 'intermediate' (standard), 'advanced' (longer, more complex)
 */
export function generateScrambleByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): string {
  const lengths = {
    beginner: 15,
    intermediate: 20,
    advanced: 25
  };
  return generateScramble(lengths[difficulty]);
}

/**
 * Validates if a scramble is syntactically correct
 */
export function validateScramble(scramble: string): boolean {
  const moves = scramble.trim().split(/\s+/);
  const validMoves = MOVES.map(m => [m, `${m}'`, `${m}2`]).flat();
  
  return moves.every(move => validMoves.includes(move));
}

/**
 * Formats a scramble for display with proper spacing
 */
export function formatScramble(scramble: string): string {
  return scramble.trim().replace(/\s+/g, ' ');
}