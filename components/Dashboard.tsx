
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

const formatCurrency = (value: number, options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(value);

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


  // Calculate today's spending
  const todaySpending = useMemo(() => {
    const today = new Date().toDateString();
    return transactions
      .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === today)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Calculate budget by category from localStorage or defaults
  const budgetCategories = useMemo(() => {
    const saved = localStorage.getItem('budgetLimits');
    const defaultLimits: Record<string, number> = {
      'Food': 600,
      'Transport': 400,
      'Housing': 1500,
      'Entertainment': 300,
      'Shopping': 500
    };
    return saved ? { ...defaultLimits, ...JSON.parse(saved) } : defaultLimits;
  }, []);

  // Calculate today's spending by category
  const todaySpendingByCategory = useMemo(() => {
    const today = new Date().toDateString();
    const spending: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === today)
      .forEach(tx => {
        spending[tx.category] = (spending[tx.category] || 0) + tx.amount;
      });
    return spending;
  }, [transactions]);

  // Calculate total daily budget and remaining by category
  const { totalDailyBudget, remainingBudgetByCategory, categoriesWithRemaining } = useMemo(() => {
    const values = Object.values(budgetCategories) as number[];
    const total = values.reduce((sum, limit) => sum + limit, 0);
    const dailyTotal = total / 30; // Convert monthly to daily
    
    const remaining: Record<string, number> = {};
    const withRemaining: Array<{ category: string; remaining: number; percentage: number }> = [];
    
    (Object.entries(budgetCategories) as [string, number][]).forEach(([category, limit]) => {
      const spent = todaySpendingByCategory[category] || 0;
      const dailyLimit = limit / 30;
      const dailyRemaining = Math.max(dailyLimit - spent, 0);
      remaining[category] = dailyRemaining;
      
      if (dailyRemaining > 0) {
        const percentage = (dailyRemaining / dailyLimit) * 100;
        withRemaining.push({ category, remaining: dailyRemaining, percentage });
      }
    });
    
    return {
      totalDailyBudget: dailyTotal,
      remainingBudgetByCategory: remaining,
      categoriesWithRemaining: withRemaining.sort((a, b) => b.remaining - a.remaining)
    };
  }, [budgetCategories, todaySpendingByCategory]);

  
  // Get next recurring transaction
  const nextRecurring = useMemo(() => {
    const recurring = transactions.filter(t => t.isRecurring);
    if (recurring.length === 0) return null;
    
    // Find the next upcoming recurring transaction
    const today = new Date();
    const sortedRecurring = recurring.sort((a, b) => {
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);
      return aDate.getTime() - bDate.getTime();
    });
    
    return sortedRecurring[0];
  }, [transactions]);

  // Calculate days until next recurring
  const recurringStatus = useMemo(() => {
    if (!nextRecurring) return { title: 'Nta nyemezabuguzi', status: 'Nta byateganyijwe', amount: 0 };

    const txDate = new Date(nextRecurring.date);
    const today = new Date();
    const diffTime = txDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status = '';
    if (diffDays === 0) status = 'Uyu munsi';
    else if (diffDays === 1) status = 'Ejo';
    else if (diffDays < 0) status = 'Byarenze';
    else status = `Mu minsi ${diffDays}`;

    return { title: nextRecurring.title, status, amount: nextRecurring.amount };
  }, [nextRecurring]);

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

  const totalSavings = useMemo(() => {
    return savingsGoals.reduce((sum, goal) => sum + goal.current, 0);
  }, [savingsGoals]);

  const cashFlow = useMemo(() => monthlyIncome - monthlyExpenses, [monthlyIncome, monthlyExpenses]);

  const spendingProgress = useMemo(() => {
    if (!totalDailyBudget) return 0;
    return Math.min((todaySpending / totalDailyBudget) * 100, 200);
  }, [todaySpending, totalDailyBudget]);

  const topSpendingCategory = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.type !== 'expense') return;
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    });
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return null;
    return { name: sorted[0][0], amount: sorted[0][1] };
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);
  }, [transactions]);

  const insights = useMemo(() => {
    const results: { id: string; title: string; message: string; tone: 'positive' | 'warning' | 'info' }[] = [];

    // Check if user has any transactions (not a first-time user)
    const hasTransactions = transactions.length > 0;
    const hasTodaySpending = todaySpending > 0;

    if (!hasTransactions) {
      // First-time user with no transactions
      results.push({
        id: 'budget',
        title: 'Murakaza neza!',
        message: 'Tangira wongera ibyakozwe byawe kugirango ubone inama z\'ubwenge.',
        tone: 'info'
      });
    } else if (todaySpending >= totalDailyBudget) {
      results.push({
        id: 'budget',
        title: 'Ingengo y\'uyu munsi yarenze',
        message: `Warenze ${formatCurrency(Math.max(todaySpending - totalDailyBudget, 0), { maximumFractionDigits: 0 })} ku mugambi w'uyu munsi. Hagarika ibidakenewe.`,
        tone: 'warning'
      });
    } else if (hasTodaySpending && categoriesWithRemaining.length > 0) {
      // Only show category remaining if user has spent something today
      const topCategory = categoriesWithRemaining[0];
      results.push({
        id: 'budget',
        title: 'Hari aho wakoresha',
        message: `${topCategory.category}: Uracyafite ${formatCurrency(topCategory.remaining, { maximumFractionDigits: 0 })} mu ngengo y'uyu munsi.`,
        tone: 'positive'
      });
    } else if (hasTransactions && !hasTodaySpending) {
      // Returning user but no spending today yet
      results.push({
        id: 'budget',
        title: 'Hari aho wakoresha',
        message: `Uracyafite ${formatCurrency(totalDailyBudget, { maximumFractionDigits: 0 })} mu ngengo y'uyu munsi.`,
        tone: 'positive'
      });
    } else {
      results.push({
        id: 'budget',
        title: 'Hari aho wakoresha',
        message: `Uracyafite ${formatCurrency(Math.max(totalDailyBudget - todaySpending, 0), { maximumFractionDigits: 0 })} mu ngengo y'uyu munsi.`,
        tone: 'positive'
      });
    }

    results.push({
      id: 'savings',
      title: 'Ibizigamwe byose',
      message: totalSavings > 0 ? `${formatCurrency(totalSavings)} byazigamwe ku ntego zose.` : 'Tangira intego yo kubaka ubuzima bwawe.',
      tone: totalSavings > 0 ? 'positive' : 'info'
    });

    if (topSpendingCategory) {
      results.push({
        id: 'category',
        title: 'Icyiciro cyakoreshejwe cyane',
        message: `${topSpendingCategory.name} - ${formatCurrency(topSpendingCategory.amount, { maximumFractionDigits: 0 })} muri uku kwezi.`,
        tone: 'info'
      });
    }

    if (recurringStatus.status === 'Overdue') {
      results.push({
        id: 'recurring',
        title: 'Inyemezabuguzi ihoraho yarenze',
        message: `${recurringStatus.title} ikeneye kwitabwaho ubu.`,
        tone: 'warning'
      });
    }

    return results;
  }, [todaySpending, totalDailyBudget, totalSavings, topSpendingCategory, recurringStatus, categoriesWithRemaining]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Mwaramutse';
    if (hour < 18) return 'Mwiriwe';
    return 'Mwiriwe';
  };

  return (
    <div className="h-full overflow-y-auto pb-44 no-scrollbar bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Header */}
      <div className="pt-14 px-6 pb-6 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30 flex justify-between items-center transition-all duration-300">
        <div className="animate-fade-in">
          <h2 className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-0.5">{t('dashboard.welcome')}</h2>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {user.name || t('auth.welcomeBack')}
          </h1>
        </div>
        <div onClick={() => onNavigate(Tab.PROFILE)} className="relative group cursor-pointer animate-scale-in">
          <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-brand via-orange-400 to-purple-500 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full rounded-full bg-slate-900 text-white flex items-center justify-center text-base font-bold tracking-wide">
              {(user.name?.trim()?.[0] || 'V').toUpperCase()}
            </div>
          </div>
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
                <h2 className="text-3xl font-bold tracking-tight">
                  {formatCurrency(Math.abs(balance), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                <p className="font-semibold text-base tracking-wide pl-1">
                  +{formatCurrency(monthlyIncome, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-md hover:bg-white/10 transition-colors group/item">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-brand/20 flex items-center justify-center text-brand group-hover/item:scale-110 transition-transform">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                  </div>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{t('dashboard.expenses')}</p>
                </div>
                <p className="font-semibold text-base tracking-wide pl-1">
                  -{formatCurrency(monthlyExpenses, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Snapshot */}
        <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_-15px_rgba(15,23,42,0.45)]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Uku kwezi</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Incamake y'imari</h3>
              </div>
              <button
                onClick={() => onNavigate(Tab.BUDGET)}
                className="text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full text-white bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 border border-white/10 shadow-sm hover:shadow-md transition-all"
              >
                Reba ingengo
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/40">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Amafaranga yinjiye</p>
                  <p className={`text-2xl font-bold mt-1 ${cashFlow >= 0 ? 'text-teal-500' : 'text-red-500'}`}>
                    {cashFlow >= 0 ? '+' : '-'}{formatCurrency(Math.abs(cashFlow))}
                  </p>
                  <span className="text-[10px] text-slate-400 font-bold">Ayinjiye {formatCurrency(monthlyIncome)} • Ayasohotse {formatCurrency(monthlyExpenses)}</span>
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-slate-400">Ibizigamwe</span>
                  <strong className="text-base text-slate-900 dark:text-white">{formatCurrency(totalSavings)}</strong>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/60">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Imikoreshereze</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xl font-bold ${spendingProgress > 100 ? 'text-red-500' : 'text-brand'}`}>{Math.min(spendingProgress, 200).toFixed(0)}%</span>
                    <span className="text-xs text-slate-400">by'uyu munsi</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                    <div className={`h-full rounded-full ${spendingProgress > 100 ? 'bg-red-500' : 'bg-brand'}`} style={{ width: `${Math.min(spendingProgress, 200)}%` }}></div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/60">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Inyemezabuguzi itaha</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white truncate">{recurringStatus.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{recurringStatus.status}</p>
                  {recurringStatus.amount > 0 && <span className="text-xs font-bold text-slate-500 mt-2 inline-block">{formatCurrency(recurringStatus.amount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>}
                </div>
              </div>
              {topSpendingCategory && (
                <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-900/40">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Icyiciro cya mbere</p>
                    <p className="font-bold text-slate-900 dark:text-white text-lg">{topSpendingCategory.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Byakoreshejwe</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(topSpendingCategory.amount, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Personal Insights */}
        {insights.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Inama z'ubwenge</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bihinduka</span>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 pb-4 snap-x snap-mandatory">
              {insights.map((insight) => (
                <div key={insight.id} className={`snap-center shrink-0 w-64 rounded-[1.8rem] border p-5 shadow-sm transition-all active:scale-[0.98] ${insight.tone === 'warning' ? 'border-red-200 bg-red-50/60 dark:border-red-900/30 dark:bg-red-900/10 text-red-900 dark:text-red-200' : insight.tone === 'positive' ? 'border-teal-200 bg-teal-50/70 dark:border-teal-900/30 dark:bg-teal-900/10 text-teal-900 dark:text-teal-200' : 'border-slate-200 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-opacity-60'}`}>
                  <p className="text-xs font-black uppercase tracking-[0.3em] mb-2">{insight.title}</p>
                  <p className="text-sm leading-relaxed font-medium">{insight.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Pulse - Unified subtle card style */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-5 px-1">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{t('dashboard.dailyPulse')}</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{t('common.today')}</span>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 snap-x snap-mandatory">
            {/* Budget Widget */}
            <div className="snap-center shrink-0 w-44 bg-white dark:bg-slate-900 p-5 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-40 group hover:scale-[1.02] active:scale-[0.98] transition-all">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">{t('dashboard.dailySpend')}</p>
              <div>
                <div className="flex items-end gap-1.5 mb-3">
                  <span className={`text-2xl font-black leading-none ${todaySpending > totalDailyBudget ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{formatCurrency(todaySpending, { maximumFractionDigits: 0 })}</span>
                  <span className="text-xs text-slate-400 mb-0.5 font-medium">/ {formatCurrency(totalDailyBudget, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${todaySpending > totalDailyBudget ? 'bg-red-500' : 'bg-slate-900 dark:bg-white'}`} style={{ width: `${Math.min((todaySpending / totalDailyBudget) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Weekly Summary Widget */}
            <div className="snap-center shrink-0 w-44 bg-white dark:bg-slate-900 p-5 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-40 group hover:scale-[1.02] active:scale-[0.98] transition-all">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Uku kwezi</p>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{formatCurrency(monthlyExpenses, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-slate-400 font-medium">Ayakoreshejwe</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${cashFlow >= 0 ? 'bg-teal-500' : 'bg-red-500'}`}></span>
                  <p className={`text-[10px] font-bold ${cashFlow >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-400'}`}>{cashFlow >= 0 ? '+' : ''}{formatCurrency(cashFlow, { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
            </div>

            {/* Bill Widget */}
            <div className="snap-center shrink-0 w-44 bg-white dark:bg-slate-900 p-5 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-40 group hover:scale-[1.02] active:scale-[0.98] transition-all">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">{t('dashboard.upNext')}</p>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm truncate leading-snug mb-1.5">{recurringStatus.title}</p>
                <div className={`flex items-center gap-1.5 w-fit px-2 py-1 rounded-lg ${recurringStatus.status === 'Byarenze' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${recurringStatus.status === 'Byarenze' ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`}></span>
                  <p className={`text-[10px] font-bold ${recurringStatus.status === 'Byarenze' ? 'text-red-600 dark:text-red-300' : 'text-slate-500 dark:text-slate-400'}`}>{recurringStatus.status}</p>
                </div>
              </div>
            </div>

            {/* Add Transaction Widget - Functional */}
            <button onClick={() => onNavigate(Tab.BUDGET)} className="snap-center shrink-0 w-44 bg-white dark:bg-slate-900 p-5 rounded-[1.8rem] border border-dashed border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center h-40 group hover:scale-[1.02] hover:border-brand hover:bg-brand/5 active:scale-[0.98] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-brand/10 transition-colors">
                <Icons.Plus className="w-6 h-6 text-slate-400 group-hover:text-brand transition-colors" />
              </div>
              <p className="text-xs font-bold text-slate-400 group-hover:text-brand transition-colors">{t('dashboard.addTransaction')}</p>
            </button>
          </div>
        </div>


        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">{t('dashboard.recentTransactions')}</h3>
              <button onClick={() => onNavigate(Tab.BUDGET)} className="text-brand text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full hover:bg-brand/10 transition-colors">{t('dashboard.viewAll')}</button>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              {recentTransactions.slice(0, 4).map((tx, idx) => (
                <div 
                  key={tx.id} 
                  onClick={() => onNavigate(Tab.BUDGET)}
                  className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${idx !== recentTransactions.slice(0, 4).length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'income' ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      {tx.type === 'income' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" transform="rotate(180 12 12)" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{tx.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{new Date(tx.date).toLocaleDateString('rw-RW', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-900 dark:text-white'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Savings Goals - Clickable */}
        {savingsGoals.length > 0 && (
          <div className="animate-slide-up pb-6" style={{ animationDelay: '0.3s' }}>
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">{t('dashboard.savingsGoals')}</h3>
              <button onClick={() => onNavigate(Tab.BUDGET)} className="text-brand text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full hover:bg-brand/10 transition-colors">{t('dashboard.viewAll')}</button>
            </div>
            <div className="space-y-3">
              {savingsGoals.slice(0, 3).map((goal) => (
                <div 
                  key={goal.id} 
                  onClick={() => onNavigate(Tab.BUDGET)}
                  className="bg-white dark:bg-slate-900 p-4 rounded-[1.8rem] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:scale-105 transition-transform">
                      {getGoalIcon(goal.icon)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{goal.name}</h4>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-1000" style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}></div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">{Math.round((goal.current / goal.target) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(goal.current)}</span>
                    <p className="text-[10px] text-slate-400">/ {formatCurrency(goal.target)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
