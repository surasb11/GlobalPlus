
import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  PieChart, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Search,
  Bell,
  Globe,
  ShieldCheck,
  FileText,
  ChevronRight,
  Map
} from 'lucide-react';
import { MOCK_DATA, CATEGORIES, REGIONS } from './constants';
import { CategoryId } from './types';
import StatCard from './components/StatCard';
import ChartWidget from './components/ChartWidget';
import ComparisonTool from './components/ComparisonTool';
import FilterBar from './components/FilterBar';
import { LiveDataProvider, useLiveData } from './context/LiveDataContext';

// Wrapper to provide context
const AppWrapper = () => (
  <LiveDataProvider>
    <App />
  </LiveDataProvider>
);

function App() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [activeMetricId, setActiveMetricId] = useState<string>(MOCK_DATA[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'compare'>('dashboard');
  
  const { selectedRegion, liveValues, getDisplayValue } = useLiveData();

  const filteredMetrics = useMemo(() => {
    if (selectedCategory === 'all') return MOCK_DATA;
    return MOCK_DATA.filter(m => m.category === selectedCategory);
  }, [selectedCategory]);

  const activeMetric = MOCK_DATA.find(m => m.id === activeMetricId) || MOCK_DATA[0];

  const handleMetricClick = (id: string) => {
    setActiveMetricId(id);
    setViewMode('dashboard');
    document.getElementById('chart-section')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category ? category.icon : Globe;
  };

  // Calculate regional breakdown for active metric
  const regionalBreakdown = useMemo(() => {
    const baseValue = liveValues[activeMetric.id] || activeMetric.baseValue;
    return REGIONS.map(region => {
      let multiplier = 1;
      if (region.code !== 'WORLD') {
        if (activeMetric.regionalMultipliers && activeMetric.regionalMultipliers[region.code]) {
          multiplier = activeMetric.regionalMultipliers[region.code];
        } else {
          const heuristic: Record<string, number> = { 'USA': 0.25, 'CHN': 0.18, 'IND': 0.04, 'EU': 0.17, 'BRA': 0.02 };
          multiplier = heuristic[region.code] || 0.01;
        }
      }
      return {
        ...region,
        value: baseValue * multiplier
      };
    }).sort((a, b) => b.value - a.value);
  }, [activeMetric, liveValues]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="h-20 flex items-center px-8 border-b border-slate-100">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-indigo-200 shadow-md">
              <Globe className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              GlobalPulse
            </span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            <div className="mb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Main Menu
            </div>
            
            <button 
              onClick={() => { setViewMode('dashboard'); setSelectedCategory('all'); }}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${viewMode === 'dashboard' && selectedCategory === 'all' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <LayoutDashboard size={20} className="mr-3" />
              Dashboard
            </button>

            <button 
              onClick={() => setViewMode('compare')}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${viewMode === 'compare' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <PieChart size={20} className="mr-3" />
              Compare Data
            </button>

            <div className="mt-8 mb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Data Categories
            </div>
            
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setViewMode('dashboard'); }}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${selectedCategory === cat.id ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <cat.icon size={20} className="mr-3" />
                {cat.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button className="w-full flex items-center px-4 py-3 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
              <Settings size={20} className="mr-3" />
              Settings
            </button>
            <button className="w-full flex items-center px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1">
              <LogOut size={20} className="mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 z-10 shrink-0">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 -ml-2 mr-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl font-bold text-slate-800 hidden md:block">
              {viewMode === 'compare' ? 'Data Comparison' : (selectedCategory === 'all' ? 'Global Overview' : CATEGORIES.find(c => c.id === selectedCategory)?.label)}
            </h1>
          </div>

          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 w-64">
              <Search size={18} className="text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search data..." 
                className="bg-transparent border-none outline-none text-sm w-full"
              />
            </div>
            
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold text-slate-800">SuraSB</div>
                <div className="text-xs text-slate-500">Pro Account</div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover grayscale"
              />
            </div>
          </div>
        </header>

        <FilterBar />

        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          
          {viewMode === 'dashboard' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {filteredMetrics.map((metric) => {
                  const Icon = getCategoryIcon(metric.category);
                  return (
                    <StatCard 
                      key={metric.id}
                      metric={metric}
                      icon={<Icon size={24} />} 
                      onClick={() => handleMetricClick(metric.id)}
                      isActive={activeMetricId === metric.id}
                    />
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 scroll-mt-24" id="chart-section">
                <div className="lg:col-span-2 h-[500px]">
                  <ChartWidget data={activeMetric} />
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Map size={20} className="text-indigo-600" />
                    Regional Breakdown
                  </h3>
                  
                  <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                    {regionalBreakdown.map((reg) => (
                      <div key={reg.code} className="group flex flex-col p-3 bg-slate-50 rounded-xl transition-all hover:bg-indigo-50 hover:shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeMetric.color }}></span>
                            {reg.label}
                          </span>
                          <span className="text-sm font-black text-indigo-600">
                            {Math.floor(reg.value).toLocaleString()}
                            <span className="text-[10px] ml-1 font-normal text-slate-400">{activeMetric.unit}</span>
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="h-full transition-all duration-1000" 
                            style={{ 
                              width: `${(reg.value / (regionalBreakdown[0].value || 1)) * 100}%`,
                              backgroundColor: activeMetric.color 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-4 pt-4 border-t border-slate-100">
                    <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Active Scope</div>
                      <div className="font-bold text-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe size={16} className="text-indigo-600" />
                          {selectedRegion === 'WORLD' ? 'Global' : REGIONS.find(r => r.code === selectedRegion)?.label}
                        </div>
                        <ChevronRight size={14} className="text-slate-400" />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Summary</div>
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        "{activeMetric.description.slice(0, 100)}..."
                      </p>
                    </div>

                    <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-indigo-100 active:scale-95">
                      Export Metric Report
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="max-w-6xl mx-auto">
              <ComparisonTool metrics={MOCK_DATA} />
            </div>
          )}

          <footer className="mt-12 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm pb-4 border-t border-slate-100 pt-8">
            <div className="mb-4 md:mb-0 font-medium">
              &copy; 2024 GlobalPulse Analytics. Engineered by Senior Frontend AI.
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-600 flex items-center gap-1 transition-colors">
                <ShieldCheck size={14} /> Data Sovereignty
              </a>
              <a href="#" className="hover:text-slate-600 flex items-center gap-1 transition-colors">
                <FileText size={14} /> Methodology
              </a>
            </div>
          </footer>
        </div>

      </main>
    </div>
  );
}

export default AppWrapper;
