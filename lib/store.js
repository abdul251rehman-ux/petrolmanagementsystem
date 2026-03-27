// lib/store.js - localStorage data management

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// ─── Company / Auth ──────────────────────────────────────────────────────────

export const getCompany = () => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('ps_company');
  return data ? JSON.parse(data) : null;
};

export const saveCompany = (company) => {
  localStorage.setItem('ps_company', JSON.stringify(company));
};

export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('ps_session');
};

export const setSession = (pumpCode) => {
  localStorage.setItem('ps_session', JSON.stringify({ pumpCode, loginAt: new Date().toISOString() }));
};

export const clearSession = () => {
  localStorage.removeItem('ps_session');
};

// ─── Accounts ────────────────────────────────────────────────────────────────

export const getAccounts = () => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('ps_accounts');
  return data ? JSON.parse(data) : [];
};

export const saveAccounts = (accounts) => {
  localStorage.setItem('ps_accounts', JSON.stringify(accounts));
};

export const addAccount = (account) => {
  const accounts = getAccounts();
  const newAccount = { ...account, id: generateId(), currentBalance: account.openingBalance || 0 };
  accounts.push(newAccount);
  saveAccounts(accounts);
  return newAccount;
};

export const updateAccount = (id, updates) => {
  const accounts = getAccounts();
  const idx = accounts.findIndex(a => a.id === id);
  if (idx !== -1) {
    accounts[idx] = { ...accounts[idx], ...updates };
    saveAccounts(accounts);
    return accounts[idx];
  }
  return null;
};

export const deleteAccount = (id) => {
  const accounts = getAccounts().filter(a => a.id !== id);
  saveAccounts(accounts);
};

export const getAccountById = (id) => {
  return getAccounts().find(a => a.id === id) || null;
};

// ─── Products ────────────────────────────────────────────────────────────────

export const getProducts = () => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('ps_products');
  return data ? JSON.parse(data) : [];
};

export const saveProducts = (products) => {
  localStorage.setItem('ps_products', JSON.stringify(products));
};

export const addProduct = (product) => {
  const products = getProducts();
  const newProduct = { ...product, id: generateId() };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
};

export const updateProduct = (id, updates) => {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...updates };
    saveProducts(products);
    return products[idx];
  }
  return null;
};

export const deleteProduct = (id) => {
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
};

// ─── Machines ────────────────────────────────────────────────────────────────

export const getMachines = () => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('ps_machines');
  return data ? JSON.parse(data) : [];
};

export const saveMachines = (machines) => {
  localStorage.setItem('ps_machines', JSON.stringify(machines));
};

export const addMachine = (machine) => {
  const machines = getMachines();
  const newMachine = { ...machine, id: generateId() };
  machines.push(newMachine);
  saveMachines(machines);
  return newMachine;
};

export const updateMachine = (id, updates) => {
  const machines = getMachines();
  const idx = machines.findIndex(m => m.id === id);
  if (idx !== -1) {
    machines[idx] = { ...machines[idx], ...updates };
    saveMachines(machines);
    return machines[idx];
  }
  return null;
};

export const deleteMachine = (id) => {
  const machines = getMachines().filter(m => m.id !== id);
  saveMachines(machines);
};

// ─── Purchases ───────────────────────────────────────────────────────────────

export const getPurchases = () => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('ps_purchases');
  return data ? JSON.parse(data) : [];
};

export const savePurchases = (purchases) => {
  localStorage.setItem('ps_purchases', JSON.stringify(purchases));
};

export const addPurchase = (purchase) => {
  const purchases = getPurchases();
  const newPurchase = { ...purchase, id: generateId(), createdAt: new Date().toISOString() };
  purchases.push(newPurchase);
  savePurchases(purchases);
  // Update product stock
  const products = getProducts();
  const idx = products.findIndex(p => p.id === purchase.productId);
  if (idx !== -1) {
    products[idx].stock = parseFloat(products[idx].stock || 0) + parseFloat(purchase.quantity || 0);
    saveProducts(products);
  }
  // Update supplier balance
  if (purchase.supplierId) {
    const accounts = getAccounts();
    const aIdx = accounts.findIndex(a => a.id === purchase.supplierId);
    if (aIdx !== -1) {
      accounts[aIdx].currentBalance = parseFloat(accounts[aIdx].currentBalance || 0) + parseFloat(purchase.total || 0);
      saveAccounts(accounts);
    }
  }
  return newPurchase;
};

export const deletePurchase = (id) => {
  const purchases = getPurchases().filter(p => p.id !== id);
  savePurchases(purchases);
};

// ─── Sales ───────────────────────────────────────────────────────────────────

export const getSales = () => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('ps_sales');
  return data ? JSON.parse(data) : [];
};

export const saveSales = (sales) => {
  localStorage.setItem('ps_sales', JSON.stringify(sales));
};

export const addSale = (sale) => {
  const sales = getSales();
  const newSale = { ...sale, id: generateId(), createdAt: new Date().toISOString() };
  sales.push(newSale);
  saveSales(sales);
  // Update product stock
  const products = getProducts();
  const idx = products.findIndex(p => p.id === sale.productId);
  if (idx !== -1) {
    products[idx].stock = parseFloat(products[idx].stock || 0) - parseFloat(sale.quantity || 0);
    saveProducts(products);
  }
  // Update customer balance (credit sale)
  if (sale.customerId && sale.paymentMode === 'credit') {
    const accounts = getAccounts();
    const aIdx = accounts.findIndex(a => a.id === sale.customerId);
    if (aIdx !== -1) {
      accounts[aIdx].currentBalance = parseFloat(accounts[aIdx].currentBalance || 0) + parseFloat(sale.total || 0);
      saveAccounts(accounts);
    }
  }
  return newSale;
};

