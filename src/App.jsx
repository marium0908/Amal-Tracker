import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Flame,
  History,
  Check,
  BookOpen,
  Edit2,
  PlusCircle,
  RotateCcw,
  Calendar,
  Layers,
  Heart,
  X,
  Download,
  Upload,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Award,
  BookOpenCheck,
  HelpCircle,
  Maximize2
} from 'lucide-react';
import { playClickSound, playSuccessSound } from './utils/audio';
import { DEFAULT_AMALS } from './data/defaultAmals';

// Helper to get local date string YYYY-MM-DD
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate full days array for month display
function getCalendarMonthDays(year, month) {
  const result = [];
  
  // First day of target month
  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
  
  // Days in current month
  const totalDays = new Date(year, month + 1, 0).getDate();
  
  // Days in previous month
  const prevMonthTotalDays = new Date(year, month, 0).getDate();
  
  // Padding from previous month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    // previous month's actual year and month are handled safely
    const prevMonthDate = new Date(year, month - 1, dayNum);
    result.push({
      dateStr: getLocalDateString(prevMonthDate),
      dayNum,
      isCurrentMonth: false
    });
  }
  
  // Current month days
  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    const d = new Date(year, month, dayNum);
    result.push({
      dateStr: getLocalDateString(d),
      dayNum,
      isCurrentMonth: true
    });
  }
  
  // Padding from next month to fit a 7x grid
  const remainingCells = result.length % 7;
  if (remainingCells > 0) {
    const nextDaysNeeded = 7 - remainingCells;
    for (let dayNum = 1; dayNum <= nextDaysNeeded; dayNum++) {
      const nextMonthDate = new Date(year, month + 1, dayNum);
      result.push({
        dateStr: getLocalDateString(nextMonthDate),
        dayNum,
        isCurrentMonth: false
      });
    }
  }
  
  return result;
}

// Beautiful hand-drawn style custom 5-petal Cherry Blossom (Sakura) Icon matching the user's provided reference
function CherryBlossomIcon({ className = "w-5 h-5", title }) {
  // A custom 5-petal cherry blossom (sakura) shape with notches on petal tips
  const petalPath = "M 50 50 C 31 38, 26 21, 39 8 C 43 6, 47 10, 50 14 C 53 10, 57 6, 61 8 C 74 21, 69 38, 50 50 Z";
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`${className} inline-block`}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {title && <title>{title}</title>}
      <g stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="#FFAAA6">
        <path d={petalPath} />
        <path d={petalPath} transform="rotate(72 50 50)" />
        <path d={petalPath} transform="rotate(144 50 50)" />
        <path d={petalPath} transform="rotate(216 50 50)" />
        <path d={petalPath} transform="rotate(288 50 50)" />
      </g>
      <circle 
        cx="50" 
        cy="50" 
        r="11" 
        fill="white" 
        stroke="currentColor" 
        strokeWidth="6" 
      />
    </svg>
  );
}

// Aesthetic, less colorful category icon aligned with the website theme
function CategoryIcon({ category, className = "w-5 h-5" }) {
  const cat = category.toLowerCase();
  if (cat.includes('quran') || cat.includes('surah')) {
    return <BookOpen className={`${className} text-espresso stroke-[2.5]`} />;
  }
  if (cat.includes('custom')) {
    return <PlusCircle className={`${className} text-espresso stroke-[2.5]`} />;
  }
  // Custom, handcrafted, highly-aesthetic Cherry Blossom flower icon
  return (
    <CherryBlossomIcon className={`${className} text-espresso`} />
  );
}

function getCategoryStyle(category) {
  const cat = category.toLowerCase();
  
  if (cat.includes('before fajr') || cat.includes('fajr') || cat.includes('after every prayer')) {
    // Pastel Pink / Rose Theme
    return {
      bg: 'bg-pastel-rose-bg',
      border: 'border-pastel-rose-dark',
      textAccent: 'text-pastel-rose-dark',
      bgAccent: 'bg-pastel-rose/40',
      progress: 'bg-pastel-rose-dark',
      tagBg: 'bg-pastel-rose-bg text-pastel-rose-dark border border-pastel-rose/40'
    };
  } else if (cat.includes('dhuhr') || cat.includes('supplications') || cat.includes('adhkar') || cat.includes('dhikr')) {
    // Pastel Yellow Theme
    return {
      bg: 'bg-pastel-yellow-bg',
      border: 'border-pastel-yellow-dark',
      textAccent: 'text-pastel-yellow-dark',
      bgAccent: 'bg-pastel-yellow/50',
      progress: 'bg-pastel-yellow-dark',
      tagBg: 'bg-pastel-yellow-bg text-pastel-yellow-dark border border-pastel-yellow/40'
    };
  } else if (cat.includes('asr')) {
    // Pastel Blue Theme
    return {
      bg: 'bg-pastel-blue-bg',
      border: 'border-pastel-blue-dark',
      textAccent: 'text-pastel-blue-dark',
      bgAccent: 'bg-pastel-blue/50',
      progress: 'bg-pastel-blue-dark',
      tagBg: 'bg-pastel-blue-bg text-pastel-blue-dark border border-pastel-blue/40'
    };
  } else if (cat.includes('maghrib') || cat.includes('quran')) {
    // Pastel Purple / Lavender Theme
    return {
      bg: 'bg-pastel-purple-bg',
      border: 'border-pastel-purple-dark',
      textAccent: 'text-pastel-purple-dark',
      bgAccent: 'bg-pastel-purple/50',
      progress: 'bg-pastel-purple-dark',
      tagBg: 'bg-pastel-purple-bg text-pastel-purple-dark border border-pastel-purple/40'
    };
  } else {
    // Pastel Green (Sage) Theme (e.g. Isha, etc.)
    return {
      bg: 'bg-pastel-green-bg',
      border: 'border-pastel-green-dark',
      textAccent: 'text-pastel-green-dark',
      bgAccent: 'bg-pastel-green/40',
      progress: 'bg-pastel-green-dark',
      tagBg: 'bg-pastel-green-bg text-pastel-green-dark border border-pastel-green/40'
    };
  }
}

// Check if a specific Amal (ritual deed) is exempted during menstruation periods (such as formal prayers and Quran reading)
function isAmalExemptedDuringMenses(amal) {
  const titleLower = amal.title.toLowerCase();
  const categoryLower = amal.category.toLowerCase();
  
  // Dhikr, Tasbih, and Supplications (Dua) are fully permissible and encouraged during period.
  // Thus, they are NEVER exempted, allowing the user to recite and track them in each salah time slot.
  const isDhikrOrSupplication = 
    amal.unit === 'times' || 
    titleLower.includes('zikr') || 
    titleLower.includes('dhikr') || 
    titleLower.includes('supplication') || 
    titleLower.includes('dua') || 
    titleLower.includes('tasbih') ||
    titleLower.includes('istighfar') ||
    titleLower.includes('salawat') ||
    titleLower.includes('durood') ||
    titleLower.includes('subhanallah') ||
    titleLower.includes('alhamdulillah') ||
    titleLower.includes('allahu akbar') ||
    titleLower.includes('allahuakbar') ||
    titleLower.includes('lailahaillallah') ||
    titleLower.includes('la ilaha illallah') ||
    titleLower.includes('lahawla') ||
    titleLower.includes('la hawla') ||
    titleLower.includes('recite') ||
    titleLower.includes('remembrance');

  if (isDhikrOrSupplication) {
    return false;
  }
  
  // Salah categories or titles that involve ritual prayers (exempted during period)
  const isSalah = 
    amal.unit === 'completed' || 
    titleLower.includes('prayer') || 
    titleLower.includes('rakah') || 
    titleLower.includes('fard') || 
    titleLower.includes('sunnah') || 
    titleLower.includes('tahajjud') || 
    titleLower.includes('witr') ||
    ['before fajr', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].includes(categoryLower);

  // Surahs/Reading of Quran (exempted during period)
  const isSurah = 
    amal.unit === 'read' || 
    titleLower.startsWith('surah') || 
    titleLower.includes('surah');

  return isSalah || isSurah;
}

