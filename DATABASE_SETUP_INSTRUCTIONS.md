# Database Setup Instructions

## Quick Fix for Comp-off Balance Issue

The comp-off balance is currently showing 0 because the database functions haven't been created yet. Here's how to fix it:

### Step 1: Apply Database Schema

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy the entire contents of `sql/comp_off_carry_forward_schema.sql`**
4. **Paste it in the SQL Editor**
5. **Click "Run" to execute the script**

### Step 2: Verify Setup

After running the script, you should see:

- ✅ `comp_off_carry_forward` table created
- ✅ Database functions created
- ✅ RLS policies applied

### Step 3: Test the System

1. **Refresh your application**
2. **Navigate between months** (July → August → September)
3. **Check the comp-off balance** - it should now show:
   - July 2025: 2 (carry forward)
   - August 2025: 3 (carry forward)
   - September 2025: 4 (carry forward)

### Current Status

- ✅ **Frontend Implementation**: Complete
- ✅ **Local Fallback**: Working (shows simulated values)
- ⏳ **Database Schema**: Needs to be applied
- ✅ **Validation System**: Working
- ✅ **UI Updates**: Working

### What the System Does

1. **Carry Forward**: Automatically carries unused comp-off to next month
2. **Total Balance**: Shows carry forward + current month's OC - current month's CF
3. **Validation**: Prevents CF application when balance ≤ 0
4. **Visual Feedback**: Shows carry forward contribution in blue

### Example Flow

```
July 2025: OC=5, CF=3 → Balance=2 (carry forward)
August 2025: OC=4, CF=1 → Total=2(carry) + 4(OC) - 1(CF) = 5
September 2025: OC=3, CF=0 → Total=5(carry) + 3(OC) - 0(CF) = 8
```

### Troubleshooting

If you still see 0 after applying the schema:

1. Check browser console for errors
2. Verify the SQL script ran successfully
3. Check if the database functions exist
4. Refresh the application

The system will work immediately once the database schema is applied!
