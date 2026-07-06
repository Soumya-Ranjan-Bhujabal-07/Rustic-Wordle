/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Sparkles, BookOpen, Compass, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { soundEngine } from '../utils/AudioSynth';
import { getWordHint, HintData } from '../utils/HintEngine';

interface HintModalProps {
  word: string;
  guesses: string[];
  onClose: () => void;
}

export default function HintModal({ word, guesses, onClose }: HintModalProps) {
  const [hint, setHint] = useState<HintData | null>(null);
  const [apiHint, setApiHint] = useState<{ synonym?: string; antonym?: string; alternative?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Generate the baseline premium local hint
    const baseHint = getWordHint(word, guesses.length);
    setHint(baseHint);

    // Try fetching synonyms or antonyms from the free dictionary API for extra depth
    const fetchExtraDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            let synonym = '';
            let antonym = '';
            let alternative = '';

            for (const entry of data) {
              if (entry.meanings) {
                for (const meaning of entry.meanings) {
                  if (meaning.synonyms && meaning.synonyms.length > 0 && !synonym) {
                    synonym = meaning.synonyms.slice(0, 3).join(', ');
                  }
                  if (meaning.antonyms && meaning.antonyms.length > 0 && !antonym) {
                    antonym = meaning.antonyms.slice(0, 3).join(', ');
                  }
                  if (meaning.definitions && meaning.definitions.length > 0 && !alternative) {
                    // Try to grab an alternative high-level dictionary definition
                    const defText = meaning.definitions[0].definition;
                    if (defText && defText.length > 15) {
                      alternative = defText;
                    }
                  }
                }
              }
            }

            if (synonym || antonym || alternative) {
              setApiHint({ synonym, antonym, alternative });
            }
          }
        }
      } catch (err) {
        console.warn('Unable to retrieve auxiliary dynamic hints from dictionary API', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExtraDetails();
  }, [word, guesses.length]);

  // Determine which visual styling cards and titles to present based on hint type
  const getHeaderStyle = () => {
    switch (hint?.type) {
      case 'SYNONYM':
        return {
          title: "Synonyms & Linguistic Kinships",
          label: "Linguistic Cousin Words",
          color: "text-moss-correct bg-moss-correct/10 border-moss-correct/20",
          icon: <Compass className="w-4 h-4 text-moss-correct" />
        };
      case 'ANTONYM':
        return {
          title: "Antonyms & Conceptual Polarities",
          label: "Opposing Linguistic Currents",
          color: "text-amber-700 bg-amber-100 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/40",
          icon: <Sparkles className="w-4 h-4 text-amber-600" />
        };
      case 'OPPOSITE':
        return {
          title: "Opposites & Contrasting Natural Elements",
          label: "Contrasting Elements Clue",
          color: "text-ochre-present bg-ochre-present/15 border-ochre-present/20",
          icon: <BookOpen className="w-4 h-4 text-ochre-present" />
        };
      case 'HARD_DEFINITION':
      default:
        return {
          title: "Sophisticated Academic Definition",
          label: "High-Tier Scholarly Description",
          color: "text-walnut-text bg-clay-empty/60 border-clay-border/40",
          icon: <HelpCircle className="w-4 h-4 text-walnut-text" />
        };
    }
  };

  const header = getHeaderStyle();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-linen-bg border border-clay-border/60 shadow-2xl p-5 sm:p-6 text-walnut-text flex flex-col max-h-[92vh]"
      >
        
        {/* Modal Close Button */}
        <button
          onClick={() => {
            soundEngine.playTick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-clay-empty/50 text-walnut-muted hover:text-walnut-text transition-colors cursor-pointer z-10"
          title="Close hint dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dynamic Backdrop Glow */}
        <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-15 bg-ochre-present pointer-events-none" />

        {/* Modal Title Header */}
        <div className="flex items-center gap-2 border-b border-clay-border/40 pb-3 mb-4 shrink-0 pr-8">
          <Sparkles className="w-5 h-5 text-ochre-present animate-pulse" />
          <div>
            <h2 className="text-base font-bold font-sans text-walnut-text">
              Nature's Whisper Clue
            </h2>
            <p className="text-[10px] font-mono text-walnut-muted font-bold uppercase tracking-wider">
              Life-line whisper (5/6 tries active)
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          
          <div className={`p-4 border rounded-xl flex flex-col gap-2 shadow-sm ${header.color}`}>
            <div className="flex items-center gap-1.5">
              {header.icon}
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-walnut-muted">
                {header.label}
              </span>
            </div>
            
            <p className="font-serif italic text-sm leading-relaxed text-walnut-text font-medium">
              "{hint?.clue}"
            </p>
          </div>

          {/* Dynamic Extra Clues from API if available or fallback lists */}
          <div className="bg-clay-empty/25 border border-clay-border/30 rounded-xl p-4 flex flex-col gap-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-walnut-muted flex items-center gap-1">
              🌱 Additional Natural Context
            </span>

            {loading ? (
              <div className="flex items-center gap-2 py-2 text-xs font-mono text-walnut-muted">
                <div className="w-4 h-4 rounded-full border-2 border-clay-border border-t-walnut-text animate-spin" />
                Harvesting supplementary terms...
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                {/* 1. Synonyms row */}
                {(apiHint?.synonym || hint?.type !== 'SYNONYM') && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase font-mono font-bold text-walnut-muted">
                      Semantic Synonyms:
                    </span>
                    <span className="text-walnut-text font-serif italic text-[12.5px]">
                      {apiHint?.synonym || "Words representing similar earthy textures or features of equivalent nature."}
                    </span>
                  </div>
                )}

                {/* 2. Antonyms row */}
                {(apiHint?.antonym || hint?.type !== 'ANTONYM') && (
                  <div className="flex flex-col gap-0.5 pt-2 border-t border-clay-border/15">
                    <span className="text-[9px] uppercase font-mono font-bold text-walnut-muted">
                      Contrasting Antonyms:
                    </span>
                    <span className="text-walnut-text font-serif italic text-[12.5px]">
                      {apiHint?.antonym || "Elements resembling sterile synthetics, void, or severe industrial stasis."}
                    </span>
                  </div>
                )}

                {/* 3. Advanced definition */}
                {hint?.type !== 'HARD_DEFINITION' && (apiHint?.alternative || word.length > 0) && (
                  <div className="flex flex-col gap-0.5 pt-2 border-t border-clay-border/15">
                    <span className="text-[9px] uppercase font-mono font-bold text-walnut-muted">
                      Complex High-Level Phrase:
                    </span>
                    <span className="text-walnut-muted font-serif italic text-[12px] leading-relaxed">
                      {apiHint?.alternative || `An elegant, non-obvious ${word.length}-letter term representing a central feature of woodlands, soil chemistry, weather, or natural hydrology.`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-[10px] font-serif text-walnut-muted text-center px-2 italic pt-1 leading-relaxed">
            "A riddle in the bark, a whisper in the wind. Combine the clues with your existing letters to assemble the correct form."
          </p>

        </div>

        {/* Action Button */}
        <div className="mt-4 shrink-0">
          <button
            onClick={() => {
              soundEngine.playTick();
              onClose();
            }}
            className="w-full py-2.5 bg-walnut-text text-linen-bg hover:bg-walnut-text/90 rounded-xl font-semibold text-xs transition-all shadow-md cursor-pointer"
          >
            I Understand, Return to Game
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
}
