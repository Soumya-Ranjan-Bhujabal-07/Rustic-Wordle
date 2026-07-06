/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Lightbulb, 
  Wifi, 
  Check, 
  X, 
  BookOpen, 
  AlertCircle,
  Settings,
  GraduationCap,
  Lock,
  Layers,
  Calendar,
  Sun,
  Moon
} from 'lucide-react';

import { PlayerStats, GameState, VocabularyWord } from './types';
import { getWordForLevel, getKeyboardKeyStatuses } from './utils/WordEngine';
import { soundEngine } from './utils/AudioSynth';
import GameBoard from './components/GameBoard';
import VirtualKeyboard from './components/VirtualKeyboard';
import StatsModal from './components/StatsModal';
import LevelSelectorModal from './components/LevelSelectorModal';
import DefinitionReveal from './components/DefinitionReveal';
import EarthyConfetti from './components/EarthyConfetti';
import { VALID_GUESS_SET_BY_LENGTH } from './data/vocabulary';

// Daily Puzzle helpers
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailyLevelNumber(): number {
  const dateStr = getTodayDateString();
  
  // Deterministic seed hashing
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Level is selected deterministically between 1 and 10000 (covers all lengths)
  const level = Math.abs(hash % 10000) + 1;
  return level;
}

// Initial stats template
const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  masteredWords: [],
  levelMilestones: []
};

