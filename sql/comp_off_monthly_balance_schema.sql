-- Comp-off Monthly Balance Schema
-- This table stores monthly comp-off balances for each user

CREATE TABLE IF NOT EXISTS comp_off_monthly_balance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    oc_days INTEGER NOT NULL DEFAULT 0, -- On-Call days assigned
    cf_days INTEGER NOT NULL DEFAULT 0, -- Comp-off days used
    balance INTEGER NOT NULL DEFAULT 0, -- Final balance for the month
    carry_forward_balance INTEGER NOT NULL DEFAULT 0, -- Balance carried to next month
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, team_id, year, month)
);

-- Enable Row Level Security
ALTER TABLE comp_off_monthly_balance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comp_off_monthly_balance table

-- Policy 1: Users can view their own monthly balance records
CREATE POLICY "Users can view own monthly balance records" ON comp_off_monthly_balance
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Team admins can view monthly balance records for their team members
CREATE POLICY "Team admins can view team monthly balance records" ON comp_off_monthly_balance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.team_id = comp_off_monthly_balance.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role = 'admin'
        )
    );

-- Policy 3: Users can insert their own monthly balance records
CREATE POLICY "Users can insert own monthly balance records" ON comp_off_monthly_balance
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 4: Team admins can insert monthly balance records for their team members
CREATE POLICY "Team admins can insert team monthly balance records" ON comp_off_monthly_balance
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.team_id = comp_off_monthly_balance.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role = 'admin'
        )
    );

-- Policy 5: Users can update their own monthly balance records
CREATE POLICY "Users can update own monthly balance records" ON comp_off_monthly_balance
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy 6: Team admins can update monthly balance records for their team members
CREATE POLICY "Team admins can update team monthly balance records" ON comp_off_monthly_balance
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.team_id = comp_off_monthly_balance.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role = 'admin'
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comp_off_monthly_balance_user_team ON comp_off_monthly_balance(user_id, team_id);
CREATE INDEX IF NOT EXISTS idx_comp_off_monthly_balance_year_month ON comp_off_monthly_balance(year, month);
CREATE INDEX IF NOT EXISTS idx_comp_off_monthly_balance_user_year_month ON comp_off_monthly_balance(user_id, year, month);

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_comp_off_monthly_balance_updated_at
    BEFORE UPDATE ON comp_off_monthly_balance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate and store monthly comp-off balance
