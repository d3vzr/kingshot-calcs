import { useState, useEffect } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import './BalanceCalculator.css';

interface ResourceData {
  name: string;
  emoji: string;
  current: number;
  target: number;
  needed: number;
  ratio: number;
}

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
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Save data whenever inputs change
  useEffect(() => {
    try {
      const data = { 
        bread, wood, stone, iron,
        breadUnit, woodUnit, stoneUnit, ironUnit
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [bread, wood, stone, iron, breadUnit, woodUnit, stoneUnit, ironUnit]);

  const RATIO = {
    bread: 20,
    wood: 20,
    stone: 4,
    iron: 1
  };

  const formatNumber = (num: number): string => {
    const millions = num / 1000000;
    return millions.toFixed(2) + 'M';
  };

  const parseInput = (value: string, unit: Unit): number => {
    const cleaned = value.replace(/[^\d.]/g, '');
    const multiplier = unit === 'B' ? 1000000000 : 1000000; // Billion or Million
    return parseFloat(cleaned) * multiplier || 0;
  };

  const handleCalculate = () => {
    const currentBread = parseInput(bread, breadUnit);
    const currentWood = parseInput(wood, woodUnit);
    const currentStone = parseInput(stone, stoneUnit);
    const currentIron = parseInput(iron, ironUnit);

    // Check if all values are zero
    if (currentBread === 0 && currentWood === 0 && currentStone === 0 && currentIron === 0) {
      setAllZero(true);
      setResults(null);
      setMostNeeded(null);
      return;
    }

    setAllZero(false);

    // Find the limiting factor (which resource requires the most multiplier)
    const multipliers = [
      currentBread / RATIO.bread,
      currentWood / RATIO.wood,
      currentStone / RATIO.stone,
      currentIron / RATIO.iron
    ];

    const maxMultiplier = Math.max(...multipliers);

    // Calculate targets and needs
    const resources: ResourceData[] = [
      {
        name: 'Bread',
        emoji: '🍞',
        current: currentBread,
        target: Math.ceil(maxMultiplier * RATIO.bread),
        needed: 0,
        ratio: RATIO.bread
      },
      {
        name: 'Wood',
        emoji: '🪵',
        current: currentWood,
        target: Math.ceil(maxMultiplier * RATIO.wood),
        needed: 0,
        ratio: RATIO.wood
      },
      {
        name: 'Stone',
        emoji: '🪨',
        current: currentStone,
        target: Math.ceil(maxMultiplier * RATIO.stone),
        needed: 0,
        ratio: RATIO.stone
      },
      {
        name: 'Iron',
        emoji: '⚔️',
        current: currentIron,
        target: Math.ceil(maxMultiplier * RATIO.iron),
        needed: 0,
        ratio: RATIO.iron
      }
    ];

    // Calculate needed amounts
    resources.forEach(resource => {
      resource.needed = Math.max(0, resource.target - resource.current);
    });

    // Find most needed resource
    const maxNeeded = Math.max(...resources.map(r => r.needed));
    const mostNeededResource = maxNeeded > 0 
      ? resources.find(r => r.needed === maxNeeded) || null
      : null;

    setResults(resources);
    setMostNeeded(mostNeededResource);
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
    setResults(null);
    setMostNeeded(null);
    setAllZero(false);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  const handleInputChange = (
    value: string, 
    setter: (value: string) => void
  ) => {
    // Allow only numbers and decimal point
    const cleaned = value.replace(/[^\d.]/g, '');
    setter(cleaned);
  };

  return (
    <div className="calculator-container">
      <div className="left-panel">
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); handleCalculate(); }} className="input-form">
        <div className="input-group">
          <label htmlFor="bread">
            <span className="resource-emoji">🍞</span> Bread
          </label>
          <div className="input-with-unit">
            <input
              id="bread"
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={bread}
              onChange={(e) => handleInputChange(e.target.value, setBread)}
              onKeyPress={handleKeyPress}
              className="resource-input"
            />
            <select 
              value={breadUnit} 
              onChange={(e) => setBreadUnit(e.target.value as Unit)}
              className="unit-select"
            >
              <option value="M">Million</option>
              <option value="B">Billion</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="wood">
            <span className="resource-emoji">🪵</span> Wood
          </label>
          <div className="input-with-unit">
            <input
              id="wood"
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={wood}
              onChange={(e) => handleInputChange(e.target.value, setWood)}
              onKeyPress={handleKeyPress}
              className="resource-input"
            />
            <select 
              value={woodUnit} 
              onChange={(e) => setWoodUnit(e.target.value as Unit)}
              className="unit-select"
            >
              <option value="M">Million</option>
              <option value="B">Billion</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="stone">
            <span className="resource-emoji">🪨</span> Stone
          </label>
          <div className="input-with-unit">
            <input
              id="stone"
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={stone}
              onChange={(e) => handleInputChange(e.target.value, setStone)}
              onKeyPress={handleKeyPress}
              className="resource-input"
            />
            <select 
              value={stoneUnit} 
              onChange={(e) => setStoneUnit(e.target.value as Unit)}
              className="unit-select"
            >
              <option value="M">Million</option>
              <option value="B">Billion</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="iron">
            <span className="resource-emoji">⚔️</span> Iron
          </label>
          <div className="input-with-unit">
            <input
              id="iron"
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={iron}
              onChange={(e) => handleInputChange(e.target.value, setIron)}
              onKeyPress={handleKeyPress}
              className="resource-input"
            />
            <select 
              value={ironUnit} 
              onChange={(e) => setIronUnit(e.target.value as Unit)}
              className="unit-select"
            >
              <option value="M">Million</option>
              <option value="B">Billion</option>
            </select>
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="btn btn-primary">
            ✨ Calculate
          </button>
          <button type="button" onClick={handleClear} className="btn btn-secondary">
            🗑️ Clear
          </button>
        </div>
        </form>

        <div className="explanation-box">
          <h3>📊 How It Works</h3>
          <p>
            Kingshot uses a standard resource ratio of <strong>Bread:Wood:Stone:Iron = 20:20:4:1</strong>.
            Enter your amounts and select M (millions) or B (billions) for each resource.
            We'll show you which resource you need most to achieve perfect balance!
          </p>
        </div>
      </div>

      {allZero && (
        <div className="results-section">
          <div className="empty-state-box">
            <span className="empty-state-icon">📝</span>
            <h2>Enter Your Resources</h2>
            <p>Please enter your current resource amounts to calculate the balance.</p>
          </div>
        </div>
      )}

      {results && (
        <div className="results-section">
          {mostNeeded ? (
            <div className="most-needed-box">
              <h2>🎯 Most Needed Resource</h2>
              <div className="most-needed-content">
                <span className="big-emoji">{mostNeeded.emoji}</span>
                <div className="most-needed-text">
                  <h3>{mostNeeded.name}</h3>
                  <p>This is your most needed resource!</p>
                  <p className="needed-amount">Need: {formatNumber(mostNeeded.needed)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="balanced-box">
              <h2>✅ All Resources Balanced!</h2>
              <p>Your resources are perfectly balanced. Nice work!</p>
            </div>
          )}

          <div className="results-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Current</th>
                  <th>Target</th>
                  <th>Needed</th>
                </tr>
              </thead>
              <tbody>
                {results.map((resource) => (
                  <tr 
                    key={resource.name}
                    className={resource === mostNeeded ? 'highlight-row' : ''}
                  >
                    <td className="resource-name">
                      <span className="table-emoji">{resource.emoji}</span>
                      {resource.name}
                    </td>
                    <td className="number-cell">{formatNumber(resource.current)}</td>
                    <td className="number-cell">{formatNumber(resource.target)}</td>
                    <td className="number-cell needed-cell">
                      {resource.needed > 0 ? formatNumber(resource.needed) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

