import { useEffect, useState } from 'react';

const STORAGE_KEY = 'kingshot-hero-shard-calculator';

// Shard requirements per tier within each star level (from kingshotdata.com)
const TIER_SHARDS: Record<number, number[]> = {
  1: [1, 1, 2, 2, 2, 2],       // 1★ tiers (total: 10)
  2: [5, 5, 5, 5, 5, 15],      // 2★ tiers (total: 40)
  3: [15, 15, 15, 15, 15, 40], // 3★ tiers (total: 115)
  4: [40, 40, 40, 40, 40, 100], // 4★ tiers (total: 300)
  5: [100, 100, 100, 100, 100, 100], // 5★ tiers (total: 600)
};

// Calculate cumulative shards needed to reach any star+tier combination
const getCumulativeShards = (star: number, tier: number): number => {
  if (star === 0) return 0;
  
  let total = 0;
  for (let s = 1; s < star; s++) {
    total += TIER_SHARDS[s].reduce((a, b) => a + b, 0);
  }
  for (let t = 0; t < tier; t++) {
    total += TIER_SHARDS[star][t];
  }
  return total;
};

export default function HeroShardCalculator() {
  const [currentStar, setCurrentStar] = useState(0);
  const [currentTier, setCurrentTier] = useState(0);
  const [targetStar, setTargetStar] = useState(5);
  const [targetTier, setTargetTier] = useState(6);
  const [currentShards, setCurrentShards] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setCurrentStar(data.currentStar ?? 0);
        setCurrentTier(data.currentTier ?? 0);
        setTargetStar(data.targetStar ?? 5);
        setTargetTier(data.targetTier ?? 6);
        setCurrentShards(data.currentShards || '');
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentStar, currentTier, targetStar, targetTier, currentShards
      }));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [currentStar, currentTier, targetStar, targetTier, currentShards, isLoaded]);

  const currentTotal = getCumulativeShards(currentStar, currentTier);
  const targetTotal = getCumulativeShards(targetStar, targetTier);
  const totalNeeded = Math.max(0, targetTotal - currentTotal);
  const ownedShards = parseInt(currentShards) || 0;
  const shardsNeeded = Math.max(0, totalNeeded - ownedShards);
  const progress = totalNeeded > 0 ? Math.min(100, (ownedShards / totalNeeded) * 100) : 0;

  const renderStars = (count: number, filled: boolean = true) => {
    return (
      <span className={filled ? '' : 'opacity-30'}>
        {'⭐'.repeat(count)}
      </span>
    );
  };

  const selectClass = "w-full px-3 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer";

  return (
    <div className="max-w-lg mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">🦸 Hero Shard Calculator</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Calculate shards needed to upgrade your hero
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 space-y-5">
        
        {/* Current Position */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
          <h3 className="font-bold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
            📍 Current Position
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Star Level</label>
              <select
                value={currentStar}
                onChange={(e) => {
                  const star = parseInt(e.target.value);
                  setCurrentStar(star);
                  setCurrentTier(0);
                  // Adjust target if needed
                  if (star >= targetStar && (star > targetStar || 0 >= targetTier)) {
                    setTargetStar(Math.min(star + 1, 5));
                    setTargetTier(star === 5 ? 6 : 1);
                  }
                }}
                className={selectClass}
              >
                <option value={0}>🔒 Not Unlocked</option>
                <option value={1}>⭐ 1 Star</option>
                <option value={2}>⭐⭐ 2 Stars</option>
                <option value={3}>⭐⭐⭐ 3 Stars</option>
                <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tier</label>
              <select
                value={currentTier}
                onChange={(e) => {
                  const tier = parseInt(e.target.value);
                  setCurrentTier(tier);
                  // Adjust target if needed
                  if (currentStar >= targetStar && tier >= targetTier) {
                    if (currentStar === 5 && tier === 6) {
                      // Already maxed
                    } else if (tier === 6) {
                      setTargetStar(Math.min(currentStar + 1, 5));
                      setTargetTier(1);
                    } else {
                      setTargetTier(tier + 1);
                    }
                  }
                }}
                className={selectClass}
                disabled={currentStar === 0}
              >
                {currentStar === 0 ? (
                  <option value={0}>—</option>
                ) : (
                  <>
                    <option value={0}>Start of {currentStar}★</option>
                    {[1, 2, 3, 4, 5, 6].map((t) => (
                      <option key={t} value={t}>Tier {t} {t === 6 ? '(Complete)' : ''}</option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Target Position */}
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-2 border-amber-200 dark:border-amber-800">
          <h3 className="font-bold text-amber-700 dark:text-amber-300 mb-3 flex items-center gap-2">
            🎯 Target Goal
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Star Level</label>
              <select
                value={targetStar}
                onChange={(e) => {
                  const star = parseInt(e.target.value);
                  setTargetStar(star);
                  if (star === currentStar) {
                    setTargetTier(Math.max(currentTier + 1, 1));
                  } else {
                    setTargetTier(6); // Default to complete star
                  }
                }}
                className={selectClass}
              >
                {[1, 2, 3, 4, 5].filter(s => s >= currentStar).map((s) => (
                  <option key={s} value={s}>{'⭐'.repeat(s)} {s} Star{s > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tier</label>
              <select
                value={targetTier}
                onChange={(e) => setTargetTier(parseInt(e.target.value))}
                className={selectClass}
              >
                {[1, 2, 3, 4, 5, 6]
                  .filter(t => targetStar > currentStar || t > currentTier)
                  .map((t) => (
                    <option key={t} value={t}>Tier {t} {t === 6 ? '(Complete)' : ''}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Current Shards */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            💎 Shards You Have (optional)
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter your current shards..."
            value={currentShards}
            onChange={(e) => setCurrentShards(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-3 text-lg font-mono border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Progress Bar */}
        {totalNeeded > 0 && ownedShards > 0 && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.min(ownedShards, totalNeeded).toLocaleString()} / {totalNeeded.toLocaleString()}</span>
            </div>
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-green-400 to-green-600 transition-all duration-500 flex items-center justify-center"
                style={{ width: `${progress}%` }}
              >
                {progress >= 20 && <span className="text-white text-xs font-bold">{progress.toFixed(0)}%</span>}
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        <div className={`p-6 rounded-xl text-center ${
          shardsNeeded === 0 && totalNeeded > 0
            ? 'bg-linear-to-r from-green-400 to-green-600' 
            : 'bg-linear-to-r from-indigo-500 to-purple-600'
        }`}>
          <p className="text-white/80 text-sm mb-2">
            {currentStar === 0 ? '🔒' : renderStars(currentStar)} → {renderStars(targetStar)}
          </p>
          <p className="text-white text-5xl font-bold drop-shadow mb-1">
            {shardsNeeded.toLocaleString()}
          </p>
          <p className="text-white/80 text-sm">shards needed</p>
          {shardsNeeded === 0 && totalNeeded > 0 && (
            <p className="text-white text-sm mt-3 font-semibold">🎉 You have enough!</p>
          )}
        </div>

        {/* Quick Summary */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>Total for this upgrade: <strong>{totalNeeded.toLocaleString()}</strong> shards</p>
          {ownedShards > 0 && <p>You have: <strong>{ownedShards.toLocaleString()}</strong> shards</p>}
        </div>
      </div>

      {/* Quick Reference */}
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-2">📊 Shards per Star</h3>
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {[1, 2, 3, 4, 5].map((star) => (
            <div key={star} className="bg-white dark:bg-gray-700 p-2 rounded">
              <div className="text-lg mb-1">{'⭐'.repeat(star)}</div>
              <div className="font-bold text-indigo-600 dark:text-indigo-400">
                {TIER_SHARDS[star].reduce((a, b) => a + b, 0)}
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
          Total to max: <strong>1,065</strong> shards
        </p>
      </div>
      
      <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
        Data: <a href="https://kingshotdata.com/database/hero-shards/" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">kingshotdata.com</a>
      </p>
    </div>
  );
}
