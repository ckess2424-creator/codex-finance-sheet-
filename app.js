diff --git a/app.js b/app.js
index a1c8f44f542b4812bb089694e594e06169a16b86..6c51410e63860a6c8731997303eb896cd0111b7a 100644
--- a/app.js
+++ b/app.js
@@ -1,878 +1,122 @@
-class FinanceApp {
-    constructor() {
-        this.data = {
-            expenses: { usd: [], ils: [] },
-            payslips: { usd: [], ils: [] },
-            balances: { usdChecking: 0, usdSavings: 0, ils: 0 },
-            balanceHistory: [],
-            budgets: { usd: [], ils: [] },
-            recurring: [],
-            settings: { emailNotifications: false, cloudSync: false, email: '', exchangeRate: 3.5 }
-        };
-
-        this.currentMonth = new Date();
-        this.currentSavingsMonth = new Date();
-        this.charts = {};
-
-        this.loadData();
-        this.init();
-    }
-
-    // ===== DATA MANAGEMENT =====
-    loadData() {
-        const saved = localStorage.getItem('financeData');
-        if (saved) {
-            try {
-                this.data = JSON.parse(saved);
-            } catch (e) {
-                console.error('Error loading data:', e);
-                this.saveData();
-            }
-        } else {
-            this.saveData();
-        }
-    }
-
-    saveData() {
-        localStorage.setItem('financeData', JSON.stringify(this.data));
-    }
-
-    exportData() {
-        const dataStr = JSON.stringify(this.data, null, 2);
-        const dataBlob = new Blob([dataStr], { type: 'application/json' });
-        const url = URL.createObjectURL(dataBlob);
-        const link = document.createElement('a');
-        link.href = url;
-        link.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
-        link.click();
-        URL.revokeObjectURL(url);
-        alert('✅ Data exported successfully!');
-    }
-
-    importData() {
-        document.getElementById('importFile').addEventListener('change', (e) => {
-            const file = e.target.files[0];
-            if (!file) return;
-
-            const reader = new FileReader();
-            reader.onload = (event) => {
-                try {
-                    const imported = JSON.parse(event.target.result);
-                    if (imported.expenses && imported.payslips && imported.balances) {
-                        this.data = imported;
-                        this.saveData();
-                        alert('✅ Data imported successfully!');
-                        location.reload();
-                    } else {
-                        alert('❌ Invalid data format');
-                    }
-                } catch (err) {
-                    alert('❌ Error importing data: ' + err.message);
-                }
-            };
-            reader.readAsText(file);
-        });
-    }
-
-    clearAllData() {
-        if (confirm('⚠️ Are you sure you want to delete ALL data? This cannot be undone!')) {
-            if (confirm('🚨 This is your FINAL WARNING. All expenses, payslips, and balances will be permanently deleted.')) {
-                this.data = {
-                    expenses: { usd: [], ils: [] },
-                    payslips: { usd: [], ils: [] },
-                    balances: { usdChecking: 0, usdSavings: 0, ils: 0 },
-                    balanceHistory: [],
-                    budgets: { usd: [], ils: [] },
-                    recurring: [],
-                    settings: { emailNotifications: false, cloudSync: false, email: '', exchangeRate: 3.5 }
-                };
-                this.saveData();
-                alert('✅ All data has been cleared');
-                location.reload();
-            }
-        }
-    }
-
-    // ===== INITIALIZATION =====
-    init() {
-        this.setupTabs();
-        this.setupExpenses();
-        this.setupRecurring();
-        this.setupBalances();
-        this.setupPayslips();
-        this.setupSavings();
-        this.setupBudgets();
-        this.setupCharts();
-        this.setupSettings();
-        this.importData();
-        this.processRecurringExpenses();
-        this.updateAllDisplays();
-    }
-
-    setupTabs() {
-        document.querySelectorAll('.tab-btn').forEach(btn => {
-            btn.addEventListener('click', () => {
-                const tabName = btn.dataset.tab;
-                this.switchTab(tabName);
-            });
-        });
-    }
-
-    switchTab(tabName) {
-        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
-        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
-
-        document.getElementById(tabName).classList.add('active');
-        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
-
-        if (tabName === 'savings') {
-            this.updateSavingsSummary();
-        } else if (tabName === 'charts') {
-            setTimeout(() => this.drawAllCharts(), 100);
-        }
-    }
-
-    // ===== EXPENSES =====
-    setupExpenses() {
-        const updateDisplay = () => {
-            this.displayExpenses();
-            this.updateAllDisplays();
-        };
-
-        document.getElementById('usdExpenseForm').addEventListener('submit', (e) => {
-            e.preventDefault();
-            this.addExpense('usd');
-            document.getElementById('usdExpenseForm').reset();
-            updateDisplay();
-        });
-
-        document.getElementById('ilsExpenseForm').addEventListener('submit', (e) => {
-            e.preventDefault();
-            this.addExpense('ils');
-            document.getElementById('ilsExpenseForm').reset();
-            updateDisplay();
-        });
-
-        document.getElementById('prevMonth').addEventListener('click', () => {
-            this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
-            this.updateMonthDisplay();
-            this.displayExpenses();
-        });
-
-        document.getElementById('nextMonth').addEventListener('click', () => {
-            this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
-            this.updateMonthDisplay();
-            this.displayExpenses();
-        });
-
-        document.getElementById('monthSelector').addEventListener('change', (e) => {
-            const [year, month] = e.target.value.split('-');
-            this.currentMonth = new Date(year, month - 1, 1);
-            this.updateMonthDisplay();
-            this.displayExpenses();
-        });
-
-        this.updateMonthDisplay();
-        this.displayExpenses();
-    }
-
-    addExpense(currency) {
-        const dateInput = document.getElementById(`${currency}ExpenseDate`);
-        const categoryInput = document.getElementById(`${currency}ExpenseCategory`);
-        const amountInput = document.getElementById(`${currency}ExpenseAmount`);
-        const notesInput = document.getElementById(`${currency}ExpenseNotes`);
-
-        const expense = {
-            id: Date.now(),
-            date: dateInput.value,
-            category: categoryInput.value,
-            amount: parseFloat(amountInput.value),
-            notes: notesInput.value || ''
-        };
-
-        this.data.expenses[currency].push(expense);
-        this.saveData();
-    }
-
-    deleteExpense(currency, id) {
-        this.data.expenses[currency] = this.data.expenses[currency].filter(e => e.id !== id);
-        this.saveData();
-        this.displayExpenses();
-        this.updateAllDisplays();
-    }
-
-    getExpensesForMonth(currency, month, year) {
-        return this.data.expenses[currency].filter(e => {
-            const date = new Date(e.date);
-            return date.getMonth() === month && date.getFullYear() === year;
-        });
-    }
-
-    displayExpenses() {
-        const month = this.currentMonth.getMonth();
-        const year = this.currentMonth.getFullYear();
-
-        ['usd', 'ils'].forEach(currency => {
-            const expenses = this.getExpensesForMonth(currency, month, year);
-            const list = document.getElementById(`${currency}ExpensesList`);
-            list.innerHTML = '';
-
-            expenses.forEach(exp => {
-                const item = document.createElement('div');
-                item.className = 'list-item';
-                const formatter = currency === 'usd' ? '$' : '₪';
-                item.innerHTML = `
-                    <div class="list-item-content">
-                        <div class="list-item-date">${exp.date}</div>
-                        <div class="list-item-category">${exp.category}</div>
-                        ${exp.notes ? `<div class="list-item-date" style="font-size: 0.8em; color: #94a3b8;">${exp.notes}</div>` : ''}
-                    </div>
-                    <div class="list-item-amount">${formatter}${exp.amount.toFixed(2)}</div>
-                    <button class="list-item-delete" onclick="app.deleteExpense('${currency}', ${exp.id})">Delete</button>
-                `;
-                list.appendChild(item);
-            });
-
-            const total = expenses.reduce((sum, e) => sum + e.amount, 0);
-            const formatter = currency === 'usd' ? '$' : '₪';
-            document.getElementById(`${currency}Total`).textContent = `${formatter}${total.toFixed(2)}`;
-        });
-    }
-
-    updateMonthDisplay() {
-        const options = { year: 'numeric', month: 'long' };
-        const display = this.currentMonth.toLocaleDateString('en-US', options);
-        document.getElementById('currentMonth').textContent = display;
-
-        const year = this.currentMonth.getFullYear();
-        const month = String(this.currentMonth.getMonth() + 1).padStart(2, '0');
-        document.getElementById('monthSelector').value = `${year}-${month}`;
-    }
-
-    // ===== RECURRING EXPENSES =====
-    setupRecurring() {
-        document.getElementById('recurringForm').addEventListener('submit', (e) => {
-            e.preventDefault();
-            this.addRecurringExpense();
-            document.getElementById('recurringForm').reset();
-            this.displayRecurring();
-        });
-        this.displayRecurring();
-    }
-
-    addRecurringExpense() {
-        const currency = document.getElementById('recurringCurrency').value;
-        const category = document.getElementById('recurringCategory').value;
-        const amount = parseFloat(document.getElementById('recurringAmount').value);
-        const frequency = document.getElementById('recurringFrequency').value;
-
-        this.data.recurring.push({
-            id: Date.now(),
-            currency,
-            category,
-            amount,
-            frequency,
-            lastApplied: new Date().toISOString().split('T')[0],
-            active: true
-        });
-
-        this.saveData();
-    }
-
-    deleteRecurring(id) {
-        this.data.recurring = this.data.recurring.filter(r => r.id !== id);
-        this.saveData();
-        this.displayRecurring();
-    }
-
-    displayRecurring() {
-        const list = document.getElementById('recurringList');
-        list.innerHTML = '';
-
-        this.data.recurring.forEach(recurring => {
-            const item = document.createElement('div');
-            item.className = 'list-item';
-            const formatter = recurring.currency === 'usd' ? '$' : '₪';
-            const frequencyEmoji = recurring.frequency === 'daily' ? '📅' : recurring.frequency === 'weekly' ? '📆' : '📊';
-
-            item.innerHTML = `
-                <div class="list-item-content">
-                    <div class="list-item-category">${recurring.category} ${frequencyEmoji}</div>
-                    <div class="list-item-date">${recurring.frequency.toUpperCase()}</div>
-                </div>
-                <div class="list-item-amount">${formatter}${recurring.amount.toFixed(2)}</div>
-                <button class="list-item-delete" onclick="app.deleteRecurring(${recurring.id})">Delete</button>
-            `;
-            list.appendChild(item);
-        });
-
-        if (this.data.recurring.length === 0) {
-            list.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 20px;">No recurring expenses set up yet.</p>';
-        }
-    }
-
-    processRecurringExpenses() {
-        const today = new Date().toISOString().split('T')[0];
-
-        this.data.recurring.forEach(recurring => {
-            if (!recurring.active) return;
-
-            const lastApplied = new Date(recurring.lastApplied);
-            const now = new Date();
-            let shouldApply = false;
-
-            if (recurring.frequency === 'daily') {
-                shouldApply = lastApplied.getDate() !== now.getDate();
-            } else if (recurring.frequency === 'weekly') {
-                const daysSince = (now - lastApplied) / (1000 * 60 * 60 * 24);
-                shouldApply = daysSince >= 7;
-            } else if (recurring.frequency === 'monthly') {
-                shouldApply = lastApplied.getMonth() !== now.getMonth();
-            }
-
-            if (shouldApply) {
-                this.data.expenses[recurring.currency].push({
-                    id: Date.now() + Math.random(),
-                    date: today,
-                    category: recurring.category,
-                    amount: recurring.amount,
-                    notes: `[Recurring - ${recurring.frequency}]`
-                });
-
-                recurring.lastApplied = today;
-                this.saveData();
-            }
-        });
-    }
-
-    // ===== BALANCES =====
-    setupBalances() {
-        this.displayBalances();
-    }
-
-    updateBalance(account) {
-        const input = document.getElementById(`${account}Input`);
-        const value = parseFloat(input.value);
-
-        if (isNaN(value)) {
-            alert('Please enter a valid number');
-            return;
-        }
-
-        this.data.balances[account] = value;
-        this.saveData();
-        this.recordBalanceHistory();
-        this.displayBalances();
-        alert('✅ Balance updated!');
-    }
-
-    recordBalanceHistory() {
-        const today = new Date().toISOString().split('T')[0];
-        
-        const existingToday = this.data.balanceHistory.find(h => h.date === today);
-        if (existingToday) {
-            existingToday.usdChecking = this.data.balances.usdChecking;
-            existingToday.usdSavings = this.data.balances.usdSavings;
-            existingToday.ils = this.data.balances.ils;
-        } else {
-            this.data.balanceHistory.push({
-                date: today,
-                usdChecking: this.data.balances.usdChecking,
-                usdSavings: this.data.balances.usdSavings,
-                ils: this.data.balances.ils
-            });
-        }
-        this.saveData();
-    }
-
-    displayBalances() {
-        const balances = this.data.balances;
-
-        document.getElementById('usdCheckingDisplay').textContent = `$${balances.usdChecking.toFixed(2)}`;
-        document.getElementById('usdSavingsDisplay').textContent = `$${balances.usdSavings.toFixed(2)}`;
-        document.getElementById('ilsDisplay').textContent = `₪${balances.ils.toFixed(2)}`;
-
-        document.getElementById('usdCheckingInput').value = balances.usdChecking || '';
-        document.getElementById('usdSavingsInput').value = balances.usdSavings || '';
-        document.getElementById('ilsInput').value = balances.ils || '';
-
-        this.displayBalanceHistory();
-    }
-
-    displayBalanceHistory() {
-        const list = document.getElementById('balanceHistoryList');
-        list.innerHTML = '';
-
-        const sorted = [...this.data.balanceHistory].reverse();
-
-        sorted.forEach(history => {
-            const item = document.createElement('div');
-            item.className = 'list-item';
-            item.innerHTML = `
-                <div class="list-item-content">
-                    <div class="list-item-date">${history.date}</div>
-                </div>
-                <div style="flex: 1; display: flex; gap: 20px; flex-wrap: wrap; font-size: 0.9em;">
-                    <span><strong>USD Checking:</strong> $${history.usdChecking.toFixed(2)}</span>
-                    <span><strong>USD Savings:</strong> $${history.usdSavings.toFixed(2)}</span>
-                    <span><strong>ILS:</strong> ₪${history.ils.toFixed(2)}</span>
-                </div>
-            `;
-            list.appendChild(item);
-        });
-
-        if (sorted.length === 0) {
-            list.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 20px;">No balance history yet. Update your balances to track them.</p>';
-        }
-    }
-
-    // ===== PAYSLIPS =====
-    setupPayslips() {
-        document.getElementById('usdPayslipForm').addEventListener('submit', (e) => {
-            e.preventDefault();
-            this.addPayslip('usd');
-            document.getElementById('usdPayslipForm').reset();
-            this.displayPayslips();
-            this.updateAllDisplays();
-        });
-
-        document.getElementById('ilsPayslipForm').addEventListener('submit', (e) => {
-            e.preventDefault();
-            this.addPayslip('ils');
-            document.getElementById('ilsPayslipForm').reset();
-            this.displayPayslips();
-            this.updateAllDisplays();
-        });
-
-        this.displayPayslips();
-    }
-
-    addPayslip(currency) {
-        const dateInput = document.getElementById(`${currency}PayslipDate`);
-        const grossInput = document.getElementById(`${currency}PayslipGross`);
-        const taxesInput = document.getElementById(`${currency}PayslipTaxes`);
-        const deductionsInput = document.getElementById(`${currency}PayslipDeductions`);
-
-        const payslip = {
-            id: Date.now(),
-            date: dateInput.value,
-            gross: parseFloat(grossInput.value),
-            taxes: parseFloat(taxesInput.value),
-            deductions: parseFloat(deductionsInput.value) || 0,
-            net: parseFloat(grossInput.value) - parseFloat(taxesInput.value) - (parseFloat(deductionsInput.value) || 0)
-        };
-
-        this.data.payslips[currency].push(payslip);
-        this.saveData();
-    }
-
-    deletePayslip(currency, id) {
-        this.data.payslips[currency] = this.data.payslips[currency].filter(p => p.id !== id);
-        this.saveData();
-        this.displayPayslips();
-        this.updateAllDisplays();
-    }
-
-    displayPayslips() {
-        ['usd', 'ils'].forEach(currency => {
-            const list = document.getElementById(`${currency}PayslipsList`);
-            list.innerHTML = '';
-
-            this.data.payslips[currency].forEach(slip => {
-                const item = document.createElement('div');
-                item.className = 'list-item';
-                const formatter = currency === 'usd' ? '$' : '₪';
-
-                item.innerHTML = `
-                    <div class="list-item-content">
-                        <div class="list-item-date">${slip.date}</div>
-                        <div style="display: flex; gap: 15px; margin-top: 8px; font-size: 0.9em;">
-                            <span><strong>Gross:</strong> ${formatter}${slip.gross.toFixed(2)}</span>
-                            <span><strong>Taxes:</strong> ${formatter}${slip.taxes.toFixed(2)}</span>
-                            <span><strong>Deductions:</strong> ${formatter}${slip.deductions.toFixed(2)}</span>
-                        </div>
-                    </div>
-                    <div class="list-item-amount">${formatter}${slip.net.toFixed(2)}</div>
-                    <button class="list-item-delete" onclick="app.deletePayslip('${currency}', ${slip.id})">Delete</button>
-                `;
-                list.appendChild(item);
-            });
-
-            if (this.data.payslips[currency].length === 0) {
-                list.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 20px;">No payslips recorded yet.</p>';
-            }
-        });
-    }
-
-    // ===== SAVINGS SUMMARY =====
-    setupSavings() {
-        document.getElementById('prevSavings').addEventListener('click', () => {
-            this.currentSavingsMonth.setMonth(this.currentSavingsMonth.getMonth() - 1);
-            this.updateSavingsMonthDisplay();
-            this.updateSavingsSummary();
-        });
-
-        document.getElementById('nextSavings').addEventListener('click', () => {
-            this.currentSavingsMonth.setMonth(this.currentSavingsMonth.getMonth() + 1);
-            this.updateSavingsMonthDisplay();
-            this.updateSavingsSummary();
-        });
-
-        document.getElementById('savingsMonthSelector').addEventListener('change', (e) => {
-            const [year, month] = e.target.value.split('-');
-            this.currentSavingsMonth = new Date(year, month - 1, 1);
-            this.updateSavingsMonthDisplay();
-            this.updateSavingsSummary();
-        });
-
-        this.updateSavingsMonthDisplay();
-    }
-
-    updateSavingsMonthDisplay() {
-        const options = { year: 'numeric', month: 'long' };
-        const display = this.currentSavingsMonth.toLocaleDateString('en-US', options);
-        document.getElementById('currentSavingsMonth').textContent = display;
-
-        const year = this.currentSavingsMonth.getFullYear();
-        const month = String(this.currentSavingsMonth.getMonth() + 1).padStart(2, '0');
-        document.getElementById('savingsMonthSelector').value = `${year}-${month}`;
-    }
-
-    updateSavingsSummary() {
-        const month = this.currentSavingsMonth.getMonth();
-        const year = this.currentSavingsMonth.getFullYear();
-
-        ['usd', 'ils'].forEach(currency => {
-            const payslips = this.data.payslips[currency].filter(p => {
-                const date = new Date(p.date);
-                return date.getMonth() === month && date.getFullYear() === year;
-            });
-
-            const expenses = this.data.expenses[currency].filter(e => {
-                const date = new Date(e.date);
-                return date.getMonth() === month && date.getFullYear() === year;
-            });
-
-            const totalGross = payslips.reduce((sum, p) => sum + p.gross, 0);
-            const totalTaxes = payslips.reduce((sum, p) => sum + p.taxes, 0);
-            const totalDeductions = payslips.reduce((sum, p) => sum + p.deductions, 0);
-            const totalNet = totalGross - totalTaxes - totalDeductions;
-            const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);
-            const remaining = totalNet - totalSpending;
-
-            const prefix = currency === 'usd' ? '$' : '₪';
-
-            document.getElementById(`savings${currency.toUpperCase()}Gross`).textContent = `${prefix}${totalGross.toFixed(2)}`;
-            document.getElementById(`savings${currency.toUpperCase()}Taxes`).textContent = `-${prefix}${totalTaxes.toFixed(2)}`;
-            document.getElementById(`savings${currency.toUpperCase()}Deductions`).textContent = `-${prefix}${totalDeductions.toFixed(2)}`;
-            document.getElementById(`savings${currency.toUpperCase()}Net`).textContent = `${prefix}${totalNet.toFixed(2)}`;
-            document.getElementById(`savings${currency.toUpperCase()}Spending`).textContent = `-${prefix}${totalSpending.toFixed(2)}`;
-            
-            const remainingElement = document.getElementById(`savings${currency.toUpperCase()}Remaining`);
-            remainingElement.textContent = `${prefix}${remaining.toFixed(2)}`;
-        });
-    }
-
-    // ===== BUDGETS =====
-    setupBudgets() {
-        document.getElementById('usdBudgetForm').addEventListener('submit', (e) => {
-            e.preventDefault();
-            this.addBudget('usd');
-            document.getElementById('usdBudgetForm').reset();
-            this.displayBudgets();
-        });
-
-        document.getElementById('ilsBudgetForm').addEventListener('submit', (e) => {
-            e.preventDefault();
-            this.addBudget('ils');
-            document.getElementById('ilsBudgetForm').reset();
-            this.displayBudgets();
-        });
-
-        this.displayBudgets();
-    }
-
-    addBudget(currency) {
-        const category = document.getElementById(`${currency}BudgetCategory`).value;
-        const amount = parseFloat(document.getElementById(`${currency}BudgetAmount`).value);
-
-        const existing = this.data.budgets[currency].find(b => b.category === category);
-        if (existing) {
-            existing.limit = amount;
-        } else {
-            this.data.budgets[currency].push({ category, limit: amount });
-        }
-
-        this.saveData();
-    }
-
-    deleteBudget(currency, category) {
-        this.data.budgets[currency] = this.data.budgets[currency].filter(b => b.category !== category);
-        this.saveData();
-        this.displayBudgets();
-    }
-
-    displayBudgets() {
-        const month = new Date().getMonth();
-        const year = new Date().getFullYear();
-
-        ['usd', 'ils'].forEach(currency => {
-            const list = document.getElementById(`${currency}BudgetList`);
-            list.innerHTML = '';
-            const formatter = currency === 'usd' ? '$' : '₪';
-
-            this.data.budgets[currency].forEach(budget => {
-                const spent = this.data.expenses[currency]
-                    .filter(e => {
-                        const date = new Date(e.date);
-                        return e.category === budget.category && 
-                               date.getMonth() === month && 
-                               date.getFullYear() === year;
-                    })
-                    .reduce((sum, e) => sum + e.amount, 0);
-
-                const percentage = (spent / budget.limit) * 100;
-                let barClass = '';
-                if (percentage > 100) {
-                    barClass = 'danger';
-                } else if (percentage > 80) {
-                    barClass = 'warning';
-                }
-
-                const item = document.createElement('div');
-                item.className = 'budget-item';
-                item.innerHTML = `
-                    <div class="budget-header">
-                        <div class="list-item-category">${budget.category}</div>
-                        <div class="list-item-amount">${formatter}${spent.toFixed(2)} / ${formatter}${budget.limit.toFixed(2)}</div>
-                    </div>
-                    <div class="budget-progress">
-                        <div class="budget-bar ${barClass}" style="width: ${Math.min(percentage, 100)}%"></div>
-                    </div>
-                    <div class="budget-info">
-                        <span>${Math.round(percentage)}% spent</span>
-                        <button class="list-item-delete" style="padding: 4px 8px; font-size: 0.85em;" onclick="app.deleteBudget('${currency}', '${budget.category}')">Delete</button>
-                    </div>
-                `;
-                list.appendChild(item);
-            });
-
-            if (this.data.budgets[currency].length === 0) {
-                list.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 20px;">No budgets set up yet.</p>';
-            }
-        });
-    }
-
-    // ===== CHARTS =====
-    setupCharts() {
-        // Charts will be drawn when tab is clicked
-    }
-
-    drawAllCharts() {
-        this.drawExpenseCharts();
-        this.drawIncomeCharts();
-    }
-
-    drawExpenseCharts() {
-        const month = new Date().getMonth();
-        const year = new Date().getFullYear();
-
-        ['usd', 'ils'].forEach(currency => {
-            const canvasId = `${currency}ExpenseChart`;
-            const canvas = document.getElementById(canvasId);
-            if (!canvas) return;
-
-            const expenses = this.data.expenses[currency].filter(e => {
-                const date = new Date(e.date);
-                return date.getMonth() === month && date.getFullYear() === year;
-            });
-
-            const categories = {};
-            expenses.forEach(e => {
-                categories[e.category] = (categories[e.category] || 0) + e.amount;
-            });
-
-            const ctx = canvas.getContext('2d');
-            
-            if (this.charts[canvasId]) {
-                this.charts[canvasId].destroy();
-            }
-
-            this.charts[canvasId] = new Chart(ctx, {
-                type: 'doughnut',
-                data: {
-                    labels: Object.keys(categories),
-                    datasets: [{
-                        data: Object.values(categories),
-                        backgroundColor: [
-                            '#10b981', '#8b5cf6', '#f59e0b', '#3b82f6', '#ef4444',
-                            '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#6366f1'
-                        ],
-                        borderColor: '#1e293b',
-                        borderWidth: 2
-                    }]
-                },
-                options: {
-                    responsive: true,
-                    maintainAspectRatio: true,
-                    plugins: {
-                        legend: { 
-                            position: 'bottom',
-                            labels: {
-                                color: '#cbd5e1',
-                                font: { size: 12 }
-                            }
-                        }
-                    }
-                }
-            });
-        });
-    }
-
-    drawIncomeCharts() {
-        const month = new Date().getMonth();
-        const year = new Date().getFullYear();
-
-        ['usd', 'ils'].forEach(currency => {
-            const canvasId = `${currency}IncomeChart`;
-            const canvas = document.getElementById(canvasId);
-            if (!canvas) return;
-            
-            const payslips = this.data.payslips[currency].filter(p => {
-                const date = new Date(p.date);
-                return date.getMonth() === month && date.getFullYear() === year;
-            });
-
-            const totalGross = payslips.reduce((sum, p) => sum + p.gross, 0);
-            const totalTaxes = payslips.reduce((sum, p) => sum + p.taxes, 0);
-            const totalDeductions = payslips.reduce((sum, p) => sum + p.deductions, 0);
-            const totalNet = totalGross - totalTaxes - totalDeductions;
-
-            const expenses = this.data.expenses[currency].filter(e => {
-                const date = new Date(e.date);
-                return date.getMonth() === month && date.getFullYear() === year;
-            });
-            const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
-
-            const ctx = canvas.getContext('2d');
-            
-            if (this.charts[canvasId]) {
-                this.charts[canvasId].destroy();
-            }
-
-            this.charts[canvasId] = new Chart(ctx, {
-                type: 'bar',
-                data: {
-                    labels: ['Gross', 'Taxes', 'Deductions', 'Net', 'Spending', 'Savings'],
-                    datasets: [{
-                        label: currency.toUpperCase(),
-                        data: [totalGross, totalTaxes, totalDeductions, totalNet, totalExpenses, totalNet - totalExpenses],
-                        backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'],
-                        borderRadius: 6,
-                        borderSkipped: false
-                    }]
-                },
-                options: {
-                    responsive: true,
-                    maintainAspectRatio: true,
-                    indexAxis: 'y',
-                    plugins: {
-                        legend: { 
-                            labels: { color: '#cbd5e1' }
-                        }
-                    },
-                    scales: {
-                        x: {
-                            grid: { color: '#334155' },
-                            ticks: { color: '#cbd5e1' }
-                        },
-                        y: {
-                            grid: { color: '#334155' },
-                            ticks: { color: '#cbd5e1' }
-                        }
-                    }
-                }
-            });
-        });
-    }
-
-    // ===== CURRENCY CONVERSION =====
-    convertCurrency() {
-        const amount = parseFloat(document.getElementById('exchangeAmount').value);
-        const from = document.getElementById('exchangeFrom').value;
-        const to = document.getElementById('exchangeTo').value;
-        const rate = this.data.settings.exchangeRate;
-
-        let result;
-        if (from === 'usd' && to === 'ils') {
-            result = amount * rate;
-        } else if (from === 'ils' && to === 'usd') {
-            result = amount / rate;
-        }
-
-        const resultElement = document.getElementById('exchangeResult');
-        const formatter = to === 'usd' ? '$' : '₪';
-        resultElement.textContent = `${formatter}${result.toFixed(2)}`;
-        document.getElementById('exchangeRate').textContent = `Exchange Rate: 1 USD = ${rate} ILS`;
-    }
-
-    // ===== SETTINGS =====
-    setupSettings() {
-        document.getElementById('emailNotifications').checked = this.data.settings.emailNotifications;
-        document.getElementById('cloudSync').checked = this.data.settings.cloudSync;
-        document.getElementById('emailAddress').value = this.data.settings.email;
-    }
-
-    toggleEmailNotifications() {
-        const enabled = document.getElementById('emailNotifications').checked;
-        this.data.settings.emailNotifications = enabled;
-        document.getElementById('emailSettings').style.display = enabled ? 'block' : 'none';
-        this.saveData();
-
-        if (enabled) {
-            alert('📧 Email notifications enabled. Note: This feature requires a backend service.');
-        }
-    }
-
-    saveEmailSettings() {
-        const email = document.getElementById('emailAddress').value;
-        if (!email.includes('@')) {
-            alert('❌ Please enter a valid email address');
-            return;
-        }
-        this.data.settings.email = email;
-        this.saveData();
-        alert('✅ Email settings saved!');
-    }
-
-    toggleCloudSync() {
-        const enabled = document.getElementById('cloudSync').checked;
-        this.data.settings.cloudSync = enabled;
-        this.saveData();
-
-        const status = document.getElementById('cloudSyncStatus');
-        status.style.display = 'block';
-        const statusText = document.getElementById('syncStatusText');
-
-        if (enabled) {
-            statusText.textContent = '☁️ Cloud sync is ENABLED (Beta). Your data will be backed up automatically.';
-            statusText.style.color = '#10b981';
-        } else {
-            statusText.textContent = '☁️ Cloud sync is disabled';
-            statusText.style.color = '#94a3b8';
-        }
-    }
+const { useMemo, useState, useEffect } = React;
+
+const STORAGE_KEY = 'financeDashboardV2';
+const CATS = ['Food', 'Rent', 'Travel', 'Bills', 'Health', 'Shopping', 'Other'];
+const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
+
+const defaultData = {
+  expensesUS: [], expensesIL: [], payslipsUS: [], payslipsIL: [],
+  accountsUS: { checking: 0, savings: 0 }, accountsIL: { main: 0 },
+  balanceHistory: { usChecking: [], usSavings: [], ilMain: [] },
+  selectedMonth: new Date().getMonth(), selectedYear: new Date().getFullYear()
+};
+
+const id = () => Date.now() + Math.random();
+const fmt = (n,c) => new Intl.NumberFormat('en-US',{style:'currency',currency:c}).format(Number(n||0));
+const ym = d => { const dt = new Date(d); return [dt.getFullYear(), dt.getMonth()]; };
+const filterMY = (arr,m,y) => arr.filter(x => { const [yy,mm]=ym(x.date); return mm===m&&yy===y; });
+const groupCat = arr => arr.reduce((a,x)=>(a[x.category]=(a[x.category]||0)+Number(x.amount),a),{});
+
+function App(){
+  const [tab, setTab] = useState('dashboard');
+  const [data, setData] = useState(() => {
+    try { return { ...defaultData, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
+    catch { return defaultData; }
+  });
+  const [search, setSearch] = useState('');
+  const [categoryFilter, setCategoryFilter] = useState('all');
+  const [minAmt, setMinAmt] = useState('');
+  const [maxAmt, setMaxAmt] = useState('');
+
+  useEffect(()=>localStorage.setItem(STORAGE_KEY, JSON.stringify(data)), [data]);
+
+  const m = data.selectedMonth, y = data.selectedYear;
+  const expUS = filterMY(data.expensesUS,m,y), expIL = filterMY(data.expensesIL,m,y);
+  const payUS = filterMY(data.payslipsUS,m,y), payIL = filterMY(data.payslipsIL,m,y);
+  const sums = useMemo(() => {
+    const eUS=expUS.reduce((s,x)=>s+Number(x.amount),0), eIL=expIL.reduce((s,x)=>s+Number(x.amount),0);
+    const nUS=payUS.reduce((s,x)=>s+Number(x.net),0), nIL=payIL.reduce((s,x)=>s+Number(x.net),0);
+    return { eUS,eIL,nUS,nIL,sUS:nUS-eUS,sIL:nIL-eIL };
+  },[data,m,y]);
+
+  const addExpense = (country,p) => setData(d=>({...d,[country==='US'?'expensesUS':'expensesIL']:[...d[country==='US'?'expensesUS':'expensesIL'],{...p,id:id()}]}));
+  const addPayslip = (country,p) => setData(d=>({...d,[country==='US'?'payslipsUS':'payslipsIL']:[...d[country==='US'?'payslipsUS':'payslipsIL'],{...p,net:Number(p.gross)-Number(p.tax),id:id()}]}));
+  const updateBalance = (acc,val,label) => setData(d=>{
+    const copy = structuredClone(d);
+    if (acc==='checking'||acc==='savings') copy.accountsUS[acc]=Number(val);
+    if (acc==='main') copy.accountsIL.main=Number(val);
+    const key = acc==='checking'?'usChecking':acc==='savings'?'usSavings':'ilMain';
+    copy.balanceHistory[key].push({id:id(),date:new Date().toISOString().slice(0,10),amount:Number(val),label});
+    return copy;
+  });
+
+  const exportJSON = ()=>{ const b=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='finance-backup.json'; a.click(); };
+  const importJSON = e => { const f=e.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=()=>setData({...defaultData,...JSON.parse(r.result)}); r.readAsText(f); };
+  const resetAll = ()=>{ if(confirm('Reset all data?')) setData(defaultData); };
+
+  const Card=({t,v,cls})=><div className={`card ${cls||''}`}><div>{t}</div><strong>{v}</strong></div>;
+  const ExpenseSection=({country,currency,list,setList})=>{
+    const [form,setForm]=useState({date:new Date().toISOString().slice(0,10),category:'Food',custom:'',description:'',amount:''});
+    const filtered = list.filter(x => (x.description+x.category).toLowerCase().includes(search.toLowerCase()))
+      .filter(x => categoryFilter==='all'||x.category===categoryFilter)
+      .filter(x => minAmt===''||x.amount>=Number(minAmt)).filter(x=>maxAmt===''||x.amount<=Number(maxAmt));
+    const edit=(id,p)=>setData(d=>({...d,[country==='US'?'expensesUS':'expensesIL']:d[country==='US'?'expensesUS':'expensesIL'].map(x=>x.id===id?{...x,...p}:x)}));
+    const del=id=>setData(d=>({...d,[country==='US'?'expensesUS':'expensesIL']:d[country==='US'?'expensesUS':'expensesIL'].filter(x=>x.id!==id)}));
+    const cats=groupCat(list);
+    return <div className='panel'><h3>{country==='US'?'🇺🇸 US':'🇮🇱 Israel'} Expenses</h3>
+      <form onSubmit={e=>{e.preventDefault(); addExpense(country,{date:form.date,category:form.category==='Custom'?form.custom:form.category,description:form.description,amount:Number(form.amount)}); setForm({...form,description:'',amount:''});}} className='grid4'>
+        <input type='date' value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
+        <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{[...CATS,'Custom'].map(c=><option key={c}>{c}</option>)}</select>
+        {form.category==='Custom' && <input placeholder='Custom category' value={form.custom} onChange={e=>setForm({...form,custom:e.target.value})}/>}
+        <input placeholder='Description' value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
+        <input type='number' step='0.01' placeholder='Amount' value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/>
+        <button>Add</button>
+      </form>
+      <div>Monthly total: <b>{fmt(list.reduce((s,x)=>s+Number(x.amount),0),currency)}</b></div>
+      {filtered.map(x=><div className='row' key={x.id}><span>{x.date} • {x.category} • {x.description}</span><span>{fmt(x.amount,currency)}</span><button onClick={()=>{const a=prompt('New amount',x.amount); if(a) edit(x.id,{amount:Number(a)});}}>Edit</button><button onClick={()=>del(x.id)}>Delete</button></div>)}
+      <div className='mini'>Top categories: {Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${k} ${fmt(v,currency)}`).join(' | ')||'No data'}</div>
+    </div>
+  };
+
+  return <div className='app'><h1>Personal Finance Dashboard</h1>
+    <div className='toolbar'>
+      {['dashboard','expenses','accounts','payslips','savings'].map(t=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}
+      <select value={m} onChange={e=>setData(d=>({...d,selectedMonth:Number(e.target.value)}))}>{monthNames.map((n,i)=><option value={i} key={i}>{n}</option>)}</select>
+      <input type='number' value={y} onChange={e=>setData(d=>({...d,selectedYear:Number(e.target.value)}))}/>
+      <button onClick={exportJSON}>Export JSON</button><label className='file'>Import<input type='file' onChange={importJSON}/></label><button onClick={resetAll}>Reset</button>
+    </div>
+
+    {tab==='dashboard' && <div className='grid'>
+      <Card t='US Income' v={fmt(sums.nUS,'USD')} cls='income'/><Card t='US Expenses' v={fmt(sums.eUS,'USD')} cls='expense'/><Card t='US Savings' v={fmt(sums.sUS,'USD')} cls='save'/>
+      <Card t='IL Income' v={fmt(sums.nIL,'ILS')} cls='income'/><Card t='IL Expenses' v={fmt(sums.eIL,'ILS')} cls='expense'/><Card t='IL Savings' v={fmt(sums.sIL,'ILS')} cls='save'/>
+      <div className='panel full'>Monthly comparison: US {sums.sUS>=0?'Surplus':'Deficit'} | IL {sums.sIL>=0?'Surplus':'Deficit'}</div>
+    </div>}
+
+    {tab==='expenses' && <><div className='filters'><input placeholder='Search' value={search} onChange={e=>setSearch(e.target.value)}/><select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}><option value='all'>All Categories</option>{CATS.map(c=><option key={c}>{c}</option>)}</select><input type='number' placeholder='Min amount' value={minAmt} onChange={e=>setMinAmt(e.target.value)}/><input type='number' placeholder='Max amount' value={maxAmt} onChange={e=>setMaxAmt(e.target.value)}/></div>
+      <div className='split'><ExpenseSection country='US' currency='USD' list={expUS}/><ExpenseSection country='IL' currency='ILS' list={expIL}/></div></>}
+
+    {tab==='accounts' && <div className='split'>
+      {['checking','savings'].map(a=><div key={a} className='panel'><h3>US {a}</h3><div>{fmt(data.accountsUS[a],'USD')}</div><button onClick={()=>{const v=prompt('Balance'); if(v!==null) updateBalance(a,v,'manual');}}>Add balance update</button>{data.balanceHistory[a==='checking'?'usChecking':'usSavings'].slice(-6).map(h=><div className='mini' key={h.id}>{h.date}: {fmt(h.amount,'USD')}</div>)}</div>)}
+      <div className='panel'><h3>IL main</h3><div>{fmt(data.accountsIL.main,'ILS')}</div><button onClick={()=>{const v=prompt('Balance'); if(v!==null) updateBalance('main',v,'manual');}}>Add balance update</button>{data.balanceHistory.ilMain.slice(-6).map(h=><div className='mini' key={h.id}>{h.date}: {fmt(h.amount,'ILS')}</div>)}</div></div>
+    </div>}
+
+    {tab==='payslips' && <div className='split'>{['US','IL'].map(c=>{ const curr=c==='US'?'USD':'ILS'; const list=c==='US'?payUS:payIL; return <Payslip key={c} country={c} currency={curr} list={list} addPayslip={addPayslip}/>; })}</div>}
+
+    {tab==='savings' && <div className='grid'><Card t='US saved this month?' v={sums.sUS>=0?'✅ Yes':'❌ No'} cls='save'/><Card t='IL saved this month?' v={sums.sIL>=0?'✅ Yes':'❌ No'} cls='save'/><div className='panel full'>Yearly summary: US income {fmt(data.payslipsUS.filter(x=>new Date(x.date).getFullYear()===y).reduce((s,x)=>s+x.net,0),'USD')} vs expense {fmt(data.expensesUS.filter(x=>new Date(x.date).getFullYear()===y).reduce((s,x)=>s+x.amount,0),'USD')} | IL income {fmt(data.payslipsIL.filter(x=>new Date(x.date).getFullYear()===y).reduce((s,x)=>s+x.net,0),'ILS')} vs expense {fmt(data.expensesIL.filter(x=>new Date(x.date).getFullYear()===y).reduce((s,x)=>s+x.amount,0),'ILS')}</div></div>}
+  </div>
+}
 
-    // ===== UTILITIES =====
-    updateAllDisplays() {
-        this.displayExpenses();
-        this.displayBalances();
-        this.displayPayslips();
-        this.displayBudgets();
-    }
+function Payslip({country,currency,list,addPayslip}){
+  const [f,setF]=useState({date:new Date().toISOString().slice(0,10),gross:'',tax:'',employer:''});
+  const gross=list.reduce((s,x)=>s+Number(x.gross),0), tax=list.reduce((s,x)=>s+Number(x.tax),0), net=list.reduce((s,x)=>s+Number(x.net),0);
+  const rate = gross? (tax/gross*100).toFixed(1):0;
+  return <div className='panel'><h3>{country==='US'?'🇺🇸':'🇮🇱'} Payslips</h3>
+    <form className='grid4' onSubmit={e=>{e.preventDefault();addPayslip(country,f);setF({...f,gross:'',tax:'',employer:''});}}>
+      <input type='date' value={f.date} onChange={e=>setF({...f,date:e.target.value})}/><input placeholder='Employer' value={f.employer} onChange={e=>setF({...f,employer:e.target.value})}/><input type='number' placeholder='Gross' value={f.gross} onChange={e=>setF({...f,gross:e.target.value})}/><input type='number' placeholder='Tax' value={f.tax} onChange={e=>setF({...f,tax:e.target.value})}/><button>Add</button>
+    </form>
+    <div>Gross {fmt(gross,currency)} | Tax {fmt(tax,currency)} | Net {fmt(net,currency)} | Effective tax {rate}%</div>
+    {list.map(p=><div key={p.id} className='mini'>{p.date} {p.employer} • Gross {fmt(p.gross,currency)} • Net {fmt(p.net,currency)}</div>)}
+  </div>
 }
 
-// Initialize app when DOM is ready
-document.addEventListener('DOMContentLoaded', () => {
-    window.app = new FinanceApp();
-});
+ReactDOM.createRoot(document.getElementById('root')).render(<App />);
