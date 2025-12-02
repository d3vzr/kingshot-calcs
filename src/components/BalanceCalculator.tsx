import type { FormEvent, KeyboardEvent } from 'react';
import { useEffect, useState } from 'react';

interface ResourceData {
  name: string;
  emoji: string;
  current: number;
  target: number;
  needed: number;
  ratio: number;
}

interface ChestAllocation {
  bread: number;
  wood: number;
  stone: number;
  iron: number;
}

interface ChestRecommendations {
  lv1: ChestAllocation;
  lv2: ChestAllocation;
  lv1Total: number;
  lv2Total: number;
}

const CHEST_VALUES = {
  lv1: { bread: 10000, wood: 10000, stone: 2000, iron: 500 },
  lv2: { bread: 100000, wood: 100000, stone: 20000, iron: 5000 }
};

const RESOURCE_KEYS = ['bread', 'wood', 'stone', 'iron'] as const;
const RESOURCE_INFO = {
  bread: { name: 'Bread', emoji: '🍞' },
  wood: { name: 'Wood', emoji: '🪵' },
  stone: { name: 'Stone', emoji: '🪨' },
  iron: { name: 'Iron', emoji: '⚔️' }
};

const STORAGE_KEY = 'kingshot-balancer-resources';

type Unit = 'M' | 'B';

