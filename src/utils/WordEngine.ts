/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LetterState, VocabularyWord } from '../types';
import { VOCABULARY } from '../data/vocabulary';

/**
 * Seeded pseudo-random number generator (0 to 1) for a given integer seed.
 * Ensures that level generations are completely deterministic yet appear random.
 */
export function seededRandom(seed: number): number {
  // Linear Congruential Generator (LCG) constants
  const m = 0x80000000; // 2**31
  const a = 1103515245;
  const c = 12345;
  const state = (a * seed + c) % m;
  return state / (m - 1);
}

/**
 * Retrieves the target word and details for a specific level.
 * Features a progressive difficulty curve across 10,000 levels:
 * - Levels 1-2000: 4 letters (Easy -> Medium -> Hard)
 * - Levels 2001-6000: 5 letters (Easy -> Medium -> Hard)
 * - Levels 6001-8500: 6 letters (Easy -> Medium -> Hard)
 * - Levels 8501-10000+: 7 letters (Easy -> Medium -> Hard)
 */
export function getWordForLevel(levelNumber: number): VocabularyWord {
  let length: 4 | 5 | 6 | 7 = 5;
  let progressInBracket = 0;

  if (levelNumber <= 2000) {
    length = 4;
    progressInBracket = (levelNumber - 1) / 2000;
  } else if (levelNumber <= 6000) {
    length = 5;
    progressInBracket = (levelNumber - 2001) / 4000;
  } else if (levelNumber <= 8500) {
    length = 6;
    progressInBracket = (levelNumber - 6001) / 2500;
  } else {
    length = 7;
    // Bound or loop level progression beyond 10,000
    const relativeLevel = levelNumber > 10000 ? ((levelNumber - 8501) % 1500) : (levelNumber - 8501);
    progressInBracket = Math.min(relativeLevel / 1500, 1.0);
  }

  // Determine difficulty tier distribution based on progress
  let chosenTier: 'easy' | 'medium' | 'hard' = 'easy';
  const randVal = seededRandom(levelNumber * 17 + 5);

  if (progressInBracket < 0.25) {
    // Early stage: 85% Easy, 15% Medium
    chosenTier = randVal < 0.85 ? 'easy' : 'medium';
  } else if (progressInBracket < 0.70) {
    // Mid stage: 20% Easy, 65% Medium, 15% Hard
    if (randVal < 0.20) {
      chosenTier = 'easy';
    } else if (randVal < 0.85) {
      chosenTier = 'medium';
    } else {
      chosenTier = 'hard';
    }
  } else {
    // Advanced stage: 10% Medium, 90% Hard
    chosenTier = randVal < 0.10 ? 'medium' : 'hard';
  }

  // Filter words by the determined length and difficulty
  const wordsOfLength = VOCABULARY[length];
  let filteredWords = wordsOfLength.filter((w) => w.difficulty === chosenTier);

  // Fallback if no words match the tier (should not happen with our database)
  if (filteredWords.length === 0) {
    filteredWords = wordsOfLength;
  }

  // Deterministically pick a word from the filtered list
  const wordIndex = Math.floor(seededRandom(levelNumber * 31 + 4) * filteredWords.length);
  return filteredWords[wordIndex];
}

/**
 * Performs a deep Wordle-compliant letter matching pass,
 * carefully tracking correct spots and duplicates.
 */
export function checkGuess(guess: string, target: string): LetterState[] {
  const len = target.length;
  const result: LetterState[] = Array(len).fill('ABSENT');
  const targetChars = target.toLowerCase().split('');
  const guessChars = guess.toLowerCase().split('');

  // Pass 1: Mark CORRECT (exact letter & index match) and remove from active pool
  for (let i = 0; i < len; i++) {
    if (guessChars[i] === targetChars[i]) {
      result[i] = 'CORRECT';
      targetChars[i] = '_'; // consume letter in target
      guessChars[i] = '';   // consume letter in guess
    }
  }

  // Pass 2: Mark PRESENT (letter exists in target at a different location)
  for (let i = 0; i < len; i++) {
    if (guessChars[i] === '') continue; // already marked as CORRECT
    
    const targetIndex = targetChars.indexOf(guessChars[i]);
    if (targetIndex !== -1) {
      result[i] = 'PRESENT';
      targetChars[targetIndex] = '_'; // consume letter in target pool
    }
  }

  return result;
}

/**
 * Pre-evaluates the key status colors for the virtual keyboard.
 * Merges previous letter statuses, prioritizing: CORRECT > PRESENT > ABSENT.
 */
export function getKeyboardKeyStatuses(
  guesses: string[],
  target: string
): { [key: string]: LetterState } {
  const keyStatuses: { [key: string]: LetterState } = {};

  guesses.forEach((guess) => {
    const states = checkGuess(guess, target);
    for (let i = 0; i < guess.length; i++) {
      const char = guess[i].toLowerCase();
      const currentState = states[i];

      // Update if not defined, or if existing state has lower priority
      const existing = keyStatuses[char];
      if (!existing) {
        keyStatuses[char] = currentState;
      } else if (existing === 'ABSENT' && (currentState === 'PRESENT' || currentState === 'CORRECT')) {
        keyStatuses[char] = currentState;
      } else if (existing === 'PRESENT' && currentState === 'CORRECT') {
        keyStatuses[char] = currentState;
      }
    }
  });

  return keyStatuses;
}
