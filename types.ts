export type CategoryId = 'population' | 'economics' | 'environment' | 'technology' | 'health' | 'society' | 'energy';

export interface Metric {
  id: string;
  label: string;
  baseValue: number;
  growthRate: number; // units per second (can be negative)
  unit: string;
  color: string;
  description: string;
  category: CategoryId;
  regionalMultipliers?: Record<string, number>; // coefficient for specific regions (e.g., 'US': 0.04)
}

export interface HistoricalDataPoint {
  year: string;
  value: number;
}

export interface MetricData extends Metric {
  history: HistoricalDataPoint[];
}

export type ChartType = 'area' | 'bar' | 'line';

export interface InsightResult {
  text: string;
  loading: boolean;
}

export type RegionCode = 'WORLD' | 'USA' | 'CHN' | 'IND' | 'EU' | 'BRA';

export interface FilterState {
  region: RegionCode;
  year: number;
  category: CategoryId | 'all';
}
