import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { BudgetCategory, Transaction, SavingsGoal } from '../types';
import useAppStore, { useTransactions, useSavingsGoals, useBalance } from '../store/useAppStore';
import { CardSkeleton, EmptyState, Spinner } from './ui/LoadingStates';
import { validate, sanitize } from '../services/validationService';
import { useDebounce } from '../hooks/usePerformance';

// --- Icons (Standardized) ---
const Icons = {
    Housing: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    Food: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
    Transport: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    Fun: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Shopping: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    Salary: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    Freelance: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Invest: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    Gift: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>,
    Rental: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
    Emergency: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    Vacation: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Goal: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    Default: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
    Close: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
};

// --- Icon Mapping Helper ---
const getIcon = (name: string, className: string = "w-5 h-5") => {
    switch (name) {
        // Expenses
        case 'housing': return <Icons.Housing className={className} />;
        case 'food': return <Icons.Food className={className} />;
        case 'transport': return <Icons.Transport className={className} />;
        case 'fun': return <Icons.Fun className={className} />;
        case 'shopping': return <Icons.Shopping className={className} />;
        // Income
        case 'salary': return <Icons.Salary className={className} />;
        case 'freelance': return <Icons.Freelance className={className} />;
        case 'investments': return <Icons.Invest className={className} />;
        case 'gifts': return <Icons.Gift className={className} />;
        case 'rental': return <Icons.Rental className={className} />;
        // Savings
        case 'emergency': return <Icons.Emergency className={className} />;
        case 'vacation': return <Icons.Vacation className={className} />;
        case 'goal': return <Icons.Goal className={className} />;
        default: return <Icons.Default className={className} />;
    }
}

// --- Mock Data ---
const initialCategories: BudgetCategory[] = [
    { id: '1', name: 'Housing', type: 'expense', spent: 1200, limit: 1500, color: '#0d9488', icon: 'housing' },
    { id: '2', name: 'Food', type: 'expense', spent: 450, limit: 600, color: '#f97316', icon: 'food' },
    { id: '3', name: 'Transport', type: 'expense', spent: 120, limit: 200, color: '#6366f1', icon: 'transport' },
    { id: '4', name: 'Fun', type: 'expense', spent: 180, limit: 150, color: '#ec4899', icon: 'fun' },
    { id: '5', name: 'Shopping', type: 'expense', spent: 210, limit: 300, color: '#8b5cf6', icon: 'shopping' },

    // Income Categories
    { id: '6', name: 'Salary', type: 'income', spent: 0, limit: 5000, color: '#10b981', icon: 'salary' },
    { id: '7', name: 'Freelance', type: 'income', spent: 0, limit: 1500, color: '#3b82f6', icon: 'freelance' },
    { id: '8', name: 'Investments', type: 'income', spent: 0, limit: 0, color: '#8b5cf6', icon: 'investments' },
    { id: '9', name: 'Gifts', type: 'income', spent: 0, limit: 0, color: '#ec4899', icon: 'gifts' },
    { id: '10', name: 'Rental', type: 'income', spent: 0, limit: 0, color: '#f59e0b', icon: 'rental' },
];

const initialTransactions: Transaction[] = [
    { id: '1', title: 'Whole Foods Market', category: 'Food', amount: 84.50, date: new Date(), type: 'expense', icon: 'food', color: 'bg-orange-100 text-orange-600', isRecurring: false },
    { id: '2', title: 'Uber Ride', category: 'Transport', amount: 24.00, date: new Date(), type: 'expense', icon: 'transport', color: 'bg-indigo-100 text-indigo-600', isRecurring: false },
    { id: '3', title: 'Freelance Payment', category: 'Freelance', amount: 1200.00, date: new Date(Date.now() - 86400000), type: 'income', icon: 'freelance', color: 'bg-blue-100 text-blue-600', isRecurring: false },
    { id: '4', title: 'Netflix Subscription', category: 'Fun', amount: 15.99, date: new Date(Date.now() - 86400000 * 2), type: 'expense', icon: 'fun', color: 'bg-pink-100 text-pink-600', isRecurring: true },
    { id: '5', title: 'Zara', category: 'Shopping', amount: 120.00, date: new Date(Date.now() - 86400000 * 5), type: 'expense', icon: 'shopping', color: 'bg-purple-100 text-purple-600', isRecurring: false },
    { id: '6', title: 'Rent Payment', category: 'Housing', amount: 1200.00, date: new Date(Date.now() - 86400000 * 10), type: 'expense', icon: 'housing', color: 'bg-teal-100 text-teal-600', isRecurring: true },
];

