import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { MOCK_DATA } from '../constants';
import { MetricData, RegionCode } from '../types';

interface LiveDataContextType {
  liveValues: Record<string, number>;
  selectedRegion: RegionCode;
  selectedYear: number;
  setRegion: (region: RegionCode) => void;
  setYear: (year: number) => void;
  getDisplayValue: (metric: MetricData) => number;
}

const LiveDataContext = createContext<LiveDataContextType | undefined>(undefined);

// Standalone helper calculation for use outside of context
export const calculateValue = (metric: MetricData, year: number, region: string, month?: number, ageRange?: string, gender?: string) => {
  let diffYears = year - 2024;

  if (month !== undefined) {
    diffYears = (year - 2024) - ((12 - month) / 12);
  }

  let val = metric.baseValue + (metric.growthRate * diffYears * 31536000); 

  // Demographic heuristics for Life Expectancy
  if (metric.id === 'life-expectancy') {
    // 1. Age-based heuristics
    if (ageRange && ageRange !== 'all') {
      const yearWeight = (year - 1900) / 124; // 0 at 1900, 1 at 2024
      switch (ageRange) {
        case '0-5':
          // Standard metric, no adjustment needed relative to base
          break;
        case '5-20':
          val += (1 - yearWeight) * 15; 
          break;
        case '20-60':
          val += 5 + (yearWeight * 5);
          break;
        case '60+':
          val = 15 + (yearWeight * 15); 
          break;
      }
    }

    // 2. Gender-based heuristics (Standard gap of ~5 years)
    if (gender === 'male') {
      val -= 2.5;
    } else if (gender === 'female') {
      val += 2.5;
    }
  }

  // 3. Apply Regional Multiplier
  if (region !== 'WORLD') {
    if (metric.regionalMultipliers && metric.regionalMultipliers[region]) {
      val = val * metric.regionalMultipliers[region];
    } else {
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
  const intervalRef = useRef<number>(0); 

  useEffect(() => {
    const initial: Record<string, number> = {};
    MOCK_DATA.forEach(m => initial[m.id] = m.baseValue);
    setLiveValues(initial);
  }, []);

  useEffect(() => {
    const TICK_MS = 3000; 

    const updateValues = () => {
      const now = Date.now();
      const elapsedSeconds = (now - startTimeRef.current) / 1000;
      const nextValues: Record<string, number> = {};
      
      MOCK_DATA.forEach(metric => {
        const isCurrentYear = selectedYear === new Date().getFullYear();
        let calculatedValue;
        
        if (isCurrentYear) {
          calculatedValue = metric.baseValue + (metric.growthRate * elapsedSeconds);
        } else {
          const diffYears = selectedYear - 2024;
          calculatedValue = metric.baseValue + (metric.growthRate * diffYears * 31536000); 
        }
        nextValues[metric.id] = calculatedValue;
      });
      setLiveValues(nextValues);
    };

    updateValues();
    intervalRef.current = window.setInterval(updateValues, TICK_MS);
    return () => window.clearInterval(intervalRef.current);
  }, [selectedYear]);

  const getDisplayValue = (metric: MetricData) => {
    const baseVal = liveValues[metric.id] || metric.baseValue;
    if (selectedRegion !== 'WORLD' && metric.regionalMultipliers) {
      const multiplier = metric.regionalMultipliers[selectedRegion] || 0;
      return baseVal * multiplier;
    }
    if (selectedRegion !== 'WORLD' && !metric.regionalMultipliers) {
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