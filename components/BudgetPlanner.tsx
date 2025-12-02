import React, { useState, useMemo, useEffect, memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { BudgetCategory, Transaction, SavingsGoal } from '../types';
import useAppStore, { useTransactions, useSavingsGoals, useBalance } from '../store/useAppStore';
import { CardSkeleton, EmptyState, Spinner } from './ui/LoadingStates';
import { validate, sanitize } from '../services/validationService';
import { useDebounce } from '../hooks/usePerformance';
import DatePicker from './ui/DatePicker';

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
        case 'housing': return <Icons.Housing className={className} />;
        case 'food': return <Icons.Food className={className} />;
        case 'transport': return <Icons.Transport className={className} />;
        case 'fun': return <Icons.Fun className={className} />;
        case 'shopping': return <Icons.Shopping className={className} />;
        case 'salary': return <Icons.Salary className={className} />;
        case 'freelance': return <Icons.Freelance className={className} />;
        case 'investments': return <Icons.Invest className={className} />;
        case 'gifts': return <Icons.Gift className={className} />;
        case 'rental': return <Icons.Rental className={className} />;
        case 'emergency': return <Icons.Emergency className={className} />;
        case 'vacation': return <Icons.Vacation className={className} />;
        case 'goal': return <Icons.Goal className={className} />;
        default: return <Icons.Default className={className} />;
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

const CATEGORY_LABELS: Record<string, string> = {
    housing: 'Icumbi',
    food: 'Ibiryo',
    transport: 'Ubwikorezi',
    entertainment: 'Imyidagaduro',
    shopping: 'Amasoko',
    utilities: 'Serivisi z\'ingenzi',
    salary: 'Umushahara',
    freelance: 'Akazi k\'igihe gito',
    investments: 'Ishoramari',
    gifts: 'Impano',
    rental: 'Ubukodesha',
    emergency: 'By\'ihutirwa',
    vacation: 'Kuruhuka',
    goal: 'Intego',
    health: 'Ubuzima',
    transport_monthly: 'Ubwikorezi buri kwezi',
    education: 'Amashuri'
};

const SECTION_LABELS: Record<'OVERVIEW' | 'TRANSACTIONS' | 'SAVINGS', string> = {
    OVERVIEW: 'Incamake',
    TRANSACTIONS: 'Amateka',
    SAVINGS: 'Kuzigama'
};

const TIME_RANGE_LABELS: Record<'WEEK' | 'MONTH' | 'YEAR', string> = {
    WEEK: 'Icyumweru',
    MONTH: 'Ukwezi',
    YEAR: 'Umwaka'
};

const TRANSACTION_FILTER_LABELS: Record<'ALL' | 'INCOME' | 'EXPENSE' | 'RECURRING', string> = {
    ALL: 'Byose',
    INCOME: 'Ayinjiye',
    EXPENSE: 'Ayasohotse',
    RECURRING: 'Ibihoraho'
};

const getCategoryLabel = (name: string) => {
    if (!name) return '';
    return CATEGORY_LABELS[name.toLowerCase()] || name;
};

const getSectionLabel = (section: 'OVERVIEW' | 'TRANSACTIONS' | 'SAVINGS') => SECTION_LABELS[section];

const getTimeRangeLabel = (range: 'WEEK' | 'MONTH' | 'YEAR') => TIME_RANGE_LABELS[range];

const getFilterLabel = (filter: 'ALL' | 'INCOME' | 'EXPENSE' | 'RECURRING') => TRANSACTION_FILTER_LABELS[filter];

// --- ProgressBar Helper ---
const ProgressBar = ({ current, max, color }: { current: number; max: number; color: string }) => {
    const percentage = Math.min((current / max) * 100, 100);
    const isOver = current > max;
    return (
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : ''}`}
                style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: isOver ? undefined : color }}
            />
        </div>
    );
};

// --- Initial Categories Data ---
const expenseCategories: BudgetCategory[] = [
    { id: '1', name: 'Housing', type: 'expense', spent: 0, limit: 1500, color: '#6366f1', icon: 'housing' },
    { id: '2', name: 'Food', type: 'expense', spent: 0, limit: 600, color: '#f59e0b', icon: 'food' },
    { id: '3', name: 'Transport', type: 'expense', spent: 0, limit: 400, color: '#10b981', icon: 'transport' },
    { id: '4', name: 'Entertainment', type: 'expense', spent: 0, limit: 300, color: '#ec4899', icon: 'fun' },
    { id: '5', name: 'Shopping', type: 'expense', spent: 0, limit: 500, color: '#8b5cf6', icon: 'shopping' },
];

const incomeCategories: BudgetCategory[] = [
    { id: '6', name: 'Salary', type: 'income', spent: 0, limit: 5000, color: '#10b981', icon: 'salary' },
    { id: '7', name: 'Freelance', type: 'income', spent: 0, limit: 2000, color: '#6366f1', icon: 'freelance' },
    { id: '8', name: 'Investments', type: 'income', spent: 0, limit: 1000, color: '#f59e0b', icon: 'investments' },
    { id: '9', name: 'Gifts', type: 'income', spent: 0, limit: 500, color: '#ec4899', icon: 'gifts' },
    { id: '10', name: 'Rental', type: 'income', spent: 0, limit: 1500, color: '#8b5cf6', icon: 'rental' },
];

// --- Main Component ---
const BudgetPlannerComponent = () => {
    // Store hooks
    const transactions = useTransactions();
    const savings = useSavingsGoals();
    const balance = useBalance();
    const { addTransaction, updateTransaction, deleteTransaction, addSavingsGoal } = useAppStore();

    // UI state
    const [activeSection, setActiveSection] = useState<'OVERVIEW' | 'TRANSACTIONS' | 'SAVINGS'>('OVERVIEW');
    const [transactionFilter, setTransactionFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE' | 'RECURRING'>('ALL');
    const [dateFilter, setDateFilter] = useState<'WEEK' | 'MONTH' | 'YEAR'>('MONTH');
    const [searchQuery, setSearchQuery] = useState('');

    // Force a file change to trigger Vite rebuild and clear cache
    const dummy = 'dummy';
    // Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSavingsModal, setShowSavingsModal] = useState(false);
    const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showEjoHezaModal, setShowEjoHezaModal] = useState(false);
    const [ejoHezaTab, setEjoHezaTab] = useState<'about' | 'calculator' | 'howto'>('about');
    const [ejoHezaContribution, setEjoHezaContribution] = useState(15000);

    // Transaction Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [txType, setTxType] = useState<'income' | 'expense'>('expense');
    const [txAmount, setTxAmount] = useState('');
    const [txTitle, setTxTitle] = useState('');
    const [txCategory, setTxCategory] = useState('');
    const [txIcon, setTxIcon] = useState('');
    const [txRecurring, setTxRecurring] = useState(false);
    const [txDate, setTxDate] = useState<Date>(new Date());

    // Savings Goal Form State
    const [newGoalName, setNewGoalName] = useState('');
    const [newGoalTarget, setNewGoalTarget] = useState('');
    const [newGoalDeadline, setNewGoalDeadline] = useState<Date | null>(null);

    // Budget Limit State
    const [budgetLimits, setBudgetLimits] = useState<Record<string, number>>({});
    const [editingBudgetCategory, setEditingBudgetCategory] = useState<BudgetCategory | null>(null);
    const [newBudgetLimit, setNewBudgetLimit] = useState('');

    // Compute real spending by category from transactions
    const realSpendingByCategory = useMemo(() => {
        const now = new Date();
        const spending: Record<string, number> = {};
        transactions
            .filter(tx => {
                const txDate = new Date(tx.date);
                return tx.type === 'expense' && txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
            })
            .forEach(tx => {
                const cat = tx.category;
                spending[cat] = (spending[cat] || 0) + tx.amount;
            });
        return spending;
    }, [transactions]);

    // Open edit budget modal
    const openEditBudgetModal = (cat: BudgetCategory & { spent: number }) => {
        setEditingBudgetCategory(cat);
        setNewBudgetLimit(cat.limit.toString());
        setShowEditBudgetModal(true);
    };

    // Save budget limit
    const handleSaveBudgetLimit = () => {
        if (editingBudgetCategory && newBudgetLimit) {
            const limit = parseFloat(newBudgetLimit);
            if (!isNaN(limit) && limit > 0) {
                setBudgetLimits(prev => ({
                    ...prev,
                    [editingBudgetCategory.name]: limit
                }));
                // Save to localStorage
                const saved = JSON.parse(localStorage.getItem('budgetLimits') || '{}');
                saved[editingBudgetCategory.name] = limit;
                localStorage.setItem('budgetLimits', JSON.stringify(saved));

                const toast = document.createElement('div');
                toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl z-[60] animate-slide-up';
                toast.textContent = `Urugero rw'ingengo rwa ${getCategoryLabel(editingBudgetCategory.icon)} rwahinduwe!`;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
            }
        }
        setShowEditBudgetModal(false);
    };

    // Load budget limits from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('budgetLimits');
        if (saved) {
            setBudgetLimits(JSON.parse(saved));
        }
    }, []);

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

    const budgetCategoriesWithRealData = useMemo(() => {
        return expenseCategories.map(cat => ({
            ...cat,
            spent: realSpendingByCategory[cat.name] || 0,
            limit: budgetLimits[cat.name] || cat.limit
        }));
    }, [expenseCategories, realSpendingByCategory, budgetLimits]);

    const pieChartData = useMemo(() => budgetCategoriesWithRealData.filter(cat => cat.spent > 0), [budgetCategoriesWithRealData]);

    const totalSpent = useMemo(() => budgetCategoriesWithRealData.reduce((sum, cat) => sum + cat.spent, 0), [budgetCategoriesWithRealData]);

    const monthlyExpenseTotal = useMemo(
        () => Object.values(realSpendingByCategory).reduce((sum: number, value) => sum + (typeof value === 'number' ? value : 0), 0),
        [realSpendingByCategory]
    );

    const monthlyIncomeTotal = useMemo(() => {
        const now = new Date();
        return transactions
            .filter(tx => {
                const txDate = new Date(tx.date);
                return tx.type === 'income' && txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
            })
            .reduce((sum, tx) => sum + tx.amount, 0);
    }, [transactions]);

    const totalBudgetLimit = useMemo(
        () => expenseCategories.reduce((sum, cat) => sum + (budgetLimits[cat.name] || cat.limit), 0),
        [expenseCategories, budgetLimits]
    );

    const budgetUsage = useMemo(
        () => (totalBudgetLimit ? Math.min((monthlyExpenseTotal / totalBudgetLimit) * 100, 300) : 0),
        [monthlyExpenseTotal, totalBudgetLimit]
    );

    const savingsProgressAvg = useMemo(() => {
        if (savings.length === 0) return 0;
        const progress = savings.reduce((sum, goal) => sum + (goal.current / goal.target || 0), 0) / savings.length;
        return Math.min(progress * 100, 100);
    }, [savings]);

    const availableToSave = useMemo(() => monthlyIncomeTotal - monthlyExpenseTotal, [monthlyIncomeTotal, monthlyExpenseTotal]);

    const overspentCategories = useMemo(
        () => budgetCategoriesWithRealData.filter(cat => cat.spent > cat.limit),
        [budgetCategoriesWithRealData]
    );

    const alerts = useMemo(() => {
        const msgs: { type: 'info' | 'warning'; title: string; text: string }[] = [];
        const recurringCount = transactions.filter(t => t.isRecurring).length;
        if (recurringCount > 0) {
            msgs.push({ type: 'info', title: 'Inyemezabuguzi zihoraho', text: `Ufite ${recurringCount} nyemezabuguzi zihoraho ziri gukurikiranwa mu ngengo yawe.` });
        }
        if (overspentCategories.length > 0) {
            msgs.push({ type: 'warning', title: 'Ibyiciro birenze ingengo', text: `Ibyiciro ${overspentCategories.length} birenze urugero rw'ingengo muri uku kwezi.` });
        }
        if (budgetUsage > 80 && budgetUsage <= 100) {
            msgs.push({ type: 'warning', title: 'Ingengo igeze hafi', text: `Wakoresheje ${budgetUsage.toFixed(0)}% by'ingengo yawe y'uku kwezi.` });
        }
        return { msgs };
    }, [transactions, overspentCategories, budgetUsage]);

    const realTrendData = useMemo(() => {
        const days = ['Ku', 'Mb', 'Kb', 'Gt', 'Ga', 'Gat', 'Cy'];
        const today = new Date();
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dayName = days[date.getDay()];
            const daySpending = transactions
                .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === date.toDateString())
                .reduce((sum, t) => sum + t.amount, 0);
            data.push({ day: dayName, amount: daySpending });
        }
        return data;
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
            toast.textContent = 'Nyamuneka uzuza ibisabwa byose';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
            return;
        }

        const amount = parseFloat(txAmount);
        if (isNaN(amount) || amount <= 0) {
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-xl z-[60] animate-slide-up';
            toast.textContent = 'Nyamuneka andika amafaranga yemewe';
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
            toast.textContent = 'Ibyakozwe byahinduwe neza!';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        } else {
            addTransaction(newTx);
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl z-[60] animate-slide-up';
            toast.textContent = 'Ibyakozwe byongeweho neza!';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        setShowAddModal(false);
    };

    const handleDeleteTransaction = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDeleteTransaction = () => {
        if (editingId) {
            deleteTransaction(editingId);
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-xl shadow-xl z-[60] animate-slide-up';
            toast.textContent = 'Ibyakozwe byasibwe';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);

            setShowDeleteConfirm(false);
            setShowAddModal(false);
        }
    };

    const handleAddGoal = () => {
        if (!newGoalName || !newGoalTarget) {
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-xl z-[60] animate-slide-up';
            toast.textContent = `Nyamuneka andika izina ry'intego n'amafaranga agamijwe`;
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
        toast.textContent = 'Intego yo kuzigama yashyizweho!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);

        setShowSavingsModal(false);
        setNewGoalName('');
        setNewGoalTarget('');
        setNewGoalDeadline(null);
    };

    const ejoHezaMatchRate = 0.33;
    const ejoHezaMaxMatch = 20000;

    const ejoHezaProjectedMatch = useMemo(() => {
        return Math.min(Math.round(ejoHezaContribution * ejoHezaMatchRate), ejoHezaMaxMatch);
    }, [ejoHezaContribution]);

    const ejoHezaProjectedTotal = useMemo(() => ejoHezaContribution + ejoHezaProjectedMatch, [ejoHezaContribution, ejoHezaProjectedMatch]);
    const ejoHezaFiveYearTotal = useMemo(() => ejoHezaProjectedTotal * 12 * 5, [ejoHezaProjectedTotal]);

    const getSavingsAnalysis = (goal: SavingsGoal) => {
        if (!goal.deadline) return null;
        const targetDate = new Date(goal.deadline);
        const today = new Date();

        const timeDiff = targetDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysLeft < 0) return { type: 'expired', msg: `Itariki yarenze`, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' };
        if (goal.current >= goal.target) return { type: 'done', msg: 'Intego yagezeho! 🎉', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' };
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
                        <p className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest mb-1">Amafaranga Yose</p>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {formatCurrency(Math.abs(balance), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            {balance < 0 && <span className="text-base text-red-500 ml-2">(Umwenda)</span>}
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
                    <button onClick={() => setActiveSection('OVERVIEW')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider relative z-10 transition-colors ${activeSection === 'OVERVIEW' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>Incamake</button>
                    <button onClick={() => setActiveSection('TRANSACTIONS')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider relative z-10 transition-colors ${activeSection === 'TRANSACTIONS' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>Amateka</button>
                    <button onClick={() => setActiveSection('SAVINGS')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider relative z-10 transition-colors ${activeSection === 'SAVINGS' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>Kuzigama</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-44 no-scrollbar px-6 pt-6">
                {activeSection === 'OVERVIEW' && (
                    <div className="space-y-8 animate-slide-up">
                        {alerts.msgs.length > 0 && (
                            <div className="space-y-3">
                                {alerts.msgs.slice(0, 3).map((alert, idx) => (
                                    <div key={idx} className={`p-4 rounded-[1.5rem] shadow-sm flex items-start gap-4 bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 transition-transform active:scale-90`}>
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
                                <div><h3 className="font-semibold text-slate-900 dark:text-white">Imikoreshereze y'Amafaranga</h3><p className="text-xs text-slate-400">Iminsi 7 ishize</p></div>
                            </div>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={realTrendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
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
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Igabana ry'Ibyakoreshejwe</h3>
                            <div className="h-48 relative">
                                {pieChartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie isAnimationActive={false} data={pieChartData as any} innerRadius={60} outerRadius={80} paddingAngle={5} cornerRadius={6} dataKey="spent" stroke="none">
                                                {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <p className="text-slate-400 text-sm">Nta makuru y'ibyakoreshejwe muri uku kwezi</p>
                                    </div>
                                )}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                    <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Igiteranyo</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalSpent)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4 pb-10">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Uko Ingengo Ihagaze</h3>
                                <span className="text-xs text-slate-400">Kanda uhindure urugero</span>
                            </div>
                            {budgetCategoriesWithRealData.map((cat) => {
                                const isOverBudget = cat.spent > cat.limit;
                                return (
                                    <div key={cat.id} onClick={() => openEditBudgetModal(cat)} className="bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-800 transition-colors group cursor-pointer hover:shadow-md active:scale-[0.98]">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors">{getIcon(cat.icon)}</div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white">{getCategoryLabel(cat.icon)}</h4>
                                                    {isOverBudget && <span className="text-[10px] text-red-500 font-bold">Byarenze ingengo!</span>}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`font-bold ${isOverBudget ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{formatCurrency(cat.spent)} <span className="text-slate-300 dark:text-slate-600 font-normal">/ {formatCurrency(cat.limit)}</span></span>
                                                <p className="text-[10px] text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold">Hindura</p>
                                            </div>
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
                                <input type="text" placeholder="Shakisha ibyakozwe..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full pl-11 pr-4 py-4 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] bg-white dark:bg-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 sm:text-sm shadow-sm font-medium dark:text-white transition-all" />
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Igihe</span>
                                    <div className="bg-white dark:bg-slate-900 p-1 rounded-xl inline-flex shadow-sm border border-slate-100 dark:border-slate-800">
                                        {(['WEEK', 'MONTH', 'YEAR'] as const).map(filter => (
                                            <button key={filter} onClick={() => setDateFilter(filter)} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider ${dateFilter === filter ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>{getTimeRangeLabel(filter)}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 overflow-x-auto no-scrollbar px-1">
                                    {(['ALL', 'INCOME', 'EXPENSE', 'RECURRING'] as const).map(f => (
                                        <button key={f} onClick={() => setTransactionFilter(f)} className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${transactionFilter === f ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{getFilterLabel(f)}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((tx) => (
                                    <div key={tx.id} onClick={() => openEditModal(tx)} className="bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-all cursor-pointer hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-2xl ${tx.color.includes('bg-') ? tx.color : (tx.type === 'income' ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400')} flex items-center justify-center text-xl relative`}>
                                                {getIcon(tx.icon)}
                                                {tx.isRecurring && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center"><svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></div>
                                                )}
                                            </div>
                                            <div><h4 className="font-bold text-slate-900 dark:text-white text-base mb-0.5">{tx.title}</h4><div className="flex items-center gap-2"><p className="text-xs text-slate-400 font-medium">{tx.category}</p><span className="text-[10px] text-slate-300">•</span><p className="text-xs text-slate-400 font-medium">{new Date(tx.date).toLocaleDateString()}</p></div></div>
                                        </div>
                                        <div className="flex flex-col items-end"><span className={`font-black text-lg ${tx.type === 'income' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-900 dark:text-white'}`}>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}</span><span className="text-[10px] text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold mt-1">Hindura</span></div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 opacity-50 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4"><svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                                    <p className="text-slate-500 font-bold">Nta byakozwe byabonetse</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeSection === 'SAVINGS' && (
                    <div className="animate-slide-up space-y-6 pb-10">
                        <div className="rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800 bg-slate-900">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900" />
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
                            <div className="absolute -top-24 -right-24 w-60 h-60 bg-brand/25 rounded-full blur-[90px]" />
                            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-900/40 rounded-full blur-[90px]" />
                            <div className="relative z-10">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                    Byose Byazigamwe
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                                </p>
                                <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">
                                    {formatCurrency(savings.reduce((acc, curr) => acc + curr.current, 0), { minimumFractionDigits: 0 })}
                                </h2>
                                <button onClick={() => setShowSavingsModal(true)} className="bg-white/10 backdrop-blur-md border border-white/10 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center gap-2 hover:bg-white/20">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    Intego Nshya
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div
                                onClick={() => { setShowEjoHezaModal(true); setEjoHezaTab('about'); }}
                                className="rounded-[1.8rem] border border-emerald-200 bg-white shadow-sm p-5 dark:bg-slate-900 dark:border-teal-900/40 text-slate-800 dark:text-slate-100 active:scale-[0.98] transition-all cursor-pointer hover:border-emerald-300"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white">EjoHeza</h3>
                                    </div>
                                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 dark:bg-teal-900/30 dark:text-teal-200 flex items-center justify-center text-sm font-black">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </span>
                                </div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-emerald-400 dark:text-teal-400 mb-3">Gahunda yo kuzigamira ejo hazaza</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    Hari aho wakoresha. Uracyafite {formatCurrency(60000)} mu ngengo y'uyu munsi — shyira mu EjoHeza kugira ngo wungukire kuri +33% y'impano ya Leta.
                                </p>
                            </div>

                            {savings.map(goal => {
                                const analysis = getSavingsAnalysis(goal);
                                const progress = (goal.current / goal.target) * 100;
                                const hue = progress > 75 ? 120 : progress > 50 ? 60 : progress > 25 ? 30 : 0;

                                return (
                                    <div key={goal.id} className={`bg-gradient-to-br from-${progress > 75 ? 'emerald' : progress > 50 ? 'blue' : progress > 25 ? 'indigo' : 'purple'}-600 via-${progress > 75 ? 'emerald' : progress > 50 ? 'blue' : progress > 25 ? 'indigo' : 'purple'}-700 to-${progress > 75 ? 'teal' : progress > 50 ? 'indigo' : progress > 25 ? 'purple' : 'pink'}-800 rounded-[2rem] p-6 relative overflow-hidden cursor-pointer group active:scale-[0.98] transition-all duration-300 shadow-xl shadow-${progress > 75 ? 'emerald' : progress > 50 ? 'blue' : progress > 25 ? 'indigo' : 'purple'}-900/20`}>
                                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                                        <div className="relative z-10">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                                        {getIcon(goal.icon)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-black text-white mb-1">{goal.name}</h4>
                                                        {goal.deadline && <p className="text-xs text-white/60 font-medium">Intego: {new Date(goal.deadline).toLocaleDateString()}</p>}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xl font-black text-white">{formatCurrency(goal.current)}</span>
                                                    <p className="text-xs text-white/60">/ {formatCurrency(goal.target)}</p>
                                                </div>
                                            </div>

                                            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden mb-4">
                                                <div className="h-full bg-white rounded-full transition-all duration-1000 relative overflow-hidden" style={{ width: `${progress}%` }}>
                                                    <div className="absolute inset-0 bg-white/30 animate-pulse-slow"></div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                                                    <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold mb-1">Aho wigeze</p>
                                                    <p className="text-lg font-black text-white">{Math.round(progress)}%</p>
                                                </div>
                                                <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                                                    <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold mb-1">Imvura</p>
                                                    <p className="text-lg font-black text-white">{formatCurrency(goal.target - goal.current)}</p>
                                                </div>
                                            </div>

                                            {analysis && (
                                                <div className={`mt-4 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20`}>
                                                    <div className="flex items-start gap-3">
                                                        <svg className="w-5 h-5 text-white/80 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-white/80 uppercase tracking-wider mb-1">Isesengura</p>
                                                            {analysis.type === 'active' ? (
                                                                <p className="text-sm text-white/90 font-medium leading-relaxed">Zigama <span className="font-black text-white">{Math.ceil(analysis.monthlyRate)}/ukwezi</span> kugira ngo ugere ku ntego mu mezi {Math.ceil(analysis.daysLeft / 30)}.</p>
                                                            ) : (
                                                                <p className="text-sm text-white/90 font-medium">{analysis.msg}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Transaction Bottom Sheet (Using fixed position to simulate sheet) */}
            {showAddModal && (
                <div className="fixed inset-0 z-[70] flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddModal(false)}></div>
                    <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-t-[2.5rem] p-6 pb-28 shadow-2xl animate-slide-up relative z-10 transition-colors border-t border-white/10 max-h-[calc(100vh-7rem)] overflow-y-auto">
                        <div className="drag-handle mb-6"></div>

                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{editingId ? 'Hindura Ibyakozwe' : 'Ibyakozwe Bishya'}</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <Icons.Close className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                                <button onClick={() => setTxType('expense')} className={`py-3.5 rounded-xl text-sm font-bold transition-all ${txType === 'expense' ? 'bg-white dark:bg-slate-700 text-red-500 shadow-sm' : 'text-slate-500'}`}>Ayasohotse</button>
                                <button onClick={() => setTxType('income')} className={`py-3.5 rounded-xl text-sm font-bold transition-all ${txType === 'income' ? 'bg-white dark:bg-slate-700 text-green-500 shadow-sm' : 'text-slate-500'}`}>Ayinjiye</button>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Amafaranga</label>
                                <div className="relative group">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">$</span>
                                    <input type="number" value={txAmount} onChange={e => setTxAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 dark:bg-slate-900 rounded-3xl py-5 pl-10 pr-6 text-3xl font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all border border-slate-100 dark:border-slate-800" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Izina</label>
                                <input type="text" value={txTitle} onChange={e => setTxTitle(e.target.value)} placeholder="urugero: Kugura ibiryo" className="w-full bg-slate-50 dark:bg-slate-900 rounded-3xl py-4 px-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all border border-slate-100 dark:border-slate-800" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Icyiciro</label>
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                    {(txType === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => { setTxCategory(cat.name); setTxIcon(cat.icon); }}
                                            className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all ${txCategory === cat.name ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white scale-105' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'}`}
                                        >
                                            {getCategoryLabel(cat.icon)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Itariki</label>
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800">
                                    <DatePicker value={txDate} onChange={setTxDate} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl cursor-pointer border border-slate-100 dark:border-slate-800" onClick={() => setTxRecurring(!txRecurring)}>
                                <span className="font-bold text-slate-900 dark:text-white text-sm">Bihoraho buri kwezi</span>
                                <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${txRecurring ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${txRecurring ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            {editingId && (
                                <button onClick={handleDeleteTransaction} className="flex-1 py-4 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-3xl font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-100 dark:border-red-900/30">Siba</button>
                            )}
                            <button onClick={handleSaveTransaction} className="flex-[2] py-4 bg-slate-900 dark:bg-teal-600 text-white rounded-3xl font-bold text-sm shadow-xl dark:shadow-teal-900/40 active:scale-95 transition-transform">
                                {editingId ? 'Bika Impinduka' : 'Ongeraho'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Budget Modal */}
            {showEditBudgetModal && editingBudgetCategory && (
                <div className="fixed inset-0 z-[80] flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowEditBudgetModal(false)}></div>
                    <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-t-[2.5rem] p-6 pb-10 shadow-2xl animate-slide-up transition-colors border-t border-white/10 relative z-10">
                        <div className="drag-handle mb-6"></div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Hindura Ingengo</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{getCategoryLabel(editingBudgetCategory.icon)}</h3>
                            </div>
                            <button onClick={() => setShowEditBudgetModal(false)} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <Icons.Close className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.3em] mb-2">Urugero rushya</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-400 font-black text-2xl">RWF</span>
                                    <input
                                        type="number"
                                        min={0}
                                        value={newBudgetLimit}
                                        onChange={(e) => setNewBudgetLimit(e.target.value)}
                                        className="flex-1 bg-transparent border-none text-4xl font-black text-slate-900 dark:text-white outline-none"
                                        placeholder="0"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-3">Ubu: {formatCurrency(editingBudgetCategory.limit)}</p>
                            </div>

                            <div className="rounded-3xl border border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
                                <div className="flex justify-between text-xs text-slate-400 font-semibold mb-2">
                                    <span>Ayakozwe</span>
                                    <span>Ingengo</span>
                                </div>
                                <ProgressBar current={editingBudgetCategory.spent} max={Math.max(parseFloat(newBudgetLimit) || editingBudgetCategory.limit, 1)} color={editingBudgetCategory.color} />
                                <div className="flex justify-between text-sm font-bold mt-2 text-slate-900 dark:text-white">
                                    <span>{formatCurrency(editingBudgetCategory.spent)}</span>
                                    <span>{formatCurrency(parseFloat(newBudgetLimit) || editingBudgetCategory.limit)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowEditBudgetModal(false)} className="flex-1 py-4 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm">
                                Kureka
                            </button>
                            <button onClick={handleSaveBudgetLimit} className="flex-[1.5] py-4 bg-slate-900 dark:bg-teal-500 text-white rounded-3xl font-bold text-sm shadow-xl active:scale-95 transition-transform">
                                Bika
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Savings Modal (Bottom Sheet) */}
            {showSavingsModal && (
                <div className="fixed inset-0 z-[70] flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowSavingsModal(false)}></div>
                    <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-t-[2.5rem] p-6 pb-28 shadow-2xl animate-slide-up transition-colors border-t border-white/10 relative z-10 max-h-[calc(100vh-7rem)] overflow-y-auto">
                        <div className="drag-handle mb-6"></div>
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Intego Nshya yo Kuzigama</h3>
                            <button onClick={() => setShowSavingsModal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <Icons.Close className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <input type="text" value={newGoalName} onChange={e => setNewGoalName(e.target.value)} placeholder="Izina ry'intego (urugero: Imodoka nshya)" className="w-full bg-slate-50 dark:bg-slate-900 rounded-3xl py-4 px-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-100 dark:border-slate-800" />
                            <input type="number" value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)} placeholder="Amafaranga agamijwe" className="w-full bg-slate-50 dark:bg-slate-900 rounded-3xl py-4 px-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-100 dark:border-slate-800" />
                            <DatePicker
                                value={newGoalDeadline}
                                onChange={setNewGoalDeadline}
                                placeholder="Hitamo itariki"
                            />
                        </div>
                        <button onClick={handleAddGoal} className="w-full mt-8 py-4 bg-indigo-600 text-white rounded-3xl font-bold text-sm shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 active:scale-95 transition-transform">
                            Shiraho Intego
                        </button>
                    </div>
                </div>
            )}

            {/* EjoHeza Info Modal */}
            {showEjoHezaModal && (
                <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowEjoHezaModal(false)}></div>
                    <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl animate-slide-up sm:animate-zoom-in relative z-10 overflow-hidden border border-slate-100 dark:border-slate-800 max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="relative h-32 bg-white dark:bg-slate-900 overflow-hidden shrink-0 border-b border-slate-100 dark:border-slate-800">
                            <button onClick={() => setShowEjoHezaModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full transition-colors z-20">
                                <Icons.Close className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-4 left-6 right-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                                        <svg className="w-5 h-5 text-slate-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white">EjoHeza</h2>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 mx-6 mt-4 rounded-xl shrink-0">
                            <button onClick={() => setEjoHezaTab('about')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${ejoHezaTab === 'about' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>Ibisobanuro</button>
                            <button onClick={() => setEjoHezaTab('calculator')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${ejoHezaTab === 'calculator' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>Kubara</button>
                            <button onClick={() => setEjoHezaTab('howto')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${ejoHezaTab === 'howto' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>Uko Bimera</button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {ejoHezaTab === 'about' && (
                                <div className="space-y-5 animate-fade-in">
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                                        EjoHeza ni gahunda ya Leta y'u Rwanda ifasha buri munyarwanda kwizigamira no kubona impano ya Leta ku byo atekereza ejo hazaza.
                                    </p>

                                    <div className="grid grid-cols-2 gap-3">
                                        {[{ label: 'Impano ya Leta', value: '+33%' }, { label: 'Tangirira kuri', value: 'RWF 1K' }].map((item) => (
                                            <div key={item.label} className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                                                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400 mb-2">{item.label}</p>
                                                <p className="text-2xl font-black text-slate-900 dark:text-white">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Ibyiza by'EjoHeza</h4>
                                        <div className="grid gap-2">
                                            {[
                                                'Impano ya Leta kuri buri RWF uzigama',
                                                'Amafaranga yawe arinzwe neza',
                                                'Inyungu ziyongera buri mwaka',
                                                'Intego zo kuzigama zisobanutse'
                                            ].map((text, i) => (
                                                <div key={i} className="rounded-[1.5rem] border border-slate-100 bg-white p-3 shadow-sm flex items-center gap-3 dark:bg-slate-900 dark:border-slate-800">
                                                    <span className="w-8 h-8 rounded-full bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand flex items-center justify-center text-sm font-black">{i + 1}</span>
                                                    <p className="text-sm text-slate-600 dark:text-slate-200">{text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {ejoHezaTab === 'calculator' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="rounded-[1.8rem] border border-slate-100 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Shyiramo Ku kwezi</p>
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(ejoHezaContribution, { maximumFractionDigits: 0 })}</h3>
                                            </div>
                                            <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Kubara</span>

                                        </div>
                                        <input
                                            type="range"
                                            min={1000}
                                            max={100000}
                                            step={1000}
                                            value={ejoHezaContribution}
                                            onChange={(e) => setEjoHezaContribution(Number(e.target.value))}
                                            className="w-full accent-brand"

                                        />
                                        <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-2">
                                            <span>RWF 1K</span>
                                            <span>RWF 100K</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[{
                                            label: 'Ufatiweho',
                                            value: formatCurrency(ejoHezaContribution, { maximumFractionDigits: 0 })
                                        }, {
                                            label: "Impano ya Leta (+33%)",
                                            value: formatCurrency(ejoHezaProjectedMatch, { maximumFractionDigits: 0 })
                                        }, {
                                            label: 'Utahana buri kwezi',
                                            value: formatCurrency(ejoHezaProjectedTotal, { maximumFractionDigits: 0 })
                                        }].map((item) => (
                                            <div key={item.label} className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                                                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400 mb-2">{item.label}</p>
                                                <p className="text-xl font-black text-slate-900 dark:text-white">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="rounded-[1.8rem] border border-slate-100 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                                        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400 mb-2">Mu myaka 5</p>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{formatCurrency(ejoHezaFiveYearTotal, { maximumFractionDigits: 0 })}</h3>

                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                            Ushyira kuri konti ya EjoHeza amafaranga angana n'aya buri kwezi, ukoresheje impano ya Leta ya +33%,
                                            ushobora kugira iyi nyongeragaciro mu myaka 5, utabariyemo inyungu y'isoko.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {ejoHezaTab === 'howto' && (
                                <div className="space-y-5 animate-fade-in">
                                    <div className="rounded-[1.8rem] border border-slate-100 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                                        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400 mb-1">Uko Bimera</p>

                                        <p className="text-sm text-slate-600 dark:text-slate-300">
                                            Kurikiza izi ntambwe nto kugirango winjire muri gahunda ya EjoHeza kandi utangire kwakira impano ya Leta.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {[{
                                            title: 'Iyandikishe',
                                            desc: 'Sura urubuga rwa EjoHeza cyangwa ukoreshe *506# kuri telefone yawe.'
                                        }, {
                                            title: 'Reba konti ya banki cyangwa MoMo',
                                            desc: 'Hitamo aho uzajya ufatira amafaranga buri kwezi—banki, SACCO cyangwa Mobile Money.'
                                        }, {
                                            title: 'Shyiraho gahunda yo kuzigama',
                                            desc: 'Teganya umubare uhora ubika buri kwezi (RWF 1,000 kugeza hejuru).'
                                        }, {
                                            title: 'Komeza kubika',
                                            desc: 'Iyo ushyizemo amafaranga ku gihe, Leta igufasha kongeraho 33% kugeza ku RWF 20,000 ku kwezi.'
                                        }].map((step, idx) => (
                                            <div key={step.title} className="rounded-[1.6rem] border border-slate-100 bg-white p-4 shadow-sm flex gap-4 dark:bg-slate-900 dark:border-slate-800">
                                                <div className="w-10 h-10 rounded-full bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand flex items-center justify-center font-black">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white">{step.title}</p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{step.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const BudgetPlanner = memo(BudgetPlannerComponent);

export default BudgetPlanner;