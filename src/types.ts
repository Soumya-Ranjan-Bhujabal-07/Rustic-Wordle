/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LetterState = 'EMPTY' | 'TENSE' | 'ABSENT' | 'PRESENT' | 'CORRECT';

export interface VocabularyWord {
  word: string;
  definition: string;
  phonetic: string;
  partOfSpeech: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: { [key: number]: number };
  masteredWords: string[]; // List of words successfully guessed
  levelMilestones: number[]; // Milestones reached
}

export interface GameState {
  levelNumber: number;
  wordLength: number;
  targetWord: string;
  definition: string;
  phonetic: string;
  partOfSpeech: string;
  guesses: string[];
  currentGuess: string;
  gameStatus: 'IN_PROGRESS' | 'WON' | 'LOST';
  showStats: boolean;
  showDefinition: boolean;
  hintUsed: boolean;
  errorShakeRowIndex: number | null; // For invalid-word animation trigger
}

export interface GuessLetter {
  char: string;
  state: LetterState;
}
