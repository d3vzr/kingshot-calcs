interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="w-full bg-white dark:bg-gray-900 shadow sticky top-0 z-50">
      <div className="flex max-w-6xl mx-auto overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`flex-1 min-w-[120px] flex flex-col items-center gap-1 py-3 px-4 text-sm font-semibold transition-all border-b-3 cursor-pointer
              ${activeTab === tab.id 
                ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