export default function App() {
  // --- STATE ---
  const [amals, setAmals] = useState(() => {
    const saved = localStorage.getItem('amal_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out Sunnah Asr to respect user request ("We only pray asr 4 rakhat fard")
          return parsed.filter(a => a.id !== 'asr-sunnah');
        }
      } catch (e) {
        return DEFAULT_AMALS.filter(a => a.id !== 'asr-sunnah');
      }
    }
    return DEFAULT_AMALS.filter(a => a.id !== 'asr-sunnah');
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('amal_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('amal_sound_enabled');
    return saved !== 'false';
  });

  // UI Modals / Controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAmal, setEditingAmal] = useState(null);
  const [showManualCountModal, setShowManualCountModal] = useState(null);
  const [manualCountInput, setManualCountInput] = useState('');
  
  // Custom form inputs
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Custom');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [formTargetCount, setFormTargetCount] = useState(100);
  const [formUnit, setFormUnit] = useState('times');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('All');
  const [activeMainTab, setActiveMainTab] = useState('checklist'); // 'checklist' or 'analytics'
  const [timelineRange, setTimelineRange] = useState(7); // 7, 14, or 30 days
  const fileInputRef = useRef(null);

  // Calendar month/year navigation state
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return d.getMonth();
  });
  const [calendarYear, setCalendarYear] = useState(() => {
    const d = new Date();
    return d.getFullYear();
  });

  // Sync calendar month/year when selectedDate changes (without causing loops)
  const lastSyncedDateRef = useRef('');
  useEffect(() => {
    if (selectedDate && selectedDate !== lastSyncedDateRef.current) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1; // 0-indexed
        if (!isNaN(y) && !isNaN(m)) {
          setCalendarMonth(m);
          setCalendarYear(y);
          lastSyncedDateRef.current = selectedDate;
        }
      }
    }
  }, [selectedDate]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('amal_list', JSON.stringify(amals));
  }, [amals]);

  useEffect(() => {
    localStorage.setItem('amal_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('amal_sound_enabled', String(soundEnabled));
  }, [soundEnabled]);

  // Handle playing click or success feedback
  const triggerFeedback = useCallback((isSuccess = false) => {
    if (!soundEnabled) return;
    if (isSuccess) {
      playSuccessSound();
    } else {
      playClickSound();
    }
  }, [soundEnabled]);

  const monthNames = useMemo(() => [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ], []);

  const handlePrevMonth = useCallback(() => {
    setCalendarMonth((prev) => {
      if (prev === 0) {
        setCalendarYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
    triggerFeedback(false);
  }, [triggerFeedback]);

  const handleNextMonth = useCallback(() => {
    setCalendarMonth((prev) => {
      if (prev === 11) {
        setCalendarYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
    triggerFeedback(false);
  }, [triggerFeedback]);

  const handleGoToToday = useCallback(() => {
    const todayStr = getLocalDateString();
    setSelectedDate(todayStr);
    triggerFeedback(true);
  }, [triggerFeedback]);

  // Current selected day's progress structure
  const currentDayProgress = useMemo(() => {
    return history[selectedDate] || {
      dateStr: selectedDate,
      completed: {},
      counts: {},
      notes: '',
      isMenstruating: false
    };
  }, [history, selectedDate]);

  // Handle toggling menstrual mode for the selected date
  const handleToggleMenstrualMode = useCallback(() => {
    setHistory((prev) => {
      const current = prev[selectedDate] || {
        dateStr: selectedDate,
        completed: {},
        counts: {},
        notes: '',
        isMenstruating: false
      };
      
      const updated = {
        ...current,
        isMenstruating: !current.isMenstruating
      };
      
      return {
        ...prev,
        [selectedDate]: updated
      };
    });
    triggerFeedback(true);
  }, [selectedDate, triggerFeedback]);

  // Get active items with category filter and search query
  const filteredAmals = useMemo(() => {
    return amals.filter((a) => {
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            a.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (selectedCategoryTab === 'All') return matchesSearch;
      if (selectedCategoryTab === 'Prayers') {
        return matchesSearch && ['Before Fajr', 'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(a.category);
      }
      if (selectedCategoryTab === 'Daily Adhkar') {
        return matchesSearch && ['Daily Supplications', 'After Every Prayer', 'Morning & Evening Adhkar'].includes(a.category);
      }
      if (selectedCategoryTab === 'Custom') {
        return matchesSearch && (a.isCustom || a.category === 'Custom');
      }
      return matchesSearch && a.category === selectedCategoryTab;
    });
  }, [amals, searchQuery, selectedCategoryTab]);

  // Unique ordered categories list for section display
  const allDisplayCategories = useMemo(() => {
    const standardOrder = [
      'Before Fajr', 'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 
      'After Every Prayer', 'Morning & Evening Adhkar', 'Daily Supplications', 'Custom'
    ];
    const activeCategories = Array.from(new Set(amals.map(a => a.category || 'Custom')));
    const ordered = [
      ...standardOrder.filter(c => activeCategories.includes(c)),
      ...activeCategories.filter(c => !standardOrder.includes(c))
    ];
    return ordered;
  }, [amals]);

  // Statistics calculation
  const totalLifetimeDeeds = useMemo(() => {
    let total = 0;
    Object.values(history).forEach((day) => {
      // Sum up checked off ones
      Object.entries(day.completed || {}).forEach(([_, checked]) => {
        if (checked) total += 1;
      });
      // Sum up numerical counts
      Object.entries(day.counts || {}).forEach(([_, count]) => {
        if (count > 0) total += count;
      });
    });
    return total;
  }, [history]);

  const activeDaysCount = useMemo(() => {
    return Object.keys(history).filter((dateStr) => {
      const progress = history[dateStr];
      if (!progress) return false;
      const hasCompletedCheckboxes = Object.values(progress.completed || {}).some(Boolean);
      const hasSomeCounts = Object.values(progress.counts || {}).some(val => val > 0);
      const isMenses = progress.isMenstruating ?? false;
      return hasCompletedCheckboxes || hasSomeCounts || isMenses;
    }).length;
  }, [history]);

  const dailyStreak = useMemo(() => {
    let streak = 0;
    let checkDate = new Date();
    while (true) {
      const dateStr = getLocalDateString(checkDate);
      const progress = history[dateStr];
      const hasCompletedCheckboxes = progress ? Object.values(progress.completed || {}).some(Boolean) : false;
      const hasSomeCounts = progress ? Object.values(progress.counts || {}).some(val => val > 0) : false;
      const isMenses = progress ? (progress.isMenstruating ?? false) : false;
      
      if (hasCompletedCheckboxes || hasSomeCounts || isMenses) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If it's today and they haven't done anything yet, check yesterday to keep streak
        if (getLocalDateString() === dateStr) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yestDateStr = getLocalDateString(checkDate);
          const yestProgress = history[yestDateStr];
          const yestCompletedCheckboxes = yestProgress ? Object.values(yestProgress.completed || {}).some(Boolean) : false;
          const yestSomeCounts = yestProgress ? Object.values(yestProgress.counts || {}).some(val => val > 0) : false;
          const yestMenses = yestProgress ? (yestProgress.isMenstruating ?? false) : false;
          
          if (yestCompletedCheckboxes || yestSomeCounts || yestMenses) {
            // Keep streak alive but don't count today yet
            continue;
          }
        }
        break;
      }
    }
    return streak;
  }, [history]);

  // Calculate day completion percentage
  const getDayCompletionPercent = useCallback((dateStr) => {
    const progress = history[dateStr];
    if (!progress) return 0;
    
    const isMenses = progress.isMenstruating ?? false;
    const activeAmals = amals.filter(a => !(isMenses && isAmalExemptedDuringMenses(a)));
    
    let totalPossible = activeAmals.length;
    if (totalPossible === 0) return 100; // Excused from all, so 100% complete!
    
    let completedCount = 0;
    activeAmals.forEach((amal) => {
      if (amal.targetCount === 1 || amal.unit !== 'times') {
        if ((progress.completed || {})[amal.id]) {
          completedCount++;
        }
      } else {
        const currentCount = (progress.counts || {})[amal.id] || 0;
        if (currentCount >= amal.targetCount) {
          completedCount++;
        } else {
          // Fractional credit
          completedCount += currentCount / amal.targetCount;
        }
      }
    });

    return Math.min(100, Math.round((completedCount / totalPossible) * 100));
  }, [amals, history]);

  // Average of daily completion percentages for all logged active days
  const consistencyPercent = useMemo(() => {
    const loggedDays = Object.keys(history);
    if (loggedDays.length === 0) return 0;
    
    let totalPercentageSum = 0;
    let activeLoggedDaysCount = 0;
    
    loggedDays.forEach((dateStr) => {
      const progress = history[dateStr];
      if (!progress) return;
      
      const hasCompletedCheckboxes = Object.values(progress.completed || {}).some(Boolean);
      const hasSomeCounts = Object.values(progress.counts || {}).some(val => val > 0);
      const hasNotes = !!progress.notes;
      const isMenses = !!progress.isMenstruating;
      
      if (hasCompletedCheckboxes || hasSomeCounts || hasNotes || isMenses) {
        totalPercentageSum += getDayCompletionPercent(dateStr);
        activeLoggedDaysCount++;
      }
    });
    
    return activeLoggedDaysCount > 0 ? Math.round(totalPercentageSum / activeLoggedDaysCount) : 0;
  }, [history, getDayCompletionPercent]);

  // Aggregate stats per Amal (lifetime leaderboards!)
  const amalLifetimeStats = useMemo(() => {
    const stats = {};
    amals.forEach((a) => {
      stats[a.id] = 0;
    });

    Object.values(history).forEach((day) => {
      Object.entries(day.completed || {}).forEach(([id, checked]) => {
        if (checked) {
          stats[id] = (stats[id] || 0) + 1;
        }
      });
      Object.entries(day.counts || {}).forEach(([id, val]) => {
        if (val > 0) {
          stats[id] = (stats[id] || 0) + val;
        }
      });
    });

    return stats;
  }, [history, amals]);

  // --- ACTIONS ---

  // Toggle completion for checkbox/binary items
  const handleToggleCheck = (amalId) => {
    const isCurrentlyCompleted = !!currentDayProgress.completed[amalId];
    const updatedCompleted = {
      ...currentDayProgress.completed,
      [amalId]: !isCurrentlyCompleted
    };

    setHistory((prev) => ({
      ...prev,
      [selectedDate]: {
        ...currentDayProgress,
        completed: updatedCompleted
      }
    }));

    triggerFeedback(!isCurrentlyCompleted);
  };

  // Adjust numeric count for Tasbih items
  const handleAdjustCount = (amalId, amount, amal) => {
    const currentCount = currentDayProgress.counts[amalId] || 0;
    const target = amal.targetCount;
    const newCount = Math.max(0, currentCount + amount);

    // If we just reached the target, play success sound
    const wasCompletedBefore = currentCount >= target;
    const isCompletedNow = newCount >= target;
    const reachedTargetJustNow = !wasCompletedBefore && isCompletedNow && target > 1;

    setHistory((prev) => ({
      ...prev,
      [selectedDate]: {
        ...currentDayProgress,
        counts: {
          ...currentDayProgress.counts,
          [amalId]: newCount
        }
      }
    }));

    triggerFeedback(reachedTargetJustNow);
  };

  // Manual input update
  const handleOpenManualInput = (amal) => {
    setManualCountInput(String(currentDayProgress.counts[amal.id] || 0));
    setShowManualCountModal(amal);
  };

  const handleSaveManualCount = () => {
    if (!showManualCountModal) return;
    const value = parseInt(manualCountInput) || 0;
    const target = showManualCountModal.targetCount;
    const currentCount = currentDayProgress.counts[showManualCountModal.id] || 0;

    const reachedTargetJustNow = currentCount < target && value >= target && target > 1;

    setHistory((prev) => ({
      ...prev,
      [selectedDate]: {
        ...currentDayProgress,
        counts: {
          ...currentDayProgress.counts,
          [showManualCountModal.id]: Math.max(0, value)
        }
      }
    }));

    triggerFeedback(reachedTargetJustNow);
    setShowManualCountModal(null);
  };

  // Save notes for the active date
  const handleSaveNotes = (val) => {
    setHistory((prev) => ({
      ...prev,
      [selectedDate]: {
        ...currentDayProgress,
        notes: val
      }
    }));
  };

  // Create or edit an Amal item
  const handleSaveAmal = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const resolvedCategory = formCategory === '__OTHER__'
      ? (customCategoryInput.trim() || 'Custom')
      : formCategory;

    if (editingAmal) {
      // Edit existing
      setAmals((prev) =>
        prev.map((a) =>
          a.id === editingAmal.id
            ? { ...a, title: formTitle.trim(), category: resolvedCategory, targetCount: formTargetCount, unit: formUnit }
            : a
        )
      );
    } else {
      // Create new
      const newAmal = {
        id: `custom-${Date.now()}`,
        title: formTitle.trim(),
        category: resolvedCategory,
        targetCount: formTargetCount,
        unit: formUnit,
        isCustom: true
      };
      setAmals((prev) => [...prev, newAmal]);
    }

    // Reset fields
    setFormTitle('');
    setFormCategory('Custom');
    setCustomCategoryInput('');
    setFormTargetCount(100);
    setFormUnit('times');
    setEditingAmal(null);
    setIsFormOpen(false);
    triggerFeedback(true);
  };

  // Delete/Remove any Amal (both custom and default amals)
  const handleDeleteAmal = (id, title) => {
    const itemName = title ? `"${title}"` : 'this Amal';
    if (confirm(`Are you sure you want to delete ${itemName} from your daily tracker? You can re-add it or restore defaults anytime.`)) {
      setAmals((prev) => prev.filter((a) => a.id !== id));
      triggerFeedback(false);
    }
  };

  // Trigger form for custom creation
  const handleOpenAddForm = () => {
    setEditingAmal(null);
    setFormTitle('');
    setFormCategory('Custom');
    setCustomCategoryInput('');
    setFormTargetCount(100);
    setFormUnit('times');
    setIsFormOpen(true);
  };

  // Trigger form for editing
  const handleOpenEditForm = (amal) => {
    setEditingAmal(amal);
    setFormTitle(amal.title);
    const standardCategories = [
      'Before Fajr', 'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 
      'After Every Prayer', 'Morning & Evening Adhkar', 'Daily Supplications', 'Custom'
    ];
    if (standardCategories.includes(amal.category)) {
      setFormCategory(amal.category);
      setCustomCategoryInput('');
    } else {
      setFormCategory('__OTHER__');
      setCustomCategoryInput(amal.category);
    }
    setFormTargetCount(amal.targetCount || (amal.unit === 'times' ? 100 : 1));
    setFormUnit(amal.unit || 'times');
    setIsFormOpen(true);
  };

  // JSON Exporter (Backup)
  const handleExportBackup = () => {
    const dataStr = JSON.stringify({
      version: '1.0',
      amals,
      history,
      soundEnabled
    }, null, 2);
    
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Amal_Tracker_Backup_${selectedDate}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // JSON Importer (Restore)
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        if (parsed && (parsed.amals || parsed.history)) {
          if (parsed.amals) setAmals(parsed.amals);
          if (parsed.history) setHistory(parsed.history);
          if (parsed.soundEnabled !== undefined) setSoundEnabled(parsed.soundEnabled);
          alert('Backup restored successfully! Your lifelong progress data is loaded.');
          triggerFeedback(true);
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        alert('Failed to parse backup file. Please ensure it is a valid backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Restore default Amals while preserving any custom Amals the user added
  const handleRestoreDefaults = () => {
    if (confirm('Restore all default Islamic prayers, surahs, and adhkar to your tracker? Any custom amals you created will be kept safe.')) {
      setAmals((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const missingDefaults = DEFAULT_AMALS.filter((a) => a.id !== 'asr-sunnah' && !existingIds.has(a.id));
        return [...prev, ...missingDefaults];
      });
      triggerFeedback(true);
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Revert all routines to standard original defaults? All custom amals will be cleared and default amals restored. (Your past tracking history will remain safe). Proceed?')) {
      setAmals(DEFAULT_AMALS.filter(a => a.id !== 'asr-sunnah'));
      triggerFeedback(true);
    }
  };

  const handleFullWipe = () => {
    if (confirm('CRITICAL WARNING: This will permanently delete ALL your history from day one till today! This action is irreversible. Are you sure you want to completely start over?')) {
      localStorage.clear();
      setAmals(DEFAULT_AMALS);
      setHistory({});
      setSelectedDate(getLocalDateString());
      alert('Application reset completely.');
    }
  };

  // Active day's progress stats
  const activeDayProgressPercent = useMemo(() => {
    return getDayCompletionPercent(selectedDate);
  }, [selectedDate, getDayCompletionPercent]);

  // Calendar days grid
  const calendarDays = useMemo(() => {
    return getCalendarMonthDays(calendarYear, calendarMonth);
  }, [calendarYear, calendarMonth]);

  // --- LIFELONG ANALYTICS INSIGHTS ---
  const sortedHistoryDates = useMemo(() => {
    return Object.keys(history)
      .filter((dateStr) => {
        const progress = history[dateStr];
        if (!progress) return false;
        const hasCompletedCheckboxes = Object.values(progress.completed || {}).some(Boolean);
        const hasSomeCounts = Object.values(progress.counts || {}).some((val) => val > 0);
        const isMenses = progress.isMenstruating ?? false;
        return hasCompletedCheckboxes || hasSomeCounts || isMenses;
      })
      .sort();
  }, [history]);

  const trackingFirstDate = useMemo(() => {
    if (sortedHistoryDates.length === 0) return getLocalDateString();
    return sortedHistoryDates[0];
  }, [sortedHistoryDates]);

  const trackingDurationDays = useMemo(() => {
    if (sortedHistoryDates.length === 0) return 1;
    const first = new Date(trackingFirstDate + 'T00:00:00');
    const today = new Date(getLocalDateString() + 'T00:00:00');
    const diffTime = Math.abs(today - first);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [trackingFirstDate]);

  const averageDailyCompletionActive = useMemo(() => {
    const activeNonMensesDates = sortedHistoryDates.filter(d => !history[d]?.isMenstruating);
    if (activeNonMensesDates.length === 0) return 0;
    let sum = 0;
    activeNonMensesDates.forEach((dateStr) => {
      sum += getDayCompletionPercent(dateStr);
    });
    return Math.round(sum / activeNonMensesDates.length);
  }, [sortedHistoryDates, history, getDayCompletionPercent]);

  const averageDailyCompletionOverall = useMemo(() => {
    if (sortedHistoryDates.length === 0) return 0;
    const totalDays = trackingDurationDays;
    let sum = 0;
    let countedDays = 0;
    
    const firstStr = trackingFirstDate;
    const firstDate = new Date(firstStr + 'T00:00:00');
    
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(firstDate);
      d.setDate(firstDate.getDate() + i);
      const dateStr = getLocalDateString(d);
      
      const progress = history[dateStr];
      if (progress && progress.isMenstruating) {
        continue;
      }
      
      sum += getDayCompletionPercent(dateStr);
      countedDays++;
    }
    
    if (countedDays === 0) return 0;
    return Math.round(sum / countedDays);
  }, [trackingDurationDays, trackingFirstDate, history, getDayCompletionPercent]);

  const chronologicalProgressList = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < timelineRange; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = getLocalDateString(d);
      
      const progress = history[dateStr];
      const percent = getDayCompletionPercent(dateStr);
      const isMenses = progress ? (progress.isMenstruating ?? false) : false;
      const hasNotes = progress ? !!progress.notes : false;
      const hasLogged = !!progress && (
        Object.values(progress.completed || {}).some(Boolean) || 
        Object.values(progress.counts || {}).some(v => v > 0) || 
        progress.isMenstruating
      );
      
      list.push({
        dateStr,
        dateObj: d,
        percent,
        isMenses,
        hasNotes,
        hasLogged
      });
    }
    return list;
  }, [timelineRange, history, getDayCompletionPercent]);

  const monthlyConsistencyBreakdown = useMemo(() => {
    const breakdown = [];
    const currentYear = new Date().getFullYear();
    
    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
      let loggedDaysCount = 0;
      let totalPercentageSum = 0;
      
      for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
        const d = new Date(currentYear, m, dayNum);
        const dateStr = getLocalDateString(d);
        const progress = history[dateStr];
        
        if (progress) {
          const hasCompletedCheckboxes = Object.values(progress.completed || {}).some(Boolean);
          const hasSomeCounts = Object.values(progress.counts || {}).some(val => val > 0);
          const isMenses = !!progress.isMenstruating;
          
          if (hasCompletedCheckboxes || hasSomeCounts || isMenses) {
            totalPercentageSum += getDayCompletionPercent(dateStr);
            loggedDaysCount++;
          }
        }
      }
      
      const avg = loggedDaysCount > 0 ? Math.round(totalPercentageSum / loggedDaysCount) : null;
      breakdown.push({
        monthIndex: m,
        monthName: monthNames[m],
        avgPercent: avg,
        loggedDays: loggedDaysCount
      });
    }
    return breakdown;
  }, [history, getDayCompletionPercent, monthNames]);

  const milestones = useMemo(() => {
    return [
      {
        id: 'novice',
        title: 'Al-Murid (The Seeker)',
        desc: 'Beginner steps — Logged 3 active tracking days of Amal.',
        unlocked: activeDaysCount >= 3,
        icon: '🌱'
      },
      {
        id: 'blossom',
        title: 'Al-Salik (The Wayfarer)',
        desc: 'Logged 7 days of beautiful daily devotion and spiritual efforts.',
        unlocked: activeDaysCount >= 7,
        icon: '🌸'
      },
      {
        id: 'fortnight',
        title: 'Al-Muttaqi (The Devout)',
        desc: 'Logged 14 days of protective spiritual mindfulness and discipline.',
        unlocked: activeDaysCount >= 14,
        icon: '📜'
      },
      {
        id: 'month',
        title: 'Al-Sadiq (The Sincere)',
        desc: 'Logged 30 days of persistent consistency in daily prayers and adhkar.',
        unlocked: activeDaysCount >= 30,
        icon: '🕌'
      },
      {
        id: 'gold',
        title: 'Al-Arif (The Gnostic)',
        desc: 'Logged 100 days of deep devotion on your lifelong spiritual companion.',
        unlocked: activeDaysCount >= 100,
        icon: '💎'
      },
      {
        id: 'perfect_day',
        title: 'Al-Muhsin (The Excellence)',
        desc: 'Achieved a fully complete 100% spiritual target day.',
        unlocked: Object.keys(history).some(dateStr => getDayCompletionPercent(dateStr) === 100),
        icon: '✨'
      }
    ];
  }, [activeDaysCount, history, getDayCompletionPercent]);

  return (
    <div className="min-h-screen bg-gingham text-espresso font-sans antialiased flex flex-col selection:bg-pastel-rose/30 selection:text-espresso">
      
      {/* --- SIMPLE HEADER --- */}
      <header className="bg-white/95 border-b-2 border-espresso sticky top-0 z-40 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-center">
          <h1 className="text-xl font-black tracking-tight text-espresso flex items-center gap-2">
            <CherryBlossomIcon className="w-5 h-5" />
            Amal Tracker
          </h1>
        </div>
      </header>

      {/* --- MAIN LAYOUT CONTAINER --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        
        {/* === LEFT/SIDEBAR COLUMN: Date & Lifelong Progress Stats === */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Section 1: Dynamic Date Navigator & Themed Month Calendar */}
          <div className="bg-white rounded-3xl p-5 border-2 border-espresso sticker-shadow flex flex-col gap-4">
            
            {/* Header with Title and Today shortcut */}
            <div className="flex items-center justify-between border-b-2 border-espresso pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pastel-rose-dark" />
                <h2 className="text-xs font-black text-espresso uppercase tracking-wider">Date Navigator</h2>
              </div>
              <button
                onClick={handleGoToToday}
                className="text-[10px] font-black px-2.5 py-1 bg-pastel-rose border-2 border-espresso text-espresso rounded-xl hover:bg-pastel-rose-dark/80 active:scale-95 transition-all uppercase tracking-wider sticker-shadow-sm"
              >
                Today
              </button>
            </div>

            {/* Selected Date Header */}
            <div className="text-center py-2 bg-pastel-rose-bg/30 rounded-2xl border-2 border-espresso">
              <span className="text-[9px] uppercase font-black text-espresso/60 tracking-widest block">Active View</span>
              <span className="text-sm font-black text-espresso mt-0.5 block">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            {/* Menstrual Mode (Period Mode) Toggle */}
            <div className="flex items-center justify-between p-3 bg-white rounded-2xl border-2 border-espresso sticker-shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs font-black text-pastel-rose-dark flex items-center gap-1.5">
                  <CherryBlossomIcon className="w-4 h-4 text-espresso" /> Period Mode
                </span>
                <span className="text-[9px] text-espresso-muted font-bold leading-tight">Exempts prayers & surahs</span>
              </div>
              <button
                onClick={handleToggleMenstrualMode}
                className={`px-4 py-2 text-xs font-black rounded-xl transition-all border-2 border-espresso active:scale-95 ${
                  currentDayProgress.isMenstruating
                    ? 'bg-pastel-rose text-espresso sticker-shadow-sm'
                    : 'bg-warm-cream/40 hover:bg-warm-cream text-espresso-muted'
                }`}
              >
                {currentDayProgress.isMenstruating ? 'ACTIVE ✿' : 'OFF'}
              </button>
            </div>

            {/* Month selector controls */}
            <div className="flex items-center justify-between gap-1 border-t-2 border-espresso pt-4">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-warm-cream border-2 border-espresso rounded-xl transition-all active:scale-95"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4 text-espresso" />
              </button>
              <span className="text-xs font-black tracking-wider uppercase text-espresso">
                {monthNames[calendarMonth]} {calendarYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-warm-cream border-2 border-espresso rounded-xl transition-all active:scale-95"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4 text-espresso" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] mt-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                <span key={idx} className="font-black text-espresso/65 uppercase py-1">{d}</span>
              ))}
              
              {calendarDays.map((cell, idx) => {
                const isSelected = cell.dateStr === selectedDate;
                const isToday = cell.dateStr === getLocalDateString();
                const progressPercentage = getDayCompletionPercent(cell.dateStr);
                const hasActivity = history[cell.dateStr] && (
                  Object.values(history[cell.dateStr].completed || {}).some(Boolean) ||
                  Object.values(history[cell.dateStr].counts || {}).some(v => v > 0) ||
                  history[cell.dateStr].isMenstruating
                );

                let dotColor = 'bg-espresso/20';
                if (history[cell.dateStr]?.isMenstruating) {
                  dotColor = 'bg-pastel-rose-dark';
                } else if (progressPercentage === 100) {
                  dotColor = 'bg-pastel-green-dark';
                } else if (progressPercentage > 50) {
                  dotColor = 'bg-pastel-blue-dark';
                } else if (progressPercentage > 0) {
                  dotColor = 'bg-pastel-yellow-dark';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDate(cell.dateStr);
                      triggerFeedback(false);
                    }}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center border-2 transition-all relative ${
                      isSelected
                        ? 'bg-pastel-rose text-espresso border-espresso scale-110 z-10 font-black shadow-sm'
                        : isToday
                        ? 'bg-pastel-rose-bg/40 border-pastel-rose-dark text-espresso font-black'
                        : cell.isCurrentMonth
                        ? 'bg-white hover:bg-warm-cream border-espresso/25 text-espresso'
                        : 'bg-warm-cream-light/35 border-transparent text-espresso-muted/40'
                    }`}
                  >
                    <span className="text-[11px] font-bold leading-none">{cell.dayNum}</span>
                    {hasActivity && (
                      <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${dotColor}`} />
                    )}
                    {isToday && !isSelected && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-pastel-rose-dark rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="border-t-2 border-espresso pt-3 flex flex-wrap gap-2 justify-center text-[9px] font-black text-espresso-muted leading-tight">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-pastel-green-dark" /> 100% Done
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-pastel-blue-dark" /> &gt;50% Done
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-pastel-rose-dark" /> Period Pause
              </span>
            </div>

          </div>

          {/* Section 2: Consistency Wheel & Stats */}
          <div className="bg-white rounded-3xl p-5 border-2 border-espresso sticker-shadow flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b-2 border-espresso pb-2">
              <TrendingUp className="w-4 h-4 text-pastel-blue-dark" />
              <h2 className="text-xs font-black text-espresso uppercase tracking-wider">Spiritual Consistency</h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Radial Progress gauge */}
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-warm-cream"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-pastel-green-dark transition-all duration-500"
                    strokeWidth="3.5"
                    strokeDasharray={`${consistencyPercent}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                  <span className="text-base font-black text-espresso">{consistencyPercent}%</span>
                  <span className="text-[8px] text-espresso-muted font-bold mt-0.5">SCORE</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-1 text-xs">
                <p className="font-bold text-espresso leading-snug">
                  Your consistency is calculated from daily targets on all active tracking days.
                </p>
                <p className="text-[10px] text-espresso-light font-bold mt-1">
                  Active Logged Days: <strong className="text-espresso font-black">{activeDaysCount} Days</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Daily Reflections / Diary Journal */}
          <div className="bg-white rounded-3xl p-5 border-2 border-espresso sticker-shadow flex flex-col gap-3">
            <div className="flex items-center justify-between border-b-2 border-espresso pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pastel-yellow-dark" />
                <h2 className="text-xs font-black text-espresso uppercase tracking-wider">Reflections & Duas</h2>
              </div>
              <span className="text-[9px] uppercase font-black text-espresso-muted">Diary Note</span>
            </div>

            <textarea
              placeholder="Write any personal prayers, dua requests, or self-accountability reflections for this active day..."
              value={currentDayProgress.notes || ''}
              onChange={(e) => handleSaveNotes(e.target.value)}
              rows={4}
              className="w-full p-3 bg-warm-cream/20 border-2 border-espresso/50 focus:border-espresso rounded-2xl text-xs text-espresso placeholder-espresso-muted/60 transition-all font-bold resize-none focus:outline-none focus:bg-white shadow-3xs"
            />
            <p className="text-[9px] text-espresso-light font-bold leading-normal text-right">
              ✿ Auto-saved to your browser storage.
            </p>
          </div>

          {/* Section 4: Maintenance, Backup, and Reset Controls */}
          <div className="bg-white rounded-3xl p-4 border-2 border-espresso sticker-shadow-sm flex flex-col gap-2.5">
            <span className="text-[10px] font-black text-espresso-muted uppercase tracking-wider block border-b-2 border-espresso pb-1">
              Data &amp; Routines Manager
            </span>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportBackup}
                className="py-1.5 px-2 bg-white hover:bg-warm-cream border-2 border-espresso rounded-xl text-[10px] font-black text-espresso transition-all flex items-center justify-center gap-1 shadow-3xs"
              >
                <Download className="w-3 h-3 text-pastel-blue-dark" />
                Export Backup
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-1.5 px-2 bg-white hover:bg-warm-cream border-2 border-espresso rounded-xl text-[10px] font-black text-espresso transition-all flex items-center justify-center gap-1 shadow-3xs"
              >
                <Upload className="w-3 h-3 text-pastel-yellow-dark" />
                Import Backup
              </button>
            </div>

            {/* Hidden file selector for Restore */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportBackup}
              accept=".json"
              className="hidden"
            />

            <div className="flex flex-col gap-1.5 mt-1 pt-1 border-t border-espresso/20">
              <button
                onClick={handleRestoreDefaults}
                className="py-1 px-2 bg-pastel-green-bg/30 hover:bg-pastel-green-bg border-2 border-espresso rounded-xl text-[9px] font-black text-espresso transition-all flex items-center justify-center gap-1 shadow-3xs cursor-pointer"
                title="Restore any deleted default amals while keeping your custom amals"
              >
                <RotateCcw className="w-3 h-3 text-pastel-green-dark" />
                Restore Default Amals
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleResetToDefault}
                  className="py-1 px-1.5 bg-white hover:bg-warm-cream border-2 border-espresso/60 hover:border-espresso rounded-xl text-[9px] font-bold text-espresso-muted hover:text-espresso transition-all cursor-pointer"
                  title="Revert all trackers strictly to default"
                >
                  Reset Routine
                </button>
                <button
                  onClick={handleFullWipe}
                  className="py-1 px-1.5 bg-white hover:bg-red-50 border-2 border-espresso/60 hover:border-red-600 rounded-xl text-[9px] font-bold text-espresso-muted hover:text-red-600 transition-all cursor-pointer"
                  title="Wipe entire data forever"
                >
                  Wipe All Progress
                </button>
              </div>
            </div>
          </div>

        </section>

        {/* === RIGHT COLUMN: Core Tracker Routine scoring === */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Day progress indicator sticker */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-espresso sticker-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black text-espresso/65 uppercase tracking-widest block">Daily Accountability Status</span>
                {selectedDate === getLocalDateString() && (
                  <span className="px-2 py-0.5 bg-pastel-rose border border-espresso text-espresso text-[9px] font-black uppercase tracking-wider rounded-lg sticker-shadow-sm">
                    Today
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black text-espresso flex items-center gap-1.5 mt-1.5">
                {activeDayProgressPercent === 100 ? (
                  <span className="text-pastel-green-dark">✿ Spiritual Goal Met!</span>
                ) : (
                  <span>Refining Your Soul ({activeDayProgressPercent}%)</span>
                )}
              </h2>
              <p className="text-[10px] text-espresso-light font-bold mt-1.5 leading-relaxed">
                <span className="font-black text-espresso mr-1.5 bg-warm-cream/45 px-1.5 py-0.5 rounded border border-espresso/10">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                {activeDayProgressPercent === 100 
                  ? (currentDayProgress.isMenstruating ? '✿ Beautiful! All active dhikr completed on this day.' : '✿ Beautiful! All spiritual tasks completed on this day.')
                  : currentDayProgress.isMenstruating
                  ? `${amals.filter(a => !isAmalExemptedDuringMenses(a) && (currentDayProgress.completed[a.id] || (currentDayProgress.counts[a.id] >= a.targetCount))).length} of ${amals.filter(a => !isAmalExemptedDuringMenses(a)).length} active Amals completed (excused from Salah & Quran).`
                  : `${amals.filter(a => currentDayProgress.completed[a.id] || (currentDayProgress.counts[a.id] >= a.targetCount)).length} of ${amals.length} Amals completed.`}
              </p>
            </div>

            {/* Giant Progress Pill */}
            <div className="w-full sm:w-48 bg-warm-cream h-7 rounded-2xl border-2 border-espresso overflow-hidden shadow-3xs relative flex items-center justify-center shrink-0">
              <div 
                style={{ width: `${activeDayProgressPercent}%` }}
                className="bg-pastel-green-dark h-full absolute left-0 transition-all duration-300 rounded-r-lg"
              />
              <span className="relative font-mono font-black text-xs text-espresso drop-shadow-sm">
                {activeDayProgressPercent}% COMPLETE
              </span>
            </div>
          </div>

          {/* Main View Tab Switcher */}
          <div className="flex border-2 border-espresso bg-white/60 rounded-2xl p-1 sticker-shadow-sm">
            <button
              onClick={() => {
                setActiveMainTab('checklist');
                triggerFeedback(false);
              }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeMainTab === 'checklist'
                  ? 'bg-pastel-rose border-2 border-espresso text-espresso font-black sticker-shadow-sm scale-[1.01] z-10 cursor-pointer'
                  : 'text-espresso-light hover:text-espresso font-bold cursor-pointer'
              }`}
            >
              <BookOpenCheck className="w-4 h-4" />
              Daily Checklist
            </button>
            <button
              onClick={() => {
                setActiveMainTab('analytics');
                triggerFeedback(true);
              }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeMainTab === 'analytics'
                  ? 'bg-pastel-rose border-2 border-espresso text-espresso font-black sticker-shadow-sm scale-[1.01] z-10 cursor-pointer'
                  : 'text-espresso-light hover:text-espresso font-bold cursor-pointer'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Lifelong Progress Insights
            </button>
          </div>

          {activeMainTab === 'checklist' ? (
            <>
              {/* Search bar and custom Amal buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border-2 border-espresso sticker-shadow-sm">
                
                <div className="relative w-full sm:max-w-xs">
                  <input
                    type="text"
                    placeholder="Search spiritual deeds..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border-2 border-espresso focus:border-espresso focus:bg-white rounded-xl text-xs text-espresso transition-all focus:outline-none font-bold placeholder-espresso-muted/75 shadow-3xs"
                  />
                  <div className="absolute left-3 top-2.5 text-espresso-muted">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Custom Amal Action Button */}
                <button
                  onClick={handleOpenAddForm}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-pastel-rose hover:bg-pastel-rose-dark border-2 border-espresso text-espresso text-xs font-black rounded-xl transition-all sticker-shadow-sm active:scale-95 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Custom Amal
                </button>
              </div>

              {/* Navigation Category Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {['All', 'Prayers', 'Daily Adhkar', 'Custom'].map((tab) => {
                  const isActive = selectedCategoryTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        setSelectedCategoryTab(tab);
                        triggerFeedback(false);
                      }}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-pastel-rose border-2 border-espresso text-espresso scale-105 font-black sticker-shadow-sm z-10'
                          : 'bg-white hover:bg-warm-cream text-espresso-light hover:text-espresso border-2 border-espresso shadow-3xs'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* AMAL SCORING LIST */}
              <div className="flex flex-col gap-6">
                
                {/* Group by category dynamically from allDisplayCategories */}
                {allDisplayCategories.map((category) => {
                  // Get amals for this category that match current filters
                  const categoryAmals = filteredAmals.filter((a) => a.category === category);

                  if (categoryAmals.length === 0) return null;

                  const style = getCategoryStyle(category);

                  return (
                    <div key={category} className="bg-white rounded-3xl border-2 border-espresso p-5 sm:p-6 sticker-shadow flex flex-col gap-4">
                      
                      {/* Category Header */}
                      <div className="flex items-center justify-between border-b-2 border-espresso pb-3">
                        <h3 className={`text-sm font-black ${style.textAccent} tracking-wider uppercase flex items-center gap-2`}>
                          <CategoryIcon category={category} className="w-5 h-5 shrink-0" />
                          {category}
                        </h3>
                        <span className="text-[10px] font-black text-espresso-muted">
                          {currentDayProgress.isMenstruating && categoryAmals.every(a => isAmalExemptedDuringMenses(a)) ? (
                            <span className="text-pastel-rose-dark font-black flex items-center gap-1">
                              <CherryBlossomIcon className="w-4 h-4 text-espresso" /> Fully Exempted
                            </span>
                          ) : (
                            <span>
                              {categoryAmals.filter((a) => {
                                if (currentDayProgress.isMenstruating && isAmalExemptedDuringMenses(a)) return false;
                                if (a.targetCount === 1 || a.unit !== 'times') {
                                  return currentDayProgress.completed[a.id];
                                }
                                return (currentDayProgress.counts[a.id] || 0) >= a.targetCount;
                              }).length} of {categoryAmals.filter(a => !(currentDayProgress.isMenstruating && isAmalExemptedDuringMenses(a))).length} Done
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Amals List Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {categoryAmals.map((amal) => {
                          const isCheckboxType = amal.targetCount === 1 || amal.unit !== 'times';
                          const isExempted = currentDayProgress.isMenstruating && isAmalExemptedDuringMenses(amal);
                          const isCompleted = !isExempted && (isCheckboxType 
                            ? !!currentDayProgress.completed[amal.id]
                            : (currentDayProgress.counts[amal.id] || 0) >= amal.targetCount);
                          
                          const numericCount = currentDayProgress.counts[amal.id] || 0;

                          return (
                            <div
                              key={amal.id}
                              className={`rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between relative overflow-hidden sticker-shadow-sm ${
                                isExempted
                                  ? 'bg-pastel-rose-bg/30 border-dashed border-pastel-rose-dark/80 opacity-95'
                                  : isCompleted
                                  ? `${style.bgAccent} border-espresso`
                                  : 'bg-white hover:bg-warm-cream-light border-espresso/60 hover:border-espresso'
                              }`}
                            >
                              
                              {/* Top Row: Info & Controls */}
                              <div className="flex items-start justify-between gap-3 mb-2 p-4 pb-0">
                                <div>
                                  <h4 className="font-black text-espresso text-xs sm:text-sm leading-tight flex items-center gap-1.5 flex-wrap">
                                    {amal.title}
                                    {amal.isCustom && (
                                      <span className="text-[8px] px-1.5 py-0.5 bg-pastel-rose-bg/70 border border-espresso/25 rounded-md text-espresso-light font-black uppercase tracking-wider">
                                        Custom
                                      </span>
                                    )}
                                    {isExempted && <CherryBlossomIcon className="w-3.5 h-3.5 text-espresso inline-block" title="Exempted during period" />}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-[10px] text-espresso-light font-black">
                                      {isExempted ? 'Excused / Paused' : `Target: ${amal.targetCount} ${amal.unit}`}
                                    </span>
                                    {!isExempted && (
                                      <button
                                        onClick={() => handleOpenEditForm(amal)}
                                        className="text-[9px] font-black text-espresso/80 hover:text-espresso bg-warm-cream hover:bg-pastel-rose/50 px-2 py-0.5 rounded-lg border border-espresso/25 transition-all cursor-pointer inline-flex items-center gap-1 active:scale-95 shadow-3xs"
                                        title="Customize recitation times or prayer time"
                                      >
                                        <Edit2 className="w-2.5 h-2.5 text-pastel-rose-dark" />
                                        <span>Customize Times</span>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Edit / Trash Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => handleOpenEditForm(amal)}
                                    className="p-1 hover:bg-warm-cream rounded-lg text-espresso-muted hover:text-espresso transition-colors cursor-pointer"
                                    title="Edit target or details"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAmal(amal.id, amal.title)}
                                    className="p-1 hover:bg-red-50 rounded-lg text-espresso-muted hover:text-red-600 transition-colors cursor-pointer"
                                    title={`Delete "${amal.title}" from routine`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Action Center per Amal type */}
                              <div className="p-4 pt-0 mt-auto">
                                {isExempted ? (
                                  <div className="mt-2 py-2 px-3 bg-pastel-rose-bg/50 border-2 border-espresso rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-black text-pastel-rose-dark uppercase tracking-wider shadow-3xs">
                                    <CherryBlossomIcon className="w-3.5 h-3.5 text-espresso" /> Period Pause — Exempted
                                  </div>
                                ) : isCheckboxType ? (
                                  <button
                                    onClick={() => handleToggleCheck(amal.id)}
                                    className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all mt-2 border-2 border-espresso sticker-shadow-sm cursor-pointer ${
                                      isCompleted
                                        ? 'bg-white text-espresso'
                                        : 'bg-warm-cream hover:bg-warm-cream-dark/60 text-espresso-light'
                                    }`}
                                  >
                                    <Check className={`w-3.5 h-3.5 stroke-[3] ${isCompleted ? style.textAccent : 'text-espresso-muted/40'}`} />
                                    {isCompleted ? 'Completed' : `Mark as done`}
                                  </button>
                                ) : (
                                  <div className="mt-3 flex flex-col gap-2">
                                    {/* Count bar */}
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-mono font-black text-espresso">
                                        {numericCount.toLocaleString()} <span className="text-[10px] text-espresso-muted font-bold">/{amal.targetCount}</span>
                                      </span>
                                      <span className="text-[10px] text-espresso-muted font-black">
                                        {Math.min(100, Math.round((numericCount / amal.targetCount) * 100))}%
                                      </span>
                                    </div>
                                    <div className="w-full bg-warm-cream h-2.5 rounded-full overflow-hidden border-2 border-espresso shadow-3xs">
                                      <div
                                        style={{ width: `${Math.min(100, (numericCount / amal.targetCount) * 100)}%` }}
                                        className={`${style.progress} h-full rounded-full transition-all duration-150`}
                                      />
                                    </div>

                                    {/* Interactive Incrementers */}
                                    <div className="grid grid-cols-5 gap-1.5 mt-1.5">
                                      <button
                                        onClick={() => handleAdjustCount(amal.id, -1, amal)}
                                        disabled={numericCount === 0}
                                        className="py-1.5 text-xs font-black text-espresso bg-white hover:bg-warm-cream border-2 border-espresso rounded-xl shadow-3xs disabled:opacity-50 transition-all hover:translate-y-[-1px] cursor-pointer"
                                      >
                                        -1
                                      </button>
                                      <button
                                        onClick={() => handleAdjustCount(amal.id, 1, amal)}
                                        className={`py-1.5 text-xs font-black text-espresso ${style.bgAccent} border-2 border-espresso rounded-xl shadow-3xs transition-all hover:translate-y-[-1px] cursor-pointer`}
                                      >
                                        +1
                                      </button>
                                      <button
                                        onClick={() => handleAdjustCount(amal.id, 10, amal)}
                                        className="py-1.5 text-xs font-black text-espresso bg-white hover:bg-warm-cream border-2 border-espresso rounded-xl shadow-3xs transition-all hover:translate-y-[-1px] cursor-pointer"
                                      >
                                        +10
                                      </button>
                                      <button
                                        onClick={() => handleAdjustCount(amal.id, 100, amal)}
                                        className="py-1.5 text-xs font-black text-espresso bg-white hover:bg-warm-cream border-2 border-espresso rounded-xl shadow-3xs transition-all hover:translate-y-[-1px] cursor-pointer"
                                      >
                                        +100
                                      </button>
                                      <button
                                        onClick={() => handleOpenManualInput(amal)}
                                        className="py-1.5 text-xs font-black text-espresso bg-white hover:bg-warm-cream border-2 border-espresso rounded-xl shadow-3xs flex items-center justify-center transition-all hover:translate-y-[-1px] cursor-pointer"
                                        title="Type exact count value"
                                      >
                                        <Maximize2 className="w-3 h-3 text-espresso-muted" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {filteredAmals.length === 0 && (
                  <div className="bg-white rounded-3xl border-2 border-espresso p-8 sm:p-12 text-center sticker-shadow">
                    <div className="w-12 h-12 bg-pastel-rose border-2 border-espresso rounded-2xl flex items-center justify-center mx-auto mb-3 sticker-shadow-sm">
                      <Plus className="w-6 h-6 text-espresso" />
                    </div>
                    {amals.length === 0 ? (
                      <>
                        <h3 className="font-black text-espresso text-base">Your Amal routine is empty</h3>
                        <p className="text-xs text-espresso-muted mt-1 font-bold max-w-sm mx-auto">
                          You have cleared all amals. You can add your own custom spiritual deeds, or restore default Islamic prayers and adhkar anytime!
                        </p>
                        <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                          <button
                            onClick={handleOpenAddForm}
                            className="px-4 py-2 bg-pastel-rose hover:bg-pastel-rose-dark border-2 border-espresso text-espresso text-xs font-black rounded-xl transition-all sticker-shadow-sm cursor-pointer"
                          >
                            + Add Custom Amal
                          </button>
                          <button
                            onClick={handleRestoreDefaults}
                            className="px-4 py-2 bg-pastel-green-bg hover:bg-pastel-green-bg/80 border-2 border-espresso text-espresso text-xs font-black rounded-xl transition-all sticker-shadow-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-pastel-green-dark" />
                            Restore Default Amals
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="font-black text-espresso">No Amals found</h3>
                        <p className="text-xs text-espresso-muted mt-1 font-bold">
                          No items matched "{searchQuery || selectedCategoryTab}". Adjust your search or filters, or add a custom deed!
                        </p>
                        <button
                          onClick={handleOpenAddForm}
                          className="mt-4 px-4 py-2 bg-pastel-rose hover:bg-pastel-rose-dark border-2 border-espresso text-espresso text-xs font-black rounded-xl transition-all sticker-shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Add Custom Amal
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-6">
              {/* LIFELONG PROGRESS ANALYTICS VIEW */}
              
              {/* Metric grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Tracking Duration */}
                <div className="bg-pastel-blue-bg/40 border-2 border-espresso rounded-3xl p-4 flex flex-col justify-between sticker-shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-espresso-light tracking-wider">Devotion Time</span>
                    <Calendar className="w-4 h-4 text-pastel-blue-dark" />
                  </div>
                  <div className="mt-4">
                    <span className="block text-2xl font-black text-espresso leading-tight">{trackingDurationDays} Days</span>
                    <span className="text-[9px] text-espresso-muted font-bold block mt-1">
                      Tracking since {new Date(trackingFirstDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Total Actions */}
                <div className="bg-pastel-green-bg/40 border-2 border-espresso rounded-3xl p-4 flex flex-col justify-between sticker-shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-espresso-light tracking-wider">Total Deeds</span>
                    <Layers className="w-4 h-4 text-pastel-green-dark" />
                  </div>
                  <div className="mt-4">
                    <span className="block text-2xl font-black text-espresso leading-tight">{totalLifetimeDeeds.toLocaleString()}</span>
                    <span className="text-[9px] text-espresso-muted font-bold block mt-1">
                      Spiritual actions recorded
                    </span>
                  </div>
                </div>

                {/* Active Days */}
                <div className="bg-pastel-rose-bg/40 border-2 border-espresso rounded-3xl p-4 flex flex-col justify-between sticker-shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-espresso-light tracking-wider">Active Logs</span>
                    <History className="w-4 h-4 text-pastel-rose-dark" />
                  </div>
                  <div className="mt-4">
                    <span className="block text-2xl font-black text-espresso leading-tight">{activeDaysCount} Days</span>
                    <span className="text-[9px] text-espresso-muted font-bold block mt-1">
                      Days with recorded activity
                    </span>
                  </div>
                </div>

                {/* Flame Streak */}
                <div className="bg-pastel-yellow-bg/55 border-2 border-espresso rounded-3xl p-4 flex flex-col justify-between sticker-shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-espresso-light tracking-wider">Active Streak</span>
                    <Flame className="w-4 h-4 text-pastel-yellow-dark fill-pastel-yellow-dark" />
                  </div>
                  <div className="mt-4">
                    <span className="block text-2xl font-black text-espresso leading-tight">{dailyStreak} Days</span>
                    <span className="text-[9px] text-espresso-muted font-bold block mt-1">
                      Consecutive active days
                    </span>
                  </div>
                </div>

                {/* Average Daily Completion */}
                <div className="bg-pastel-rose-bg/30 border-2 border-espresso rounded-3xl p-4 flex flex-col justify-between sticker-shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-espresso-light tracking-wider">Average Progress</span>
                    <TrendingUp className="w-4 h-4 text-pastel-rose-dark" />
                  </div>
                  <div className="mt-4">
                    <span className="block text-2xl font-black text-espresso leading-tight">{averageDailyCompletionOverall}%</span>
                    <span className="text-[9px] text-espresso-muted font-bold block mt-1">
                      {averageDailyCompletionActive}% avg. on active days
                    </span>
                  </div>
                </div>

              </div>

              {/* Continuous Chronological Timeline */}
              <div className="bg-white border-2 border-espresso rounded-3xl p-5 sm:p-6 sticker-shadow flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-espresso pb-3">
                  <div>
                    <h3 className="text-sm font-black text-espresso uppercase tracking-wider flex items-center gap-2">
                      <History className="w-4 h-4 text-pastel-blue-dark" />
                      Day-by-Day Journey
                    </h3>
                    <p className="text-[10px] text-espresso-light font-bold mt-0.5">Continuous logs showing day-by-day spiritual progress percentage</p>
                  </div>
                  
                  {/* Timeline range selector */}
                  <div className="flex border-2 border-espresso bg-warm-cream/20 rounded-xl p-0.5 self-start sm:self-auto shadow-3xs">
                    {[7, 14, 30].map((days) => (
                      <button
                        key={days}
                        onClick={() => {
                          setTimelineRange(days);
                          triggerFeedback(false);
                        }}
                        className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                          timelineRange === days
                            ? 'bg-pastel-rose border border-espresso text-espresso sticker-shadow-sm'
                            : 'text-espresso-light hover:text-espresso font-bold'
                        }`}
                      >
                        {days} Days
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline progress list */}
                <div className="flex flex-col gap-2 max-h-[30rem] overflow-y-auto pr-1">
                  {chronologicalProgressList.map((item, idx) => {
                    const isToday = item.dateStr === getLocalDateString();
                    const isSelected = item.dateStr === selectedDate;
                    
                    let statusLabel = "No Logs";
                    let statusBg = "bg-warm-cream/30 text-espresso-muted/60";
                    let progressBg = "bg-espresso/20";
                    
                    if (item.isMenses) {
                      statusLabel = "Period Pause ✿";
                      statusBg = "bg-pastel-rose-bg text-pastel-rose-dark border border-pastel-rose-dark/30";
                      progressBg = "bg-pastel-rose-dark";
                    } else if (item.hasLogged) {
                      if (item.percent === 100) {
                        statusLabel = "100% Met";
                        statusBg = "bg-pastel-green-bg text-pastel-green-dark border border-pastel-green-dark/30";
                        progressBg = "bg-pastel-green-dark";
                      } else if (item.percent > 75) {
                        statusLabel = "Excellent";
                        statusBg = "bg-pastel-blue-bg text-pastel-blue-dark border border-pastel-blue-dark/30";
                        progressBg = "bg-pastel-blue-dark";
                      } else if (item.percent > 40) {
                        statusLabel = "Steady";
                        statusBg = "bg-pastel-yellow-bg text-pastel-yellow-dark border border-pastel-yellow-dark/30";
                        progressBg = "bg-pastel-yellow-dark";
                      } else {
                        statusLabel = "Started";
                        statusBg = "bg-warm-cream/50 text-espresso-light border border-espresso/20";
                        progressBg = "bg-espresso/45";
                      }
                    }

                    return (
                      <div 
                        key={idx}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border-2 transition-all ${
                          isSelected 
                            ? 'bg-pastel-rose-bg/30 border-espresso scale-[1.01] shadow-3xs' 
                            : 'bg-white border-espresso/15 hover:border-espresso/40'
                        }`}
                      >
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                          {/* Date title */}
                          <div className="sm:w-40">
                            <span className="text-xs font-black text-espresso block">
                              {item.dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              {isToday && (
                                <span className="ml-2 px-1.5 py-0.5 bg-pastel-rose border border-espresso text-espresso text-[8px] font-black uppercase tracking-wider rounded-md">
                                  Today
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-espresso-muted font-bold block mt-0.5">{item.dateStr}</span>
                          </div>

                          {/* Progress Meter bar */}
                          <div className="flex-1 flex items-center gap-3">
                            <div className="flex-1 bg-warm-cream h-2.5 rounded-full overflow-hidden border border-espresso/20 relative">
                              <div 
                                style={{ width: `${item.hasLogged && !item.isMenses ? item.percent : 0}%` }}
                                className={`h-full rounded-full ${progressBg} transition-all`}
                              />
                            </div>
                            <span className="text-xs font-mono font-black text-espresso w-10 text-right shrink-0">
                              {item.isMenses ? 'Exempt' : `${item.percent}%`}
                            </span>
                          </div>
                        </div>

                        {/* Status badging and Action button */}
                        <div className="flex items-center justify-end gap-2 shrink-0">
                          {item.hasNotes && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 bg-pastel-blue-bg text-pastel-blue-dark border border-pastel-blue/30 rounded-md">
                              📝 Notes
                            </span>
                          )}
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${statusBg}`}>
                            {statusLabel}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedDate(item.dateStr);
                              setActiveMainTab('checklist');
                              triggerFeedback(true);
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-warm-cream border-2 border-espresso text-[10px] font-black text-espresso rounded-xl shadow-3xs transition-all active:scale-95 cursor-pointer"
                          >
                            Go to Day
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly breakdown metrics */}
              <div className="bg-white border-2 border-espresso rounded-3xl p-5 sm:p-6 sticker-shadow flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-black text-espresso uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-pastel-green-dark" />
                    Monthly Devotion Breakdown
                  </h3>
                  <p className="text-[10px] text-espresso-light font-bold mt-0.5">Average consistency progress recorded per calendar month of {new Date().getFullYear()}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {monthlyConsistencyBreakdown.map((month) => {
                    const hasLogs = month.avgPercent !== null;
                    const val = month.avgPercent || 0;
                    
                    let color = 'bg-pastel-rose-dark';
                    if (val > 80) color = 'bg-pastel-green-dark';
                    else if (val > 50) color = 'bg-pastel-blue-dark';
                    else if (val > 25) color = 'bg-pastel-yellow-dark';

                    return (
                      <div key={month.monthIndex} className="p-3.5 bg-warm-cream-light/30 border-2 border-espresso/15 rounded-2xl flex flex-col justify-between gap-2">
                        <div className="flex items-center justify-between text-xs font-black">
                          <span className="text-espresso">{month.monthName}</span>
                          <span className="text-espresso-muted font-bold text-[10px]">
                            {hasLogs ? `${month.loggedDays} logged days` : "No logs"}
                          </span>
                        </div>

                        {hasLogs ? (
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex-1 bg-warm-cream h-3 rounded-full overflow-hidden border border-espresso/30 relative">
                              <div 
                                style={{ width: `${val}%` }}
                                className={`h-full rounded-full ${color}`}
                              />
                            </div>
                            <span className="text-xs font-mono font-black text-espresso shrink-0 w-8 text-right">
                              {val}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-espresso-light font-bold italic mt-1 block">
                            No logs tracked in {month.monthName} yet.
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Milestone & Accomplishments section */}
              <div className="bg-white border-2 border-espresso rounded-3xl p-5 sm:p-6 sticker-shadow flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-black text-espresso uppercase tracking-wider flex items-center gap-2">
                    <CherryBlossomIcon className="w-5 h-5 text-espresso" />
                    Islamic Spiritual Stations (Al-Maqamat)
                  </h3>
                  <p className="text-[10px] text-espresso-light font-bold mt-0.5">Unlock stations of beautiful devotion on your lifelong spiritual companion</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {milestones.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 rounded-2xl border-2 flex flex-col gap-2 transition-all duration-200 sticker-shadow-sm ${
                        item.unlocked 
                          ? 'bg-pastel-yellow-bg/40 border-espresso' 
                          : 'bg-warm-cream/10 border-espresso/20 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <CherryBlossomIcon className={`w-7 h-7 text-espresso ${item.unlocked ? '' : 'grayscale opacity-35'}`} />
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          item.unlocked 
                            ? 'bg-pastel-green-bg text-pastel-green-dark border border-pastel-green-dark/30' 
                            : 'bg-warm-cream text-espresso-light/60 border border-espresso/15'
                        }`}>
                          {item.unlocked ? 'Unlocked 🌟' : 'Locked'}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-espresso leading-snug">{item.title}</h4>
                        <p className="text-[9px] text-espresso-light font-bold leading-normal mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </section>

      </main>

      {/* --- ADD / EDIT AMAL FORM MODAL --- */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-espresso/45 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border-2 border-espresso max-w-md w-full overflow-hidden relative sticker-shadow"
            >
              
              <form onSubmit={handleSaveAmal} className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b-2 border-espresso pb-3">
                  <h3 className="text-sm font-black text-espresso flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-pastel-rose-dark" />
                    <span>{editingAmal ? 'Edit Amal Definition' : 'Add Custom Routine'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="p-1 hover:bg-warm-cream rounded-lg text-espresso hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Title */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black text-espresso/80">
                      Amal Name / Supplication Title
                    </label>
                    {editingAmal && formTitle.toLowerCase().includes('times') && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formTitle.replace(/\d+\s*times/i, `${formTargetCount} times`);
                          setFormTitle(updated);
                        }}
                        className="text-[9px] font-bold text-pastel-rose-dark hover:underline cursor-pointer"
                        title="Update title with your new count"
                      >
                        Sync count into title
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SubhanAllah, Morning Azkar, Surah Yaseen"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-espresso focus:border-pastel-rose focus:outline-none rounded-xl text-xs text-espresso bg-white font-bold shadow-3xs"
                  />
                </div>

                {/* Category Selection (Recitation Time Slot) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black text-espresso/80">
                      Recitation Time / Prayer Slot
                    </label>
                    <span className="text-[10px] text-espresso-muted font-bold">When to recite</span>
                  </div>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-espresso focus:border-pastel-rose focus:outline-none rounded-xl text-xs text-espresso bg-white font-bold shadow-3xs cursor-pointer"
                  >
                    <option value="Before Fajr">Before Fajr (Tahajjud & Pre-Dawn)</option>
                    <option value="Fajr">Fajr (Dawn Prayer)</option>
                    <option value="Dhuhr">Dhuhr (Noon Prayer)</option>
                    <option value="Asr">Asr (Afternoon Prayer)</option>
                    <option value="Maghrib">Maghrib (Sunset Prayer)</option>
                    <option value="Isha">Isha (Night Prayer)</option>
                    <option value="After Every Prayer">After Every Prayer (Salah Post-Dhikr)</option>
                    <option value="Morning & Evening Adhkar">Morning & Evening Adhkar</option>
                    <option value="Daily Supplications">Daily Supplications (Throughout the day)</option>
                    <option value="Custom">Custom / General Good Deeds</option>
                    <option value="__OTHER__">+ New Custom Time Slot Name...</option>
                  </select>

                  {formCategory === '__OTHER__' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        required
                        placeholder="Type time slot name (e.g. Friday Sunnahs, Pre-Sleep Azkar)"
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-espresso focus:border-pastel-rose focus:outline-none rounded-xl text-xs text-espresso bg-warm-cream/30 font-bold shadow-3xs"
                      />
                    </div>
                  )}
                </div>

                {/* Unit / Mode selection */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black text-espresso/80">
                      Recitation Tracker Mode
                    </label>
                    <span className="text-[10px] text-espresso-muted font-bold">How to track</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'times', label: 'Tasbih Count', desc: 'Recite X times' },
                      { val: 'read', label: 'Read Checklist', desc: 'Surah / Quran' },
                      { val: 'completed', label: 'Simple Checkbox', desc: 'One-tap done' }
                    ].map((item) => {
                      const isActive = formUnit === item.val;
                      return (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => {
                            setFormUnit(item.val);
                            if (item.val === 'times' && formTargetCount <= 1) {
                              setFormTargetCount(100);
                            }
                          }}
                          className={`p-2.5 rounded-xl border-2 border-espresso text-center text-[10px] font-black leading-tight transition-all cursor-pointer ${
                            isActive
                              ? 'bg-pastel-rose text-espresso scale-105 sticker-shadow-sm font-black'
                              : 'bg-white text-espresso hover:bg-warm-cream shadow-3xs'
                          }`}
                        >
                          <div>{item.label}</div>
                          <div className="text-[8px] opacity-75 font-bold mt-0.5">{item.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Target count customization for times and read */}
                {(formUnit === 'times' || formUnit === 'read') && (
                  <div className="bg-warm-cream/30 p-3.5 rounded-2xl border-2 border-espresso/40 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-espresso">
                        Daily Recitation Target (Times)
                      </label>
                      <span className="text-[10px] font-mono font-black text-pastel-rose-dark bg-white px-2 py-0.5 rounded-md border border-espresso/20">
                        {formTargetCount} {formUnit}
                      </span>
                    </div>

                    {/* Quick Presets for beloved Islamic recitation counts */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-black text-espresso/60 uppercase tracking-wider mr-1">
                        Presets:
                      </span>
                      {[
                        { count: 1, label: '1x' },
                        { count: 3, label: '3x' },
                        { count: 7, label: '7x' },
                        { count: 33, label: '33x (Sunnah)' },
                        { count: 100, label: '100x' },
                        { count: 300, label: '300x' },
                        { count: 500, label: '500x' },
                        { count: 1000, label: '1,000x' }
                      ].map((preset) => (
                        <button
                          key={preset.count}
                          type="button"
                          onClick={() => setFormTargetCount(preset.count)}
                          className={`px-2 py-1 rounded-lg text-[9px] font-black border transition-all cursor-pointer ${
                            formTargetCount === preset.count
                              ? 'bg-pastel-rose text-espresso border-espresso sticker-shadow-3xs scale-105'
                              : 'bg-white hover:bg-warm-cream border-espresso/30 text-espresso'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div>
                      <input
                        type="number"
                        min="1"
                        max="100000"
                        placeholder="Enter any number of times to recite"
                        value={formTargetCount}
                        onChange={(e) => setFormTargetCount(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full px-4 py-2 border-2 border-espresso focus:border-pastel-rose focus:outline-none rounded-xl text-xs font-mono text-espresso bg-white font-bold shadow-3xs"
                      />
                      <p className="text-[9px] text-espresso-muted font-bold mt-1">
                        Recite this exact number of times each day on your daily tracker.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 py-2.5 bg-white hover:bg-warm-cream border-2 border-espresso text-espresso rounded-xl text-xs font-black transition-all shadow-3xs hover:translate-y-[-1px] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-pastel-rose hover:bg-pastel-rose-dark border-2 border-espresso text-espresso rounded-xl text-xs font-black transition-all sticker-shadow-sm hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
                  >
                    {editingAmal ? 'Save Changes' : 'Create Amal'}
                  </button>
                </div>

                {/* Delete button if editing an existing amal (default or custom) */}
                {editingAmal && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteAmal(editingAmal.id, editingAmal.title);
                      setIsFormOpen(false);
                      setEditingAmal(null);
                    }}
                    className="w-full py-2 bg-red-50 hover:bg-red-100 border-2 border-red-300 text-red-600 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete this Amal from tracker
                  </button>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MANUAL COUNT DIAL MODAL --- */}
      <AnimatePresence>
        {showManualCountModal && (
          <div className="fixed inset-0 bg-espresso/45 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border-2 border-espresso max-w-sm w-full p-6 relative overflow-hidden sticker-shadow"
            >
              
              <h3 className="text-sm font-black text-espresso flex items-center gap-2 mb-3">
                <PlusCircle className="w-5 h-5 text-pastel-rose-dark" />
                <span>Adjust Count Value</span>
              </h3>
              
              <p className="text-xs text-espresso-light mb-3 font-bold">
                Type the exact total count you have recited for <strong className="text-espresso">{showManualCountModal.title}</strong> today.
              </p>

              <div className="flex flex-col gap-4">
                <input
                  type="number"
                  min="0"
                  max="100000"
                  value={manualCountInput}
                  onChange={(e) => setManualCountInput(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-espresso focus:border-pastel-rose focus:outline-none rounded-xl text-center font-mono font-black text-lg text-espresso bg-white shadow-3xs"
                  autoFocus
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowManualCountModal(null)}
                    className="flex-1 py-2 bg-white hover:bg-warm-cream border-2 border-espresso text-espresso rounded-xl text-xs font-black transition-all shadow-3xs hover:translate-y-[-1px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveManualCount}
                    className="flex-1 py-2 bg-pastel-rose hover:bg-pastel-rose-dark border-2 border-espresso text-espresso rounded-xl text-xs font-black transition-all sticker-shadow-sm hover:translate-y-[-1px]"
                  >
                    Save Value
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t-2 border-espresso py-6 mt-12 text-center text-xs text-espresso-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-bold">
          <div className="flex items-center gap-2 text-espresso-light">
            <Heart className="w-3.5 h-3.5 text-pastel-rose-dark fill-pastel-rose-dark" />
            <span>Spiritual consistency is beloved to the Creator.</span>
          </div>
          <p className="text-espresso-muted">
            Amal Tracker &copy; {new Date().getFullYear()} &bull; Lifetime Spiritual Companion
          </p>
        </div>
      </footer>

    </div>
  );
}
