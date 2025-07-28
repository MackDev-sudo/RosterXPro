-- Comp-off Carry Forward Schema
-- This table stores monthly carry forward balances for each user

CREATE TABLE IF NOT EXISTS comp_off_carry_forward (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    carry_forward_balance INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, team_id, year, month)
);

-- Enable Row Level Security
ALTER TABLE comp_off_carry_forward ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comp_off_carry_forward table

-- Policy 1: Users can view their own carry forward records
CREATE POLICY "Users can view own carry forward records" ON comp_off_carry_forward
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Team admins can view carry forward records for their team members
CREATE POLICY "Team admins can view team carry forward records" ON comp_off_carry_forward
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.team_id = comp_off_carry_forward.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role = 'admin'
        )
    );

-- Policy 3: Users can insert their own carry forward records
CREATE POLICY "Users can insert own carry forward records" ON comp_off_carry_forward
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 4: Team admins can insert carry forward records for their team members
CREATE POLICY "Team admins can insert team carry forward records" ON comp_off_carry_forward
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.team_id = comp_off_carry_forward.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role = 'admin'
        )
    );

-- Policy 5: Users can update their own carry forward records
CREATE POLICY "Users can update own carry forward records" ON comp_off_carry_forward
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy 6: Team admins can update carry forward records for their team members
CREATE POLICY "Team admins can update team carry forward records" ON comp_off_carry_forward
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.team_id = comp_off_carry_forward.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role = 'admin'
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comp_off_carry_forward_user_team ON comp_off_carry_forward(user_id, team_id);
CREATE INDEX IF NOT EXISTS idx_comp_off_carry_forward_year_month ON comp_off_carry_forward(year, month);
CREATE INDEX IF NOT EXISTS idx_comp_off_carry_forward_user_year_month ON comp_off_carry_forward(user_id, year, month);

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_comp_off_carry_forward_updated_at
    BEFORE UPDATE ON comp_off_carry_forward
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate and store carry forward balance for a user
CREATE OR REPLACE FUNCTION calculate_carry_forward_balance(
    p_user_id UUID,
    p_team_id UUID,
    p_year INTEGER,
    p_month INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_oc_count INTEGER;
    v_cf_count INTEGER;
    v_balance INTEGER;
    v_previous_balance INTEGER;
BEGIN
    -- Calculate OC and CF for the specified month
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
    INTO v_previous_balance
    FROM comp_off_carry_forward
    WHERE user_id = p_user_id 
    AND team_id = p_team_id
    AND (
        (year = p_year AND month = p_month - 1) OR
        (year = p_year - 1 AND month = 12 AND p_month = 1)
    );
    
    -- Calculate current balance: previous balance + OC - CF
    v_balance := v_previous_balance + v_oc_count - v_cf_count;
    
    -- Ensure balance doesn't go below 0
    IF v_balance < 0 THEN
        v_balance := 0;
    END IF;
    
    -- Insert or update the carry forward record
    INSERT INTO comp_off_carry_forward (user_id, team_id, year, month, carry_forward_balance)
    VALUES (p_user_id, p_team_id, p_year, p_month, v_balance)
    ON CONFLICT (user_id, team_id, year, month)
    DO UPDATE SET 
        carry_forward_balance = v_balance,
        updated_at = NOW();
    
    RETURN v_balance;
END;
$$ LANGUAGE plpgsql;

-- Function to get current comp-off balance including carry forward
CREATE OR REPLACE FUNCTION get_current_comp_off_balance(
    p_user_id UUID,
    p_team_id UUID,
    p_year INTEGER,
    p_month INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_carry_forward_balance INTEGER;
    v_current_month_oc INTEGER;
    v_current_month_cf INTEGER;
    v_total_balance INTEGER;
BEGIN
    -- Get carry forward balance from previous month
    SELECT COALESCE(carry_forward_balance, 0)
    INTO v_carry_forward_balance
    FROM comp_off_carry_forward
    WHERE user_id = p_user_id 
    AND team_id = p_team_id
    AND (
        (year = p_year AND month = p_month - 1) OR
        (year = p_year - 1 AND month = 12 AND p_month = 1)
    );
    
    -- Calculate current month's OC and CF
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
    v_total_balance := v_carry_forward_balance + v_current_month_oc - v_current_month_cf;
    
    -- Ensure balance doesn't go below 0
    IF v_total_balance < 0 THEN
        v_total_balance := 0;
    END IF;
    
    RETURN v_total_balance;
END;
$$ LANGUAGE plpgsql; 