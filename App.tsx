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
  Globe
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
  
  // Use live data context if needed for filters, but mostly passed down
  const { selectedRegion } = useLiveData();

  const filteredMetrics = useMemo(() => {
    if (selectedCategory === 'all') return MOCK_DATA;
    return MOCK_DATA.filter(m => m.category === selectedCategory);
  }, [selectedCategory]);

  const activeMetric = MOCK_DATA.find(m => m.id === activeMetricId) || MOCK_DATA[0];

  const handleMetricClick = (id: string) => {
    setActiveMetricId(id);
    setViewMode('dashboard');
    if (window.innerWidth < 768) {
      document.getElementById('chart-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category ? category.icon : Globe;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-20 flex items-center px-8 border-b border-slate-100">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-indigo-200 shadow-md">
              <Globe className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              GlobalPulse
            </span>
          </div>

          {/* Navigation */}
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

          {/* Bottom Actions */}
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
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
                <div className="text-sm font-bold text-slate-800">Admin User</div>
                <div className="text-xs text-slate-500">Pro Account</div>
              </div>
              <img 
                src="https://picsum.photos/40/40" 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Filter Bar */}
        <FilterBar />

        {/* Scrollable Dashboard Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          
          {viewMode === 'dashboard' ? (
            <>
              {/* Stat Cards Grid */}
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

              {/* Main Chart Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="chart-section">
                <div className="lg:col-span-2 h-[500px]">
                  <ChartWidget data={activeMetric} />
                </div>
                
                {/* Side Panel / Details */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Metric Details</h3>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="text-sm text-slate-500 mb-1">Scope</div>
                      <div className="font-medium capitalize flex items-center gap-2">
                        <Globe size={16} className="text-indigo-500" />
                        {selectedRegion === 'WORLD' ? 'Global' : REGIONS.find(r => r.code === selectedRegion)?.label}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="text-sm text-slate-500 mb-1">Growth Rate</div>
                      <div className="font-medium text-green-600 flex items-center">
                        +{activeMetric.growthRate} <span className="text-slate-400 text-xs ml-1">per second</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="text-sm text-slate-500 mb-1">Description</div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {activeMetric.description}
                      </p>
                    </div>

                    <div className="mt-auto pt-4">
                       <button className="w-full py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                         Download Report
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Comparison View */
            <div className="max-w-5xl mx-auto">
              <ComparisonTool metrics={MOCK_DATA} />
            </div>
          )}

          <footer className="mt-12 text-center text-slate-400 text-sm pb-4">
            &copy; 2024 GlobalPulse Analytics. Powered by Gemini AI.
          </footer>
        </div>

      </main>
    </div>
  );
}

export default AppWrapper;