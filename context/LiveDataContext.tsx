import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { MOCK_DATA } from '../constants';
import { MetricData, RegionCode } from '../types';

interface LiveDataState {
  values: Record<string, number>;
  timestamp: number;
}

interface LiveDataContextType {
  liveValues: Record<string, number>;
  selectedRegion: RegionCode;
  selectedYear: number;
  setRegion: (region: RegionCode) => void;
  setYear: (year: number) => void;
  getDisplayValue: (metric: MetricData) => number;
}

const LiveDataContext = createContext<LiveDataContextType | undefined>(undefined);

// Standalone helper calculation for use outside of context if needed
export const calculateValue = (metric: MetricData, year: number, region: string) => {
  // 1. Calculate Base for Year
  const isCurrentYear = year === new Date().getFullYear();
  let val = metric.baseValue;
  
  if (isCurrentYear) {
    // For live current year, we approximate based on "now" relative to a start of year
    // Since we don't have exact start of year timestamp here easily without passing it,
    // we will use the generic linear projection from the mock data start.
    // However, to keep it consistent with the "Live" ticker which adds elapsed seconds:
    // We will just use the baseValue as the "start of 2024" snapshot for simplicity in static calc,
    // or project it to mid-year. 
    // Better approach for consistency with `generateHistory`:
    const diffYears = year - 2024;
    val = metric.baseValue + (metric.growthRate * diffYears * 31536000); 
  } else {
    // Time travel logic
    const diffYears = year - 2024;
    val = metric.baseValue + (metric.growthRate * diffYears * 31536000); 
  }

  // 2. Apply Regional Multiplier
  if (region !== 'WORLD') {
    if (metric.regionalMultipliers && metric.regionalMultipliers[region]) {
      val = val * metric.regionalMultipliers[region];
    } else {
      // Fallback heuristic
      const heuristic: Record<string, number> = { 'USA': 0.25, 'CHN': 0.18, 'IND': 0.04, 'EU': 0.17, 'BRA': 0.02 };
      val = val * (heuristic[region] || 0.01);
    }
  }

  return val;
};

export const LiveDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [liveValues, setLiveValues] = useState<Record<string, number>>({});
  const [selectedRegion, setSelectedRegion] = useState<RegionCode>('WORLD');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  const startTimeRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number>();

  // Initialize base values
  useEffect(() => {
    const initial: Record<string, number> = {};
    MOCK_DATA.forEach(m => initial[m.id] = m.baseValue);
    setLiveValues(initial);
  }, []);

  // The "WebSocket" simulation - Ticker
  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const elapsedSeconds = (now - startTimeRef.current) / 1000;
      
      const nextValues: Record<string, number> = {};
      
      MOCK_DATA.forEach(metric => {
        // Core calculation: Base + (Growth * Time)
        // Adjust for "Year" selection: if not current year, we stop "ticking" and show static projected value
        const isCurrentYear = selectedYear === new Date().getFullYear();
        
        let calculatedValue;
        
        if (isCurrentYear) {
          calculatedValue = metric.baseValue + (metric.growthRate * elapsedSeconds);
        } else {
          // Time travel logic
          const diffYears = selectedYear - 2024;
          calculatedValue = metric.baseValue + (metric.growthRate * diffYears * 31536000); 
        }

        nextValues[metric.id] = calculatedValue;
      });

      setLiveValues(nextValues);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [selectedYear]);

  // Helper to get value with filters applied
  const getDisplayValue = (metric: MetricData) => {
    const baseVal = liveValues[metric.id] || metric.baseValue;
    
    // Apply Region Multiplier
    if (selectedRegion !== 'WORLD' && metric.regionalMultipliers) {
      const multiplier = metric.regionalMultipliers[selectedRegion] || 0;
      return baseVal * multiplier;
    }
    
    // Fallback if no specific multiplier but region selected (rough generic heuristic for demo)
    if (selectedRegion !== 'WORLD' && !metric.regionalMultipliers) {
      // Rough GDP-based heuristic if no data
      const heuristic = { 'USA': 0.25, 'CHN': 0.18, 'IND': 0.04, 'EU': 0.17, 'BRA': 0.02 };
      return baseVal * (heuristic[selectedRegion] || 0.01);
    }

    return baseVal;
  };

  return (
    <LiveDataContext.Provider value={{ 
      liveValues, 
      selectedRegion, 
      selectedYear,
      setRegion: setSelectedRegion, 
      setYear: setSelectedYear,
      getDisplayValue 
    }}>
      {children}
    </LiveDataContext.Provider>
  );
};

export const useLiveData = () => {
  const context = useContext(LiveDataContext);
  if (!context) throw new Error("useLiveData must be used within LiveDataProvider");
  return context;
};