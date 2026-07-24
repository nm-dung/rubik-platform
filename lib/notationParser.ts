/**
 * Cube Notation Parser
 * Parses standard Rubik's cube notation into individual moves
 * Supports: R, L, U, D, F, B and their modifiers (', 2)
 */

export interface Move {
  notation: string;
  face: string;
  modifier: '' | "'" | '2';
  description: string;
}

export function parseAlgorithm(notation: string): Move[] {
  if (!notation) return [];

  // Remove extra spaces and split by spaces
  const moves = notation.trim().split(/\s+/).filter(Boolean);

  return moves.map(moveStr => {
    const face = moveStr[0];
    const modifier = moveStr.slice(1) as '' | "'" | '2';

    return {
      notation: moveStr,
      face,
      modifier,
      description: getMoveDescription(face, modifier),
    };
  });
}

function getMoveDescription(face: string, modifier: '' | "'" | '2'): string {
  const faceNames: Record<string, string> = {
    'R': 'Right',
    'L': 'Left', 
    'U': 'Up',
    'D': 'Down',
    'F': 'Front',
    'B': 'Back',
  };

  const faceName = faceNames[face] || face;
  const modifierDesc = {
    '': 'clockwise',
    "'": 'counter-clockwise',
    '2': 'double turn',
  }[modifier];

  return `${faceName} face ${modifierDesc}`;
}

export function getMoveCount(notation: string): number {
  return parseAlgorithm(notation).length;
}
