import { MetricData, CategoryId, RegionCode } from './types';
import { 
  Users, DollarSign, Leaf, Zap, Activity, GraduationCap, Globe, 
  Smartphone, CloudRain, Briefcase, Factory, Trash2 
} from 'lucide-react';

export const CATEGORIES: { id: CategoryId; label: string; icon: any }[] = [
  { id: 'population', label: 'Demographics', icon: Users },
  { id: 'economics', label: 'Economics', icon: DollarSign },
  { id: 'environment', label: 'Environment', icon: Leaf },
  { id: 'technology', label: 'Technology', icon: Zap },
  { id: 'health', label: 'Health', icon: Activity },
  { id: 'society', label: 'Society', icon: GraduationCap },
  { id: 'energy', label: 'Energy', icon: Factory },
];

export const REGIONS: { code: RegionCode; label: string }[] = [
  { code: 'WORLD', label: 'World' },
  { code: 'USA', label: 'United States' },
  { code: 'CHN', label: 'China' },
  { code: 'IND', label: 'India' },
  { code: 'EU', label: 'European Union' },
  { code: 'BRA', label: 'Brazil' },
];

// Helper to generate mock history
const generateHistory = (base: number, growth: number, steps: number = 10) => {
  const data = [];
  const startYear = 2015;
  for (let i = 0; i < steps; i++) {
    const year = startYear + i;
    // Simple linear regression backwards from "now"
    const diffYears = 2024 - year;
    const value = base - (growth * diffYears * 31536000); 
    // Add noise
    const noise = value * 0.02 * (Math.random() - 0.5);
    data.push({
      year: year.toString(),
      value: Math.floor(value + noise), 
    });
  }
  return data;
};

// Regional Multipliers (Approximations for demo purposes)
const POP_MULTIPLIERS = { 'USA': 0.042, 'CHN': 0.17, 'IND': 0.175, 'EU': 0.05, 'BRA': 0.026 };
const GDP_MULTIPLIERS = { 'USA': 0.25, 'CHN': 0.18, 'IND': 0.035, 'EU': 0.17, 'BRA': 0.02 };
const TECH_MULTIPLIERS = { 'USA': 0.30, 'CHN': 0.25, 'IND': 0.15, 'EU': 0.20, 'BRA': 0.05 };