const initialSavingsData: SavingsGoal[] = [
    { id: '1', name: 'Emergency Fund', current: 5200, target: 10000, color: '#14b8a6', icon: 'emergency', deadline: '2024-12-31' },
    { id: '2', name: 'Dream Vacation', current: 1400, target: 3000, color: '#f59e0b', icon: 'vacation', deadline: '2024-08-15' },
];

const trendData = [
    { day: 'Mon', amount: 120 },
    { day: 'Tue', amount: 85 },
    { day: 'Wed', amount: 240 },
    { day: 'Thu', amount: 90 },
    { day: 'Fri', amount: 350 },
    { day: 'Sat', amount: 180 },
    { day: 'Sun', amount: 110 },
];

type Section = 'OVERVIEW' | 'TRANSACTIONS' | 'SAVINGS';
type FilterType = 'ALL' | 'INCOME' | 'EXPENSE' | 'RECURRING';
type DateFilter = 'WEEK' | 'MONTH' | 'YEAR';

// Import the new DatePicker
import DatePicker from './ui/DatePicker';

// --- Helper Components ---

const ProgressBar = ({ current, max, color }: { current: number, max: number, color: string }) => {
    const percentage = Math.min((current / max) * 100, 100);
    const isOver = current > max;
    return (
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ease-out ${isOver ? 'bg-red-500' : ''}`} style={{ width: `${percentage}%`, backgroundColor: isOver ? undefined : color }}></div>
        </div>
    );
};

const BudgetPlanner: React.FC = memo(() => {
    // Get data from store
    const storeTransactions = useTransactions();
    const storeSavings = useSavingsGoals();
    const balance = useBalance();
    const { addTransaction, updateTransaction, deleteTransaction, addSavingsGoal, updateSavingsGoal, loadFromStorage } = useAppStore();

    // Component state
    const [activeSection, setActiveSection] = useState<Section>('OVERVIEW');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSavingsModal, setShowSavingsModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Use store data directly (no local duplication)
    const transactions = storeTransactions;
    const savings = storeSavings;

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                loadFromStorage();
            } catch (error) {
                console.error('Failed to load budget data:', error);
            } finally {
                setTimeout(() => setIsLoading(false), 300);
            }
        };
        loadData();
    }, [loadFromStorage]);

    const [transactionFilter, setTransactionFilter] = useState<FilterType>('ALL');
    const [dateFilter, setDateFilter] = useState<DateFilter>('MONTH');
    const [searchQuery, setSearchQuery] = useState('');

    const [editingId, setEditingId] = useState<string | null>(null);
    const [txType, setTxType] = useState<'income' | 'expense'>('expense');
    const [txAmount, setTxAmount] = useState('');
    const [txTitle, setTxTitle] = useState('');
    const [txCategory, setTxCategory] = useState('');
    const [txIcon, setTxIcon] = useState('');
    const [txRecurring, setTxRecurring] = useState(false);
    const [txDate, setTxDate] = useState<Date>(new Date());

    const [newGoalName, setNewGoalName] = useState('');
    const [newGoalTarget, setNewGoalTarget] = useState('');
    const [newGoalDeadline, setNewGoalDeadline] = useState<Date | null>(null);

    const expenseCategories = useMemo(() => initialCategories.filter(c => c.type === 'expense'), []);
    const incomeCategories = useMemo(() => initialCategories.filter(c => c.type === 'income'), []);

    const filteredTransactions = useMemo(() => {
        const now = new Date();
        return transactions.filter(t => {
            if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.category.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            const txDate = new Date(t.date);
            let dateMatch = true;

            if (dateFilter === 'WEEK') {
                const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                dateMatch = txDate >= oneWeekAgo;
            } else if (dateFilter === 'MONTH') {
                dateMatch = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
            } else if (dateFilter === 'YEAR') {
                dateMatch = txDate.getFullYear() === now.getFullYear();
            }

            if (!dateMatch) return false;
            if (transactionFilter === 'ALL') return true;
            if (transactionFilter === 'RECURRING') return t.isRecurring;
            return t.type.toLowerCase() === transactionFilter.toLowerCase();
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, transactionFilter, dateFilter, searchQuery]);

    const alerts = useMemo(() => {
        const msgs = [];
        const recurringCount = transactions.filter(t => t.isRecurring).length;
        if (recurringCount > 0) {
            msgs.push({ type: 'info', title: 'Recurring Bills', text: `You have ${recurringCount} active recurring charges tracking in your budget.` });
        }
        const highSpends = transactions.filter(t => t.amount > 100 && t.type === 'expense' && new Date(t.date).getTime() > Date.now() - 86400000 * 7);
        if (highSpends.length > 0) {
            msgs.push({ type: 'warning', title: 'High Spending', text: `You spent $${highSpends[0].amount} at ${highSpends[0].title} recently.` });
        }
        return { msgs };
    }, [transactions]);

    const openAddModal = () => {
        setEditingId(null);
        setTxType('expense');
        setTxAmount('');
        setTxTitle('');
        setTxCategory('');
        setTxIcon('');
        setTxRecurring(false);
        setTxDate(new Date());
        setShowAddModal(true);
    };

    const openEditModal = (tx: Transaction) => {
        setEditingId(tx.id);
        setTxType(tx.type);
        setTxAmount(tx.amount.toString());
        setTxTitle(tx.title);
        setTxCategory(tx.category);
        setTxIcon(tx.icon);
        setTxRecurring(!!tx.isRecurring);
        setTxDate(new Date(tx.date));
        setShowAddModal(true);
    };

    const handleSaveTransaction = () => {
        if (!txAmount || !txTitle || !txCategory) {
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-xl z-[60] animate-slide-up';
            toast.textContent = 'Please fill all required fields';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
            return;
        }

        const amount = parseFloat(txAmount);
        if (isNaN(amount) || amount <= 0) {
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-xl z-[60] animate-slide-up';
            toast.textContent = 'Please enter a valid positive amount';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
            return;
        }

        const newTx: Transaction = {
            id: editingId || `tx_${Date.now()}`,
            title: txTitle.trim(),
            amount: amount,
            category: txCategory,
            date: txDate,
            type: txType,
            isRecurring: txRecurring,
            icon: txIcon,
            color: txType === 'income' ? 'bg-teal-100 text-teal-600' : 'bg-orange-100 text-orange-600'
        };

        if (editingId) {
            updateTransaction(editingId, newTx);
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl z-[60] animate-slide-up';
            toast.textContent = 'Transaction updated successfully!';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        } else {
            addTransaction(newTx);
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl z-[60] animate-slide-up';
            toast.textContent = 'Transaction added successfully!';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        setShowAddModal(false);
    };

    const handleDeleteTransaction = () => {
        if (editingId) {
            const confirmDelete = window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.');
            if (!confirmDelete) return;

            deleteTransaction(editingId);
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-xl shadow-xl z-[60] animate-slide-up';
            toast.textContent = 'Transaction deleted';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);

            setShowAddModal(false);
        }
    };

    const handleAddGoal = () => {
        if (!newGoalName || !newGoalTarget) {
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-xl z-[60] animate-slide-up';
            toast.textContent = 'Please enter goal name and target amount';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
            return;
        }
        const goal: SavingsGoal = {
            id: `goal_${Date.now()}`,
            name: newGoalName.trim(),
            target: parseFloat(newGoalTarget),
            current: 0,
            deadline: newGoalDeadline ? newGoalDeadline.toISOString().split('T')[0] : undefined,
            color: '#6366f1',
            icon: 'goal'
        };
        addSavingsGoal(goal);

        const toast = document.createElement('div');
        toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl z-[60] animate-slide-up';
        toast.textContent = 'Savings goal created!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);

        setShowSavingsModal(false);
        setNewGoalName('');
        setNewGoalTarget('');
        setNewGoalDeadline(null);
    };

    const getSavingsAnalysis = (goal: SavingsGoal) => {
        if (!goal.deadline) return null;
        const targetDate = new Date(goal.deadline);
        const today = new Date();
        const timeDiff = targetDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysLeft < 0) return { type: 'expired', msg: `Deadline passed`, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' };
        if (goal.current >= goal.target) return { type: 'done', msg: 'Goal Reached! 🎉', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' };
        const amountNeeded = goal.target - goal.current;
        const months = Math.max(daysLeft / 30, 1);
        const monthlyRate = amountNeeded / months;
        return { type: 'active', daysLeft, monthlyRate, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' };
    };

    return (
        <div className="h-full overflow-hidden bg-slate-50 dark:bg-slate-950 relative flex flex-col transition-colors duration-500">
            {/* Top Header */}
            <div className="pt-14 px-6 pb-2 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md z-20 shrink-0 transition-colors">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest mb-1">Total Balance</p>
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            ${Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            {balance < 0 && <span className="text-lg text-red-500 ml-2">(Overdraft)</span>}
                        </h1>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform hover:bg-slate-800 dark:hover:bg-slate-200 group"
                    >
                        <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                </div>
                <div className="flex p-1 bg-white dark:bg-slate-900 rounded-2xl relative mb-2 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className={`absolute top-1 bottom-1 w-[32.5%] bg-slate-100 dark:bg-slate-800 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`} style={{ left: activeSection === 'OVERVIEW' ? '0.25rem' : activeSection === 'TRANSACTIONS' ? '33.75%' : '67%' }}></div>
                    <button onClick={() => setActiveSection('OVERVIEW')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider relative z-10 transition-colors ${activeSection === 'OVERVIEW' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>Overview</button>
                    <button onClick={() => setActiveSection('TRANSACTIONS')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider relative z-10 transition-colors ${activeSection === 'TRANSACTIONS' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>History</button>
                    <button onClick={() => setActiveSection('SAVINGS')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider relative z-10 transition-colors ${activeSection === 'SAVINGS' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>Savings</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-44 no-scrollbar px-6 pt-6">
                {activeSection === 'OVERVIEW' && (
                    <div className="space-y-8 animate-slide-up">
                        {alerts.msgs.length > 0 && (
                            <div className="space-y-3">
                                {alerts.msgs.slice(0, 3).map((alert, idx) => (
                                    <div key={idx} className={`p-4 rounded-[1.5rem] shadow-sm flex items-start gap-4 bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 transition-transform active:scale-[0.98]`}>
                                        <div className={`p-2 rounded-full shrink-0 ${alert.type === 'warning' ? 'bg-amber-100 text-amber-500 dark:bg-amber-500/10' : 'bg-blue-100 text-blue-500 dark:bg-blue-500/10'}`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{alert.title}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{alert.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                            <div className="flex justify-between items-center mb-6">
                                <div><h3 className="font-bold text-slate-900 dark:text-white">Expense Trends</h3><p className="text-xs text-slate-400">Last 7 days</p></div>
                            </div>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                        <defs><linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} /><stop offset="95%" stopColor="#0d9488" stopOpacity={0} /></linearGradient></defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" strokeOpacity={0.1} />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                        <Tooltip isAnimationActive={false} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontFamily: 'inherit', backgroundColor: '#fff', color: '#0f172a' }} cursor={{ stroke: '#0d9488', strokeWidth: 1, strokeDasharray: '5 5' }} />
                                        <Area isAnimationActive={false} type="monotone" dataKey="amount" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Spending Breakdown</h3>
                            <div className="h-48 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie isAnimationActive={false} data={expenseCategories as any} innerRadius={60} outerRadius={80} paddingAngle={5} cornerRadius={6} dataKey="spent" stroke="none">
                                            {expenseCategories.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                    <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Total</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">$2,160</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4 pb-10">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg px-1">Budget Status</h3>
                            {expenseCategories.map((cat) => {
                                return (
                                    <div key={cat.id} className="bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-800 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors">{getIcon(cat.icon)}</div>
                                                <div><h4 className="font-bold text-slate-900 dark:text-white">{cat.name}</h4></div>
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-white">${cat.spent} <span className="text-slate-300 dark:text-slate-600 font-normal">/ ${cat.limit}</span></span>
                                        </div>
                                        <ProgressBar current={cat.spent} max={cat.limit} color={cat.color} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeSection === 'TRANSACTIONS' && (
                    <div className="animate-slide-up space-y-6 pb-10">
                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                                <input type="text" placeholder="Search transactions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full pl-11 pr-4 py-4 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] bg-white dark:bg-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 sm:text-sm shadow-sm font-medium dark:text-white transition-all" />
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Time Range</span>
                                    <div className="bg-white dark:bg-slate-900 p-1 rounded-xl inline-flex shadow-sm border border-slate-100 dark:border-slate-800">
                                        {(['WEEK', 'MONTH', 'YEAR'] as const).map(filter => (
                                            <button key={filter} onClick={() => setDateFilter(filter)} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider ${dateFilter === filter ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>{filter}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 overflow-x-auto no-scrollbar px-1">
                                    {(['ALL', 'INCOME', 'EXPENSE', 'RECURRING'] as const).map(f => (
                                        <button key={f} onClick={() => setTransactionFilter(f)} className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${transactionFilter === f ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{f}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((tx) => (
                                    <div key={tx.id} onClick={() => openEditModal(tx)} className="bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-all cursor-pointer group hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-2xl ${tx.color.includes('bg-') ? tx.color : (tx.type === 'income' ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400')} flex items-center justify-center text-xl relative`}>
                                                {getIcon(tx.icon)}
                                                {tx.isRecurring && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center"><svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></div>
                                                )}
                                            </div>
                                            <div><h4 className="font-bold text-slate-900 dark:text-white text-base mb-0.5">{tx.title}</h4><div className="flex items-center gap-2"><p className="text-xs text-slate-400 font-medium">{tx.category}</p><span className="text-[10px] text-slate-300">•</span><p className="text-xs text-slate-400 font-medium">{new Date(tx.date).toLocaleDateString()}</p></div></div>
                                        </div>
                                        <div className="flex flex-col items-end"><span className={`font-black text-lg ${tx.type === 'income' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-900 dark:text-white'}`}>{tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}</span><span className="text-[10px] text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold mt-1">Edit</span></div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 opacity-50 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4"><svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                                    <p className="text-slate-500 font-bold">No transactions found</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeSection === 'SAVINGS' && (
                    <div className="animate-slide-up space-y-6 pb-10">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none group-hover:opacity-10 transition-opacity"></div>
                            <div className="relative z-10">
                                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2">Total Saved</p>
                                <h2 className="text-5xl font-black mb-8 tracking-tight">${savings.reduce((acc, curr) => acc + curr.current, 0).toLocaleString()}</h2>
                                <button onClick={() => setShowSavingsModal(true)} className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform flex items-center gap-2 hover:bg-white/20">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    New Goal
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {savings.map(goal => {
                                const analysis = getSavingsAnalysis(goal);
                                return (
                                    <div key={goal.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                                                    {getIcon(goal.icon)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">{goal.name}</h4>
                                                    {goal.deadline && <p className="text-xs text-slate-400 font-medium">Target: {new Date(goal.deadline).toLocaleDateString()}</p>}
                                                </div>
                                            </div>
                                            <span className="font-black text-slate-900 dark:text-white text-lg">${goal.current.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ ${goal.target.toLocaleString()}</span></span>
                                        </div>

                                        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-5">
                                            <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 relative overflow-hidden" style={{ width: `${(goal.current / goal.target) * 100}%` }}>
                                                <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
                                            </div>
                                        </div>

                                        {analysis && (
                                            <div className={`p-4 rounded-xl ${analysis.bg} flex items-start gap-3`}>
                                                <svg className={`w-5 h-5 ${analysis.color} mt-0.5 shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <div>
                                                    <p className={`text-[10px] font-bold ${analysis.color} uppercase tracking-wider mb-1`}>Analysis</p>
                                                    {analysis.type === 'active' ? (
                                                        <p className={`text-sm ${analysis.color} font-medium leading-relaxed`}>Save <span className="font-black">${Math.ceil(analysis.monthlyRate)}/mo</span> to hit your goal in {Math.ceil(analysis.daysLeft / 30)} months.</p>
                                                    ) : (
                                                        <p className={`text-sm ${analysis.color} font-medium`}>{analysis.msg}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Transaction Bottom Sheet (Using fixed position to simulate sheet) */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddModal(false)}></div>
                    <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-t-[2.5rem] p-6 pb-12 shadow-2xl animate-slide-up relative z-10 overflow-hidden transition-colors border-t border-white/10">
                        <div className="drag-handle mb-6"></div>

                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Transaction' : 'New Transaction'}</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <Icons.Close className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                                <button onClick={() => setTxType('expense')} className={`py-3.5 rounded-xl text-sm font-bold transition-all ${txType === 'expense' ? 'bg-white dark:bg-slate-700 text-red-500 shadow-sm' : 'text-slate-500'}`}>Expense</button>
                                <button onClick={() => setTxType('income')} className={`py-3.5 rounded-xl text-sm font-bold transition-all ${txType === 'income' ? 'bg-white dark:bg-slate-700 text-green-500 shadow-sm' : 'text-slate-500'}`}>Income</button>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Amount</label>
                                <div className="relative group">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">$</span>
                                    <input type="number" value={txAmount} onChange={e => setTxAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 dark:bg-slate-900 rounded-3xl py-5 pl-10 pr-6 text-3xl font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all border border-slate-100 dark:border-slate-800" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Title</label>
                                <input type="text" value={txTitle} onChange={e => setTxTitle(e.target.value)} placeholder="e.g. Grocery Run" className="w-full bg-slate-50 dark:bg-slate-900 rounded-3xl py-4 px-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all border border-slate-100 dark:border-slate-800" />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Category</label>
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                    {(txType === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => { setTxCategory(cat.name); setTxIcon(cat.icon); }}
                                            className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all ${txCategory === cat.name ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white scale-105' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'}`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Date</label>
                                <DatePicker value={txDate} onChange={setTxDate} />
                            </div>

                            <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl cursor-pointer border border-slate-100 dark:border-slate-800" onClick={() => setTxRecurring(!txRecurring)}>
                                <span className="font-bold text-slate-900 dark:text-white text-sm">Recurring Monthly</span>
                                <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${txRecurring ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${txRecurring ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            {editingId && (
                                <button onClick={handleDeleteTransaction} className="flex-1 py-4 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-3xl font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-100 dark:border-red-900/30">Delete</button>
                            )}
                            <button onClick={handleSaveTransaction} className="flex-[2] py-4 bg-slate-900 dark:bg-teal-600 text-white rounded-3xl font-bold text-sm shadow-xl dark:shadow-teal-900/40 active:scale-[0.98] transition-transform">
                                {editingId ? 'Save Changes' : 'Add Transaction'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Savings Modal (Bottom Sheet) */}
            {showSavingsModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowSavingsModal(false)}></div>
                    <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-t-[2.5rem] p-6 pb-12 shadow-2xl animate-slide-up transition-colors border-t border-white/10 relative z-10">
                        <div className="drag-handle mb-6"></div>
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">New Savings Goal</h3>
                            <button onClick={() => setShowSavingsModal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <Icons.Close className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <input type="text" value={newGoalName} onChange={e => setNewGoalName(e.target.value)} placeholder="Goal Name (e.g. New Car)" className="w-full bg-slate-50 dark:bg-slate-900 rounded-3xl py-4 px-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-100 dark:border-slate-800" />
                            <input type="number" value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)} placeholder="Target Amount ($)" className="w-full bg-slate-50 dark:bg-slate-900 rounded-3xl py-4 px-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-100 dark:border-slate-800" />
                            <DatePicker
                                value={newGoalDeadline}
                                onChange={setNewGoalDeadline}
                                placeholder="Select target date"
                            />
                        </div>
                        <button onClick={handleAddGoal} className="w-full mt-8 py-4 bg-indigo-600 text-white rounded-3xl font-bold text-sm shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 active:scale-95 transition-transform">
                            Create Goal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

export default BudgetPlanner;