CREATE OR REPLACE FUNCTION calculate_monthly_comp_off_balance(
    p_user_id UUID,
    p_team_id UUID,
    p_year INTEGER,
    p_month INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_oc_count INTEGER;
    v_cf_count INTEGER;
    v_balance INTEGER;
    v_previous_carry_forward INTEGER;
    v_carry_forward_balance INTEGER;
BEGIN
    -- Calculate OC and CF for the specified month from roster_entries
    SELECT 
        COALESCE(COUNT(CASE WHEN status = 'OC' THEN 1 END), 0),
        COALESCE(COUNT(CASE WHEN status IN ('CF', 'CmO') THEN 1 END), 0)
    INTO v_oc_count, v_cf_count
    FROM roster_entries 
    WHERE user_id = p_user_id 
    AND team_id = p_team_id
    AND EXTRACT(YEAR FROM date::date) = p_year
    AND EXTRACT(MONTH FROM date::date) = p_month;
    
    -- Get previous month's carry forward balance
    SELECT COALESCE(carry_forward_balance, 0)
    INTO v_previous_carry_forward
    FROM comp_off_monthly_balance
    WHERE user_id = p_user_id 
    AND team_id = p_team_id
    AND (
        (year = p_year AND month = p_month - 1) OR
        (year = p_year - 1 AND month = 12 AND p_month = 1)
    );
    
    -- Calculate current month's balance: previous carry forward + OC - CF
    v_balance := v_previous_carry_forward + v_oc_count - v_cf_count;
    
    -- Ensure balance doesn't go below 0
    IF v_balance < 0 THEN
        v_balance := 0;
    END IF;
    
    -- The carry forward balance is the same as the current balance
    v_carry_forward_balance := v_balance;
    
    -- Insert or update the monthly balance record
    INSERT INTO comp_off_monthly_balance (
        user_id, team_id, year, month, 
        oc_days, cf_days, balance, carry_forward_balance
    )
    VALUES (
        p_user_id, p_team_id, p_year, p_month,
        v_oc_count, v_cf_count, v_balance, v_carry_forward_balance
    )
    ON CONFLICT (user_id, team_id, year, month)
    DO UPDATE SET 
        oc_days = v_oc_count,
        cf_days = v_cf_count,
        balance = v_balance,
        carry_forward_balance = v_carry_forward_balance,
        updated_at = NOW();
    
    RETURN v_balance;
END;
$$ LANGUAGE plpgsql;

-- Function to get current month's comp-off balance
CREATE OR REPLACE FUNCTION get_current_month_comp_off_balance(
    p_user_id UUID,
    p_team_id UUID,
    p_year INTEGER,
    p_month INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_balance INTEGER;
BEGIN
    -- Get the balance for the current month
    SELECT COALESCE(balance, 0)
    INTO v_balance
    FROM comp_off_monthly_balance
    WHERE user_id = p_user_id 
    AND team_id = p_team_id
    AND year = p_year
    AND month = p_month;
    
    RETURN v_balance;
END;
$$ LANGUAGE plpgsql;

-- Function to get carry forward balance for next month
CREATE OR REPLACE FUNCTION get_carry_forward_balance(
    p_user_id UUID,
    p_team_id UUID,
    p_year INTEGER,
    p_month INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_carry_forward INTEGER;
BEGIN
    -- Get the carry forward balance from the specified month
    SELECT COALESCE(carry_forward_balance, 0)
    INTO v_carry_forward
    FROM comp_off_monthly_balance
    WHERE user_id = p_user_id 
    AND team_id = p_team_id
    AND year = p_year
    AND month = p_month;
    
    RETURN v_carry_forward;
END;
$$ LANGUAGE plpgsql;

-- Function to get total balance including carry forward for a month
CREATE OR REPLACE FUNCTION get_total_comp_off_balance(
    p_user_id UUID,
    p_team_id UUID,
    p_year INTEGER,
    p_month INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_carry_forward INTEGER;
    v_current_month_oc INTEGER;
    v_current_month_cf INTEGER;
    v_total_balance INTEGER;
BEGIN
    -- Get carry forward balance from previous month
    SELECT COALESCE(carry_forward_balance, 0)
    INTO v_carry_forward
    FROM comp_off_monthly_balance
    WHERE user_id = p_user_id 
    AND team_id = p_team_id
    AND (
        (year = p_year AND month = p_month - 1) OR
        (year = p_year - 1 AND month = 12 AND p_month = 1)
    );
    
    -- Calculate current month's OC and CF from roster_entries
    SELECT 
        COALESCE(COUNT(CASE WHEN status = 'OC' THEN 1 END), 0),
        COALESCE(COUNT(CASE WHEN status IN ('CF', 'CmO') THEN 1 END), 0)
    INTO v_current_month_oc, v_current_month_cf
    FROM roster_entries 
    WHERE user_id = p_user_id 
    AND team_id = p_team_id
    AND EXTRACT(YEAR FROM date::date) = p_year
    AND EXTRACT(MONTH FROM date::date) = p_month;
    
    -- Calculate total balance: carry forward + current month OC - current month CF
    v_total_balance := v_carry_forward + v_current_month_oc - v_current_month_cf;
    
    -- Ensure balance doesn't go below 0
    IF v_total_balance < 0 THEN
        v_total_balance := 0;
    END IF;
    
    RETURN v_total_balance;
END;
$$ LANGUAGE plpgsql; 