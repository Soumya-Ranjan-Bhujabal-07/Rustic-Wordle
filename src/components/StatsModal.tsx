/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlayerStats } from '../types';
import { Award, RotateCcw, X, GraduationCap, Trophy, Flame, BookOpen, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { soundEngine } from '../utils/AudioSynth';
import { VOCABULARY } from '../data/vocabulary';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statsByLength: { [key: number]: PlayerStats };
  onResetStats: () => void;
  currentLevel: number;
  activeWordLength: number;
}

function findWordInVocabulary(word: string) {
  const lower = word.toLowerCase();
  for (const len of [4, 5, 6, 7] as const) {
    const list = VOCABULARY[len];
    if (list) {
      const found = list.find((v) => v.word.toLowerCase() === lower);
      if (found) return found;
    }
  }
  return null;
}

export default function StatsModal({
  isOpen,
  onClose,
  statsByLength,
  onResetStats,
  currentLevel,
  activeWordLength
}: StatsModalProps) {
  const [selectedLength, setSelectedLength] = useState<number>(() => activeWordLength);
  const [activeTab, setActiveTab] = useState<'stats' | 'glossary'>('stats');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const stats = statsByLength[selectedLength] || {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    masteredWords: [],
    levelMilestones: []
  };

  const winPercentage = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
    : 0;

  // Find max distribution value to scale the bars
  const maxDistribution = Math.max(...Object.values(stats.guessDistribution), 1);

  const handleResetClick = () => {
    if (window.confirm('Are you sure you want to restore your stats? This will clear your streak, win history, and vocabulary list.')) {
      onResetStats();
      soundEngine.playDelete();
    }
  };

  const handleClose = () => {
    soundEngine.playTick();
    onClose();
  };

  const filteredWords = stats.masteredWords.filter(word => 
    word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs"
    >
      <motion.div 
        id="stats-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-linen-bg border border-clay-border shadow-2xl p-6 text-walnut-text flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-clay-border/60 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-ochre-present" />
            <h2 className="text-xl font-bold tracking-tight font-sans">Zen Stat Analytics</h2>
          </div>
          <button 
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-clay-empty/50 transition-colors text-walnut-muted hover:text-walnut-text cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Word Length Segmentation Selector */}
        <div className="flex gap-1 bg-clay-empty/35 dark:bg-clay-empty/15 p-1 rounded-xl mb-4 shrink-0 border border-clay-border/30">
          {([4, 5, 6, 7] as const).map((len) => {
            const isSelected = selectedLength === len;
            const count = statsByLength[len]?.masteredWords.length || 0;
            return (
              <button
                key={len}
                onClick={() => { soundEngine.playTick(); setSelectedLength(len); }}
                className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer text-center ${
                  isSelected 
                    ? 'bg-moss-correct text-linen-bg shadow-sm font-bold' 
                    : 'text-walnut-muted hover:text-walnut-text'
                }`}
              >
                {len}L <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-clay-border/30 mb-4 shrink-0">
          <button
            onClick={() => { soundEngine.playTick(); setActiveTab('stats'); }}
            className={`flex-1 pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'stats'
                ? 'border-moss-correct text-moss-correct'
                : 'border-transparent text-walnut-muted hover:text-walnut-text'
            }`}
          >
            <Award className="w-4 h-4" />
            Statistics
          </button>
          <button
            onClick={() => { soundEngine.playTick(); setActiveTab('glossary'); }}
            className={`flex-1 pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'glossary'
                ? 'border-moss-correct text-moss-correct'
                : 'border-transparent text-walnut-muted hover:text-walnut-text'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Glossary ({stats.masteredWords.length})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1.5 space-y-4 scrollbar-thin scrollbar-thumb-clay-border">
          {activeTab === 'stats' ? (
            <>
              {/* Level Progression Indicator */}
              <div className="bg-linen-card border border-clay-border/50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold tracking-wider uppercase text-walnut-muted">
                    {selectedLength === activeWordLength ? 'Active Journey' : `${selectedLength}-Letter Journey`}
                  </div>
                  <div className="text-lg font-bold text-moss-correct">
                    {selectedLength === activeWordLength 
                      ? `Level ${currentLevel - (selectedLength === 4 ? 0 : selectedLength === 5 ? 2000 : selectedLength === 6 ? 6000 : 8500)}` 
                      : `Progress Track`
                    }
                  </div>
                </div>
                <div className="flex gap-1.5 items-center text-xs bg-moss-correct/10 text-moss-correct font-medium px-2.5 py-1 rounded-full border border-moss-correct/15">
                  <GraduationCap className="w-4 h-4" />
                  {stats.masteredWords.length} Mastered
                </div>
              </div>

              {/* Core Stats Grid */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-linen-card/70 border border-clay-border/30 rounded-xl p-3">
                  <div className="text-2xl font-bold text-walnut-text">{stats.gamesPlayed}</div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-walnut-muted">Played</div>
                </div>
                <div className="bg-linen-card/70 border border-clay-border/30 rounded-xl p-3">
                  <div className="text-2xl font-bold text-moss-correct">{winPercentage}%</div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-walnut-muted">Win %</div>
                </div>
                <div className="bg-linen-card/70 border border-clay-border/30 rounded-xl p-3 flex flex-col justify-center items-center">
                  <div className="flex items-center gap-0.5 text-2xl font-bold text-ochre-present">
                    <Flame className="w-4 h-4 text-ochre-present fill-ochre-present/20" />
                    {stats.currentStreak}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-walnut-muted">Streak</div>
                </div>
                <div className="bg-linen-card/70 border border-clay-border/30 rounded-xl p-3">
                  <div className="text-2xl font-bold text-walnut-text">{stats.maxStreak}</div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-walnut-muted">Max Streak</div>
                </div>
              </div>

              {/* Guess Distribution */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-walnut-muted mb-2.5 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Guess Distribution
                </h3>
                <div className="space-y-1.5 font-mono text-xs">
                  {[1, 2, 3, 4, 5, 6].map((guessNum) => {
                    const count = stats.guessDistribution[guessNum] || 0;
                    const percent = maxDistribution > 0 ? (count / maxDistribution) * 100 : 0;
                    return (
                      <div key={guessNum} className="flex items-center gap-2">
                        <span className="w-3 text-right font-semibold text-walnut-muted">{guessNum}</span>
                        <div className="flex-1 bg-clay-empty/40 rounded-sm h-5 overflow-hidden">
                          <div 
                            style={{ width: `${Math.max(percent, 6)}%` }}
                            className={`h-full flex items-center justify-end pr-2 rounded-sm transition-all duration-500 ${
                              count > 0 ? 'bg-moss-correct text-linen-bg font-bold' : 'bg-clay-empty/80 text-walnut-muted'
                            }`}
                          >
                            {count}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mastered Vocabulary words preview list */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-walnut-muted mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  Mastered Words ({stats.masteredWords.length})
                </h3>
                {stats.masteredWords.length === 0 ? (
                  <div className="text-xs italic text-walnut-muted bg-linen-card/40 rounded-lg p-3 text-center border border-dashed border-clay-border">
                    Solve levels to grow your natural lexicon.
                  </div>
                ) : (
                  <div className="max-h-24 overflow-y-auto bg-linen-card/60 border border-clay-border/50 rounded-xl p-2 flex flex-wrap gap-1.5">
                    {stats.masteredWords.map((word) => (
                      <span 
                        key={word}
                        className="text-xs font-medium px-2 py-0.5 rounded bg-moss-correct/10 text-moss-correct border border-moss-correct/20 capitalize"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Glossary Search Field */}
              <div className="relative flex items-center shrink-0">
                <Search className="absolute left-3 w-4 h-4 text-walnut-muted" />
                <input
                  type="text"
                  placeholder="Search mastered vocabulary..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-linen-card/70 border border-clay-border/60 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-hidden focus:border-moss-correct/80 transition-all font-sans text-walnut-text placeholder:text-walnut-muted/65"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-walnut-muted hover:text-walnut-text"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Glossary List */}
              <div className="space-y-2.5">
                {filteredWords.length === 0 ? (
                  <div className="text-xs italic text-walnut-muted bg-linen-card/40 rounded-lg p-6 text-center border border-dashed border-clay-border">
                    {searchQuery ? 'No matching words found.' : 'You haven\'t mastered any words yet! Solve levels to add them to your glossary.'}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {filteredWords.map((word) => {
                      const details = findWordInVocabulary(word);
                      return (
                        <div 
                          key={word} 
                          className="bg-linen-card/85 border border-clay-border/40 rounded-xl p-3.5 space-y-1 hover:border-moss-correct/30 hover:bg-linen-card transition-all"
                        >
                          <div className="flex items-baseline justify-between gap-2 flex-wrap">
                            <span className="font-bold text-moss-correct text-sm capitalize">{word}</span>
                            {details && (
                              <span className="text-[10px] text-walnut-muted font-mono bg-clay-empty/30 px-1.5 py-0.5 rounded capitalize">
                                {details.partOfSpeech} {details.phonetic}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-walnut-text/90 italic font-serif leading-relaxed mt-1">
                            {details ? `"${details.definition}"` : 'Definition successfully cataloged.'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Reset / Action Buttons */}
        <div className="flex items-center justify-between border-t border-clay-border/40 pt-3 mt-1 shrink-0">
          <button
            onClick={handleResetClick}
            className="flex items-center gap-1.5 text-xs text-walnut-muted hover:text-red-700 dark:hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Record
          </button>
          
          <button
            onClick={handleClose}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-walnut-text text-linen-bg hover:bg-walnut-text/90 shadow-sm transition-all cursor-pointer"
          >
            Continue Journey
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
