diff --git a/README.md b/README.md
index a7c591498790cbb6fa71eb4c0dd253b26b87d2f2..5c05aa28ea67a3a1fa23bdb702d3a7b092f74ca2 100644
--- a/README.md
+++ b/README.md
@@ -1,250 +1,24 @@
-# 💰 Personal Finance Sheet
-
-A comprehensive, self-hosted personal finance management application built with vanilla JavaScript. Track expenses, payslips, account balances, and savings across multiple currencies (USD and ILS).
-
-## ✨ Features
-
-### 📊 Expense Tracking
-- **Dual Currency Support**: Separate tracking for USD (American) and ILS (Israeli) accounts
-- **Flexible Entry**: Add expenses with date, category, amount, and optional notes
-- **Monthly & Yearly Views**: Switch between viewing expenses by month or by year
-- **Running Totals**: Automatic calculation of total expenses per currency
-
-### 💵 Account Balances
-- **Multiple Accounts**: Track 2 American accounts (checking & savings) + 1 Israeli account
-- **Balance History**: Automatic recording of balance snapshots over time
-- **Visual Timeline**: View historical balance changes to monitor account growth
-
-### 💳 Payslip Management
-- **Income vs. Taxes**: Enter gross income, taxes withheld, and deductions
-- **Net Income Calculation**: Automatic computation of take-home pay
-- **Multi-Currency**: Separate tracking for USD and ILS payslips
-- **Historical Records**: Keep a running log of all payslips
-
-### 📈 Savings Summary
-- **Income Analysis**: View total gross, taxes, and net income
-- **Spending Breakdown**: See total expenses for each currency
-- **Savings Calculation**: Know exactly how much you saved each month
-- **Side-by-Side Comparison**: American and Israeli finances displayed together
-
-### 💾 Data Persistence
-- **Automatic Local Storage**: All data automatically saved to browser's local storage
-- **Session Recovery**: Data persists across browser refreshes and sessions
-- **Export/Import**: Download your data as JSON for backup or transfer
-
-## 🚀 Getting Started
-
-### Installation
-1. Clone or download this repository
-2. Open `index.html` in a modern web browser
-3. Start tracking your finances!
-
-### Usage
-
-#### Adding Expenses
-1. Navigate to the **Expenses** tab
-2. Select the currency section (USD or ILS)
-3. Fill in the date, category, and amount
-4. Optionally add notes
-5. Click "Add Expense"
-
-#### Managing Accounts
-1. Go to the **Account Balances** tab
-2. Enter your current balance for each account
-3. Click "Update" to save
-4. View your balance history below
-
-#### Recording Payslips
-1. Go to the **Payslips** tab
-2. Enter the date, gross income, taxes, and deductions
-3. Click "Add Payslip"
-4. Net income is calculated automatically
-
-#### Checking Your Savings
-1. Navigate to the **Savings Summary** tab
-2. Select your desired month/year
-3. See a side-by-side comparison of:
-   - Gross income
-   - Taxes paid
-   - Net income
-   - Total spending
-   - Amount saved
-
-#### Switching Time Periods
-- Use the **Previous/Next** buttons to navigate months or years
-- Use the dropdown to switch between monthly and yearly views
-- Select a specific month/year with the date inputs
-
-#### Backing Up Your Data
-1. Click the **Export Data** button
-2. Your data downloads as a JSON file
-3. Keep it safe as a backup
-
-#### Restoring Data
-1. Click the **Import Data** button
-2. Select a previously exported JSON file
-3. Your data will be restored
-
-## 💾 Data Storage
-
-### Local Storage Structure
-```
-{
-  "expenses": {
-    "usd": [{ id, date, category, amount, notes }],
-    "ils": [{ id, date, category, amount, notes }]
-  },
-  "payslips": {
-    "usd": [{ id, date, gross, taxes, deductions }],
-    "ils": [{ id, date, gross, taxes, deductions }]
-  },
-  "balances": {
-    "usdChecking": 0,
-    "usdSavings": 0,
-    "ils": 0
-  },
-  "balanceHistory": [
-    { date, usdChecking, usdSavings, ils }
-  ]
-}
-```
-
-### Automatic Data Persistence
-- Every time you add, update, or delete data, it's automatically saved
-- Data is stored in your browser's local storage (no server required)
-- Closing and reopening the app loads all your data instantly
-
-## 🎯 Use Cases
-
-### Monthly Budget Review
-1. Select current month
-2. Check Expenses tab for spending by category
-3. Review Payslips tab for income
-4. Go to Savings Summary to see if you met your goals
-
-### Year-End Financial Report
-1. Switch to yearly view
-2. Compare total income and spending across the year
-3. View cumulative balance changes
-4. Export data for tax or financial planning
-
-### Multi-Currency Financial Planning
-- Track USD spending in America separately from ILS spending in Israel
-- Compare savings rates between the two currencies
-- Maintain separate checking/savings accounts
-- See consolidated savings summary
-
-### Account Monitoring
-- Add balance records whenever you check your account
-- View historical trends over time
-- Track account growth month-over-month
-- Identify spending patterns
-
-## 🔒 Privacy & Security
-
-- ✅ All data is stored locally in your browser
-- ✅ No data is sent to servers
-- ✅ No tracking or analytics
-- ✅ Completely private and secure
-- ✅ You own your data
-
-## 🛠️ Technical Details
-
-### Browser Compatibility
-- Chrome/Edge: ✅ Full support
-- Firefox: ✅ Full support
-- Safari: ✅ Full support
-- Mobile browsers: ✅ Responsive design
-
-### Technologies Used
-- HTML5
-- CSS3 (with gradients and flexbox)
-- Vanilla JavaScript (ES6+)
-- Browser Local Storage API
-
-### File Structure
-```
-.
-├── index.html    # Main HTML structure
-├── styles.css    # Complete styling
-├── app.js        # Application logic
-└── README.md     # This file
-```
-
-## 📱 Responsive Design
-
-The application is fully responsive and works on:
-- Desktop computers (1200px+)
-- Tablets (768px - 1200px)
-- Mobile phones (< 768px)
-
-## 🎨 Features Highlights
-
-### Smart Calculations
-- Automatic expense totals
-- Net income from payslips
-- Savings calculations
-- Balance tracking
-
-### Intuitive Navigation
-- Tab-based interface for easy switching
-- Date navigation with Previous/Next buttons
-- Quick month/year selection
-- Clear visual hierarchy
-
-### Data Management
-- One-click deletion with confirmation
-- Full data export/import
-- Automatic history tracking
-- Clean, organized lists
-
-## 🐛 Troubleshooting
-
-### Data not saving?
-- Check if local storage is enabled in your browser
-- Try clearing browser cache and reloading
-- Ensure you have sufficient storage space
-
-### Lost data?
-- Check if you have an exported backup
-- Local storage persists until you clear browser data
-- Consider exporting data regularly
-
-### Display issues on mobile?
-- Rotate your device to landscape
-- Zoom out if content appears cramped
-- Use latest browser version
-
-## 📝 Tips & Best Practices
-
-1. **Regular Updates**: Add expenses and balances regularly for accurate tracking
-2. **Consistent Categories**: Use the same category names for better analysis
-3. **Monthly Reviews**: Check your savings summary at month-end
-4. **Backup Regularly**: Export your data monthly as a backup
-5. **Notes Field**: Use notes to remember why you made certain purchases
-
-## 🚀 Future Enhancement Ideas
-
-- 💱 Exchange rate conversion for automatic USD/ILS conversion
-- 📊 Advanced charts and graphs
-- 🏷️ Budget categories with spending limits
-- 🔄 Recurring expenses
-- 📧 Monthly email summaries
-- ☁️ Cloud sync option
-- 📱 Mobile app version
-
-## 📄 License
-
-This project is open source and available for personal use.
-
-## 💡 Support
-
-For issues or questions:
-1. Check the Troubleshooting section
-2. Verify data format if importing
-3. Try exporting and re-importing data
-4. Clear browser cache if experiencing issues
-
----
-
-**Made with ❤️ for personal finance management**
+# Personal Finance Dashboard
+
+A React-based offline personal finance tracker for US (USD) and Israel (ILS) that persists all app data in `localStorage`.
+
+## Run
+Open `index.html` in a browser.
+
+## Features
+- Dashboard overview for monthly income, expenses, and savings per country
+- Expenses tab with search/filter, category insights, edit/delete
+- Accounts tab with balance updates and timeline history
+- Payslips tab with gross/tax/net tracking and effective tax rate
+- Savings analysis tab with monthly indicator and yearly summary
+- Export/import JSON backup
+- Reset all data with confirmation
+- Dark mode responsive UI
+
+## Storage Keys
+Data is saved under `financeDashboardV2` and includes:
+- `expensesUS`, `expensesIL`
+- `accountsUS`, `accountsIL`
+- `payslipsUS`, `payslipsIL`
+- `balanceHistory`
+- `selectedMonth`, `selectedYear`
