import React, { useState } from 'react';

interface RecurringTransactionFormProps {
    onSubmit: (transaction: any) => void;
    onCancel: () => void;
}

const RecurringTransactionForm: React.FC<RecurringTransactionFormProps> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'bills',
        type: 'expense' as 'income' | 'expense',
        frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
        startDate: new Date().toISOString().split('T')[0],
        icon: '💳',
        color: '#ef4444'
    });

    const categories = {
        expense: ['bills', 'food', 'transport', 'entertainment', 'shopping', 'health', 'other'],
        income: ['salary', 'freelance', 'investment', 'other']
    };

    const frequencyOptions = [
        { value: 'daily', label: 'Daily', example: 'Every day' },
        { value: 'weekly', label: 'Weekly', example: 'Every week' },
        { value: 'monthly', label: 'Monthly', example: 'Every month' },
        { value: 'yearly', label: 'Yearly', example: 'Every year' }
    ];

    const categoryIcons = {
        bills: '💳',
        food: '🍔',
        transport: '🚗',
        entertainment: '🎬',
        shopping: '🛍️',
        health: '💊',
        salary: '💰',
        freelance: '💼',
        investment: '📈',
        other: '📌'
    };

    const categoryColors = {
        bills: '#ef4444',
        food: '#f59e0b',
        transport: '#3b82f6',
        entertainment: '#8b5cf6',
        shopping: '#ec4899',
        health: '#10b981',
        salary: '#22c55e',
        freelance: '#6366f1',
        investment: '#14b8a6',
        other: '#6b7280'
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Calculate next recurring date based on frequency
        const startDate = new Date(formData.startDate);
        let nextRecurringDate = new Date(startDate);

        switch (formData.frequency) {
            case 'daily':
                nextRecurringDate.setDate(nextRecurringDate.getDate() + 1);
                break;
            case 'weekly':
                nextRecurringDate.setDate(nextRecurringDate.getDate() + 7);
                break;
            case 'monthly':
                nextRecurringDate.setMonth(nextRecurringDate.getMonth() + 1);
                break;
            case 'yearly':
                nextRecurringDate.setFullYear(nextRecurringDate.getFullYear() + 1);
                break;
        }

        const transaction = {
            title: formData.title,
            amount: parseFloat(formData.amount),
            category: formData.category,
            type: formData.type,
            date: startDate.toISOString(),
            icon: formData.icon,
            color: formData.color,
            isRecurring: true,
            recurringFrequency: formData.frequency,
            nextRecurringDate: nextRecurringDate.toISOString()
        };

        onSubmit(transaction);
    };

    const handleCategoryChange = (category: string) => {
        setFormData({
            ...formData,
            category,
            icon: categoryIcons[category as keyof typeof categoryIcons] || '📌',
            color: categoryColors[category as keyof typeof categoryColors] || '#6b7280'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                New Recurring Transaction
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Set up automatic income or expenses
                            </p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Type Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Transaction Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'expense', category: 'bills' })}
                                className={`p-4 rounded-xl border-2 transition-all ${formData.type === 'expense'
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-2xl mb-1">📤</div>
                                <div className="font-semibold text-gray-900 dark:text-white">Expense</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'income', category: 'salary' })}
                                className={`p-4 rounded-xl border-2 transition-all ${formData.type === 'income'
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-2xl mb-1">📥</div>
                                <div className="font-semibold text-gray-900 dark:text-white">Income</div>
                            </button>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Netflix Subscription"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                $
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {categories[formData.type].map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => handleCategoryChange(cat)}
                                    className={`p-3 rounded-lg border-2 transition-all capitalize ${formData.category === cat
                                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="text-xl mb-1">
                                        {categoryIcons[cat as keyof typeof categoryIcons]}
                                    </div>
                                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                                        {cat}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Frequency */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Repeat Frequency
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {frequencyOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, frequency: opt.value as any })}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${formData.frequency === opt.value
                                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="font-semibold text-gray-900 dark:text-white mb-1">
                                        {opt.label}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {opt.example}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            required
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            First occurrence will be on this date
                        </p>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-teal-200 dark:border-teal-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="text-3xl">{formData.icon}</div>
                            <div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                    {formData.title || 'Unnamed Transaction'}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    ${formData.amount || '0.00'} • {formData.frequency}
                                </div>
                            </div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                            Next occurrence: {new Date(formData.startDate).toLocaleDateString()}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-medium hover:from-teal-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
                        >
                            Create Recurring Transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecurringTransactionForm;
