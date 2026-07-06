/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LetterState } from '../types';
import { checkGuess } from '../utils/WordEngine';

interface GameBoardProps {
  guesses: string[];
  currentGuess: string;
  wordLength: number;
  targetWord: string;
  gameStatus: 'IN_PROGRESS' | 'WON' | 'LOST';
  errorShakeRowIndex: number | null;
}

export default function GameBoard({
  guesses,
  currentGuess,
  wordLength,
  targetWord,
  gameStatus,
  errorShakeRowIndex
}: GameBoardProps) {
  const maxGuesses = 6;
  const rows = Array(maxGuesses).fill(null);

  const getMaxWidthClass = () => {
    switch (wordLength) {
      case 4:
        return 'max-w-[160px] sm:max-w-[200px]';
      case 5:
        return 'max-w-[200px] sm:max-w-[245px]';
      case 6:
        return 'max-w-[240px] sm:max-w-[290px]';
      case 7:
      default:
        return 'max-w-[280px] sm:max-w-[335px]';
    }
  };

  return (
    <div className="w-full flex justify-center py-0.5 sm:py-1 px-2 my-auto">
      <div 
        id="wordle-board-matrix"
        className={`flex flex-col gap-1 sm:gap-1.2 w-full ${getMaxWidthClass()}`}
      >
        {rows.map((_, rowIndex) => {
          const isGuessedRow = rowIndex < guesses.length;
          const isCurrentRow = rowIndex === guesses.length;
          const isFutureRow = rowIndex > guesses.length;

          // Compute exact letters to show in this row
          let letters: string[] = Array(wordLength).fill('');
          let states: LetterState[] = Array(wordLength).fill('EMPTY');

          if (isGuessedRow) {
            const guess = guesses[rowIndex];
            letters = guess.split('');
            states = checkGuess(guess, targetWord);
          } else if (isCurrentRow) {
            letters = currentGuess.split('');
            // Padding with empty strings up to wordLength
            while (letters.length < wordLength) {
              letters.push('');
            }
            // Mark typed but unsubmitted letters as TENSE
            states = letters.map((char) => (char !== '' ? 'TENSE' : 'EMPTY'));
          }

          // Trigger shake animation if this row has an input validation error
          const shouldShake = errorShakeRowIndex === rowIndex;

          return (
            <div 
              key={rowIndex}
              id={`board-row-${rowIndex}`}
              className={`grid gap-1 sm:gap-1.2 justify-center ${shouldShake ? 'animate-shake' : ''}`}
              style={{
                gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))`,
              }}
            >
              {letters.map((char, charIndex) => {
                const state = states[charIndex];
                
                // Construct animation classes based on state
                let animationClass = '';
                let customStyle: React.CSSProperties = {};

                if (isGuessedRow) {
                  // Staggered domino flip animations
                  if (state === 'CORRECT') {
                    animationClass = 'animate-flip-correct';
                  } else if (state === 'PRESENT') {
                    animationClass = 'animate-flip-present';
                  } else {
                    animationClass = 'animate-flip-absent';
                  }
                  customStyle = {
                    animationDelay: `${charIndex * 150}ms`,
                  };
                } else if (state === 'TENSE') {
                  // Quick pop effect when entering a letter
                  animationClass = 'animate-pop';
                }

                // Core styling based on state (fallback values before flips trigger)
                let baseBgBorderText = 'bg-transparent border-clay-border text-walnut-text';

                if (state === 'TENSE') {
                  baseBgBorderText = 'bg-transparent border-walnut-muted text-walnut-text scale-102 ring-1 ring-walnut-muted/20';
                } else if (state === 'EMPTY') {
                  baseBgBorderText = 'bg-transparent border-clay-border/60 text-transparent';
                }

                return (
                  <div
                    key={charIndex}
                    id={`tile-row-${rowIndex}-col-${charIndex}`}
                    style={customStyle}
                    className={`
                      h-[4.8vh] sm:h-[5.2vh] md:h-[5.5vh] max-h-[36px] sm:max-h-[42px] md:max-h-[48px] aspect-square w-auto mx-auto flex items-center justify-center 
                      text-xs sm:text-base md:text-lg font-bold rounded-md sm:rounded-lg border-[1.5px] sm:border-2 uppercase select-none font-sans
                      transition-all duration-300
                      ${baseBgBorderText}
                      ${animationClass}
                    `}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
