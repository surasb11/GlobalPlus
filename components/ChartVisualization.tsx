import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Brush
} from 'recharts';
import { MetricData, ChartType } from '../types';

interface ChartVisualizationProps {
  data: MetricData;
  chartType: ChartType;
}

const ChartVisualization: React.FC<ChartVisualizationProps> = React.memo(({ data, chartType }) => {
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

  const renderChartContent = () => {
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
    <ResponsiveContainer width="100%" height="100%">
      {renderChartContent()}
    </ResponsiveContainer>
  );
});

export default ChartVisualization;