export const MOCK_DATA: MetricData[] = [
  // --- DEMOGRAPHICS ---
  {
    id: 'world-pop',
    label: 'Total Population',
    baseValue: 8100000000,
    growthRate: 2.3, 
    unit: 'people',
    color: '#3b82f6',
    category: 'population',
    description: 'Total human population. Source: UN Population Division.',
    history: generateHistory(8100000000, 2.3),
    regionalMultipliers: POP_MULTIPLIERS
  },
  {
    id: 'births-year',
    label: 'Births This Year',
    baseValue: 115000000,
    growthRate: 4.5,
    unit: 'births',
    color: '#8b5cf6',
    category: 'population',
    description: 'Cumulative births since Jan 1st.',
    history: generateHistory(134000000, 4.5), // Annualized
    regionalMultipliers: POP_MULTIPLIERS
  },
  {
    id: 'deaths-year',
    label: 'Deaths This Year',
    baseValue: 50000000,
    growthRate: 1.9,
    unit: 'deaths',
    color: '#64748b',
    category: 'population',
    description: 'Cumulative deaths since Jan 1st.',
    history: generateHistory(60000000, 1.9),
    regionalMultipliers: POP_MULTIPLIERS
  },
  {
    id: 'urban-pop',
    label: 'Urban Population',
    baseValue: 4600000000,
    growthRate: 1.5,
    unit: 'people',
    color: '#0ea5e9',
    category: 'population',
    description: 'People living in urban areas.',
    history: generateHistory(4600000000, 1.5),
    regionalMultipliers: { 'USA': 0.82 * 0.042, 'CHN': 0.65 * 0.17, 'IND': 0.35 * 0.175, 'EU': 0.75 * 0.05, 'BRA': 0.87 * 0.026 }
  },

  // --- ECONOMICS ---
  {
    id: 'world-gdp',
    label: 'Global GDP (Nominal)',
    baseValue: 105000000000000, // 105 Trillion
    growthRate: 120000, // $ per second approx
    unit: 'USD',
    color: '#10b981',
    category: 'economics',
    description: 'Gross Domestic Product worldwide.',
    history: generateHistory(105000000000000, 120000),
    regionalMultipliers: GDP_MULTIPLIERS
  },
  {
    id: 'gov-health-exp',
    label: 'Public Healthcare Spending',
    baseValue: 9500000000000,
    growthRate: 35000,
    unit: 'USD',
    color: '#059669',
    category: 'economics',
    description: 'Government expenditure on healthcare (Year to Date).',
    history: generateHistory(9500000000000, 35000),
    regionalMultipliers: GDP_MULTIPLIERS
  },
  {
    id: 'unemployed',
    label: 'Unemployed Persons',
    baseValue: 205000000,
    growthRate: 0.5,
    unit: 'people',
    color: '#f59e0b',
    category: 'economics',
    description: 'Total unemployed workforce worldwide.',
    history: generateHistory(205000000, 0.5),
    regionalMultipliers: POP_MULTIPLIERS
  },

  // --- TECHNOLOGY ---
  {
    id: 'internet-users',
    label: 'Internet Users',
    baseValue: 5400000000,
    growthRate: 3.5,
    unit: 'users',
    color: '#6366f1',
    category: 'technology',
    description: 'Individuals using the internet.',
    history: generateHistory(5400000000, 3.5),
    regionalMultipliers: TECH_MULTIPLIERS
  },
  {
    id: 'smartphones-sold',
    label: 'Smartphones Sold (Year)',
    baseValue: 1100000000,
    growthRate: 35,
    unit: 'units',
    color: '#8b5cf6',
    category: 'technology',
    description: 'Smartphones sold worldwide this year.',
    history: generateHistory(1100000000, 35),
    regionalMultipliers: TECH_MULTIPLIERS
  },
  {
    id: 'google-searches',
    label: 'Google Searches Today',
    baseValue: 5000000000,
    growthRate: 98000,
    unit: 'queries',
    color: '#4285F4',
    category: 'technology',
    description: 'Search queries processed by Google today.',
    history: generateHistory(5000000000, 98000),
    regionalMultipliers: TECH_MULTIPLIERS
  },
  {
    id: 'amazon-revenue',
    label: 'Amazon Revenue (Year)',
    baseValue: 575000000000,
    growthRate: 18000, // $/sec
    unit: 'USD',
    color: '#FF9900',
    category: 'technology',
    description: 'Estimated Amazon revenue year-to-date.',
    history: generateHistory(575000000000, 18000),
    regionalMultipliers: { 'USA': 0.6, 'EU': 0.2, 'WORLD': 1, 'CHN': 0.01, 'IND': 0.02, 'BRA': 0.01 }
  },
  {
    id: 'meta-users',
    label: 'Meta Active Users',
    baseValue: 3980000000,
    growthRate: 2.1,
    unit: 'users',
    color: '#0668E1',
    category: 'technology',
    description: 'Monthly active people across Meta family (FB, IG, WA).',
    history: generateHistory(3980000000, 2.1),
    regionalMultipliers: TECH_MULTIPLIERS
  },
  {
    id: 'ewaste',
    label: 'E-Waste Generated',
    baseValue: 62000000,
    growthRate: 2, // tons per second (approx)
    unit: 'tons',
    color: '#ef4444',
    category: 'technology',
    description: 'Electronic waste generated this year.',
    history: generateHistory(62000000, 2),
    regionalMultipliers: GDP_MULTIPLIERS
  },

  // --- ENVIRONMENT ---
  {
    id: 'co2-emissions',
    label: 'CO2 Emissions',
    baseValue: 37000000000,
    growthRate: 1100,
    unit: 'tons',
    color: '#71717a',
    category: 'environment',
    description: 'Carbon dioxide emissions from fossil fuels and industry.',
    history: generateHistory(37000000000, 1100),
    regionalMultipliers: { 'USA': 0.13, 'CHN': 0.31, 'IND': 0.07, 'EU': 0.08, 'BRA': 0.015, 'WORLD': 1 }
  },
  {
    id: 'forest-loss',
    label: 'Forest Loss (Year)',
    baseValue: 10000000,
    growthRate: 0.5,
    unit: 'hectares',
    color: '#d97706',
    category: 'environment',
    description: 'Hectares of forest cleared this year.',
    history: generateHistory(10000000, 0.5),
    regionalMultipliers: { 'BRA': 0.4, 'IND': 0.05, 'USA': 0.02, 'CHN': 0.03, 'EU': 0.01, 'WORLD': 1 }
  },
  {
    id: 'water-consumed',
    label: 'Water Consumed (Year)',
    baseValue: 4000000000000, // cubic meters?
    growthRate: 120000, 
    unit: 'M liters',
    color: '#0ea5e9',
    category: 'environment',
    description: 'Freshwater withdrawals for agriculture & industry.',
    history: generateHistory(4000000000000, 120000),
    regionalMultipliers: POP_MULTIPLIERS
  },
  {
    id: 'solar-energy',
    label: 'Solar Energy Generated',
    baseValue: 1500000000,
    growthRate: 350,
    unit: 'MWh',
    color: '#facc15',
    category: 'energy',
    description: 'Electricity generated by solar PV this year.',
    history: generateHistory(1500000000, 350),
    regionalMultipliers: { 'CHN': 0.35, 'USA': 0.15, 'EU': 0.2, 'IND': 0.08, 'BRA': 0.05, 'WORLD': 1 }
  },

  // --- HEALTH ---
  {
    id: 'life-expectancy',
    label: 'Avg Life Expectancy',
    baseValue: 73.2,
    growthRate: 0.0000001, // Very slow moving
    unit: 'years',
    color: '#ec4899',
    category: 'health',
    description: 'Average life expectancy at birth.',
    history: generateHistory(73.2, 0.0000001),
    // For life expectancy, multipliers work differently (offset). 
    // We will handle this in the logic, or just use base values if complex. 
    // Simplified: No multiplier for "years", this needs special handling or just allow slight variation.
    regionalMultipliers: { 'USA': 1.05, 'CHN': 1.06, 'IND': 0.95, 'EU': 1.1, 'BRA': 1.02, 'WORLD': 1 } 
  },
  {
    id: 'cigarettes',
    label: 'Cigarettes Smoked Today',
    baseValue: 15000000000,
    growthRate: 200000,
    unit: 'sticks',
    color: '#475569',
    category: 'health',
    description: 'Estimated cigarettes smoked worldwide today.',
    history: generateHistory(15000000000, 200000),
    regionalMultipliers: { 'CHN': 0.4, 'USA': 0.05, 'EU': 0.1, 'IND': 0.1, 'BRA': 0.02, 'WORLD': 1 }
  }
];
