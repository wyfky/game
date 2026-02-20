
import React from 'react';
import {
  Radar, RadarChart as ReRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { Metrics } from '../types';

interface Props {
  metrics: Metrics;
}

const RadarChart: React.FC<Props> = ({ metrics }) => {
  const data = [
    { subject: '发展度', A: metrics.development, fullMark: 100 },
    { subject: '安全度', A: metrics.security, fullMark: 100 },
    { subject: '社会韧性', A: metrics.stability, fullMark: 100 },
    { subject: '自主率', A: metrics.autonomy, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64 md:h-80 bg-slate-900/50 rounded-xl p-4 border border-slate-800 shadow-inner">
      <ResponsiveContainer width="100%" height="100%">
        <ReRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="国家核心指标"
            dataKey="A"
            stroke="#38bdf8"
            fill="#0ea5e9"
            fillOpacity={0.4}
          />
        </ReRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart;
