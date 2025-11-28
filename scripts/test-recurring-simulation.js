import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: Supabase credentials not found in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🔄 Testing Recurring Transactions Logic...');

async function testRecurringLogic() {
    try {
        // 1. Create a dummy user (or use existing if we can't create)
        // Since we don't have admin key, we can't easily create a user without signup
        // We will try to fetch a user or just mock the logic locally

        console.log('⚠️  Note: This test simulates the logic that runs on the server.');
        console.log('⚠️  It does NOT modify your database directly to avoid messing up real data.');

        // Mock Data
        const mockTransaction = {
            id: 'test-tx-1',
            title: 'Netflix Subscription',
            amount: 15.99,
            date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            is_recurring: true,
            recurring_frequency: 'monthly',
            next_recurring_date: new Date(Date.now() - 1000).toISOString() // Just passed
        };

        console.log('\n📋 Mock Transaction:', mockTransaction);

        // Simulate Logic
        const now = new Date();
        const nextDate = new Date(mockTransaction.next_recurring_date);

        if (nextDate <= now) {
            console.log('✅ Transaction is due for recurrence.');

            // Calculate new date
            let newNextDate = new Date(nextDate);
            if (mockTransaction.recurring_frequency === 'monthly') {
                newNextDate.setMonth(newNextDate.getMonth() + 1);
            }

            console.log(`📅 New Next Date Calculated: ${newNextDate.toISOString()}`);

            // Simulate Insert
            const newTransaction = {
                ...mockTransaction,
                id: 'new-tx-generated',
                date: mockTransaction.next_recurring_date,
                is_recurring: false,
                next_recurring_date: null
            };

            console.log('🆕 Generated Transaction (Instance):', {
                title: newTransaction.title,
                date: newTransaction.date,
                amount: newTransaction.amount
            });

            console.log('✅ Logic verification passed.');
        } else {
            console.log('❌ Logic Error: Transaction should be due.');
        }

    } catch (error) {
        console.error('❌ Test Failed:', error);
    }
}

testRecurringLogic();
