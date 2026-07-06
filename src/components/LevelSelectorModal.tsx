/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Lock, 
  Unlock, 
  Check, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Sparkles 
} from 'lucide-react';
import { motion } from 'motion/react';
import { soundEngine } from '../utils/AudioSynth';

interface LevelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
  maxUnlockedLevels: { [key: number]: number };
  onSelectLevel: (levelNum: number) => void;
}

export default function LevelSelectorModal({
  isOpen,
  onClose,
  currentLevel,
  maxUnlockedLevels,
  onSelectLevel
}: LevelSelectorModalProps) {
  // Tabs for word lengths
  // 4 Letters: 1 - 2000
  // 5 Letters: 2001 - 6000
  // 6 Letters: 6001 - 8500
  // 7 Letters: 8501 - 10000
  const tabs = useMemo(() => [
    { id: '4', label: '4 Letters', min: 1, max: 2000, base: 0 },
    { id: '5', label: '5 Letters', min: 2001, max: 6000, base: 2000 },
    { id: '6', label: '6 Letters', min: 6001, max: 8500, base: 6000 },
    { id: '7', label: '7 Letters', min: 8501, max: 10000, base: 8500 }
  ], []);

  // Determine current active tab based on current level
  const initialTabId = useMemo(() => {
    if (currentLevel <= 2000) return '4';
    if (currentLevel <= 6000) return '5';
    if (currentLevel <= 8500) return '6';
    return '7';
  }, [currentLevel]);

  const [activeTabId, setActiveTabId] = useState<string>(initialTabId);

  // Pagination page for level grid
  // We will display levels in pages of 40 for clean grid layouts (e.g. 8x5 grid)
  const pageSize = 40;
  
  const currentTab = useMemo(() => {
    return tabs.find(t => t.id === activeTabId) || tabs[0];
  }, [activeTabId, tabs]);

  // Track page inside the active tab
  // We want to default to the page containing the current level, or the highest unlocked level in this tab
  const getInitialPage = () => {
    const tabLen = parseInt(activeTabId, 10);
    const tabMaxUnlocked = maxUnlockedLevels[tabLen] || currentTab.min;
    const levelToFind = Math.min(tabMaxUnlocked, currentTab.max);
    const offset = Math.max(0, levelToFind - currentTab.min);
    return Math.floor(offset / pageSize);
  };

  const [page, setPage] = useState<number>(getInitialPage);

  // Sync page when tab changes
  React.useEffect(() => {
    // Reset page to show the current level or highest unlocked level in the new tab
    const tabLen = parseInt(activeTabId, 10);
    const tabMaxUnlocked = maxUnlockedLevels[tabLen] || currentTab.min;
    const levelToFind = Math.min(tabMaxUnlocked, currentTab.max);
    const offset = Math.max(0, levelToFind - currentTab.min);
    setPage(Math.floor(offset / pageSize));
  }, [activeTabId, currentTab, maxUnlockedLevels]);

  if (!isOpen) return null;

  // Calculate total pages for current tab
  const totalLevelsInTab = currentTab.max - currentTab.min + 1;
  const totalPages = Math.ceil(totalLevelsInTab / pageSize);

  // Generate levels to display on current page
  const startLevelNum = currentTab.min + page * pageSize;
  const endLevelNum = Math.min(startLevelNum + pageSize - 1, currentTab.max);
  
  const levelsToDisplay = [];
  for (let l = startLevelNum; l <= endLevelNum; l++) {
    levelsToDisplay.push(l);
  }

  const handleLevelClick = (levelNum: number) => {
    const tabLen = parseInt(activeTabId, 10);
    const tabMaxUnlocked = maxUnlockedLevels[tabLen] || currentTab.min;
    if (levelNum > tabMaxUnlocked) {
      soundEngine.playError();
      return;
    }
    soundEngine.playReveal();
    onSelectLevel(levelNum);
    onClose();
  };

  const handleTabChange = (tabId: string) => {
    soundEngine.playTick();
    setActiveTabId(tabId);
  };

  const handleClose = () => {
    soundEngine.playTick();
    onClose();
  };

  const activeTabLen = parseInt(activeTabId, 10);
  const currentTabMaxUnlocked = maxUnlockedLevels[activeTabLen] || currentTab.min;
  const currentTabMaxUnlockedDisplay = currentTabMaxUnlocked - currentTab.base;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs"
    >
      <motion.div 
        id="level-selector-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-linen-bg border border-clay-border shadow-2xl p-6 text-walnut-text flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-clay-border/60 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-moss-correct" />
            <h2 className="text-xl font-bold tracking-tight font-sans">Level Progression Map</h2>
          </div>
          <button 
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-clay-empty/50 transition-colors text-walnut-muted hover:text-walnut-text cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-linen-card border border-clay-border/40 rounded-xl p-3.5 mb-4 shrink-0 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-moss-correct/10 text-moss-correct shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-walnut-muted">Progression Rule</div>
            <p className="text-xs text-walnut-text/90 mt-0.5">
              Levels must be conquered sequentially. Future levels are locked until you successfully complete all previous levels. Your highest unlocked stage is <strong className="text-moss-correct">Level {currentTabMaxUnlockedDisplay}</strong> for this category.
            </p>
          </div>
        </div>

        {/* Word Length Tabs */}
        <div className="flex border-b border-clay-border/30 gap-1 mb-4 shrink-0 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const tabLength = parseInt(tab.id, 10);
            const tabMaxUnlocked = maxUnlockedLevels[tabLength] || tab.min;
            const isTabUnlocked = tabMaxUnlocked >= tab.min;
            const isCurrentTab = activeTabId === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-t border-x cursor-pointer shrink-0 ${
                  isCurrentTab 
                    ? 'bg-linen-bg border-clay-border text-moss-correct font-bold shadow-xs' 
                    : 'bg-clay-empty/20 border-transparent text-walnut-muted hover:text-walnut-text hover:bg-clay-empty/40'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {tab.label}
                  {tabMaxUnlocked === tab.min && (
                    <span className="text-[9px] bg-moss-correct/20 text-moss-correct px-1 rounded-sm font-bold font-mono">NEW</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Level Grid Area */}
        <div className="flex-1 overflow-y-auto min-h-[220px] px-1 py-1">
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
            {levelsToDisplay.map((levelNum) => {
              const isLocked = levelNum > currentTabMaxUnlocked;
              const isActive = levelNum === currentLevel;
              const isCompleted = levelNum < currentTabMaxUnlocked;
              const displayLevelNum = levelNum - currentTab.base;

              return (
                <button
                  key={levelNum}
                  onClick={() => handleLevelClick(levelNum)}
                  disabled={isLocked}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg border text-center transition-all ${
                    isLocked
                      ? 'bg-clay-empty/35 border-clay-border/30 text-walnut-muted/45 cursor-not-allowed'
                      : isActive
                        ? 'bg-moss-correct text-linen-bg border-moss-correct font-bold scale-105 ring-2 ring-moss-correct/30 ring-offset-1'
                        : isCompleted
                          ? 'bg-moss-correct/10 hover:bg-moss-correct/20 text-moss-correct border-moss-correct/20 hover:border-moss-correct/30'
                          : 'bg-linen-card hover:bg-clay-empty text-walnut-text border-clay-border/80'
                  } relative overflow-hidden group cursor-pointer`}
                >
                  <span className="text-xs font-mono font-semibold">{displayLevelNum}</span>
                  
                  {/* Small icons for status */}
                  <div className="absolute bottom-1 right-1">
                    {isLocked && <Lock className="w-2.5 h-2.5 text-walnut-muted/40" />}
                    {isCompleted && !isActive && <Check className="w-2.5 h-2.5 text-moss-correct/70" />}
                    {isActive && <Play className="w-2.5 h-2.5 text-linen-bg fill-linen-bg" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pagination & Status Bar */}
        <div className="border-t border-clay-border/50 pt-4 mt-4 shrink-0 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-walnut-muted font-mono font-medium">
            Showing Level {startLevelNum - currentTab.base} - {endLevelNum - currentTab.base} of {currentTab.max - currentTab.base}
          </div>

          {/* Page controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => { soundEngine.playTick(); setPage(p => Math.max(0, p - 1)); }}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-clay-border/60 hover:bg-clay-empty disabled:opacity-35 disabled:hover:bg-transparent text-walnut-text cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-2 text-walnut-muted">
              Page {page + 1} / {totalPages || 1}
            </span>
            <button
              onClick={() => { soundEngine.playTick(); setPage(p => Math.min(totalPages - 1, p + 1)); }}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border border-clay-border/60 hover:bg-clay-empty disabled:opacity-35 disabled:hover:bg-transparent text-walnut-text cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Jump to highest unlocked */}
          <button
            onClick={() => {
              soundEngine.playTick();
              const offset = currentTabMaxUnlocked - currentTab.min;
              setPage(Math.floor(offset / pageSize));
              
              triggerToast(`Jumped to highest unlocked Level ${currentTabMaxUnlockedDisplay} of ${currentTab.label}`);
              handleLevelClick(currentTabMaxUnlocked);
            }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-walnut-text text-linen-bg hover:bg-walnut-text/90 transition-all flex items-center gap-1 cursor-pointer"
          >
            Jump to Furthest
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Simple Toast Helper inside component to ensure toast communication works cleanly
function triggerToast(msg: string) {
  const event = new CustomEvent('rustic_toast', { detail: msg });
  window.dispatchEvent(event);
}
