import React, { useState, useMemo } from 'react';
import { MetricData } from '../types';
import { REGIONS, CATEGORIES } from '../constants';
import { calculateValue } from '../context/LiveDataContext';
import { compareMetricsAnalysis, ComparisonResult } from '../services/geminiService';
import { 
  ArrowRightLeft, Sparkles, Loader2, Calendar, MapPin, 
  Lightbulb, Plus, Trash2, BarChart2, TrendingUp,
  Clock, Check, ChevronDown, CalendarRange, History, Baby,
  Users, User, ArrowRight
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

interface ComparisonToolProps {
  metrics: MetricData[];
}

const MONTHS_LIST = [
  { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
];

const AGE_DEMOGRAPHICS = [
  { id: 'all', label: 'All Ages (Avg)' },
  { id: '0-5', label: 'Early Childhood (0-5)' },
  { id: '5-20', label: 'Youth (5-20)' },
  { id: '20-60', label: 'Adults (20-60)' },
  { id: '60+', label: 'Seniors (60+)' }
];

const GENDER_OPTIONS = [
  { id: 'all', label: 'All', icon: Users },
  { id: 'male', label: 'Male', icon: User },
  { id: 'female', label: 'Female', icon: User }
];

const MILESTONES = [1924, 1974, 2024, 2050];

interface DatasetConfig {
  id: string;
  metricId: string;
  region: string;
  timeMode: 'point' | 'range';
  ageRange?: string;
  gender?: string;
  year: number;
  months: number[]; 
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
  color: string;
}

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b'];

const ComparisonTool: React.FC<ComparisonToolProps> = ({ metrics }) => {
  const [datasets, setDatasets] = useState<DatasetConfig[]>([
    { 
      id: '1', 
      metricId: 'life-expectancy', 
      region: 'WORLD', 
      timeMode: 'point',
      ageRange: 'all',
      gender: 'all',
      year: 2024, 
      months: [12], 
      startYear: 2010, startMonth: 1, endYear: 2024, endMonth: 12,
      color: COLORS[0] 
    },
    { 
      id: '2', 
      metricId: 'life-expectancy', 
      region: 'WORLD', 
      timeMode: 'point',
      ageRange: 'all',
      gender: 'all',
      year: 1924, 
      months: [12], 
      startYear: 1910, startMonth: 1, endYear: 1924, endMonth: 12,
      color: COLORS[1] 
    }
  ]);
  
  const [chartMode, setChartMode] = useState<'line' | 'bar'>('line');
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeRangePicker, setActiveRangePicker] = useState<string | null>(null);

  const getMetric = (id: string) => metrics.find(m => m.id === id);

  const addDataset = () => {
    if (datasets.length >= 4) return;
    const newId = Math.random().toString(36).substr(2, 9);
    const nextColor = COLORS[datasets.length % COLORS.length];
    setDatasets([...datasets, { 
      id: newId, 
      metricId: metrics[0].id, 
      region: 'WORLD', 
      timeMode: 'point',
      ageRange: 'all',
      gender: 'all',
      year: 2024, 
      months: [12],
      startYear: 2010, startMonth: 1, endYear: 2024, endMonth: 12,
      color: nextColor 
    }]);
  };

  const removeDataset = (id: string) => {
    if (datasets.length <= 1) return;
    setDatasets(datasets.filter(d => d.id !== id));
  };

  const updateDataset = (id: string, updates: Partial<DatasetConfig>) => {
    setDatasets(datasets.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const toggleMonth = (id: string, month: number) => {
    const ds = datasets.find(d => d.id === id);
    if (!ds) return;
    const newMonths = ds.months.includes(month) 
      ? ds.months.filter(m => m !== month)
      : [...ds.months, month].sort((a, b) => a - b);
    
    if (newMonths.length === 0) return;
    updateDataset(id, { months: newMonths });
  };

  const chartData = useMemo(() => {
    const points = Array.from({length: 12}, (_, i) => i);
    
    return points.map(idx => {
      const row: any = { index: idx };
      datasets.forEach(ds => {
        const metric = getMetric(ds.metricId);
        if (!metric) return;

        if (ds.timeMode === 'point') {
          const monthIdx = ds.months.length > 1 ? ds.months[Math.min(idx, ds.months.length - 1)] : idx + 1;
          row[`dataset_${ds.id}`] = calculateValue(metric, ds.year, ds.region, monthIdx, ds.ageRange, ds.gender);
        } else {
          const totalMonths = (ds.endYear - ds.startYear) * 12 + (ds.endMonth - ds.startMonth);
          const monthOffset = Math.floor((idx / 11) * totalMonths);
          const currentYear = ds.startYear + Math.floor((ds.startMonth - 1 + monthOffset) / 12);
          const currentMonth = ((ds.startMonth - 1 + monthOffset) % 12) + 1;
          row[`dataset_${ds.id}`] = calculateValue(metric, currentYear, ds.region, currentMonth, ds.ageRange, ds.gender);
        }
      });
      return row;
    });
  }, [datasets, metrics]);

  const handleCompare = async () => {
    setLoading(true);
    setResult(null);

    const items = datasets.map(ds => {
      const metric = getMetric(ds.metricId)!;
      let value = 0;
      let context = "";
      const rLabel = REGIONS.find(r => r.code === ds.region)?.label || ds.region;
      const ageLabel = ds.metricId === 'life-expectancy' ? `${AGE_DEMOGRAPHICS.find(a => a.id === ds.ageRange)?.label}` : "";
      const genderLabel = ds.metricId === 'life-expectancy' ? `${GENDER_OPTIONS.find(g => g.id === ds.gender)?.label}` : "";
      const demographicInfo = ds.metricId === 'life-expectancy' ? `(${ageLabel}, ${genderLabel})` : "";

      if (ds.timeMode === 'point') {
        value = calculateValue(metric, ds.year, ds.region, ds.months[ds.months.length - 1], ds.ageRange, ds.gender);
        context = `${rLabel}, ${ds.year} ${demographicInfo}`;
      } else {
        value = calculateValue(metric, ds.endYear, ds.region, ds.endMonth, ds.ageRange, ds.gender);
        context = `${rLabel}, ${ds.startYear}-${ds.endYear} ${demographicInfo}`;
      }

      return {
        label: metric.label,
        value,
        unit: metric.unit,
        context
      };
    });

    const data = await compareMetricsAnalysis(items);
    setResult(data);
    setLoading(false);
  };

  const getMonthLabel = (m: number) => MONTHS_LIST.find(item => item.value === m)?.label || m;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ArrowRightLeft className="text-indigo-600" size={24} />
            </div>
            Global Comparison Lab
          </h2>
          <p className="text-slate-500 text-sm mt-1">Cross-reference metrics by age, gender, geography and era.</p>
        </div>
        
        <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm self-end md:self-auto">
           <button 
             onClick={() => setChartMode('line')}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${chartMode === 'line' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <TrendingUp size={16} /> Line
           </button>
           <button 
             onClick={() => setChartMode('bar')}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${chartMode === 'bar' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <BarChart2 size={16} /> Bar
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {datasets.map((ds, idx) => {
          const metric = getMetric(ds.metricId);
          
          return (
            <div key={ds.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-indigo-300">
              <div className="flex flex-col lg:flex-row">
                {/* Left Side: Metric & Demographic Selection */}
                <div className="flex items-start gap-4 p-4 lg:p-6 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-100 min-w-[340px]">
                  <div className="w-1.5 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: ds.color }}></div>
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Dataset {idx + 1}</label>
                    <select 
                      className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer hover:text-indigo-600 truncate mb-3"
                      value={ds.metricId}
                      onChange={(e) => updateDataset(ds.id, { metricId: e.target.value })}
                    >
                      {CATEGORIES.map(cat => (
                        <optgroup key={cat.id} label={cat.label}>
                          {metrics.filter(m => m.category === cat.id).map(m => (
                            <option key={m.id} value={m.id}>{m.label}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    
                    {/* Integrated Demographic Controls */}
                    {ds.metricId === 'life-expectancy' && (
                      <div className="space-y-3 mt-4 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase mb-1.5 block">Age Demographic</label>
                          <div className="flex items-center gap-2">
                            <Baby size={14} className="text-slate-400" />
                            <select 
                              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer w-full"
                              value={ds.ageRange || 'all'}
                              onChange={(e) => updateDataset(ds.id, { ageRange: e.target.value })}
                            >
                              {AGE_DEMOGRAPHICS.map(age => <option key={age.id} value={age.id}>{age.label}</option>)}
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase mb-1.5 block">Gender Focus</label>
                          <div className="flex bg-slate-100 p-0.5 rounded-lg w-full">
                            {GENDER_OPTIONS.map(opt => (
                              <button
                                key={opt.id}
                                onClick={() => updateDataset(ds.id, { gender: opt.id })}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md text-[10px] font-bold transition-all ${ds.gender === opt.id ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                              >
                                <opt.icon size={12} />
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200 text-xs font-bold shadow-sm hover:border-indigo-200 transition-colors">
                        <MapPin size={12} className="text-indigo-500" />
                        <select 
                          className="bg-transparent outline-none cursor-pointer appearance-none pr-1"
                          value={ds.region}
                          onChange={(e) => updateDataset(ds.id, { region: e.target.value })}
                        >
                          {REGIONS.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle: Timeline & Era Configuration */}
                <div className="flex-1 p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Era Timeline Mode</label>
                    <div className="inline-flex bg-slate-100 p-1 rounded-xl w-fit">
                      <button 
                        onClick={() => updateDataset(ds.id, { timeMode: 'point' })}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${ds.timeMode === 'point' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-600'}`}
                      >
                        <Clock size={14} /> Instant
                      </button>
                      <button 
                        onClick={() => updateDataset(ds.id, { timeMode: 'range' })}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${ds.timeMode === 'range' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-600'}`}
                      >
                        <CalendarRange size={14} /> Delta
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 relative">
                    {ds.timeMode === 'point' ? (
                      <div className="flex gap-4 w-full">
                        <div className="w-24">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Year</label>
                          <input 
                            type="number"
                            min="1900"
                            max="2100"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 text-center"
                            value={ds.year}
                            onChange={(e) => updateDataset(ds.id, { year: Number(e.target.value) })}
                          />
                        </div>
                        <div className="flex-1 min-w-[140px] relative">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Interval</label>
                          <button 
                            onClick={() => setActiveDropdown(activeDropdown === ds.id ? null : ds.id)}
                            className="w-full h-[42px] flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm text-left hover:border-indigo-300 transition-colors"
                          >
                            <span className="truncate font-medium text-slate-700">
                              {ds.months.length === 12 ? 'Aggregate Year' : ds.months.length === 1 ? MONTHS_LIST.find(m => m.value === ds.months[0])?.label : `${ds.months.length} Months`}
                            </span>
                            <ChevronDown size={14} className="text-slate-400" />
                          </button>
                          
                          {activeDropdown === ds.id && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 z-50 grid grid-cols-3 gap-1 animate-in fade-in slide-in-from-top-2">
                              {MONTHS_LIST.map(m => (
                                <button
                                  key={m.value}
                                  onClick={() => toggleMonth(ds.id, m.value)}
                                  className={`p-2 rounded-lg text-xs font-bold transition-all ${ds.months.includes(m.value) ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-50 text-slate-600'}`}
                                >
                                  {m.label}
                                </button>
                              ))}
                              <button 
                                onClick={() => updateDataset(ds.id, { months: [1,2,3,4,5,6,7,8,9,10,11,12] })}
                                className="col-span-3 mt-1 py-1.5 text-[10px] text-indigo-600 font-bold hover:bg-indigo-50 rounded"
                              >
                                Select Entire Year
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Era Selection</label>
                        <button 
                          onClick={() => setActiveRangePicker(activeRangePicker === ds.id ? null : ds.id)}
                          className="w-full h-[42px] flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm hover:border-indigo-300 transition-colors"
                        >
                          <div className="flex items-center gap-3 font-bold text-slate-700">
                            <div className="flex items-center gap-1.5">
                              <span className="text-indigo-600 opacity-60 font-medium text-[10px] uppercase">From</span>
                              <span>{getMonthLabel(ds.startMonth)} {ds.startYear}</span>
                            </div>
                            <ArrowRight size={14} className="text-slate-300" />
                            <div className="flex items-center gap-1.5">
                              <span className="text-indigo-600 opacity-60 font-medium text-[10px] uppercase">To</span>
                              <span>{getMonthLabel(ds.endMonth)} {ds.endYear}</span>
                            </div>
                          </div>
                          <CalendarRange size={14} className="text-slate-400" />
                        </button>

                        {activeRangePicker === ds.id && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 z-50 animate-in fade-in zoom-in duration-200 origin-top min-w-[400px]">
                            <div className="grid grid-cols-2 gap-8 relative">
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center z-10">
                                <ArrowRight size={16} className="text-slate-300" />
                              </div>

                              {/* Start Point Selection */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Start Period</span>
                                </div>
                                <input 
                                  type="number"
                                  className="w-full bg-slate-100 border-none rounded-xl p-2 text-sm font-bold text-center outline-none focus:ring-2 focus:ring-indigo-100"
                                  value={ds.startYear}
                                  onChange={(e) => updateDataset(ds.id, { startYear: Number(e.target.value) })}
                                />
                                <div className="grid grid-cols-3 gap-1">
                                  {MONTHS_LIST.map(m => (
                                    <button
                                      key={m.value}
                                      onClick={() => updateDataset(ds.id, { startMonth: m.value })}
                                      className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${ds.startMonth === m.value ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                    >
                                      {m.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* End Point Selection */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">End Period</span>
                                </div>
                                <input 
                                  type="number"
                                  className="w-full bg-slate-100 border-none rounded-xl p-2 text-sm font-bold text-center outline-none focus:ring-2 focus:ring-indigo-100"
                                  value={ds.endYear}
                                  onChange={(e) => updateDataset(ds.id, { endYear: Number(e.target.value) })}
                                />
                                <div className="grid grid-cols-3 gap-1">
                                  {MONTHS_LIST.map(m => (
                                    <button
                                      key={m.value}
                                      onClick={() => updateDataset(ds.id, { endMonth: m.value })}
                                      className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${ds.endMonth === m.value ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                    >
                                      {m.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => setActiveRangePicker(null)}
                              className="w-full mt-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md"
                            >
                              Apply Range
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 flex items-center gap-3 pt-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                      <History size={10} /> Jump Era:
                    </span>
                    <div className="flex gap-1.5">
                      {MILESTONES.map(m => (
                        <button 
                          key={m}
                          onClick={() => updateDataset(ds.id, { 
                            year: m, 
                            startYear: m-10, 
                            endYear: m 
                          })}
                          className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 lg:p-6 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-100">
                  {datasets.length > 1 && (
                    <button 
                      onClick={() => removeDataset(ds.id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <button 
          onClick={addDataset}
          disabled={datasets.length >= 4}
          className="flex items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          {datasets.length < 4 ? 'Add Comparison Dataset' : 'Limit Reached'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-12">
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl h-[500px] flex flex-col relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-0 -mr-32 -mt-32 opacity-50"></div>
           
           <div className="relative z-10 mb-6 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp size={18} className="text-indigo-600" />
                  Era & Demographic Correlation
                </h3>
                <p className="text-xs text-slate-500">Overlaying specific age and gender demographics across complex time intervals.</p>
              </div>
           </div>
           
           <div className="flex-1 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                 {chartMode === 'line' ? (
                   <LineChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="index" hide />
                     <YAxis hide />
                     <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
                       formatter={(value: number, name: string) => {
                         const ds = datasets.find(d => `dataset_${d.id}` === name);
                         const m = getMetric(ds?.metricId || '');
                         const periodText = ds?.timeMode === 'point' ? `${ds.year}` : `${getMonthLabel(ds?.startMonth || 1)} ${ds?.startYear} - ${getMonthLabel(ds?.endMonth || 12)} ${ds?.endYear}`;
                         const ageText = ds?.metricId === 'life-expectancy' ? AGE_DEMOGRAPHICS.find(a => a.id === ds.ageRange)?.label : '';
                         const genderText = ds?.metricId === 'life-expectancy' ? GENDER_OPTIONS.find(g => g.id === ds.gender)?.label : '';
                         return [`${Math.floor(value).toLocaleString()} ${m?.unit}`, `${m?.label} ${ageText} ${genderText} (${periodText})`];
                       }}
                     />
                     {datasets.map(ds => (
                       <Line key={ds.id} type="monotone" dataKey={`dataset_${ds.id}`} stroke={ds.color} strokeWidth={4} dot={{r: 5, fill: ds.color}} activeDot={{r: 8}} animationDuration={1000} />
                     ))}
                   </LineChart>
                 ) : (
                   <BarChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="index" hide />
                     <YAxis hide />
                     <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
                       formatter={(value: number, name: string) => {
                         const ds = datasets.find(d => `dataset_${d.id}` === name);
                         const m = getMetric(ds?.metricId || '');
                         return [`${Math.floor(value).toLocaleString()} ${m?.unit}`, `${m?.label}`];
                       }}
                     />
                     {datasets.map(ds => (
                       <Bar key={ds.id} dataKey={`dataset_${ds.id}`} fill={ds.color} radius={[4, 4, 0, 0]} />
                     ))}
                   </BarChart>
                 )}
              </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
           <button 
             onClick={handleCompare}
             disabled={loading}
             className="w-full bg-slate-900 text-white p-6 rounded-3xl font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-slate-800 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70"
           >
             {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles className="text-yellow-400" size={24} />}
             Analyze Era Correlation
           </button>

           {result ? (
             <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-lg animate-in fade-in slide-in-from-right-4 overflow-y-auto max-h-[400px]">
                <div className="flex items-center gap-2 text-indigo-600 mb-4 sticky top-0 bg-white py-1">
                  <Lightbulb size={20} />
                  <span className="text-sm font-bold uppercase tracking-widest">Synthesis Output</span>
                </div>
                <div className="space-y-4">
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line italic">"{result.analysis}"</p>
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                     <p className="text-indigo-900 font-bold text-sm leading-snug">{result.insight}</p>
                  </div>
                </div>
             </div>
           ) : (
             <div className="flex-1 bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                <Sparkles size={40} className="text-slate-200 mb-4" />
                <p className="text-slate-400 text-sm font-medium px-6 italic">"Compare life expectancy gaps between 1920-1950 vs 1990-2024 to see how the 'Health Horizon' has expanded."</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonTool;