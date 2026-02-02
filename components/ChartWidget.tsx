import React, { useState } from 'react';
import { MetricData, ChartType } from '../types';
import { generateInsight } from '../services/geminiService';
import { Sparkles, Loader2, BarChart2, TrendingUp, Activity, ZoomIn } from 'lucide-react';
import { useLiveData } from '../context/LiveDataContext';
import ChartVisualization from './ChartVisualization';

interface ChartWidgetProps {
  data: MetricData;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({ data }) => {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { getDisplayValue } = useLiveData();

  const handleGenerateInsight = async () => {
    setLoading(true);
    const currentValue = getDisplayValue(data);
    const result = await generateInsight(data, currentValue);
    setInsight(result);
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{data.label} Trend</h2>
          <div className="flex items-center text-sm text-slate-500 mt-1">
             <ZoomIn size={14} className="mr-1 text-indigo-500" />
             <span>Drag the slider below to pan & zoom</span>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setChartType('area')}
            className={`p-2 rounded-md transition-all ${chartType === 'area' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <TrendingUp size={18} />
          </button>
          <button 
            onClick={() => setChartType('bar')}
            className={`p-2 rounded-md transition-all ${chartType === 'bar' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <BarChart2 size={18} />
          </button>
          <button 
            onClick={() => setChartType('line')}
            className={`p-2 rounded-md transition-all ${chartType === 'line' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Activity size={18} />
          </button>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ChartVisualization data={data} chartType={chartType} />
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mt-1">
            <Sparkles size={20} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-slate-700">AI Insight</h3>
              {!insight && (
                <button 
                  onClick={handleGenerateInsight}
                  disabled={loading}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Generate Analysis
                </button>
              )}
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              {loading ? (
                <span className="flex items-center gap-2 text-indigo-500">
                  <Loader2 size={14} className="animate-spin" /> Thinking...
                </span>
              ) : insight ? (
                insight
              ) : (
                "Click generate to analyze this trend using Gemini AI."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChartWidget);
