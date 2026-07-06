/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LetterState } from '../types';
import { Delete, CornerDownLeft } from 'lucide-react';
import { soundEngine } from '../utils/AudioSynth';

interface VirtualKeyboardProps {
  onChar: (value: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  keyStatuses: { [key: string]: LetterState };
}

export default function VirtualKeyboard({
  onChar,
  onDelete,
  onEnter,
  keyStatuses
}: VirtualKeyboardProps) {
  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['ENTER', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'DELETE']
  ];

  const handleKeyPress = (key: string) => {
    if (key === 'ENTER') {
      onEnter();
    } else if (key === 'DELETE') {
      onDelete();
    } else {
      soundEngine.playTick();
      onChar(key);
    }
  };

  const getKeyColorClass = (key: string): string => {
    const status = keyStatuses[key.toLowerCase()];
    if (!status) {
      return 'bg-clay-empty text-walnut-text hover:bg-clay-empty/80 active:bg-clay-border border-clay-border/40';
    }

    switch (status) {
      case 'CORRECT':
        return 'bg-moss-correct text-linen-bg border-moss-correct hover:bg-moss-correct/90 active:scale-95';
      case 'PRESENT':
        return 'bg-ochre-present text-linen-bg border-ochre-present hover:bg-ochre-present/90 active:scale-95';
      case 'ABSENT':
        return 'bg-ash-dark text-linen-bg/75 border-ash-dark hover:opacity-90 opacity-75';
      default:
        return 'bg-clay-empty text-walnut-text border-clay-border/40';
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-1 px-1 select-none">
      <div 
        id="virtual-keyboard-grid"
        className="flex flex-col gap-1 sm:gap-2"
      >
        {rows.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className="flex justify-center gap-0.5 sm:gap-1.5 touch-manipulation"
          >
            {row.map((key) => {
              const isSpecialKey = key === 'ENTER' || key === 'DELETE';
              const colorClass = getKeyColorClass(key);
              
              // Special size classes for Action keys versus standard letter keys
              const sizeClass = isSpecialKey 
                ? 'px-1 sm:px-4 text-[9px] sm:text-xs font-bold uppercase tracking-wider flex-1.5 min-w-[38px] sm:min-w-[65px]'
                : 'text-xs sm:text-base font-semibold uppercase flex-1';

              return (
                <button
                  key={key}
                  id={`keycap-${key.toLowerCase()}`}
                  onClick={() => handleKeyPress(key)}
                  className={`
                    h-9 sm:h-10 md:h-11 flex items-center justify-center rounded-md sm:rounded-lg border-b-[1.5px] sm:border-b-2
                    transition-all duration-150 cursor-pointer active:translate-y-0.5
                    ${sizeClass} ${colorClass}
                  `}
                >
                  {key === 'DELETE' ? (
                    <span className="flex items-center gap-1">
                      <Delete className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </span>
                  ) : key === 'ENTER' ? (
                    <span className="flex items-center gap-1">
                      <CornerDownLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </span>
                  ) : (
                    key
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
