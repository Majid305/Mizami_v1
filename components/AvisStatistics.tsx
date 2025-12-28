
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getAllAvis } from '../services/db';

export const AvisStatistics = () => {
  const [stats, setStats] = useState({ total: 0, closed: 0, chartData: [] });

  useEffect(() => {
    (async () => {
      const data = await getAllAvis();
      const natureMap: any = {};
      let closed = 0;
      data.forEach(a => {
        natureMap[a.nature_incident] = (natureMap[a.nature_incident] || 0) + 1;
        if(a.statut === 'Classé') closed++;
      });
      const chartData = Object.entries(natureMap).map(([name, value]) => ({ name, value }));
      setStats({ total: data.length, closed, chartData: chartData as any });
    })();
  }, []);

  const COLORS = ['#FF6B00', '#0ABAB5', '#84cc16', '#3b82f6', '#ef4444'];

  return (
    <div className="h-full bg-[#F5F5F5] dark:bg-slate-950 p-6 overflow-y-auto pb-24">
      <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 uppercase tracking-tighter">Monitoring Incidents</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm text-center">
          <span className="text-4xl font-black text-[#FF6B00]">{stats.total}</span>
          <p className="text-[9px] font-black text-slate-400 uppercase mt-2">Dossiers AI</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm text-center">
          <span className="text-4xl font-black text-green-500">{stats.closed}</span>
          <p className="text-[9px] font-black text-slate-400 uppercase mt-2">Classés</p>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 text-center">Répartition par Nature</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={stats.chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {stats.chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
