/**
 * Data Export Service
 * Export transactions, savings goals, and other data to CSV/PDF
 */

import { Transaction, SavingsGoal } from '../types';

// ============================================
// CSV Export
// ============================================
export const csvExport = {
  /**
   * Convert array of objects to CSV string
   */
  toCSV<T extends Record<string, any>>(data: T[], columns?: { key: keyof T; label: string }[]): string {
    if (data.length === 0) return '';

    // Get columns from data or use provided columns
    const keys = columns?.map(c => c.key) || (Object.keys(data[0]) as (keyof T)[]);
    const headers = columns?.map(c => c.label) || keys.map(k => String(k));

    // Create CSV header
    const headerRow = headers.map(h => `"${h}"`).join(',');

    // Create CSV rows
    const rows = data.map(item => {
      return keys.map(key => {
        const value = item[key];
        if (value === null || value === undefined) return '""';
        if (value instanceof Date) return `"${value.toISOString()}"`;
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
    });

    return [headerRow, ...rows].join('\n');
  },

  /**
   * Download CSV file
   */
  download(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};

// ============================================
// Transaction Export
// ============================================
export const transactionExport = {
  /**
   * Export transactions to CSV
   */
  toCSV(transactions: Transaction[]): string {
    const columns = [
      { key: 'date' as keyof Transaction, label: 'Date' },
      { key: 'title' as keyof Transaction, label: 'Description' },
      { key: 'category' as keyof Transaction, label: 'Category' },
      { key: 'type' as keyof Transaction, label: 'Type' },
      { key: 'amount' as keyof Transaction, label: 'Amount' },
      { key: 'isRecurring' as keyof Transaction, label: 'Recurring' },
    ];

    const formattedData = transactions.map(t => ({
      ...t,
      date: new Date(t.date).toLocaleDateString(),
      amount: t.type === 'expense' ? -t.amount : t.amount,
      isRecurring: t.isRecurring ? 'Yes' : 'No',
    }));

    return csvExport.toCSV(formattedData, columns);
  },

  /**
   * Download transactions as CSV
   */
  download(transactions: Transaction[], filename: string = 'transactions'): void {
    const csv = this.toCSV(transactions);
    const date = new Date().toISOString().split('T')[0];
    csvExport.download(csv, `${filename}_${date}`);
  },

  /**
   * Export monthly summary
   */
  exportMonthlySummary(transactions: Transaction[], year: number, month: number): string {
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });

    const income = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    // Category breakdown
    const categoryTotals: Record<string, number> = {};
    monthTransactions.filter(t => t.type === 'expense').forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    let summary = `Monthly Financial Summary\n`;
    summary += `Period: ${new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}\n\n`;
    summary += `Total Income: $${income.toFixed(2)}\n`;
    summary += `Total Expenses: $${expenses.toFixed(2)}\n`;
    summary += `Net Savings: $${(income - expenses).toFixed(2)}\n\n`;
    summary += `Expense Breakdown:\n`;
    Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, amt]) => {
        summary += `  ${cat}: $${amt.toFixed(2)}\n`;
      });

    return summary;
  },
};

// ============================================
// Savings Goals Export
// ============================================
export const savingsExport = {
  /**
   * Export savings goals to CSV
   */
  toCSV(goals: SavingsGoal[]): string {
    const columns = [
      { key: 'name' as keyof SavingsGoal, label: 'Goal Name' },
      { key: 'current' as keyof SavingsGoal, label: 'Current Amount' },
      { key: 'target' as keyof SavingsGoal, label: 'Target Amount' },
      { key: 'deadline' as keyof SavingsGoal, label: 'Deadline' },
    ];

    const formattedData = goals.map(g => ({
      ...g,
      current: `$${g.current.toFixed(2)}`,
      target: `$${g.target.toFixed(2)}`,
      progress: `${((g.current / g.target) * 100).toFixed(1)}%`,
    }));

    return csvExport.toCSV(formattedData, columns);
  },

  /**
   * Download savings goals as CSV
   */
  download(goals: SavingsGoal[], filename: string = 'savings_goals'): void {
    const csv = this.toCSV(goals);
    const date = new Date().toISOString().split('T')[0];
    csvExport.download(csv, `${filename}_${date}`);
  },
};

