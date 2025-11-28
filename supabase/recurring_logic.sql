-- Add columns for recurring logic if they don't exist
-- Note: You might need to run this manually in Supabase SQL Editor

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'recurring_frequency') THEN
        ALTER TABLE transactions ADD COLUMN recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'next_recurring_date') THEN
        ALTER TABLE transactions ADD COLUMN next_recurring_date TIMESTAMPTZ;
    END IF;
END $$;

-- Function to process recurring transactions
CREATE OR REPLACE FUNCTION process_recurring_transactions()
RETURNS void AS $$
DECLARE
    r RECORD;
    next_date TIMESTAMPTZ;
BEGIN
    -- Loop through active recurring transactions that are due
    -- We assume the transaction with is_recurring=true is the "template"
    FOR r IN 
        SELECT * FROM transactions 
        WHERE is_recurring = true 
        AND next_recurring_date IS NOT NULL
        AND next_recurring_date <= NOW()
    LOOP
        -- Calculate next date based on frequency
        IF r.recurring_frequency = 'daily' THEN
            next_date := r.next_recurring_date + INTERVAL '1 day';
        ELSIF r.recurring_frequency = 'weekly' THEN
            next_date := r.next_recurring_date + INTERVAL '1 week';
        ELSIF r.recurring_frequency = 'monthly' THEN
            next_date := r.next_recurring_date + INTERVAL '1 month';
        ELSIF r.recurring_frequency = 'yearly' THEN
            next_date := r.next_recurring_date + INTERVAL '1 year';
        ELSE
            -- Default to monthly if not specified
            next_date := r.next_recurring_date + INTERVAL '1 month';
        END IF;

        -- Insert new transaction (the occurrence)
        -- The new transaction is NOT recurring itself
        INSERT INTO transactions (
            user_id, title, category, amount, date, type, icon, color, is_recurring, recurring_frequency, next_recurring_date
        ) VALUES (
            r.user_id, r.title, r.category, r.amount, r.next_recurring_date, r.type, r.icon, r.color, false, null, null
        );

        -- Update the recurring transaction's next date
        UPDATE transactions 
        SET next_recurring_date = next_date,
            updated_at = NOW()
        WHERE id = r.id;
        
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a cron job if pg_cron is enabled
-- SELECT cron.schedule('0 0 * * *', $$SELECT process_recurring_transactions()$$);
