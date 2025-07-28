# Comp-off Calculation Logic - Correct Implementation

## **Core Rules**

### **1. Current Month Display**

- Shows **only current month's balance**
- No carry forward included in display
- Example: July shows "2" (2 OC earned, 0 CF used)

### **2. Next Month Calculation**

- **Carry forward** from previous month's balance
- **Add** current month's OC days
- **Subtract** current month's CF days
- **Display** total balance
- Example: August shows "3" (2 carry forward + 2 new OC - 1 CF)

### **3. Navigation Rules**

- **Forward only**: Current month → Next month
- **Backward for history**: Can view previous months (read-only)
- **No modification**: Previous month data cannot be changed

## **Example Scenario**

### **July 2025 (Current Month)**

```
User assigned: 2 OC days
Comp-off earned: 2
Comp-off used: 0 CF
Balance: 2
Display: "2" (current month only)
```

### **August 2025 (Next Month)**

```
Carry forward from July: 2
User assigned: 2 OC days
Comp-off earned: 2
Comp-off used: 1 CF
Balance: 2 + 2 - 1 = 3
Display: "3" (carry forward + current month)
```

### **September 2025 (Next Month)**

```
Carry forward from August: 3
User assigned: 2 OC days
Comp-off earned: 2
Comp-off used: 0 CF
Balance: 3 + 2 - 0 = 5
Display: "5" (carry forward + current month)
```

## **Database Schema**

### **Table: `comp_off_monthly_balance`**

```sql
CREATE TABLE comp_off_monthly_balance (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    team_id UUID NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    oc_days INTEGER NOT NULL DEFAULT 0, -- On-Call days assigned
    cf_days INTEGER NOT NULL DEFAULT 0, -- Comp-off days used
    balance INTEGER NOT NULL DEFAULT 0, -- Final balance for the month
    carry_forward_balance INTEGER NOT NULL DEFAULT 0, -- Balance carried to next month
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(user_id, team_id, year, month)
);
```

### **Key Functions**

#### **1. `calculate_monthly_comp_off_balance()`**

- Calculates and stores monthly balance
- Includes carry forward from previous month
- Updates both balance and carry_forward_balance

#### **2. `get_current_month_comp_off_balance()`**

- Returns current month's balance only
- Used for current month display

#### **3. `get_total_comp_off_balance()`**

- Returns total balance including carry forward
- Used for next month calculation

#### **4. `get_carry_forward_balance()`**

- Returns carry forward balance for a specific month
- Used for historical data

## **Implementation Flow**

### **Current Month (July)**

1. **Load roster data** for July
2. **Calculate**: OC days - CF days = 2 - 0 = 2
3. **Display**: "2" (current month balance)
4. **Store**: balance = 2, carry_forward_balance = 2

### **Navigate to Next Month (August)**

1. **Get carry forward** from July: 2
2. **Load roster data** for August
3. **Calculate**: carry forward + OC - CF = 2 + 2 - 1 = 3
4. **Display**: "3" (total balance)
5. **Store**: balance = 3, carry_forward_balance = 3

### **Navigate Back to Previous Month (July)**

1. **Load stored balance** from database
2. **Display**: "2" (historical balance)
3. **Read-only**: No modifications allowed

## **Database vs Local**

### **Local Calculation (Current)**

- ✅ **Immediate functionality**
- ✅ **No database setup required**
- ✅ **Correct logic implementation**
- ❌ **Not persistent across sessions**

### **Database Implementation (Production)**

- ✅ **Persistent across sessions**
- ✅ **Historical data storage**
- ✅ **Team admin access**
- ✅ **Audit trail**
- ⏳ **Requires schema setup**

## **Setup Instructions**

### **1. Apply Database Schema**

```bash
# Copy and run in Supabase SQL Editor
sql/comp_off_monthly_balance_schema.sql
```

### **2. Update Service Functions**

- Add database functions to `organizationService.ts`
- Implement proper error handling
- Add fallback to local calculation

### **3. Update UI Logic**

- Modify display logic for current vs next month
- Add read-only mode for previous months
- Implement proper navigation restrictions

## **Expected Results**

| Month          | OC Days | CF Days | Carry Forward | Total Balance | Display |
| -------------- | ------- | ------- | ------------- | ------------- | ------- |
| July 2025      | 2       | 0       | 0             | 2             | "2"     |
| August 2025    | 2       | 1       | 2             | 3             | "3"     |
| September 2025 | 2       | 0       | 3             | 5             | "5"     |

The system now correctly implements the carry forward logic as specified!
