import React from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import { MetricData } from '../types';
import { useLiveData } from '../context/LiveDataContext';

interface StatCardProps {
  metric: MetricData;
  icon: React.ElementType;
  onMetricClick: (id: string) => void;
  isActive: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  metric, 
  icon: Icon,
  onMetricClick,
  isActive
}) => {
  const { getDisplayValue, selectedYear } = useLiveData();
  const value = getDisplayValue(metric);
  const isLive = selectedYear === new Date().getFullYear();
  
  // Dynamic formatting: Show decimals for small numbers (rates/percentages), integers for large counts
  const formattedValue = value < 100 
    ? value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })
    : Math.floor(value).toLocaleString();
  
  // Set to 1rem as requested
  const fontSizeClass = 'text-base';

  return (
    <div 
      onClick={() => onMetricClick(metric.id)}
      className={`
        relative p-3 rounded-xl cursor-pointer transition-all duration-300 border
        ${isActive 
          ? 'bg-white border-indigo-300 shadow-md ring-1 ring-indigo-200 transform scale-[1.02]' 
          : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 hover:-translate-y-0.5'
        }
      `}
    >
      <div className="flex flex-col gap-1.5">
        <div className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider truncate">
          {metric.label}
        </div>

        <div className="flex items-center gap-3">
          {/* Icon Box - compact */}
          <div 
            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-300"
            style={{ backgroundColor: `${metric.color}15`, color: metric.color }}
          >
            <Icon size={18} strokeWidth={2.5} />
          </div>

          {/* Value - 1rem size */}
          <div className={`${fontSizeClass} font-bold text-slate-800 tabular-nums leading-none tracking-tight`}>
            {formattedValue}
          </div>

          {/* Live/Proj Indicator - compact */}
          <div className={`ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm border border-opacity-50 ${isLive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
            {isLive ? <TrendingUp size={10} strokeWidth={3} /> : <Activity size={10} strokeWidth={3} />}
            {isLive ? 'Live' : 'Proj'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(StatCard);
