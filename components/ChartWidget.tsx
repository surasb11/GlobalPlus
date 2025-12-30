import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, LineChart, Line, Brush 
} from 'recharts';
import { MetricData, ChartType } from '../types';
import { generateInsight } from '../services/geminiService';
import { Sparkles, Loader2, BarChart2, TrendingUp, Activity, ZoomIn } from 'lucide-react';
import { useLiveData } from '../context/LiveDataContext';

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

  const renderChart = () => {
    const commonProps = {
      data: data.history,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    const gradientId = `color${data.id}`;

    // Common Brush component for all charts
    const brush = (
      <Brush 
        dataKey="year" 
        height={30} 
        stroke="#94a3b8"
        fill="#f1f5f9"
        tickFormatter={(val) => val.toString()}
      />
    );

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={40} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="value" fill={data.color} radius={[4, 4, 0, 0]} />
            {brush}
          </BarChart>
        );
      case 'line':
        return (
           <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={40} />
            <Tooltip 
               contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line type="monotone" dataKey="value" stroke={data.color} strokeWidth={3} dot={{ r: 4, fill: data.color }} />
            {brush}
          </LineChart>
        );
      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={data.color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={data.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={40} />
            <Tooltip 
               contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area type="monotone" dataKey="value" stroke={data.color} fillOpacity={1} fill={`url(#${gradientId})`} />
            {brush}
          </AreaChart>
        );
    }
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
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
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

export default ChartWidget;