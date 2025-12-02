import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import useAppStore from '../store/useAppStore';

interface AnalyticsProps {
    onBack: () => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ onBack }) => {
    const { transactions, balance } = useAppStore();

    // Calculate analytics data
    const analytics = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Filter transactions for current month
        const currentMonthTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        // Calculate totals
        const totalIncome = currentMonthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = currentMonthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        // Spending by category
        const categorySpending: { [key: string]: number } = {};
        currentMonthTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
            });

        const categoryData = Object.entries(categorySpending)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // Monthly trend (last 6 months)
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - i, 1);
            const month = date.toLocaleDateString('en-US', { month: 'short' });

            const monthTransactions = transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
            });

            const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

            monthlyData.push({
                month,
                income,
                expenses,
                net: income - expenses
            });
        }

        // Savings rate
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;

        return {
            totalIncome,
            totalExpenses,
            categoryData,
            monthlyData,
            savingsRate,
            netIncome: totalIncome - totalExpenses
        };
    }, [transactions]);

    const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#6b7280'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Financial insights & trends</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
                                <p className="text-xl font-semibold text-green-600 dark:text-green-400 mt-1">
                                    ${analytics.totalIncome.toFixed(2)}
                                </p>
                            </div>
                            <div className="text-4xl">📈</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
                                <p className="text-xl font-semibold text-red-600 dark:text-red-400 mt-1">
                                    ${analytics.totalExpenses.toFixed(2)}
                                </p>
                            </div>
                            <div className="text-4xl">📉</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Net Income</p>
                                <p className={`text-xl font-semibold mt-1 ${analytics.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    }`}>
                                    ${analytics.netIncome.toFixed(2)}
                                </p>
                            </div>
                            <div className="text-4xl">💰</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Savings Rate</p>
                                <p className={`text-xl font-semibold mt-1 ${analytics.savingsRate >= 20 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                                    }`}>
                                    {analytics.savingsRate.toFixed(1)}%
                                </p>
                            </div>
                            <div className="text-4xl">🎯</div>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Spending by Category */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                            Spending by Category
                        </h3>
                        {analytics.categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={analytics.categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {analytics.categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-400">
                                No expense data available
                            </div>
                        )}
                    </div>

                    {/* Top Categories */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                            Top Spending Categories
                        </h3>
                        <div className="space-y-4">
                            {analytics.categoryData.slice(0, 5).map((cat, idx) => (
                                <div key={cat.name}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                            {cat.name}
                                        </span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                                            ${cat.value.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full transition-all"
                                            style={{
                                                width: `${(cat.value / analytics.totalExpenses) * 100}%`,
                                                backgroundColor: COLORS[idx % COLORS.length]
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Monthly Trend */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        6-Month Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                            <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} name="Net" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Monthly Comparison */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Monthly Comparison
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="income" fill="#10b981" name="Income" />
                            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