export default function App() {
  // Game Setup & Level Progress
  const [levelNumber, setLevelNumber] = useState<number>(() => {
    const saved = localStorage.getItem('rustic_wordle_current_level');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [maxUnlockedLevels, setMaxUnlockedLevels] = useState<{ [key: number]: number }>(() => {
    const saved = localStorage.getItem('rustic_wordle_max_unlocked_levels');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          4: Math.max(1, parsed[4] || 1),
          5: Math.max(2001, parsed[5] || 2001),
          6: Math.max(6001, parsed[6] || 6001),
          7: Math.max(8501, parsed[7] || 8501)
        };
      } catch (e) {
        // Ignore and fall back
      }
    }
    
    // Migration helper for existing users
    const oldMax = localStorage.getItem('rustic_wordle_max_unlocked_level');
    const oldMaxNum = oldMax ? parseInt(oldMax, 10) : 1;
    return {
      4: Math.max(1, oldMaxNum >= 1 ? Math.min(oldMaxNum, 2000) : 1),
      5: Math.max(2001, oldMaxNum >= 2001 ? Math.min(oldMaxNum, 6000) : 2001),
      6: Math.max(6001, oldMaxNum >= 6001 ? Math.min(oldMaxNum, 8500) : 6001),
      7: Math.max(8501, oldMaxNum >= 8501 ? Math.min(oldMaxNum, 10000) : 8501)
    };
  });

  const [showLevelSelector, setShowLevelSelector] = useState<boolean>(false);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('rustic_wordle_sound_enabled');
    return saved !== 'false';
  });

  const [strictValidation, setStrictValidation] = useState<boolean>(() => {
    const saved = localStorage.getItem('rustic_wordle_strict_validation');
    return saved !== 'false';
  });

  const [statsByLength, setStatsByLength] = useState<{ [key: number]: PlayerStats }>(() => {
    const saved = localStorage.getItem('rustic_wordle_player_stats_by_length');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const result: { [key: number]: PlayerStats } = {};
        for (const len of [4, 5, 6, 7]) {
          result[len] = {
            ...DEFAULT_STATS,
            ...(parsed[len] || {})
          };
        }
        return result;
      } catch (e) {
        // Fall through
      }
    }

    // Try migration from old singular stats
    const oldSaved = localStorage.getItem('rustic_wordle_player_stats');
    if (oldSaved) {
      try {
        const parsed = JSON.parse(oldSaved);
        const result: { [key: number]: PlayerStats } = {};
        for (const len of [4, 5, 6, 7]) {
          result[len] = {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            maxStreak: 0,
            guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
            masteredWords: [],
            levelMilestones: []
          };
        }

        if (Array.isArray(parsed.masteredWords)) {
          parsed.masteredWords.forEach((word: string) => {
            const wLen = word.length;
            if (wLen >= 4 && wLen <= 7) {
              result[wLen].masteredWords.push(word);
            } else {
              result[5].masteredWords.push(word);
            }
          });
        }

        const targetLen = 5;
        result[targetLen].gamesPlayed = parsed.gamesPlayed || 0;
        result[targetLen].gamesWon = parsed.gamesWon || 0;
        result[targetLen].currentStreak = parsed.currentStreak || 0;
        result[targetLen].maxStreak = parsed.maxStreak || 0;
        result[targetLen].guessDistribution = parsed.guessDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        result[targetLen].levelMilestones = parsed.levelMilestones || [];

        localStorage.setItem('rustic_wordle_player_stats_by_length', JSON.stringify(result));
        return result;
      } catch (e) {
        // Fall through
      }
    }

    const initial: { [key: number]: PlayerStats } = {};
    for (const len of [4, 5, 6, 7]) {
      initial[len] = {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
        masteredWords: [],
        levelMilestones: []
      };
    }
    return initial;
  });

  const [isValidating, setIsValidating] = useState<boolean>(false);

  const [isDailyMode, setIsDailyMode] = useState<boolean>(() => {
    return localStorage.getItem('rustic_wordle_mode') === 'daily';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('rustic_wordle_dark_mode') === 'true';
  });

  // Dark Mode Sync Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('rustic_wordle_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Active Level State
  const [gameState, setGameState] = useState<GameState>(() => {
    const wordData = getWordForLevel(1); // will be re-set in useEffect, but serves as baseline
    return {
      levelNumber: 1,
      wordLength: wordData.word.length,
      targetWord: wordData.word,
      definition: wordData.definition,
      phonetic: wordData.phonetic,
      partOfSpeech: wordData.partOfSpeech,
      guesses: [],
      currentGuess: '',
      gameStatus: 'IN_PROGRESS',
      showStats: false,
      showDefinition: false,
      hintUsed: false,
      errorShakeRowIndex: null
    };
  });

  // Dialog Overlays
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [hintDrawerOpen, setHintDrawerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync sound engine toggle with user settings
  useEffect(() => {
    soundEngine.enabled = soundEnabled;
    localStorage.setItem('rustic_wordle_sound_enabled', String(soundEnabled));
  }, [soundEnabled]);

  // Sync strict validation settings
  useEffect(() => {
    localStorage.setItem('rustic_wordle_strict_validation', String(strictValidation));
  }, [strictValidation]);

  // Sync level changes to localStorage
  useEffect(() => {
    localStorage.setItem('rustic_wordle_current_level', String(levelNumber));

    // Also save as last active level for its corresponding length
    let len = 5;
    if (levelNumber <= 2000) len = 4;
    else if (levelNumber <= 6000) len = 5;
    else if (levelNumber <= 8500) len = 6;
    else len = 7;

    localStorage.setItem(`rustic_wordle_last_level_${len}`, String(levelNumber));
  }, [levelNumber]);

  // Handle custom toasts from child elements
  useEffect(() => {
    const handleCustomToast = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        triggerToast(customEvent.detail);
      }
    };
    window.addEventListener('rustic_toast', handleCustomToast);
    return () => {
      window.removeEventListener('rustic_toast', handleCustomToast);
    };
  }, []);

  // Load a level and update gameState
  const loadLevel = useCallback((levelNum: number, isDaily: boolean) => {
    const wordData = getWordForLevel(levelNum);
    
    let initialGuesses: string[] = [];
    let initialStatus: 'IN_PROGRESS' | 'WON' | 'LOST' = 'IN_PROGRESS';
    let initialHintUsed = false;
    let initialShowDefinition = false;

    if (isDaily) {
      const todayStr = getTodayDateString();
      const savedGuesses = localStorage.getItem(`rustic_wordle_daily_guesses_${todayStr}`);
      const savedStatus = localStorage.getItem(`rustic_wordle_daily_status_${todayStr}`);
      const savedHint = localStorage.getItem(`rustic_wordle_daily_hint_${todayStr}`);
      
      if (savedGuesses) {
        try {
          initialGuesses = JSON.parse(savedGuesses);
        } catch (e) {}
      }
      if (savedStatus === 'WON' || savedStatus === 'LOST' || savedStatus === 'IN_PROGRESS') {
        initialStatus = savedStatus;
        initialShowDefinition = savedStatus !== 'IN_PROGRESS';
      }
      if (savedHint === 'true') {
        initialHintUsed = true;
      }
    }

    setGameState({
      levelNumber: levelNum,
      wordLength: wordData.word.length,
      targetWord: wordData.word,
      definition: wordData.definition,
      phonetic: wordData.phonetic,
      partOfSpeech: wordData.partOfSpeech,
      guesses: initialGuesses,
      currentGuess: '',
      gameStatus: initialStatus,
      showStats: false,
      showDefinition: initialShowDefinition,
      hintUsed: initialHintUsed,
      errorShakeRowIndex: null
    });
    setHintDrawerOpen(false);
  }, []);

  // Sync level content whenever activeLevelNum or isDailyMode changes
  useEffect(() => {
    const activeLevelNum = isDailyMode ? getDailyLevelNumber() : levelNumber;
    loadLevel(activeLevelNum, isDailyMode);
  }, [levelNumber, isDailyMode, loadLevel]);

  const handleSetMode = (toDaily: boolean) => {
    soundEngine.playTick();
    setIsDailyMode(toDaily);
    localStorage.setItem('rustic_wordle_mode', toDaily ? 'daily' : 'adventure');
  };

  const handleBackToAdventure = () => {
    soundEngine.playSuccess();
    handleSetMode(false);
  };

  // Trigger brief alert messages (spelling errors, limits)
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Safe input helpers
  const handleCharInput = useCallback((char: string) => {
    if (gameState.gameStatus !== 'IN_PROGRESS') return;
    
    setGameState((prev) => {
      if (prev.currentGuess.length >= prev.wordLength) return prev;
      return {
        ...prev,
        currentGuess: prev.currentGuess + char.toLowerCase()
      };
    });
  }, [gameState.gameStatus]);

  const handleDeleteInput = useCallback(() => {
    if (gameState.gameStatus !== 'IN_PROGRESS') return;
    
    setGameState((prev) => {
      if (prev.currentGuess.length === 0) return prev;
      soundEngine.playDelete();
      return {
        ...prev,
        currentGuess: prev.currentGuess.slice(0, -1)
      };
    });
  }, [gameState.gameStatus]);

  const handleEnterInput = useCallback(async () => {
    if (gameState.gameStatus !== 'IN_PROGRESS' || isValidating) return;

    const { currentGuess, wordLength, targetWord, guesses } = gameState;

    if (currentGuess.length < wordLength) {
      soundEngine.playError();
      setGameState((prev) => ({ ...prev, errorShakeRowIndex: guesses.length }));
      triggerToast('Incomplete tile alignment');
      setTimeout(() => {
        setGameState((prev) => ({ ...prev, errorShakeRowIndex: null }));
      }, 500);
      return;
    }

    // Check against vocabulary set if strict validation is active
    if (strictValidation) {
      const lowerGuess = currentGuess.toLowerCase();
      let isValid = VALID_GUESS_SET_BY_LENGTH[wordLength]?.has(lowerGuess);
      
      if (!isValid && lowerGuess === targetWord.toLowerCase()) {
        isValid = true;
      }

      // If not in local thematic list, check via dictionary API with local cache
      if (!isValid) {
        const cached = localStorage.getItem(`validated_word_${lowerGuess}`);
        if (cached === 'true') {
          isValid = true;
        } else if (cached === 'false') {
          isValid = false;
        } else {
          setIsValidating(true);
          try {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${lowerGuess}`);
            if (res.status === 200) {
              localStorage.setItem(`validated_word_${lowerGuess}`, 'true');
              isValid = true;
            } else if (res.status === 404) {
              localStorage.setItem(`validated_word_${lowerGuess}`, 'false');
              isValid = false;
            } else {
              // Rate limit, API down, or other error: fallback to true so we don't block the user
              isValid = true;
            }
          } catch (e) {
            // Offline or network error: fallback to true so we don't block the user
            isValid = true;
          } finally {
            setIsValidating(false);
          }
        }
      }

      if (!isValid) {
        soundEngine.playError();
        setGameState((prev) => ({ ...prev, errorShakeRowIndex: guesses.length }));
        triggerToast('Not in curated natural dictionary');
        setTimeout(() => {
          setGameState((prev) => ({ ...prev, errorShakeRowIndex: null }));
        }, 500);
        return;
      }
    }

    // Process valid guess submission
    const isCorrect = currentGuess === targetWord.toLowerCase();
    const updatedGuesses = [...guesses, currentGuess];
    const nextStatus = isCorrect 
      ? 'WON' 
      : updatedGuesses.length >= 6 
        ? 'LOST' 
        : 'IN_PROGRESS';

    setGameState((prev) => {
      const updatedState = {
        ...prev,
        guesses: updatedGuesses,
        currentGuess: '',
        gameStatus: nextStatus,
        showDefinition: nextStatus !== 'IN_PROGRESS'
      };

      if (isDailyMode) {
        const todayStr = getTodayDateString();
        localStorage.setItem(`rustic_wordle_daily_guesses_${todayStr}`, JSON.stringify(updatedGuesses));
        localStorage.setItem(`rustic_wordle_daily_status_${todayStr}`, nextStatus);
        localStorage.setItem(`rustic_wordle_daily_hint_${todayStr}`, String(prev.hintUsed));
        if (nextStatus === 'WON') {
          localStorage.setItem(`rustic_wordle_daily_solved_${todayStr}`, 'true');
        }
      }

      return updatedState;
    });

    // Trigger acoustic and stats changes based on final outcome
    if (nextStatus === 'WON') {
      setTimeout(() => {
        soundEngine.playSuccess();
      }, wordLength * 150 + 200);

      // Save statistics segmented by length
      setStatsByLength((prev) => {
        const len = wordLength;
        const currentLenStats = prev[len] || {
          gamesPlayed: 0,
          gamesWon: 0,
          currentStreak: 0,
          maxStreak: 0,
          guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
          masteredWords: [],
          levelMilestones: []
        };

        const guessCount = updatedGuesses.length;
        const newDistribution = { ...currentLenStats.guessDistribution };
        newDistribution[guessCount] = (newDistribution[guessCount] || 0) + 1;

        const newStreak = currentLenStats.currentStreak + 1;
        const newMaxStreak = Math.max(currentLenStats.maxStreak, newStreak);
        
        const newMastered = currentLenStats.masteredWords.includes(targetWord)
          ? currentLenStats.masteredWords
          : [...currentLenStats.masteredWords, targetWord];

        const updated = {
          ...prev,
          [len]: {
            ...currentLenStats,
            gamesPlayed: currentLenStats.gamesPlayed + 1,
            gamesWon: currentLenStats.gamesWon + 1,
            currentStreak: newStreak,
            maxStreak: newMaxStreak,
            guessDistribution: newDistribution,
            masteredWords: newMastered
          }
        };
        localStorage.setItem('rustic_wordle_player_stats_by_length', JSON.stringify(updated));
        return updated;
      });

      // Also advance the highest unlocked level sequentially for the active word length
      if (!isDailyMode) {
        setMaxUnlockedLevels((prev) => {
          let lenKey: 4 | 5 | 6 | 7 = 5;
          if (levelNumber <= 2000) lenKey = 4;
          else if (levelNumber <= 6000) lenKey = 5;
          else if (levelNumber <= 8500) lenKey = 6;
          else lenKey = 7;

          const maxLimit = lenKey === 4 ? 2000 : lenKey === 5 ? 6000 : lenKey === 6 ? 8500 : 10000;
          const currentMax = prev[lenKey] || (lenKey === 4 ? 1 : lenKey === 5 ? 2001 : lenKey === 6 ? 6001 : 8501);
          const nextLevel = Math.min(maxLimit, Math.max(currentMax, levelNumber + 1));

          const updated = {
            ...prev,
            [lenKey]: nextLevel
          };
          localStorage.setItem('rustic_wordle_max_unlocked_levels', JSON.stringify(updated));
          return updated;
        });
      }

    } else if (nextStatus === 'LOST') {
      setTimeout(() => {
        soundEngine.playFailure();
      }, wordLength * 150 + 200);

      setStatsByLength((prev) => {
        const len = wordLength;
        const currentLenStats = prev[len] || {
          gamesPlayed: 0,
          gamesWon: 0,
          currentStreak: 0,
          maxStreak: 0,
          guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
          masteredWords: [],
          levelMilestones: []
        };

        const updated = {
          ...prev,
          [len]: {
            ...currentLenStats,
            gamesPlayed: currentLenStats.gamesPlayed + 1,
            currentStreak: 0
          }
        };
        localStorage.setItem('rustic_wordle_player_stats_by_length', JSON.stringify(updated));
        return updated;
      });
    } else {
      // Normal staggered key flipping sounds
      for (let i = 0; i < wordLength; i++) {
        setTimeout(() => {
          soundEngine.playTick();
        }, i * 150);
      }
    }

  }, [gameState, strictValidation, isValidating, levelNumber]);

  // Handle desktop physical keyboard layout
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      
      // If any modal is open, ignore game board typing
      if (showHelp || showSettings || gameState.showStats) return;

      const key = e.key;
      if (key === 'Enter') {
        handleEnterInput();
      } else if (key === 'Backspace') {
        handleDeleteInput();
      } else if (/^[a-zA-Z]$/.test(key)) {
        handleCharInput(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    handleCharInput, 
    handleDeleteInput, 
    handleEnterInput, 
    showHelp, 
    showSettings, 
    gameState.showStats
  ]);

  const handleNextLevel = () => {
    if (gameState.gameStatus === 'WON') {
      setLevelNumber((prev) => prev + 1);
    } else {
      // Re-evaluate level if they lost
      loadLevel(levelNumber);
    }
  };

  const resetStats = () => {
    const initial: { [key: number]: PlayerStats } = {};
    for (const len of [4, 5, 6, 7]) {
      initial[len] = {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
        masteredWords: [],
        levelMilestones: []
      };
    }
    setStatsByLength(initial);
    localStorage.setItem('rustic_wordle_player_stats_by_length', JSON.stringify(initial));
    localStorage.removeItem('rustic_wordle_player_stats');

    const initialLevels = { 4: 1, 5: 2001, 6: 6001, 7: 8501 };
    setMaxUnlockedLevels(initialLevels);
    localStorage.setItem('rustic_wordle_max_unlocked_levels', JSON.stringify(initialLevels));
    localStorage.removeItem('rustic_wordle_max_unlocked_level');
    localStorage.removeItem('rustic_wordle_last_level_4');
    localStorage.removeItem('rustic_wordle_last_level_5');
    localStorage.removeItem('rustic_wordle_last_level_6');
    localStorage.removeItem('rustic_wordle_last_level_7');
    setLevelNumber(1);
    loadLevel(1, isDailyMode);
  };

  const handleSelectWordLength = (len: number) => {
    soundEngine.playTick();
    // Find level range
    let targetMin = 1;
    let targetMax = 2000;
    if (len === 4) {
      targetMin = 1;
      targetMax = 2000;
    } else if (len === 5) {
      targetMin = 2001;
      targetMax = 6000;
    } else if (len === 6) {
      targetMin = 6001;
      targetMax = 8500;
    } else if (len === 7) {
      targetMin = 8501;
      targetMax = 10000;
    }

    // If current level is already in range, do nothing
    if (levelNumber >= targetMin && levelNumber <= targetMax) {
      const currentDisplayVal = levelNumber - (len === 4 ? 0 : len === 5 ? 2000 : len === 6 ? 6000 : 8500);
      triggerToast(`Already playing ${len}-letter words (Level ${currentDisplayVal})`);
      return;
    }

    // Find the last active level of this length
    const savedLastKey = `rustic_wordle_last_level_${len}`;
    const savedLast = localStorage.getItem(savedLastKey);
    let targetLevel = savedLast ? parseInt(savedLast, 10) : targetMin;

    // Get max unlocked level for this length
    const maxUnlockedForLen = maxUnlockedLevels[len] || targetMin;

    // Make sure targetLevel is <= maxUnlockedForLen and in range
    if (targetLevel > maxUnlockedForLen) {
      targetLevel = maxUnlockedForLen;
    }
    if (targetLevel < targetMin || targetLevel > targetMax) {
      targetLevel = targetMin;
    }

    const displayLevelVal = targetLevel - (len === 4 ? 0 : len === 5 ? 2000 : len === 6 ? 6000 : 8500);

    setLevelNumber(targetLevel);
    triggerToast(`Switched to ${len}-letter mode: Level ${displayLevelVal}`);
  };

  // Key matching map for Virtual Keyboard styling
  const keyStatuses = getKeyboardKeyStatuses(gameState.guesses, gameState.targetWord);

  // Helper to obscure the target word in hints to prevent spoiler letters
  const getObscuredDefinition = () => {
    const wordRegex = new RegExp(gameState.targetWord, 'gi');
    return gameState.definition.replace(wordRegex, '______');
  };

  const handleToggleHint = () => {
    soundEngine.playReveal();
    setHintDrawerOpen(!hintDrawerOpen);
    if (!gameState.hintUsed) {
      setGameState(prev => ({ ...prev, hintUsed: true }));
    }
  };

  const displayLevel = levelNumber - (gameState.wordLength === 4 ? 0 : gameState.wordLength === 5 ? 2000 : gameState.wordLength === 6 ? 6000 : 8500);

  const todayStr = getTodayDateString();
  const isTodaySolved = localStorage.getItem(`rustic_wordle_daily_solved_${todayStr}`) === 'true';

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-linen-bg text-walnut-text selection:bg-moss-correct/10 selection:text-moss-correct font-sans transition-colors duration-300">
      
      {/* Earthy Falling Petals win animation */}
      {gameState.gameStatus === 'WON' && <EarthyConfetti />}

      {/* Upper Navigation Rail */}
      <header className="border-b border-clay-border/50 py-3 px-4 bg-linen-card/40 backdrop-blur-xs sticky top-0 z-35 shadow-xs transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo & Level Track */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-moss-correct font-sans uppercase">
                {isDailyMode ? "Daily Rustic Puzzle" : "Rustic Wordle"}
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-walnut-muted uppercase flex items-center gap-1.5">
                {isDailyMode ? (
                  <>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Today's Word • {gameState.wordLength} Letters
                  </>
                ) : (
                  <>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-moss-correct animate-pulse" />
                    Level {displayLevel} • {gameState.wordLength} Letters
                  </>
                )}
              </span>
            </div>
            {isDailyMode && isTodaySolved && (
              <span className="hidden sm:flex bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest animate-bounce">
                🎉 Today's Solved
              </span>
            )}
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Theme Toggle (Dark/Light) */}
            <button
              onClick={() => { soundEngine.playTick(); setIsDarkMode(!isDarkMode); }}
              className="p-2.5 rounded-xl border border-clay-border/40 bg-clay-empty/50 hover:bg-clay-empty text-walnut-text transition-all hover:scale-105 cursor-pointer"
              title={isDarkMode ? 'Switch to Light Wood theme' : 'Switch to Grayish Slate theme'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-walnut-muted" />}
            </button>

            {/* Hint Light */}
            <button
              onClick={handleToggleHint}
              className={`p-2.5 rounded-xl border transition-all relative cursor-pointer ${
                hintDrawerOpen 
                  ? 'bg-amber-100 text-amber-800 border-amber-300' 
                  : 'bg-clay-empty/50 hover:bg-clay-empty text-walnut-text border-clay-border/40 hover:scale-105'
              }`}
              title="Reveal botanical definition hint"
            >
              <Lightbulb className="w-4 h-4" />
              {!gameState.hintUsed && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
              )}
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl border border-clay-border/40 bg-clay-empty/50 hover:bg-clay-empty text-walnut-text transition-all hover:scale-105 cursor-pointer"
              title={soundEnabled ? 'Mute woodblock ticks' : 'Unmute tactile feedback'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-moss-correct" /> : <VolumeX className="w-4 h-4 text-walnut-muted" />}
            </button>

            {/* Help / Rules */}
            <button
              onClick={() => { soundEngine.playReveal(); setShowHelp(true); }}
              className="p-2.5 rounded-xl border border-clay-border/40 bg-clay-empty/50 hover:bg-clay-empty text-walnut-text transition-all hover:scale-105 cursor-pointer"
              title="How to play instructions"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Stats Dashboard */}
            <button
              onClick={() => { soundEngine.playReveal(); setGameState(prev => ({ ...prev, showStats: true })); }}
              className="p-2.5 rounded-xl border border-clay-border/40 bg-clay-empty/50 hover:bg-clay-empty text-walnut-text transition-all hover:scale-105 cursor-pointer"
              title="View progression records"
            >
              <Trophy className="w-4 h-4 text-ochre-present" />
            </button>

            {/* Level Map Selector */}
            <button
              onClick={() => { soundEngine.playReveal(); setShowLevelSelector(true); }}
              className="p-2.5 rounded-xl border border-clay-border/40 bg-clay-empty/50 hover:bg-clay-empty text-walnut-text transition-all hover:scale-105 cursor-pointer"
              title="Check levels map"
            >
              <Layers className="w-4 h-4 text-moss-correct" />
            </button>

            {/* Settings Menu */}
            <button
              onClick={() => { soundEngine.playReveal(); setShowSettings(true); }}
              className="p-2.5 rounded-xl border border-clay-border/40 bg-clay-empty/50 hover:bg-clay-empty text-walnut-text transition-all hover:scale-105 cursor-pointer"
              title="Configure parameters"
            >
              <Settings className="w-4 h-4 text-walnut-muted" />
            </button>
          </div>

        </div>
      </header>

      {/* Interactive Clue Dropdown */}
      {hintDrawerOpen && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900/40 py-3.5 px-4 animate-fade-in-up">
          <div className="max-w-md mx-auto flex gap-3 items-start">
            <BookOpen className="w-5 h-5 text-amber-700 dark:text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800 dark:text-amber-400">
                Linguistic Riddle Clue
              </span>
              <p className="font-serif italic text-sm text-walnut-text/90 leading-relaxed mt-1">
                "{getObscuredDefinition()}"
              </p>
              <span className="text-[10px] font-mono text-amber-700/80 dark:text-amber-500/80 block mt-1.5 uppercase font-medium">
                Part of Speech: {gameState.partOfSpeech}
              </span>
            </div>
            <button 
              onClick={() => setHintDrawerOpen(false)}
              className="text-amber-800/60 hover:text-amber-900 hover:bg-amber-100 dark:hover:bg-amber-950/40 p-1 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Gameplay Screen Area */}
      <main className="flex-1 flex flex-col justify-center items-center py-4 px-2">
        <div className="w-full max-w-lg flex flex-col justify-center h-full">
          
          {/* Mode Selector Tab Bar */}
          <div className="flex justify-center mb-4 shrink-0">
            <div className="bg-linen-card/65 p-1 rounded-xl border border-clay-border/40 flex gap-1">
              <button
                onClick={() => handleSetMode(false)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  !isDailyMode 
                    ? 'bg-moss-correct text-linen-bg shadow-xs font-bold' 
                    : 'text-walnut-muted hover:text-walnut-text'
                }`}
              >
                Adventure Mode
              </button>
              <button
                onClick={() => handleSetMode(true)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  isDailyMode 
                    ? 'bg-moss-correct text-linen-bg shadow-xs font-bold' 
                    : 'text-walnut-muted hover:text-walnut-text'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Daily Puzzle
              </button>
            </div>
          </div>

          {isDailyMode ? (
            /* Daily Challenge Date Panel */
            <div className="flex items-center justify-between px-4 py-2.5 mb-5 bg-linen-card/65 border border-clay-border/40 rounded-2xl shrink-0 max-w-sm mx-auto w-full animate-fade-in-up">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono font-extrabold uppercase tracking-wider text-walnut-muted">
                  Today's Challenge
                </span>
                <span className="text-xs font-bold font-serif text-walnut-text">
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              {isTodaySolved ? (
                <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                  🏆 Solved
                </span>
              ) : (
                <span className="bg-clay-empty/40 border border-clay-border/60 text-[10px] font-bold text-walnut-muted px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                  Unsolved
                </span>
              )}
            </div>
          ) : (
            /* Quick Word Length Selector & Level Browser */
            <div className="flex items-center justify-between px-2 mb-5 bg-linen-card/65 border border-clay-border/40 p-2 rounded-2xl shrink-0 max-w-sm mx-auto w-full animate-fade-in-up">
              <span className="text-[10px] font-mono font-bold tracking-wider text-walnut-muted uppercase pl-2">
                Length:
              </span>
              <div className="flex items-center gap-1">
                {[4, 5, 6, 7].map((len) => {
                  const isActive = gameState.wordLength === len;

                  return (
                    <button
                      key={len}
                      onClick={() => handleSelectWordLength(len)}
                      className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all border cursor-pointer flex items-center gap-1 ${
                        isActive
                          ? 'bg-moss-correct text-linen-bg border-moss-correct'
                          : 'bg-linen-bg text-walnut-text border-clay-border/60 hover:bg-clay-empty/40'
                      }`}
                      title={`Switch to ${len}-letter words`}
                    >
                      {len}L
                    </button>
                  );
                })}
                <div className="w-[1px] h-4 bg-clay-border/60 mx-1.5" />
                <button
                  onClick={() => { soundEngine.playReveal(); setShowLevelSelector(true); }}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-walnut-text text-linen-bg hover:bg-walnut-text/95 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Browse and select levels"
                >
                  <Layers className="w-3 h-3" />
                  Levels
                </button>
              </div>
            </div>
          )}

          {/* Celebratory Banner */}
          {isDailyMode && isTodaySolved && (
            <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3 text-center mb-4 animate-fade-in-up">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
                🎉 You Solved Today's Puzzle!
              </span>
              <p className="text-[11px] text-walnut-muted mt-0.5">
                Come back tomorrow for another date-seeded linguistic riddle challenge.
              </p>
            </div>
          )}

          {/* Earthy Board Grid */}
          <GameBoard
            guesses={gameState.guesses}
            currentGuess={gameState.currentGuess}
            wordLength={gameState.wordLength}
            targetWord={gameState.targetWord}
            gameStatus={gameState.gameStatus}
            errorShakeRowIndex={gameState.errorShakeRowIndex}
          />

          {/* Definition Reveal Panel */}
          {gameState.showDefinition && (
            <DefinitionReveal
              word={gameState.targetWord}
              definition={gameState.definition}
              phonetic={gameState.phonetic}
              partOfSpeech={gameState.partOfSpeech}
              gameStatus={gameState.gameStatus === 'WON' ? 'WON' : 'LOST'}
              levelNumber={gameState.levelNumber}
              onNextLevel={handleNextLevel}
              hintUsed={gameState.hintUsed}
              isDaily={isDailyMode}
              onBackToAdventure={handleBackToAdventure}
            />
          )}

        </div>
      </main>

      {/* Virtual Tactile QWERTY Keyboard */}
      <footer className="bg-linen-card/35 border-t border-clay-border/30 pt-3 pb-6 px-2 shrink-0">
        <div className="max-w-lg mx-auto flex flex-col gap-3">
          
          {/* Static Offline Indicator and Progress Bar */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-walnut-muted px-2">
            <div className="flex items-center gap-1 text-moss-correct bg-moss-correct/10 px-2 py-0.5 rounded-full font-mono uppercase">
              <Wifi className="w-3 h-3 text-moss-correct" />
              Offline Safe Active
            </div>
            <div className="flex items-center gap-1 uppercase tracking-wider font-mono">
              Progression: {Math.round((levelNumber / 10000) * 100)}% ({levelNumber}/10000)
            </div>
          </div>

          <VirtualKeyboard
            onChar={handleCharInput}
            onDelete={handleDeleteInput}
            onEnter={handleEnterInput}
            keyStatuses={keyStatuses}
          />
        </div>
      </footer>

      {/* Custom Floating Alerts (Toasts) */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-walnut-text text-linen-bg text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xl border border-clay-border flex items-center gap-2 animate-fade-in-up">
          <AlertCircle className="w-4 h-4 text-ochre-present" />
          {toastMessage}
        </div>
      )}

      {/* Dialog: Zen Stat Analytics */}
      <StatsModal
        isOpen={gameState.showStats}
        onClose={() => setGameState(prev => ({ ...prev, showStats: false }))}
        statsByLength={statsByLength}
        onResetStats={resetStats}
        currentLevel={levelNumber}
        activeWordLength={gameState.wordLength}
      />

      {/* Dialog: How To Play Guidelines */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fade-in-up">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-linen-bg border border-clay-border shadow-2xl p-6 text-walnut-text flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-clay-border/60 pb-3 mb-4 shrink-0">
              <h2 className="text-lg font-bold font-sans text-moss-correct flex items-center gap-1.5">
                <GraduationCap className="w-5 h-5 text-moss-correct" />
                How to Play - Game Rules & Mechanics
              </h2>
              <button 
                onClick={() => { soundEngine.playTick(); setShowHelp(false); }}
                className="p-1 rounded-full hover:bg-clay-empty/50 transition-colors text-walnut-muted hover:text-walnut-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 text-sm leading-relaxed text-walnut-text/90 scrollbar-thin scrollbar-thumb-clay-border">
              
              <p className="text-xs text-walnut-muted italic">
                At its core, a game of Wordle is a blend of code-breaking (like the classic board game Mastermind) and a crossword puzzle. The objective is simple: guess a secret hidden word in six attempts or less.
              </p>

              {/* 1. The Setup */}
              <div className="space-y-1.5">
                <h3 className="font-semibold text-xs text-walnut-muted uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-moss-correct" /> 1. The Setup
                </h3>
                <ul className="list-disc pl-5 text-xs space-y-1">
                  <li><strong>The Target:</strong> The game selects a secret word. In this custom version, progress advances sequentially from <strong>4 to 7 letters</strong> as you conquer levels!</li>
                  <li><strong>The Grid:</strong> You are presented with an empty grid that is 4 to 7 columns wide (based on word length) and 6 rows deep (representing your 6 attempts).</li>
                </ul>
              </div>

              {/* 2. The Guessing Phase */}
              <div className="space-y-1.5">
                <h3 className="font-semibold text-xs text-walnut-muted uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-moss-correct" /> 2. The Guessing Phase
                </h3>
                <p className="text-xs">
                  To make a guess, type in a valid word using either your physical keyboard or the virtual keyboard, and press <strong>Enter</strong>. 
                  You cannot submit random strings of letters like <code className="bg-clay-empty/40 px-1 py-0.5 rounded font-mono text-[11px]">"AEEEE"</code>. 
                  The game checks your input against a comprehensive built-in dictionary to ensure it is a real, scannable word.
                </p>
              </div>

              {/* 3. The Color-Coded Feedback */}
              <div className="space-y-2 border-t border-b border-clay-border/40 py-3 my-2">
                <h3 className="font-semibold text-xs text-walnut-muted uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-moss-correct" /> 3. Color-Coded Feedback
                </h3>
                <p className="text-xs mb-2">
                  Once you submit your guess, each letter tile flips to reveal one of three colors. Use this tactile feedback to narrow down the secret word:
                </p>
                
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-moss-correct text-linen-bg flex items-center justify-center font-bold text-sm shrink-0">S</div>
                    <div>
                      <span className="text-xs font-semibold text-moss-correct block">Correct Letter, Correct Spot (Green)</span>
                      <span className="text-xs text-walnut-muted">Keep this letter exactly where it is in your next guess.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-ochre-present text-linen-bg flex items-center justify-center font-bold text-sm shrink-0">O</div>
                    <div>
                      <span className="text-xs font-semibold text-ochre-present block">Correct Letter, Wrong Spot (Yellow)</span>
                      <span className="text-xs text-walnut-muted">The letter is in the word, but you need to try it in a different position.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-ash-absent text-linen-bg flex items-center justify-center font-bold text-sm shrink-0">N</div>
                    <div>
                      <span className="text-xs font-semibold text-walnut-muted block">Wrong Letter Entirely (Gray)</span>
                      <span className="text-xs text-walnut-muted">The letter does not exist anywhere in the secret word. Avoid using it again.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Winning or Losing */}
              <div className="space-y-1.5">
                <h3 className="font-semibold text-xs text-walnut-muted uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-moss-correct" /> 4. Winning or Losing
                </h3>
                <p className="text-xs">
                  <strong>Winning:</strong> If you guess the exact configuration, all tiles flash green! The game ends, you unlock the next stage, and your stats (like your current win streak) are updated.
                  <br />
                  <strong>Losing:</strong> If you run out of all 6 guesses, the game reveals the secret word alongside its definition, and your win streak resets.
                </p>
              </div>

              {/* 5. A Common Trap: Deceptive Clues */}
              <div className="bg-walnut-text/[0.03] rounded-xl p-3 border border-clay-border/30 space-y-1.5">
                <span className="text-xs font-bold uppercase text-walnut-text flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-ochre-present" />
                  A Common Trap: Deceptive Clues
                </span>
                <p className="text-xs text-walnut-muted leading-relaxed">
                  One nuance that often trips up new players is <strong>duplicate letters</strong>.
                  <br />
                  If the secret word is <strong className="text-walnut-text font-mono">ROBOT</strong> (which has two O's), and you guess <strong className="text-walnut-text font-mono font-medium">BOBBY</strong>:
                </p>
                <ul className="list-disc pl-5 text-xs text-walnut-muted space-y-1 font-mono">
                  <li>The first <strong className="text-ochre-present">B</strong> will turn <strong className="text-ochre-present">Yellow</strong> (because 'B' is in ROBOT, just not at the start).</li>
                  <li>The second <strong className="text-walnut-muted">B</strong> will turn <strong className="text-walnut-muted">Gray</strong> (because there isn't a second 'B' in ROBOT).</li>
                </ul>
                <p className="text-xs text-walnut-muted">
                  The game is smart enough to only light up the exact number of letters present in the secret word, ensuring you don't chase ghosts!
                </p>
              </div>

              {/* 6. Definitions & Hints */}
              <div className="bg-linen-card/50 rounded-xl p-3 border border-clay-border/40">
                <span className="text-xs font-bold uppercase text-amber-800 flex items-center gap-1 mb-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Riddle hints
                </span>
                <p className="text-xs text-walnut-muted">
                  Stuck? Use the <strong>bulb button</strong> to reveal the dictionary definition of the word. The target word is censored inside the clue to preserve structural complexity!
                </p>
              </div>

            </div>

            {/* Modal footer button */}
            <div className="pt-4 border-t border-clay-border/50 shrink-0">
              <button
                onClick={() => { soundEngine.playTick(); setShowHelp(false); }}
                className="w-full py-2.5 font-semibold text-sm rounded-xl bg-moss-correct text-linen-bg hover:bg-moss-correct/90 shadow-sm transition-all cursor-pointer"
              >
                Begin Journey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Game Settings */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fade-in-up">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-linen-bg border border-clay-border shadow-2xl p-6 text-walnut-text">
            <div className="flex items-center justify-between border-b border-clay-border/60 pb-3 mb-5">
              <h2 className="text-lg font-bold font-sans">Settings & Customization</h2>
              <button 
                onClick={() => { soundEngine.playTick(); setShowSettings(false); }}
                className="p-1 rounded-full hover:bg-clay-empty/50 transition-colors text-walnut-muted hover:text-walnut-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              {/* Sound Option */}
              <div className="flex items-center justify-between py-2 border-b border-clay-border/30">
                <div>
                  <div className="font-semibold">Tactile Soundscapes</div>
                  <div className="text-xs text-walnut-muted">Organic wooden tick/chime synthesizers</div>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-11 h-6 rounded-full transition-all relative outline-none cursor-pointer ${
                    soundEnabled ? 'bg-moss-correct' : 'bg-clay-empty'
                  }`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-all ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Word List strictness Option */}
              <div className="flex items-center justify-between py-2 border-b border-clay-border/30">
                <div>
                  <div className="font-semibold">Dictionary Validation</div>
                  <div className="text-xs text-walnut-muted">Verify guesses against standard English dictionaries</div>
                </div>
                <button
                  onClick={() => setStrictValidation(!strictValidation)}
                  className={`w-11 h-6 rounded-full transition-all relative outline-none cursor-pointer ${
                    strictValidation ? 'bg-moss-correct' : 'bg-clay-empty'
                  }`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-all ${
                    strictValidation ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Dev/Level Jump Utility */}
              <div className="py-2">
                <div className="font-semibold mb-1">Stage Selection ({gameState.wordLength} Letters)</div>
                <div className="text-[11px] text-walnut-muted mb-2">
                  Furthest Unlocked: Level {maxUnlockedLevels[gameState.wordLength] - (gameState.wordLength === 4 ? 0 : gameState.wordLength === 5 ? 2000 : gameState.wordLength === 6 ? 6000 : 8500)}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={maxUnlockedLevels[gameState.wordLength] - (gameState.wordLength === 4 ? 0 : gameState.wordLength === 5 ? 2000 : gameState.wordLength === 6 ? 6000 : 8500)}
                    value={levelNumber - (gameState.wordLength === 4 ? 0 : gameState.wordLength === 5 ? 2000 : gameState.wordLength === 6 ? 6000 : 8500)}
                    onChange={(e) => {
                      const base = gameState.wordLength === 4 ? 0 : gameState.wordLength === 5 ? 2000 : gameState.wordLength === 6 ? 6000 : 8500;
                      const maxUnlockedForLen = maxUnlockedLevels[gameState.wordLength] || (base + 1);
                      const displayMaxUnlocked = maxUnlockedForLen - base;
                      const val = parseInt(e.target.value, 10);
                      
                      if (val >= 1 && val <= displayMaxUnlocked) {
                        setLevelNumber(val + base);
                      } else if (val > displayMaxUnlocked) {
                        triggerToast(`Stage ${val} is locked. Complete level ${displayMaxUnlocked} to unlock!`);
                        soundEngine.playError();
                      }
                    }}
                    className="w-24 bg-linen-card/60 border border-clay-border/80 rounded-lg px-2.5 py-1.5 font-mono text-center text-sm font-semibold text-walnut-text"
                  />
                  <span className="text-xs text-walnut-muted">Sequence Lock Active</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { soundEngine.playTick(); setShowSettings(false); }}
              className="w-full mt-6 py-2.5 font-semibold text-sm rounded-xl bg-walnut-text text-linen-bg hover:bg-walnut-text/90 shadow-sm transition-all cursor-pointer"
            >
              Apply Config
            </button>
          </div>
        </div>
      )}

      {/* Dialog: Level Selector Map */}
      <LevelSelectorModal
        isOpen={showLevelSelector}
        onClose={() => setShowLevelSelector(false)}
        currentLevel={levelNumber}
        maxUnlockedLevels={maxUnlockedLevels}
        onSelectLevel={(levelNum) => setLevelNumber(levelNum)}
      />

    </div>
  );
}