export const deleteSale = (id) => {
  const sales = getSales().filter(s => s.id !== id);
  saveSales(sales);
};

// ─── Vouchers ────────────────────────────────────────────────────────────────

export const getVouchers = () => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('ps_vouchers');
  return data ? JSON.parse(data) : [];
};

export const saveVouchers = (vouchers) => {
  localStorage.setItem('ps_vouchers', JSON.stringify(vouchers));
};

export const addVoucher = (voucher) => {
  const vouchers = getVouchers();
  const newVoucher = { ...voucher, id: generateId(), createdAt: new Date().toISOString() };
  vouchers.push(newVoucher);
  saveVouchers(vouchers);
  // Adjust account balance
  if (voucher.accountId) {
    const accounts = getAccounts();
    const aIdx = accounts.findIndex(a => a.id === voucher.accountId);
    if (aIdx !== -1) {
      if (voucher.type === 'receipt') {
        accounts[aIdx].currentBalance = parseFloat(accounts[aIdx].currentBalance || 0) - parseFloat(voucher.amount || 0);
      } else {
        accounts[aIdx].currentBalance = parseFloat(accounts[aIdx].currentBalance || 0) + parseFloat(voucher.amount || 0);
      }
      saveAccounts(accounts);
    }
  }
  return newVoucher;
};

export const deleteVoucher = (id) => {
  const vouchers = getVouchers().filter(v => v.id !== id);
  saveVouchers(vouchers);
};

// ─── Expenses ────────────────────────────────────────────────────────────────

export const getExpenses = () => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('ps_expenses');
  return data ? JSON.parse(data) : [];
};

export const saveExpenses = (expenses) => {
  localStorage.setItem('ps_expenses', JSON.stringify(expenses));
};

export const addExpense = (expense) => {
  const expenses = getExpenses();
  const newExpense = { ...expense, id: generateId(), createdAt: new Date().toISOString() };
  expenses.push(newExpense);
  saveExpenses(expenses);
  return newExpense;
};

export const deleteExpense = (id) => {
  const expenses = getExpenses().filter(e => e.id !== id);
  saveExpenses(expenses);
};

// ─── Dashboard Summary ───────────────────────────────────────────────────────

export const getDashboardSummary = () => {
  const sales = getSales();
  const purchases = getPurchases();
  const expenses = getExpenses();
  const accounts = getAccounts();
  const products = getProducts();
  const vouchers = getVouchers();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlySales = sales.filter(s => new Date(s.date || s.createdAt) >= monthStart);
  const monthlyPurchases = purchases.filter(p => new Date(p.date || p.createdAt) >= monthStart);

  const totalSaleAmt = sales.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
  const totalPurchaseAmt = purchases.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
  const totalExpenseAmt = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const monthlySaleAmt = monthlySales.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);

  const petrolSales = monthlySales.filter(s => {
    const p = products.find(pr => pr.id === s.productId);
    return p && p.name.toLowerCase().includes('petrol');
  });
  const dieselSales = monthlySales.filter(s => {
    const p = products.find(pr => pr.id === s.productId);
    return p && p.name.toLowerCase().includes('diesel');
  });

  const petrolLtr = petrolSales.reduce((sum, s) => sum + parseFloat(s.quantity || 0), 0);
  const dieselLtr = dieselSales.reduce((sum, s) => sum + parseFloat(s.quantity || 0), 0);

  const totalReceiptVouchers = vouchers.filter(v => v.type === 'receipt').reduce((sum, v) => sum + parseFloat(v.amount || 0), 0);
  const totalPaymentVouchers = vouchers.filter(v => v.type === 'payment').reduce((sum, v) => sum + parseFloat(v.amount || 0), 0);
  const cashInHand = totalReceiptVouchers - totalPaymentVouchers - totalExpenseAmt;

  const stockDetails = [
    'Petrol', 'Hi Speed Diesel', 'LPG', 'CNG', 'Super Petrol',
    'Light Diesel Oil', 'Kerosene Oil', 'Hi Octane Petrol'
  ].map(name => {
    const product = products.find(p => p.name.toLowerCase() === name.toLowerCase());
    return { name, stock: product ? parseFloat(product.stock || 0) : 0, unit: product ? product.unit : 'Ltr', rate: product ? parseFloat(product.rate || 0) : 0 };
  });

  return {
    monthlySaleAmt,
    petrolLtr,
    dieselLtr,
    accountsCount: accounts.length,
    totalPurchaseAmt,
    totalSaleAmt,
    totalExpenseAmt,
    cashInHand,
    stockDetails,
  };
};

// ─── Rate Adjustments ────────────────────────────────────────────────────────

export const getRateAdjustments = () => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('ps_rate_adjustments');
  return data ? JSON.parse(data) : [];
};

export const addRateAdjustment = (adjustment) => {
  const adjustments = getRateAdjustments();
  const newAdj = { ...adjustment, id: generateId(), createdAt: new Date().toISOString() };
  adjustments.push(newAdj);
  localStorage.setItem('ps_rate_adjustments', JSON.stringify(adjustments));
  // Update product rate
  if (adjustment.productId) {
    updateProduct(adjustment.productId, { rate: adjustment.newRate });
  }
  return newAdj;
};
