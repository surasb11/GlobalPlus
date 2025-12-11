import React from 'react';
import { REGIONS } from '../constants';
import { RegionCode } from '../types';
import { useLiveData } from '../context/LiveDataContext';
import { Calendar, MapPin, SlidersHorizontal } from 'lucide-react';

const FilterBar: React.FC = () => {
  const { selectedRegion, setRegion, selectedYear, setYear } = useLiveData();
  
  // Generate year range
  const years = Array.from({ length: 20 }, (_, i) => 2015 + i);

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center gap-4 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center text-slate-500 text-sm font-medium mr-2">
        <SlidersHorizontal size={16} className="mr-2" />
        Display Filters:
      </div>

      {/* Region Selector */}
      <div className="relative group">
        <div className="flex items-center bg-slate-100 rounded-lg px-3 py-1.5 border border-transparent hover:border-indigo-300 transition-all cursor-pointer">
          <MapPin size={16} className="text-indigo-600 mr-2" />
          <select 
            className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer appearance-none pr-4"
            value={selectedRegion}
            onChange={(e) => setRegion(e.target.value as RegionCode)}
          >
            {REGIONS.map(r => (
              <option key={r.code} value={r.code}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Year Selector */}
      <div className="relative group">
        <div className="flex items-center bg-slate-100 rounded-lg px-3 py-1.5 border border-transparent hover:border-indigo-300 transition-all cursor-pointer">
          <Calendar size={16} className="text-indigo-600 mr-2" />
          <select 
            className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer appearance-none pr-4"
            value={selectedYear}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map(y => (
              <option key={y} value={y}>{y === new Date().getFullYear() ? `${y} (Live)` : y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="ml-auto text-xs text-slate-400">
        Simulating: {selectedRegion === 'WORLD' ? 'Global Data' : REGIONS.find(r => r.code === selectedRegion)?.label} • {selectedYear}
      </div>
    </div>
  );
};

export default FilterBar;
