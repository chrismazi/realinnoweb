
import React, { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from '../hooks/useTranslation';
import { SavingsGoal, Tab, Transaction } from '../types';
import useAppStore, { useBalance, useSavingsGoals, useTransactions, useUser } from '../store/useAppStore';
import { CardSkeleton, ChartSkeleton, EmptyState } from './ui/LoadingStates';

interface DashboardProps {
  onNavigate: (tab: Tab) => void;
}

// --- Icons (Standardized Stroke 1.5) ---
const Icons = {
  Shield: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Plane: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  Laptop: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Plus: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>,
  Send: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  Scan: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>,
  Dots: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  Wallet: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  Sparkles: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Bell: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  Eye: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
};

const getGoalIcon = (iconName: string) => {
  switch (iconName) {
    case 'shield': return <Icons.Shield className="w-6 h-6" />;
    case 'plane': return <Icons.Plane className="w-6 h-6" />;
    case 'laptop': return <Icons.Laptop className="w-6 h-6" />;
    default: return <Icons.Shield className="w-6 h-6" />;
  }
};

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  // Get real data from store
  const { t } = useTranslation();
  const user = useUser();
  const balance = useBalance();
  const savingsGoals = useSavingsGoals();
  const transactions = useTransactions();
  const { loadFromStorage } = useAppStore();

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        loadFromStorage();
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setTimeout(() => setIsLoading(false), 500); // Small delay for smooth transition
      }
    };
    loadData();
  }, []);

  // Calculate balance history from transactions (last 7 days)
  const balanceHistory = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const history = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];

      // Calculate balance up to this date
      const dayBalance = transactions
        .filter(t => new Date(t.date) <= date)
        .reduce((acc, t) => {
          return t.type === 'income' ? acc + t.amount : acc - t.amount;
        }, 0);

      history.push({
        day: dayName,
        val: dayBalance || balance - (i * 50) // Fallback to simulated history
      });
    }

    return history;
  }, [transactions, balance]);

  // Calculate income and expenses for current month
  const { monthlyIncome, monthlyExpenses } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { monthlyIncome: income, monthlyExpenses: expenses };
  }, [transactions]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="h-full overflow-y-auto pb-44 no-scrollbar bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Header */}
      <div className="pt-14 px-6 pb-6 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30 flex justify-between items-center transition-all duration-300">
        <div className="animate-fade-in">
          <h2 className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-0.5">{t('dashboard.welcome')}</h2>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {user.name || t('auth.welcomeBack')}
          </h1>
        </div>
        <div onClick={() => onNavigate(Tab.PROFILE)} className="relative group cursor-pointer animate-scale-in">
          <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-brand via-orange-400 to-purple-500 group-hover:scale-105 transition-transform duration-300">
            <img
              src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-900"
            />
          </div>
          {/* Orange notification dot */}
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-brand border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 space-y-8 pt-2">

        {/* Total Balance Card with Chart */}
        <div className="animate-slide-up bg-slate-900 dark:bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-300 dark:shadow-black/50 relative overflow-hidden group border border-slate-800 dark:border-slate-800">
          {/* Background Texture & Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 z-0"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light z-0"></div>

          {/* Replaced Teal/Purple blobs with Brand Orange & Deep Purple for contrast */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand/20 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-900/40 rounded-full blur-[80px] pointer-events-none"></div>

          {/* Chart Background - Updated gradient to use brand color */}
          <div className="absolute bottom-0 left-0 right-0 h-32 opacity-40 pointer-events-none translate-y-4 transition-transform duration-700 group-hover:scale-105 group-hover:translate-y-2 mix-blend-screen">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceHistory}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="val" stroke="#F97316" strokeWidth={3} fill="url(#chartGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-2">
                  {t('dashboard.totalBalance')}
                  {/* Orange Pulse */}
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></span>
                </p>
                <h2 className="text-4xl font-extrabold tracking-tight">
                  ${Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                {balance < 0 && (
                  <span className="text-xs text-red-400 font-bold mt-1">{t('common.overdraft')}</span>
                )}
              </div>
              <button className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 hover:bg-white/20 transition-all cursor-pointer active:scale-90 shadow-lg group">
                <Icons.Eye className="w-5 h-5 text-brand group-hover:text-white transition-colors" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-md hover:bg-white/10 transition-colors group/item">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 group-hover/item:scale-110 transition-transform">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" transform="rotate(180 12 12)" /></svg>
                  </div>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{t('dashboard.income')}</p>
                </div>
                <p className="font-bold text-lg tracking-wide pl-1">
                  +${monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-md hover:bg-white/10 transition-colors group/item">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-brand/20 flex items-center justify-center text-brand group-hover/item:scale-110 transition-transform">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                  </div>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{t('dashboard.expenses')}</p>
                </div>
                <p className="font-bold text-lg tracking-wide pl-1">
                  -${monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Pulse - Horizontal Scroll Widgets */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-5 px-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard.dailyPulse')}</h3>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">{t('common.today')}</span>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 -mx-6 px-6 snap-x snap-mandatory">
            {/* Budget Widget - Using Brand Color */}
            <div className="snap-center shrink-0 w-40 bg-white dark:bg-slate-900 p-5 rounded-[2.2rem] border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] dark:shadow-none flex flex-col justify-between h-44 group hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
              <div className="w-10 h-10 bg-orange-50 dark:bg-brand/10 text-brand rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                <Icons.Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">{t('dashboard.dailySpend')}</p>
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">$42</span>
                  <span className="text-xs text-slate-400 mb-0.5 font-medium">/ $60</span>
                </div>
                <div className="h-1.5 w-full bg-orange-50 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand w-[70%] rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                </div>
              </div>
            </div>

            {/* Mood Widget */}
            <div className="snap-center shrink-0 w-40 bg-white dark:bg-slate-900 p-5 rounded-[2.2rem] border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] dark:shadow-none flex flex-col justify-between h-44 group hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
              <div className="w-10 h-10 bg-teal-50 dark:bg-teal-500/10 text-teal-500 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                <Icons.Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">{t('dashboard.checkMood')}</p>
                <div className="flex justify-between items-center px-0.5">
                  <button className="text-2xl hover:scale-125 transition-transform grayscale hover:grayscale-0 active:scale-90">😊</button>
                  <button className="text-2xl hover:scale-125 transition-transform grayscale hover:grayscale-0 active:scale-90">😐</button>
                  <button className="text-2xl hover:scale-125 transition-transform grayscale hover:grayscale-0 active:scale-90">😔</button>
                </div>
              </div>
            </div>

            {/* Bill Widget */}
            <div className="snap-center shrink-0 w-40 bg-white dark:bg-slate-900 p-5 rounded-[2.2rem] border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] dark:shadow-none flex flex-col justify-between h-44 group hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                <Icons.Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">{t('dashboard.upNext')}</p>
                <p className="font-bold text-slate-900 dark:text-white text-sm truncate leading-snug">Netflix Sub</p>
                <div className="flex items-center gap-1.5 mt-1.5 bg-blue-50 dark:bg-blue-900/20 w-fit px-2 py-1 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  <p className="text-[10px] text-blue-600 dark:text-blue-300 font-bold">Tomorrow</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Updated to use Brand Orange for the 'Add' button */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 px-1">{t('dashboard.quickActions')}</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              // Made 'Add' action prominently Orange (Brand)
              { label: t('dashboard.add'), icon: <Icons.Plus className="w-6 h-6" />, color: 'bg-brand/10 text-brand', hover: 'hover:bg-brand/20' },
              { label: t('dashboard.send'), icon: <Icons.Send className="w-5 h-5 translate-x-0.5 -translate-y-0.5" />, color: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', hover: 'hover:bg-indigo-100 dark:hover:bg-indigo-500/20' },
              { label: t('dashboard.scan'), icon: <Icons.Scan className="w-5 h-5" />, color: 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400', hover: 'hover:bg-teal-100 dark:hover:bg-teal-500/20' },
              { label: t('dashboard.more'), icon: <Icons.Dots className="w-6 h-6" />, color: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400', hover: 'hover:bg-slate-100 dark:hover:bg-slate-700' }
            ].map((action, i) => (
              <button key={i} className="flex flex-col items-center gap-3 group active:scale-95 transition-transform duration-200">
                <div className={`w-16 h-16 rounded-[1.2rem] ${action.color} flex items-center justify-center shadow-sm dark:shadow-none group-hover:shadow-md transition-all duration-300 ${action.hover}`}>
                  {action.icon}
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Savings Goals */}
        <div className="animate-slide-up pb-6" style={{ animationDelay: '0.3s' }}>
          <div className="flex justify-between items-center mb-5 px-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard.savingsGoals')}</h3>
            <button className="text-brand text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full hover:bg-brand/10 transition-colors">{t('dashboard.viewAll')}</button>
          </div>
          <div className="space-y-4">
            {savingsGoals.map((goal) => (
              <div key={goal.id} className="bg-white dark:bg-slate-900 p-5 rounded-[1.8rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex items-center justify-between group active:scale-[0.98] transition-all duration-300 hover:shadow-lg hover:shadow-slate-100 dark:hover:shadow-none cursor-pointer">
                <div className="flex items-center space-x-5">
                  <div className={`w-14 h-14 rounded-2xl ${goal.color} bg-opacity-10 dark:bg-opacity-10 flex items-center justify-center text-${goal.color.replace('bg-', '')} group-hover:scale-110 transition-transform`}>
                    {getGoalIcon(goal.icon)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">{goal.name}</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${goal.color} rounded-full transition-all duration-1000`} style={{ width: `${(goal.current / goal.target) * 100}%` }}></div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{Math.round((goal.current / goal.target) * 100)}%</span>
                    </div>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">${goal.current.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
