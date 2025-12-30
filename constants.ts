
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
const generateHistory = (base: number, growth: number, steps: number = 100) => {
  const data = [];
  const currentYear = 2024;
  const startYear = currentYear - steps + 1;
  for (let i = 0; i < steps; i++) {
    const year = startYear + i;
    const diffYears = currentYear - year;
    const value = base - (growth * diffYears * 31536000); 
    // Add noise
    const noise = value * 0.02 * (Math.random() - 0.5);
    data.push({
      year: year.toString(),
      value: Math.floor(Math.max(0, value + noise)), 
    });
  }
  return data;
};

// Regional Multipliers
const POP_MULTIPLIERS = { 'USA': 0.042, 'CHN': 0.17, 'IND': 0.175, 'EU': 0.05, 'BRA': 0.026 };
const GDP_MULTIPLIERS = { 'USA': 0.25, 'CHN': 0.18, 'IND': 0.035, 'EU': 0.17, 'BRA': 0.02 };
const TECH_MULTIPLIERS = { 'USA': 0.30, 'CHN': 0.25, 'IND': 0.15, 'EU': 0.20, 'BRA': 0.05 };

export const MOCK_DATA: MetricData[] = [
  // --- DEMOGRAPHICS ---
  {
    id: 'world-pop',
    label: 'Total Population',
    baseValue: 8100000000,
    growthRate: 2.5, 
    unit: 'people',
    color: '#3b82f6',
    category: 'population',
    description: 'Total human population. Global population has grown from roughly 1.9 billion in 1924 to over 8 billion today.',
    history: generateHistory(8100000000, 2.5, 100),
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
    history: generateHistory(134000000, 4.5, 50),
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
    history: generateHistory(60000000, 1.9, 50),
    regionalMultipliers: POP_MULTIPLIERS
  },

  // --- ECONOMICS ---
  {
    id: 'world-gdp',
    label: 'Global GDP (Nominal)',
    baseValue: 105000000000000, 
    growthRate: 150000,
    unit: 'USD',
    color: '#10b981',
    category: 'economics',
    description: 'Gross Domestic Product worldwide.',
    history: generateHistory(105000000000000, 150000, 60),
    regionalMultipliers: GDP_MULTIPLIERS
  },

  // --- TECHNOLOGY ---
  {
    id: 'internet-users',
    label: 'Internet Users',
    baseValue: 5400000000,
    growthRate: 4.2,
    unit: 'users',
    color: '#6366f1',
    category: 'technology',
    description: 'Individuals using the internet. Usage has exploded from 0 in the mid-20th century to over 5 billion today.',
    history: generateHistory(5400000000, 4.2, 30),
    regionalMultipliers: TECH_MULTIPLIERS
  },

  // --- HEALTH ---
  {
    id: 'life-expectancy',
    label: 'Avg Life Expectancy',
    baseValue: 73.2,
    growthRate: 0.0000000111, 
    unit: 'years',
    color: '#ec4899',
    category: 'health',
    description: 'Average life expectancy at birth. In 1924, global life expectancy was roughly 35-40 years.',
    history: generateHistory(73.2, 0.0000000111, 100),
    regionalMultipliers: { 
      'USA': 1.054, // ~77.2
      'CHN': 1.068, // ~78.2
      'IND': 0.959, // ~70.2
      'EU': 1.109,  // ~81.2
      'BRA': 1.036, // ~75.8
      'WORLD': 1 
    } 
  }
];
