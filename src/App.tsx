import { useState } from 'react'
import './App.css'
import TabNavigation from './components/TabNavigation'
import BalanceCalculator from './components/BalanceCalculator'
import Footer from './components/Footer'

function App() {
  const [activeTab, setActiveTab] = useState('balancer');

  const tabs = [
    { id: 'balancer', label: 'Resource Balancer', icon: '⚖️' },
    { id: 'coming-soon', label: 'Coming Soon', icon: '🚀' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'balancer':
        return <BalanceCalculator />;
      case 'coming-soon':
        return (
          <div className="coming-soon-container">
            <div className="coming-soon-content">
              <span className="coming-soon-icon">🚀</span>
              <h2>More Calculators Coming Soon!</h2>
              <p>We're working on adding more helpful tools for Kingshot players.</p>
              <div className="planned-features">
                <div className="feature-item">⚔️ Troop Calculator</div>
                <div className="feature-item">📈 Upgrade Planner</div>
                <div className="feature-item">🏰 Building Optimizer</div>
                <div className="feature-item">🎯 And more...</div>
              </div>
            </div>
          </div>
        );
      default:
        return <BalanceCalculator />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏰 Kingshot Calculators</h1>
        <p className="app-subtitle">Essential tools for Kingshot players</p>
      </header>
      
      <TabNavigation 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      />
      
      <main className="app-content">
        {renderContent()}
      </main>
      
      <Footer />
    </div>
  )
}

export default App
