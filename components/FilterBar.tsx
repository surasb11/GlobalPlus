
import React, { useState, useRef, useEffect } from 'react';
import { REGIONS } from '../constants';
import { RegionCode } from '../types';
import { useLiveData } from '../context/LiveDataContext';
import { Calendar, MapPin, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';

const FilterBar: React.FC = () => {
  const { selectedRegion, setRegion, selectedYear, setYear } = useLiveData();
  
  // State for dropdown visibility
  const [openDropdown, setOpenDropdown] = useState<'region' | 'year' | null>(null);

  // Generate year range from 1920 to 2040
  const years = Array.from({ length: 121 }, (_, i) => 1920 + i);

  // Close dropdown when mouse leaves the container area
  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };

  const toggleDropdown = (name: 'region' | 'year') => {
    if (openDropdown === name) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(name);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center gap-4 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center text-slate-500 text-sm font-medium mr-2">
        <SlidersHorizontal size={16} className="mr-2" />
        Display Filters:
      </div>

      {/* Region Selector */}
      <div 
        className="relative"
        onMouseLeave={handleMouseLeave}
      >
        <button 
          onClick={() => toggleDropdown('region')}
          className={`flex items-center bg-slate-100 rounded-lg px-4 py-2 border transition-all text-sm font-semibold text-slate-700 hover:bg-slate-50
            ${openDropdown === 'region' ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-transparent hover:border-slate-300'}
          `}
        >
          <MapPin size={16} className="text-indigo-600 mr-2" />
          <span className="mr-2">
            {selectedRegion === 'WORLD' ? 'World' : REGIONS.find(r => r.code === selectedRegion)?.label}
          </span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${openDropdown === 'region' ? 'rotate-180' : ''}`} />
        </button>

        {openDropdown === 'region' && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="text-xs font-semibold text-slate-400 px-3 py-2 uppercase tracking-wider">Select Region</div>
            {REGIONS.map(r => (
              <button
                key={r.code}
                onClick={() => { setRegion(r.code); setOpenDropdown(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors
                  ${selectedRegion === r.code ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}
                `}
              >
                {r.label}
                {selectedRegion === r.code && <Check size={14} className="text-indigo-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Year Selector */}
      <div 
        className="relative"
        onMouseLeave={handleMouseLeave}
      >
        <button 
          onClick={() => toggleDropdown('year')}
          className={`flex items-center bg-slate-100 rounded-lg px-4 py-2 border transition-all text-sm font-semibold text-slate-700 hover:bg-slate-50
            ${openDropdown === 'year' ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-transparent hover:border-slate-300'}
          `}
        >
          <Calendar size={16} className="text-indigo-600 mr-2" />
          <span className="mr-2">
            {selectedYear} {selectedYear === new Date().getFullYear() && '(Live)'}
          </span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${openDropdown === 'year' ? 'rotate-180' : ''}`} />
        </button>

        {openDropdown === 'year' && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 max-h-80 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
             <div className="text-xs font-semibold text-slate-400 px-3 py-2 uppercase tracking-wider">Select Year</div>
            {years.map(y => (
              <button
                key={y}
                onClick={() => { setYear(y); setOpenDropdown(null); }}
                 className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors
                  ${selectedYear === y ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}
                `}
              >
                <span>{y} {y === new Date().getFullYear() && <span className="text-xs text-green-500 ml-1 font-normal">(Live)</span>}</span>
                {selectedYear === y && <Check size={14} className="text-indigo-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ml-auto text-xs text-slate-400 hidden md:block">
        Simulating: {selectedRegion === 'WORLD' ? 'Global Data' : REGIONS.find(r => r.code === selectedRegion)?.label} • {selectedYear}
      </div>
    </div>
  );
};

export default FilterBar;
