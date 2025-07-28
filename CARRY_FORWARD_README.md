# Comp-off Carry Forward System

## Overview

The Comp-off Carry Forward system allows users to carry forward their unused comp-off balance from one month to the next. This ensures that earned comp-off days are not lost and can be used in future months.

## How It Works

### 1. **Balance Calculation Formula**

```
Total Balance = Previous Month Carry Forward + Current Month OC - Current Month CF
```

### 2. **Carry Forward Logic**

- **OC (On-Call)**: Adds 1 comp-off day to balance
- **CF (Comp-off)**: Deducts 1 comp-off day from balance
- **Carry Forward**: Previous month's remaining balance is carried to current month

### 3. **Example Scenario**

```
Month 1: OC = 5, CF = 2 → Balance = 3
Month 2: OC = 3, CF = 1 → Total Balance = 3 (carry forward) + 3 (new OC) - 1 (CF) = 5
```

## Database Schema

### Table: `comp_off_carry_forward`

```sql
CREATE TABLE comp_off_carry_forward (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    team_id UUID NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    carry_forward_balance INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(user_id, team_id, year, month)
);
```

### Database Functions

#### `calculate_carry_forward_balance(user_id, team_id, year, month)`

- Calculates and stores carry forward balance for a specific month
- Returns the calculated balance

#### `get_current_comp_off_balance(user_id, team_id, year, month)`

- Returns current total balance including carry forward
- Used for validation and display

## Features

### ✅ **Automatic Carry Forward**

- Automatically calculates carry forward when navigating between months
- Stores balance in database for persistence

### ✅ **Real-time Balance Updates**

- Balance updates immediately when user changes shifts (OC/CF)
- Shows total balance including carry forward

### ✅ **Validation System**

- Prevents CF application when balance ≤ 0
- Shows warning toast for insufficient balance
- Visual feedback in dropdown (disabled CF option)

### ✅ **Visual Indicators**

- Balance displayed in red if > 4 days
- Shows carry forward contribution in blue
- Balance shown next to CF option in dropdown

### ✅ **Team Admin Support**

- Team admins can view carry forward for all team members
- Proper Row Level Security policies

## Setup Instructions

### 1. **Database Setup**

```bash
# Run the setup script
./setup-carry-forward.sh

# Or manually run the SQL schema
# Copy contents of sql/comp_off_carry_forward_schema.sql to Supabase SQL Editor
```

### 2. **Verify Setup**

- Check that `comp_off_carry_forward` table exists
- Verify RLS policies are active
- Test database functions

## Usage

### **For Users**

1. **View Balance**: Comp-off balance card shows total available days
2. **Apply CF**: Select CF from dropdown (only if balance > 0)
3. **Navigate Months**: Balance automatically carries forward

### **For Team Admins**

1. **View Team Balances**: Can see carry forward for all team members
2. **Monitor Usage**: Track comp-off usage across months
3. **Audit Trail**: Historical carry forward data available

## Technical Implementation

### **Frontend Components**

- `OrganizationDashboard.tsx`: Main balance display and carry forward loading
- `TeamRoster.tsx`: Roster table with CF validation
- `RosterTable.tsx`: Individual cell validation and balance calculation

### **Backend Services**

- `organizationService.ts`: Database interaction functions
- Database functions: Server-side calculations
- RLS policies: Security and access control

### **State Management**

- `carryForwardBalance`: Database-loaded carry forward balance
- `localCompOffBalance`: Real-time local calculations
- Combined display: Shows total balance to user

## Data Flow

```
1. User navigates to new month
   ↓
2. calculateCarryForwardForNewMonth() called
   ↓
3. Database function calculates previous month balance
   ↓
4. Balance stored in comp_off_carry_forward table
   ↓
5. loadCarryForwardBalance() fetches current balance
   ↓
6. UI updates to show total balance
   ↓
7. User can apply CF if balance > 0
```

## Error Handling

### **Database Errors**

- Graceful fallback to 0 balance
- Console logging for debugging
- User-friendly error messages

### **Validation Errors**

- Toast notifications for insufficient balance
- Visual feedback in UI
- Prevention of invalid actions

## Performance Considerations

### **Indexes**

- `idx_comp_off_carry_forward_user_team`: Fast user/team lookups
- `idx_comp_off_carry_forward_year_month`: Efficient date filtering
- `idx_comp_off_carry_forward_user_year_month`: Optimized balance queries

### **Caching**

- Local state for immediate UI updates
- Database queries only when needed
- Efficient balance calculations

## Security

### **Row Level Security (RLS)**

- Users can only access their own carry forward data
- Team admins can access team member data
- Proper INSERT/UPDATE/DELETE policies

### **Data Integrity**

- Unique constraints prevent duplicate records
- Check constraints validate month values
- Foreign key relationships maintain referential integrity

## Testing Scenarios

### **Basic Carry Forward**

1. User has 3 OC days in Month 1
2. User applies 1 CF in Month 1
3. Navigate to Month 2
4. Verify balance shows 2 (carry forward)

### **Zero Balance**

1. User has 0 balance
2. Try to apply CF
3. Verify warning toast appears
4. Verify CF option is disabled

### **Month Transition**

1. User has balance in December
2. Navigate to January of next year
3. Verify carry forward works across years

### **Team Admin Access**

1. Admin views team roster
2. Verify can see carry forward for all members
3. Verify proper access controls

## Future Enhancements

### **Potential Features**

- Carry forward limits (max days per month)
- Expiration dates for carry forward
- Bulk carry forward operations
- Carry forward reports and analytics
- Email notifications for low balance

### **Optimizations**

- Batch carry forward calculations
- Background job processing
- Advanced caching strategies
- Performance monitoring

## Troubleshooting

### **Common Issues**

#### **Balance Not Updating**

- Check database connection
- Verify RLS policies
- Check console for errors
- Ensure user has proper permissions

#### **CF Not Allowed**

- Verify balance calculation
- Check carry forward data
- Ensure proper month/year handling
- Validate user permissions

#### **Database Errors**

- Check SQL schema execution
- Verify table exists
- Check function definitions
- Validate RLS policies

### **Debug Steps**

1. Check browser console for errors
2. Verify database functions exist
3. Test RLS policies
4. Check user permissions
5. Validate data integrity

## Support

For issues or questions:

1. Check this README
2. Review console logs
3. Verify database setup
4. Test with sample data
5. Contact development team