export default function BalanceCalculator() {
  const [bread, setBread] = useState('');
  const [wood, setWood] = useState('');
  const [stone, setStone] = useState('');
  const [iron, setIron] = useState('');
  const [breadUnit, setBreadUnit] = useState<Unit>('M');
  const [woodUnit, setWoodUnit] = useState<Unit>('M');
  const [stoneUnit, setStoneUnit] = useState<Unit>('M');
  const [ironUnit, setIronUnit] = useState<Unit>('M');
  const [results, setResults] = useState<ResourceData[] | null>(null);
  const [mostNeeded, setMostNeeded] = useState<ResourceData | null>(null);
  const [allZero, setAllZero] = useState(false);
  const [lv1Chests, setLv1Chests] = useState('');
  const [lv2Chests, setLv2Chests] = useState('');
  const [chestRecommendations, setChestRecommendations] = useState<ChestRecommendations | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setBread(data.bread || '');
        setWood(data.wood || '');
        setStone(data.stone || '');
        setIron(data.iron || '');
        setBreadUnit(data.breadUnit || 'M');
        setWoodUnit(data.woodUnit || 'M');
        setStoneUnit(data.stoneUnit || 'M');
        setIronUnit(data.ironUnit || 'M');
        setLv1Chests(data.lv1Chests || '');
        setLv2Chests(data.lv2Chests || '');
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save data whenever inputs change (only after initial load)
  useEffect(() => {
    if (!isLoaded) return; // Don't save until initial load is complete
    
    try {
      const data = { 
        bread, wood, stone, iron,
        breadUnit, woodUnit, stoneUnit, ironUnit,
        lv1Chests, lv2Chests
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [bread, wood, stone, iron, breadUnit, woodUnit, stoneUnit, ironUnit, lv1Chests, lv2Chests, isLoaded]);

  const RATIO = { bread: 20, wood: 20, stone: 4, iron: 1 };

  const formatNumber = (num: number): string => {
    if (num >= 1000000000000) {
      // Trillions
      return (num / 1000000000000).toFixed(2) + 'T';
    } else if (num >= 1000000000) {
      // Billions
      return (num / 1000000000).toFixed(2) + 'B';
    } else {
      // Millions
      return (num / 1000000).toFixed(2) + 'M';
    }
  };

  const parseInput = (value: string, unit: Unit): number => {
    const cleaned = value.replace(/[^\d.]/g, '');
    const multiplier = unit === 'B' ? 1000000000 : 1000000;
    return parseFloat(cleaned) * multiplier || 0;
  };

  const handleCalculate = () => {
    const currentBread = parseInput(bread, breadUnit);
    const currentWood = parseInput(wood, woodUnit);
    const currentStone = parseInput(stone, stoneUnit);
    const currentIron = parseInput(iron, ironUnit);

    if (currentBread === 0 && currentWood === 0 && currentStone === 0 && currentIron === 0) {
      setAllZero(true);
      setResults(null);
      setMostNeeded(null);
      return;
    }

    setAllZero(false);

    const multipliers = [
      currentBread / RATIO.bread,
      currentWood / RATIO.wood,
      currentStone / RATIO.stone,
      currentIron / RATIO.iron
    ];

    const maxMultiplier = Math.max(...multipliers);

    const resources: ResourceData[] = [
      { name: 'Bread', emoji: '🍞', current: currentBread, target: Math.ceil(maxMultiplier * RATIO.bread), needed: 0, ratio: RATIO.bread },
      { name: 'Wood', emoji: '🪵', current: currentWood, target: Math.ceil(maxMultiplier * RATIO.wood), needed: 0, ratio: RATIO.wood },
      { name: 'Stone', emoji: '🪨', current: currentStone, target: Math.ceil(maxMultiplier * RATIO.stone), needed: 0, ratio: RATIO.stone },
      { name: 'Iron', emoji: '⚔️', current: currentIron, target: Math.ceil(maxMultiplier * RATIO.iron), needed: 0, ratio: RATIO.iron }
    ];

    resources.forEach(resource => {
      resource.needed = Math.max(0, resource.target - resource.current);
    });

    const maxNeeded = Math.max(...resources.map(r => r.needed));
    const mostNeededResource = maxNeeded > 0 ? resources.find(r => r.needed === maxNeeded) || null : null;

    setResults(resources);
    setMostNeeded(mostNeededResource);

    const lv1Count = parseInt(lv1Chests) || 0;
    const lv2Count = parseInt(lv2Chests) || 0;

    if (lv1Count > 0 || lv2Count > 0) {
      const deficits = {
        bread: resources[0].needed,
        wood: resources[1].needed,
        stone: resources[2].needed,
        iron: resources[3].needed
      };

      const allocateChests = (chestLevel: 'lv1' | 'lv2', count: number, currentDeficits: typeof deficits): ChestAllocation => {
        const allocation: ChestAllocation = { bread: 0, wood: 0, stone: 0, iron: 0 };
        const values = CHEST_VALUES[chestLevel];
        const remainingDeficits = { ...currentDeficits };

        for (let i = 0; i < count; i++) {
          let bestResource: keyof ChestAllocation = 'bread';
          let highestDeficit = -Infinity;

          for (const key of RESOURCE_KEYS) {
            if (remainingDeficits[key] > highestDeficit) {
              highestDeficit = remainingDeficits[key];
              bestResource = key;
            }
          }

          allocation[bestResource]++;
          remainingDeficits[bestResource] -= values[bestResource];
        }

        return allocation;
      };

      const lv2Allocation = allocateChests('lv2', lv2Count, deficits);
      
      const deficitsAfterLv2 = {
        bread: deficits.bread - (lv2Allocation.bread * CHEST_VALUES.lv2.bread),
        wood: deficits.wood - (lv2Allocation.wood * CHEST_VALUES.lv2.wood),
        stone: deficits.stone - (lv2Allocation.stone * CHEST_VALUES.lv2.stone),
        iron: deficits.iron - (lv2Allocation.iron * CHEST_VALUES.lv2.iron)
      };

      const lv1Allocation = allocateChests('lv1', lv1Count, deficitsAfterLv2);

      setChestRecommendations({
        lv1: lv1Allocation,
        lv2: lv2Allocation,
        lv1Total: lv1Count,
        lv2Total: lv2Count
      });
    } else {
      setChestRecommendations(null);
    }
  };

  const handleClear = () => {
    setBread('');
    setWood('');
    setStone('');
    setIron('');
    setBreadUnit('M');
    setWoodUnit('M');
    setStoneUnit('M');
    setIronUnit('M');
    setLv1Chests('');
    setLv2Chests('');
    setResults(null);
    setMostNeeded(null);
    setAllZero(false);
    setChestRecommendations(null);
  };

  const formatChestAmount = (amount: number): string => {
    if (amount >= 1000000000) return (amount / 1000000000).toFixed(2) + 'B';
    if (amount >= 1000000) return (amount / 1000000).toFixed(2) + 'M';
    if (amount >= 1000) return (amount / 1000).toFixed(0) + 'K';
    return amount.toString();
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleCalculate();
  };

  const handleInputChange = (value: string, setter: (value: string) => void) => {
    setter(value.replace(/[^\d.]/g, ''));
  };

  const inputClass = "flex-1 px-3 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white font-mono transition-all focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";
  const selectClass = "w-20 px-2 py-2 text-xs font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 cursor-pointer transition-all focus:outline-none focus:border-indigo-500";
  const labelClass = "flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-200";

  return (
    <div className="max-w-6xl mx-auto p-4 w-full grid gap-4 lg:grid-cols-[320px_1fr]">
      {/* Left Panel */}
      <div className="flex flex-col">
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); handleCalculate(); }} className="flex flex-col gap-3">
          {/* Resource Inputs */}
          {[
            { id: 'bread', label: 'Bread', emoji: '🍞', value: bread, setValue: setBread, unit: breadUnit, setUnit: setBreadUnit },
            { id: 'wood', label: 'Wood', emoji: '🪵', value: wood, setValue: setWood, unit: woodUnit, setUnit: setWoodUnit },
            { id: 'stone', label: 'Stone', emoji: '🪨', value: stone, setValue: setStone, unit: stoneUnit, setUnit: setStoneUnit },
            { id: 'iron', label: 'Iron', emoji: '⚔️', value: iron, setValue: setIron, unit: ironUnit, setUnit: setIronUnit },
          ].map(({ id, label, emoji, value, setValue, unit, setUnit }) => (
            <div key={id} className="flex flex-col gap-1">
              <label htmlFor={id} className={labelClass}>
                <span>{emoji}</span> {label}
              </label>
              <div className="flex gap-2">
                <input
                  id={id}
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={value}
                  onChange={(e) => handleInputChange(e.target.value, setValue)}
                  onKeyPress={handleKeyPress}
                  className={inputClass}
                />
                <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)} className={selectClass}>
                  <option value="M">Million</option>
                  <option value="B">Billion</option>
                </select>
              </div>
            </div>
          ))}

          {/* Chest Section */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mt-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">🎁 Custom Resource Chests</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="lv1-chests" className="flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-linear-to-r from-green-500 to-green-700 rounded">Lv1</span>
                  Chest
                </label>
                <input
                  id="lv1-chests"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={lv1Chests}
                  onChange={(e) => setLv1Chests(e.target.value.replace(/\D/g, ''))}
                  onKeyPress={handleKeyPress}
                  className="px-2 py-1.5 text-sm border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="lv2-chests" className="flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-linear-to-r from-blue-500 to-blue-700 rounded">Lv2</span>
                  Chest
                </label>
                <input
                  id="lv2-chests"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={lv2Chests}
                  onChange={(e) => setLv2Chests(e.target.value.replace(/\D/g, ''))}
                  onKeyPress={handleKeyPress}
                  className="px-2 py-1.5 text-sm border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="mt-2 flex flex-col gap-1 text-[11px] text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <span className="px-1 py-0.5 text-[9px] font-bold text-white bg-linear-to-r from-green-500 to-green-700 rounded">Lv1</span>
                10K 🍞🪵 • 2K 🪨 • 500 ⚔️
              </div>
              <div className="flex items-center gap-1">
                <span className="px-1 py-0.5 text-[9px] font-bold text-white bg-linear-to-r from-blue-500 to-blue-700 rounded">Lv2</span>
                100K 🍞🪵 • 20K 🪨 • 5K ⚔️
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-linear-to-r from-indigo-500 to-purple-600 rounded-lg shadow hover:shadow-lg hover:-translate-y-0.5 transition-all">
              ✨ Calculate
            </button>
            <button type="button" onClick={handleClear} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all">
              🗑️ Clear
            </button>
          </div>
        </form>

        {/* Explanation */}
        <div className="mt-3 p-3 bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-lg">
          <h3 className="text-sm font-semibold mb-1">📊 How It Works</h3>
          <p className="text-xs opacity-95 leading-relaxed">
            Kingshot uses a standard resource ratio of <strong>Bread:Wood:Stone:Iron = 20:20:4:1</strong>.
            Enter your amounts and select M (millions) or B (billions) for each resource.
          </p>
        </div>
      </div>

      {/* Results Section */}
      {!results && !allZero && (
        <div className="flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center max-w-md">
            <span className="text-6xl block mb-4">⚖️</span>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Resource Balancer</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter your current resources on the left and click <strong>Calculate</strong> to see what you need to balance.
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-left">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">📊 Standard Ratio:</p>
              <div className="flex justify-between text-sm">
                <span>🍞 Bread</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">20</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>🪵 Wood</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">20</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>🪨 Stone</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">4</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>⚔️ Iron</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">1</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {allZero && (
        <div className="flex items-center justify-center">
          <div className="bg-linear-to-r from-indigo-500 to-purple-600 text-white p-8 rounded-lg text-center">
            <span className="text-5xl block mb-4">📝</span>
            <h2 className="text-xl font-bold mb-2">Enter Your Resources</h2>
            <p className="text-sm opacity-95">Please enter your current resource amounts to calculate the balance.</p>
          </div>
        </div>
      )}

      {results && (
        <div className="flex flex-col gap-3">
          {/* Most Needed / Balanced Box */}
          {mostNeeded ? (
            <div className="bg-linear-to-r from-amber-300 to-orange-400 p-4 rounded-lg shadow-lg">
              <h2 className="text-white font-bold mb-2 drop-shadow">🎯 Most Needed Resource</h2>
              <div className="flex items-center gap-3">
                <span className="text-4xl drop-shadow">{mostNeeded.emoji}</span>
                <div>
                  <h3 className="text-white font-bold text-xl drop-shadow">{mostNeeded.name}</h3>
                  <p className="text-white/90 text-sm">This is your most needed resource!</p>
                  <p className="text-white font-bold drop-shadow">Need: {formatNumber(mostNeeded.needed)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-linear-to-r from-green-400 to-green-600 p-4 rounded-lg text-center text-white shadow-lg">
              <h2 className="font-bold text-lg mb-1">✅ All Resources Balanced!</h2>
              <p className="text-sm opacity-95">Your resources are perfectly balanced. Nice work!</p>
            </div>
          )}

          {/* Results Table */}
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-linear-to-r from-indigo-500 to-purple-600 text-white">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold">Resource</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold">Current</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold">Target</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold">Needed</th>
                </tr>
              </thead>
              <tbody>
                {results.map((resource) => (
                  <tr 
                    key={resource.name}
                    className={`border-b border-gray-200 dark:border-gray-700 ${resource === mostNeeded ? 'bg-yellow-100 dark:bg-yellow-900/50 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                  >
                    <td className="px-3 py-2 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                      <span className="text-lg">{resource.emoji}</span>
                      {resource.name}
                    </td>
                    <td className="px-3 py-2 text-right text-sm font-mono text-gray-600 dark:text-gray-300">{formatNumber(resource.current)}</td>
                    <td className="px-3 py-2 text-right text-sm font-mono text-gray-600 dark:text-gray-300">{formatNumber(resource.target)}</td>
                    <td className={`px-3 py-2 text-right text-sm font-mono ${resource.needed > 0 ? 'text-purple-600 dark:text-purple-400 font-semibold' : 'text-gray-400'}`}>
                      {resource.needed > 0 ? formatNumber(resource.needed) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Chest Recommendations */}
          {chestRecommendations && (chestRecommendations.lv1Total > 0 || chestRecommendations.lv2Total > 0) && (
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow">
              <h3 className="font-bold text-gray-800 dark:text-white mb-1">🎁 Chest Distribution</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Distribute your chests like this to balance resources:</p>
              
              {chestRecommendations.lv2Total > 0 && (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-2">
                  <div className="flex items-center gap-2 font-semibold text-sm text-gray-700 dark:text-gray-200 mb-2 pb-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-linear-to-r from-blue-500 to-blue-700 rounded">Lv2</span>
                    Chests × {chestRecommendations.lv2Total}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {RESOURCE_KEYS.map(key => {
                      const count = chestRecommendations.lv2[key];
                      if (count === 0) return null;
                      return (
                        <div key={key} className="flex items-center gap-2 px-2 py-1 bg-white dark:bg-gray-800 rounded shadow-sm text-sm">
                          <span>{RESOURCE_INFO[key].emoji}</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-200">{RESOURCE_INFO[key].name}</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">×{count}</span>
                          <span className="text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400 px-1.5 py-0.5 rounded">+{formatChestAmount(count * CHEST_VALUES.lv2[key])}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {chestRecommendations.lv1Total > 0 && (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 font-semibold text-sm text-gray-700 dark:text-gray-200 mb-2 pb-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-linear-to-r from-green-500 to-green-700 rounded">Lv1</span>
                    Chests × {chestRecommendations.lv1Total}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {RESOURCE_KEYS.map(key => {
                      const count = chestRecommendations.lv1[key];
                      if (count === 0) return null;
                      return (
                        <div key={key} className="flex items-center gap-2 px-2 py-1 bg-white dark:bg-gray-800 rounded shadow-sm text-sm">
                          <span>{RESOURCE_INFO[key].emoji}</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-200">{RESOURCE_INFO[key].name}</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">×{count}</span>
                          <span className="text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400 px-1.5 py-0.5 rounded">+{formatChestAmount(count * CHEST_VALUES.lv1[key])}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
