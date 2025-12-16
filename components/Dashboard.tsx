import React, { useMemo } from 'react';
import { useJobContext } from '../context/JobContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import { ChartData } from '../types';

const StatCard = ({ label, value, icon: Icon, trend, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
      {trend && (
        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600">
          <TrendingUp size={14} />
          <span>{trend} vs last month</span>
        </div>
      )}
    </div>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { jobs } = useJobContext();

  const stats = useMemo(() => {
    const totalApplied = jobs.length;
    const interviews = jobs.filter(j => j.status === 'Interview').length;
    const offers = jobs.filter(j => j.status === 'Offer' || j.status === 'Accepted').length;
    const pending = jobs.filter(j => j.status === 'Applied').length;
    return { totalApplied, interviews, offers, pending };
  }, [jobs]);

  const chartData: ChartData[] = useMemo(() => {
    const last30Days = [...Array(30)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return d.toISOString().split('T')[0];
    });

    return last30Days.map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        applications: jobs.filter(j => j.dateApplied === date).length
    }));
  }, [jobs]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, Alex. Here's your job search overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Applications" 
          value={stats.totalApplied} 
          icon={Users} 
          trend="+12%" 
          color="bg-blue-500" 
        />
        <StatCard 
          label="Interviews Scheduled" 
          value={stats.interviews} 
          icon={Clock} 
          color="bg-amber-500" 
        />
        <StatCard 
          label="Offers Received" 
          value={stats.offers} 
          icon={CheckCircle} 
          color="bg-emerald-500" 
        />
         <StatCard 
          label="Active & Pending" 
          value={stats.pending} 
          icon={TrendingUp} 
          color="bg-indigo-500" 
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Application Activity</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                tickMargin={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="applications" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorApps)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};