#!/bin/bash

# Setup script for Comp-off Carry Forward functionality
echo "Setting up Comp-off Carry Forward database schema..."

# Check if SQL file exists
if [ ! -f "sql/comp_off_carry_forward_schema.sql" ]; then
    echo "Error: sql/comp_off_carry_forward_schema.sql not found!"
    exit 1
fi

echo "✅ SQL schema file found"

echo ""
echo "📋 Instructions to complete setup:"
echo ""
echo "1. Go to your Supabase Dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Copy and paste the contents of sql/comp_off_carry_forward_schema.sql"
echo "4. Run the SQL script"
echo ""
echo "This will create:"
echo "  - comp_off_carry_forward table"
echo "  - Row Level Security policies"
echo "  - Database functions for carry forward calculations"
echo "  - Indexes for performance"
echo ""
echo "After running the SQL script, the carry forward functionality will be available!"
echo ""
echo "🔧 The system will automatically:"
echo "  - Calculate carry forward when navigating between months"
echo "  - Show total balance including carry forward"
echo "  - Validate CF applications against total balance"
echo "  - Store carry forward data persistently" 