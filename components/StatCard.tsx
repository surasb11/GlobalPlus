import React from 'react';
import { TrendingUp, Info, Activity } from 'lucide-react';
import { MetricData } from '../types';
import { useLiveData } from '../context/LiveDataContext';

interface StatCardProps {
  metric: MetricData;
  icon: React.ReactNode;
  onClick: () => void;
  isActive: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  metric, 
  icon,
  onClick,
  isActive
}) => {
  const { getDisplayValue, selectedYear } = useLiveData();
  const value = getDisplayValue(metric);
  const isLive = selectedYear === new Date().getFullYear();
  
  const formattedValue = Math.floor(value).toLocaleString();
  
  // Dynamic font sizing based on length to prevent overflow
  const getFontSize = (len: number) => {
    if (len > 20) return 'text-base'; // Extremely long numbers
    if (len > 15) return 'text-lg';   // Trillions range
    if (len > 12) return 'text-xl';   // Billions range
    return 'text-2xl';                // Standard
  };

  const fontSizeClass = getFontSize(formattedValue.length);

  return (
    <div 
      onClick={onClick}
      className={`
        relative p-6 rounded-2xl cursor-pointer transition-all duration-300 transform overflow-hidden
        ${isActive 
          ? 'bg-white shadow-lg ring-4 ring-offset-2 scale-[1.02]' 
          : 'bg-white shadow-sm hover:shadow-xl hover:scale-105 hover:-translate-y-1'
        }
      `}
      style={{ '--tw-ring-color': metric.color } as React.CSSProperties}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-opacity-10`} style={{ backgroundColor: `${metric.color}20`, color: metric.color }}>
          {icon}
        </div>
        <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${isLive ? 'text-green-500 bg-green-50' : 'text-amber-500 bg-amber-50'}`}>
          {isLive ? <TrendingUp size={12} className="mr-1" /> : <Activity size={12} className="mr-1" />}
          {isLive ? 'Live' : 'Proj.'}
        </div>
      </div>
      
      <h3 className="text-gray-500 text-sm font-medium mb-1 truncate" title={metric.label}>{metric.label}</h3>
      <div className={`${fontSizeClass} font-bold text-gray-800 tabular-nums tracking-tight break-all`}>
        {formattedValue}
      </div>
      <div className="text-xs text-gray-400 mt-1 font-medium">
        {metric.unit}
      </div>
      
      {isActive && (
        <div className="absolute top-2 right-2 text-gray-300">
           <Info size={16} />
        </div>
      )}
    </div>
  );
};

export default StatCard;