// ============================================
// Full Data Export
// ============================================
export const fullExport = {
  /**
   * Export all user data as JSON
   */
  toJSON(data: {
    transactions?: Transaction[];
    savingsGoals?: SavingsGoal[];
    settings?: any;
    healthData?: any;
  }): string {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      version: '1.0',
      ...data,
    }, null, 2);
  },

  /**
   * Download all data as JSON
   */
  downloadJSON(data: any, filename: string = 'realworks_backup'): void {
    const json = this.toJSON(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Import data from JSON file
   */
  async importJSON(file: File): Promise<{
    transactions?: Transaction[];
    savingsGoals?: SavingsGoal[];
    settings?: any;
    healthData?: any;
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },
};

// ============================================
// PDF Export (Simple text-based)
// ============================================
export const pdfExport = {
  /**
   * Generate printable HTML report
   */
  generateReport(data: {
    title: string;
    period?: string;
    transactions?: Transaction[];
    savingsGoals?: SavingsGoal[];
    summary?: {
      totalIncome: number;
      totalExpenses: number;
      netSavings: number;
    };
  }): string {
    const { title, period, transactions, savingsGoals, summary } = data;

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #1e293b; border-bottom: 2px solid #f97316; padding-bottom: 10px; }
          h2 { color: #334155; margin-top: 30px; }
          .summary { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .summary-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .positive { color: #10b981; }
          .negative { color: #ef4444; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          th { background: #f1f5f9; font-weight: 600; }
          .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${period ? `<p style="color: #64748b;">Period: ${period}</p>` : ''}
    `;

    if (summary) {
      html += `
        <div class="summary">
          <div class="summary-item">
            <span>Total Income</span>
            <span class="positive">$${summary.totalIncome.toFixed(2)}</span>
          </div>
          <div class="summary-item">
            <span>Total Expenses</span>
            <span class="negative">$${summary.totalExpenses.toFixed(2)}</span>
          </div>
          <div class="summary-item" style="font-weight: bold;">
            <span>Net Savings</span>
            <span class="${summary.netSavings >= 0 ? 'positive' : 'negative'}">
              $${summary.netSavings.toFixed(2)}
            </span>
          </div>
        </div>
      `;
    }

    if (transactions && transactions.length > 0) {
      html += `
        <h2>Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(t => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>${t.title}</td>
                <td>${t.category}</td>
                <td class="${t.type === 'income' ? 'positive' : 'negative'}">
                  ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    if (savingsGoals && savingsGoals.length > 0) {
      html += `
        <h2>Savings Goals</h2>
        <table>
          <thead>
            <tr>
              <th>Goal</th>
              <th>Progress</th>
              <th>Current</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            ${savingsGoals.map(g => `
              <tr>
                <td>${g.name}</td>
                <td>${((g.current / g.target) * 100).toFixed(1)}%</td>
                <td>$${g.current.toFixed(2)}</td>
                <td>$${g.target.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    html += `
        <div class="footer">
          <p>Generated by WellVest on ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;

    return html;
  },

  /**
   * Print report (opens print dialog)
   */
  print(data: Parameters<typeof pdfExport.generateReport>[0]): void {
    const html = this.generateReport(data);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  },

  /**
   * Download as HTML (can be opened in browser and printed to PDF)
   */
  download(data: Parameters<typeof pdfExport.generateReport>[0], filename: string = 'report'): void {
    const html = this.generateReport(data);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};

export default {
  csv: csvExport,
  transactions: transactionExport,
  savings: savingsExport,
  full: fullExport,
  pdf: pdfExport,
};
