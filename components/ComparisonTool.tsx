import React, { useState } from 'react';
import { MetricData, RegionCode } from '../types';
import { REGIONS } from '../constants';
import { calculateValue } from '../context/LiveDataContext';
import { compareMetricsAnalysis, ComparisonResult } from '../services/geminiService';
import { ArrowRightLeft, Sparkles, Loader2, Calendar, MapPin, Lightbulb } from 'lucide-react';

interface ComparisonToolProps {
  metrics: MetricData[];
}

const ComparisonTool: React.FC<ComparisonToolProps> = ({ metrics }) => {
  // Side A State
  const [metric1Id, setMetric1Id] = useState(metrics[0]?.id);
  const [region1, setRegion1] = useState<string>('WORLD');
  const [year1, setYear1] = useState<number>(2024);

  // Side B State
  const [metric2Id, setMetric2Id] = useState(metrics[1]?.id || metrics[0]?.id);
  const [region2, setRegion2] = useState<string>('WORLD');
  const [year2, setYear2] = useState<number>(2023);

  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Derived Objects
  const metric1 = metrics.find(m => m.id === metric1Id);
  const metric2 = metrics.find(m => m.id === metric2Id);
  const years = Array.from({ length: 20 }, (_, i) => 2015 + i);

  // Calculate Values on the fly based on local state
  const val1 = metric1 ? calculateValue(metric1, year1, region1) : 0;
  const val2 = metric2 ? calculateValue(metric2, year2, region2) : 0;

  const handleCompare = async () => {
    if (!metric1 || !metric2) return;
    setLoading(true);
    setResult(null);

    const regionLabel1 = REGIONS.find(r => r.code === region1)?.label || region1;
    const regionLabel2 = REGIONS.find(r => r.code === region2)?.label || region2;

    const data = await compareMetricsAnalysis(
      metric1, val1, regionLabel1, year1,
      metric2, val2, regionLabel2, year2
    );
    
    setResult(data);
    setLoading(false);
  };

  if (!metric1 || !metric2) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <ArrowRightLeft className="text-indigo-500" />
        Advanced Data Comparator
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative">
        {/* Connector Line (Desktop) */}
        <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-indigo-50 p-2 rounded-full border border-indigo-100">
             <ArrowRightLeft className="text-indigo-400" size={20} />
          </div>
        </div>

        {/* Side A */}
        <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
            <h3 className="font-semibold text-slate-700">Dataset A</h3>
          </div>

          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Metric</label>
          <select 
            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            value={metric1Id}
            onChange={(e) => setMetric1Id(e.target.value)}
          >
            {metrics.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>

          <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Region</label>
                <div className="flex items-center bg-white rounded-xl px-3 py-2.5 border border-slate-200">
                  <MapPin size={14} className="text-slate-400 mr-2" />
                  <select 
                    className="bg-transparent text-sm w-full outline-none"
                    value={region1}
                    onChange={(e) => setRegion1(e.target.value)}
                  >
                    {REGIONS.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
                  </select>
                </div>
             </div>
             <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Year</label>
                <div className="flex items-center bg-white rounded-xl px-3 py-2.5 border border-slate-200">
                  <Calendar size={14} className="text-slate-400 mr-2" />
                  <select 
                    className="bg-transparent text-sm w-full outline-none"
                    value={year1}
                    onChange={(e) => setYear1(Number(e.target.value))}
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
             </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200 text-center">
             <div className="text-2xl font-bold tracking-tight" style={{color: metric1.color}}>
               {Math.floor(val1).toLocaleString()}
             </div>
             <div className="text-xs text-slate-400 font-medium">{metric1.unit}</div>
          </div>
        </div>

        {/* Side B */}
        <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-6 bg-violet-500 rounded-full"></div>
            <h3 className="font-semibold text-slate-700">Dataset B</h3>
          </div>

          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Metric</label>
          <select 
            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
            value={metric2Id}
            onChange={(e) => setMetric2Id(e.target.value)}
          >
            {metrics.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>

          <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Region</label>
                <div className="flex items-center bg-white rounded-xl px-3 py-2.5 border border-slate-200">
                  <MapPin size={14} className="text-slate-400 mr-2" />
                  <select 
                    className="bg-transparent text-sm w-full outline-none"
                    value={region2}
                    onChange={(e) => setRegion2(e.target.value)}
                  >
                    {REGIONS.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
                  </select>
                </div>
             </div>
             <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Year</label>
                <div className="flex items-center bg-white rounded-xl px-3 py-2.5 border border-slate-200">
                  <Calendar size={14} className="text-slate-400 mr-2" />
                  <select 
                    className="bg-transparent text-sm w-full outline-none"
                    value={year2}
                    onChange={(e) => setYear2(Number(e.target.value))}
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
             </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 text-center">
             <div className="text-2xl font-bold tracking-tight" style={{color: metric2.color}}>
               {Math.floor(val2).toLocaleString()}
             </div>
             <div className="text-xs text-slate-400 font-medium">{metric2.unit}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <button 
          onClick={handleCompare}
          disabled={loading}
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2 transform hover:-translate-y-1"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} className="text-yellow-400" />}
          Generate Comparative Analysis
        </button>

        {/* AI Analysis Section */}
        {result && !loading && (
           <div className="w-full mt-8 animate-fade-in">
             {/* Main Analysis */}
             <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 mb-4">
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                 <Sparkles size={16} className="text-indigo-500" /> AI Analysis
               </h3>
               <p className="text-slate-700 leading-relaxed">
                 {result.analysis}
               </p>
             </div>

             {/* Key Insight Summary */}
             <div className="p-5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
               <h3 className="text-xs font-bold text-indigo-200 uppercase tracking-wide mb-2 flex items-center gap-2">
                 <Lightbulb size={16} /> Key Data Insight
               </h3>
               <p className="text-lg font-medium leading-snug">
                 {result.insight}
               </p>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonTool;