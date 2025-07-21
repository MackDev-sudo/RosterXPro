-- Sample data population script
-- Run this after the organization_schema.sql

-- Get the current user's ID (replace with your actual user ID)
-- You can get this by running: SELECT auth.uid(); in Supabase SQL editor

-- For demonstration, I'll use a placeholder. Replace 'YOUR_USER_ID' with your actual user ID
DO $$
DECLARE
    current_user_id UUID;
    org_id UUID;
    project_id UUID;
    team_id UUID;
    team_lead_id UUID;
    manager_id UUID;
    i INTEGER;
    current_date DATE;
    shift_types TEXT[] := ARRAY['Morning', 'Evening', 'Night'];
    statuses TEXT[] := ARRAY['WO', 'None', 'Present'];
BEGIN
    -- Get current user ID (this would be your authenticated user)
    current_user_id := auth.uid();
    
    -- If no authenticated user, exit
    IF current_user_id IS NULL THEN
        RAISE NOTICE 'No authenticated user found';
        RETURN;
    END IF;

    -- Get organization ID
    SELECT id INTO org_id FROM organizations WHERE name = 'TechCorp Solutions';
    
    -- Get project ID
    SELECT id INTO project_id FROM projects WHERE name = 'Enterprise Platform';
    
    -- Get team ID
    SELECT id INTO team_id FROM teams WHERE name = 'L2 Storage';
    
    -- Update user profile with organization
    UPDATE user_profiles 
    SET organization_id = org_id 
    WHERE user_id = current_user_id;
    
    -- Add current user to team
    INSERT INTO team_members (team_id, user_id, role) 
    VALUES (team_id, current_user_id, 'member')
    ON CONFLICT (team_id, user_id) DO NOTHING;
    
    -- Create some sample team members (you can replace these with actual users)
    -- For now, we'll just add the current user multiple times with different roles
    -- In a real scenario, you'd have different user IDs
    
    -- Generate roster entries for July 2025
    FOR i IN 1..31 LOOP
        current_date := ('2025-07-' || LPAD(i::text, 2, '0'))::DATE;
        
        -- Skip if date doesn't exist (like July 31st doesn't exist in some months)
        IF current_date IS NOT NULL THEN
            INSERT INTO roster_entries (user_id, team_id, date, shift_type, status)
            VALUES (
                current_user_id,
                team_id,
                current_date,
                'Morning',
                CASE 
                    WHEN EXTRACT(DOW FROM current_date) IN (0, 6) THEN 'WO'  -- Weekend
                    WHEN i % 5 = 0 THEN 'WO'  -- Every 5th day
                    ELSE 'Present'
                END
            )
            ON CONFLICT (user_id, team_id, date) DO NOTHING;
        END IF;
    END LOOP;
    
    -- Add some sample leave requests
    INSERT INTO leave_requests (user_id, team_id, start_date, end_date, leave_type, reason, status)
    VALUES 
        (current_user_id, team_id, '2025-07-20', '2025-07-22', 'Sick Leave', 'Medical appointment', 'approved'),
        (current_user_id, team_id, '2025-07-28', '2025-07-30', 'Vacation', 'Family vacation', 'pending');
        
    RAISE NOTICE 'Sample data created successfully for user: %', current_user_id;
END $$;
