/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Volume2, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/AudioSynth';

interface DefinitionRevealProps {
  word: string;
  definition: string;
  phonetic: string;
  partOfSpeech: string;
  gameStatus: 'WON' | 'LOST';
  levelNumber: number;
  onNextLevel: () => void;
  hintUsed: boolean;
  isDaily?: boolean;
  onBackToAdventure?: () => void;
}

export default function DefinitionReveal({
  word,
  definition,
  phonetic,
  partOfSpeech,
  gameStatus,
  levelNumber,
  onNextLevel,
  hintUsed,
  isDaily,
  onBackToAdventure
}: DefinitionRevealProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  /**
   * Synthesize a melodic series of woodwind notes representing the letters.
   * This is a 100% offline, zero-api creative solution for letter/word pronunciations.
   */
  const handleSynthPronounce = () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    soundEngine.playReveal();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        setIsPlayingAudio(false);
        return;
      }
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      // Map characters to a musical scale (Pentatonic G major)
      const scale = [196.00, 220.00, 246.94, 293.66, 329.63, 392.00, 440.00, 493.88, 587.33, 659.25, 783.99];
      const chars = word.toLowerCase().split('');
      
      chars.forEach((char, idx) => {
        const charCode = char.charCodeAt(0) - 97; // 0 to 25
        const noteFreq = scale[charCode % scale.length];

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        // Gentle flute-like envelope
        osc.type = 'sine';
        osc.frequency.setValueAtTime(noteFreq, now + idx * 0.12);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.25);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.3);
      });

      setTimeout(() => {
        setIsPlayingAudio(false);
      }, chars.length * 120 + 200);

    } catch (e) {
      console.warn('Synth pronunciation failed:', e);
      setIsPlayingAudio(false);
    }
  };

  const handleNextClick = () => {
    soundEngine.playSuccess();
    onNextLevel();
  };

  const isWon = gameStatus === 'WON';

  return (
    <div className="w-full max-w-md mx-auto mt-6 animate-fade-in-up">
      <div className={`rounded-2xl border p-5 shadow-lg overflow-hidden relative ${
        isWon 
          ? 'bg-moss-correct/5 border-moss-correct/20 text-walnut-text' 
          : 'bg-ochre-present/5 border-ochre-present/20 text-walnut-text'
      }`}>
        {/* Dynamic Backdrop glow decoration */}
        <div className={`absolute -right-12 -top-12 w-28 h-28 rounded-full blur-2xl opacity-15 ${
          isWon ? 'bg-moss-correct' : 'bg-ochre-present'
        }`} />

        {/* Status Header */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
            isWon 
              ? 'bg-moss-correct/10 text-moss-correct' 
              : 'bg-ochre-present/15 text-ochre-present'
          }`}>
            {isWon ? 'Pristine Assembly' : 'Earthy Mystery Reveal'}
          </span>
          
          <div className="flex items-center gap-1.5 text-xs text-walnut-muted font-mono font-medium">
            <BookOpen className="w-3.5 h-3.5 text-walnut-muted" />
            Lvl {levelNumber} Definition
          </div>
        </div>

        {/* Word Display */}
        <div className="flex items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="text-3xl font-bold font-serif capitalize tracking-tight text-walnut-text flex items-center gap-1.5">
              {word}
              {isWon && !hintUsed && (
                <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" title="Zero hints utilized!" />
              )}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono text-walnut-muted font-medium">{phonetic}</span>
              <span className="text-xs italic bg-clay-empty/45 text-walnut-muted px-2 py-0.5 rounded-md border border-clay-border/40 font-serif">
                {partOfSpeech}
              </span>
            </div>
          </div>

          <button
            onClick={handleSynthPronounce}
            disabled={isPlayingAudio}
            className={`p-3 rounded-full transition-all ${
              isPlayingAudio 
                ? 'bg-clay-empty text-walnut-muted scale-95' 
                : 'bg-clay-empty/60 hover:bg-clay-empty text-walnut-text hover:shadow-sm hover:scale-105 cursor-pointer'
            }`}
            title="Listen to offline acoustic woodwind voice"
          >
            <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
          </button>
        </div>

        {/* Lexical Definition */}
        <div className="bg-linen-bg/65 border border-clay-border/40 rounded-xl p-3.5 mb-5 font-serif text-sm leading-relaxed text-walnut-text/90 italic">
          "{definition}"
        </div>

        {/* Continue Control */}
        <button
          onClick={isDaily && isWon ? onBackToAdventure : handleNextClick}
          className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer ${
            isWon 
              ? 'bg-moss-correct text-linen-bg hover:bg-moss-correct/90 hover:shadow-lg hover:shadow-moss-correct/10' 
              : 'bg-ochre-present text-linen-bg hover:bg-ochre-present/90 hover:shadow-lg hover:shadow-ochre-present/10'
          }`}
        >
          {isDaily 
            ? isWon 
              ? 'Return to Adventure Journey' 
              : 'Retry Daily Challenge' 
            : isWon 
              ? 'Step Forward to Next Level' 
              : 'Retry Level Challenge'
          }
          <ChevronRight className="w-5 h-5 animate-pulse" />
        </button>
      </div>
    </div>
  );
}
