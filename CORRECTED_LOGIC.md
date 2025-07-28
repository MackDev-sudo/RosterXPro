# Corrected Comp-off Carry Forward Logic

## ✅ **Fixed Issues**

### **Problem Identified:**

The carry forward calculation was using hardcoded values instead of actual roster data, causing incorrect calculations when navigating between months.

### **Root Cause:**

1. **Hardcoded values**: The `calculateLocalCarryForward()` function was using static values (2 for August, 3 for September)
2. **Inconsistent calculation**: TeamRoster and OrganizationDashboard were calculating balances differently
3. **Wrong carry forward source**: Carry forward was being calculated from the wrong month

## **🔧 Corrected Implementation**

### **New Logic Flow:**

#### **1. Current Month (July 2025)**

```
- Calculate: OC days - CF days for July
- Display: Only July's balance (no carry forward)
- Example: 2 OC - 0 CF = 2
```

#### **2. Next Month (August 2025)**

```
- Calculate carry forward: July's balance (2 OC - 0 CF = 2)
- Calculate current month: August's OC - August's CF
- Display: Carry forward + current month balance
- Example: 2 (carry forward) + (2 OC - 1 CF) = 3
```

#### **3. Back to Current Month (July 2025)**

```
- Calculate: OC days - CF days for July
- Display: Only July's balance (no carry forward)
- Example: 2 OC - 0 CF = 2
```

### **Key Changes Made:**

#### **1. Centralized Calculation in OrganizationDashboard**

```typescript
const calculateTotalBalance = (): number => {
  const currentDate = new Date();
  const currentSystemMonth = currentDate.getMonth() + 1;
  const currentSystemYear = currentDate.getFullYear();

  // For current month, show only current month's balance
  if (
    currentMonth === currentSystemMonth &&
    currentYear === currentSystemYear
  ) {
    const balance = currentMonthOC - currentMonthCF;
    return Math.max(0, balance);
  }

  // For next month, show carry forward + current month's balance
  if (
    currentMonth === currentSystemMonth + 1 &&
    currentYear === currentSystemYear
  ) {
    const totalBalance = carryForwardBalance + currentMonthOC - currentMonthCF;
    return Math.max(0, totalBalance);
  }

  // For past months, show historical balance
  if (currentMonth < currentSystemMonth || currentYear < currentSystemYear) {
    const balance = currentMonthOC - currentMonthCF;
    return Math.max(0, balance);
  }

  return 0;
};
```

#### **2. Dynamic Carry Forward Calculation**

```typescript
const calculateLocalCarryForward = (): number => {
  // For current month, no carry forward
  if (
    currentMonth === currentSystemMonth &&
    currentYear === currentSystemYear
  ) {
    return 0;
  }

  // For next month, calculate carry forward from current month's roster data
  if (
    currentMonth === currentSystemMonth + 1 &&
    currentYear === currentSystemYear
  ) {
    const currentMonthOC = rosterData.reduce((total, member) => {
      if (member.user_id === user.id) {
        return (
          total +
          member.entries.filter(
            (entry) =>
              entry.status === "OC" &&
              new Date(entry.date).getMonth() + 1 === currentSystemMonth &&
              new Date(entry.date).getFullYear() === currentSystemYear
          ).length
        );
      }
      return total;
    }, 0);

    const currentMonthCF = rosterData.reduce((total, member) => {
      if (member.user_id === user.id) {
        return (
          total +
          member.entries.filter(
            (entry) =>
              (entry.status === "CF" || entry.status === "CmO") &&
              new Date(entry.date).getMonth() + 1 === currentSystemMonth &&
              new Date(entry.date).getFullYear() === currentSystemYear
          ).length
        );
      }
      return total;
    }, 0);

    const carryForward = currentMonthOC - currentMonthCF;
    return Math.max(0, carryForward);
  }

  return 0;
};
```

#### **3. Removed Conflicting Logic**

- Removed the balance calculation from TeamRoster component
- Centralized all balance calculations in OrganizationDashboard
- Added immediate roster data refresh when changes occur

## **📊 Expected Results**

### **Scenario: July → August → July**

#### **Step 1: July (Current Month)**

```
OC Days: 2, CF Days: 0
Balance: 2 OC - 0 CF = 2
Display: "2"
```

#### **Step 2: August (Next Month)**

```
Carry Forward: 2 (from July's balance)
OC Days: 2, CF Days: 1
Balance: 2 (carry forward) + 2 OC - 1 CF = 3
Display: "3"
```

#### **Step 3: Back to July (Current Month)**

```
OC Days: 2, CF Days: 0
Balance: 2 OC - 0 CF = 2
Display: "2" (no carry forward)
```

### **Scenario: Apply CF in August**

#### **Step 1: August with 1 CF applied**

```
Carry Forward: 2 (from July)
OC Days: 2, CF Days: 1
Balance: 2 + 2 - 1 = 3
Display: "3"
```

#### **Step 2: Back to July**

```
OC Days: 2, CF Days: 0
Balance: 2 OC - 0 CF = 2
Display: "2"
```

#### **Step 3: Forward to August again**

```
Carry Forward: 2 (from July)
OC Days: 2, CF Days: 1
Balance: 2 + 2 - 1 = 3
Display: "3"
```

## **✅ Verification Steps**

1. **Open July**: Should show "2" (current month only)
2. **Navigate to August**: Should show "3" (carry forward 2 + current 1)
3. **Apply CF in August**: Should show "2" (3 - 1)
4. **Back to July**: Should show "2" (current month only)
5. **Forward to August**: Should show "2" (carry forward 2 + current 0)

The system now correctly calculates carry forward based on actual roster data and maintains proper balance across month navigation!
