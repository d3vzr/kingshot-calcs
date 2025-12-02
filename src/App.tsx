import { useState } from 'react'
import TabNavigation from './components/TabNavigation'
import BalanceCalculator from './components/BalanceCalculator'
import HeroShardCalculator from './components/HeroShardCalculator'
import Footer from './components/Footer'

function App() {
  const [activeTab, setActiveTab] = useState('balancer');

  const tabs = [
    { id: 'balancer', label: 'Resource Balancer', icon: '⚖️' },
    { id: 'hero-shards', label: 'Hero Shards', icon: '🦸' },
    { id: 'coming-soon', label: 'Coming Soon', icon: '🚀' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'balancer':
        return <BalanceCalculator />;
      case 'hero-shards':
        return <HeroShardCalculator />;
      case 'coming-soon':
        return (
          <div className="flex items-center justify-center py-10 px-4">
            <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-lg">
              <span className="text-6xl block mb-6">🚀</span>
              <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">More Calculators Coming Soon!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">We're working on adding more helpful tools for Kingshot players.</p>
              <div className="grid grid-cols-2 gap-3">
                {['⚔️ Troop Calculator', '📈 Upgrade Planner', '🏰 Building Optimizer', '🎯 And more...'].map((item) => (
                  <div key={item} className="bg-linear-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return <BalanceCalculator />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="text-center py-5 px-4 bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold drop-shadow">🏰 Kingshot Calculators</h1>
        <p className="text-sm md:text-base opacity-95 mt-1">Essential tools for Kingshot players</p>
      </header>
      
      <TabNavigation 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      />
      
      <main className="flex-1 py-4">
        {renderContent()}
      </main>
      
      <Footer />
    </div>
  )
}

export default App
