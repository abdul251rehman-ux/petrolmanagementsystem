-- ============================================================
--  PETROL PUMP MANAGER — Supabase SQL Schema
--  Run this entire file in Supabase → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
--  1. COMPANIES  (one row per petrol pump business)
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pump_code        TEXT UNIQUE NOT NULL,
  business_name    TEXT NOT NULL,
  mobile_no        TEXT NOT NULL,
  email            TEXT UNIQUE NOT NULL,
  password_hash    TEXT NOT NULL,          -- store bcrypt hash, never plain text
  address          TEXT,
  city             TEXT,
  owner_name       TEXT,
  logo_url         TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
--  2. ACCOUNTS  (customers / suppliers / employees)
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  account_type     TEXT NOT NULL CHECK (account_type IN ('customer', 'supplier', 'employee', 'other')),
  phone            TEXT,
  email            TEXT,
  address          TEXT,
  opening_balance  NUMERIC(14,2) NOT NULL DEFAULT 0,
  current_balance  NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes            TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
--  3. PRODUCTS  (petrol, diesel, CNG, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  unit             TEXT NOT NULL DEFAULT 'Ltr',   -- Ltr, Kg, m³
  hsn_code         TEXT,
  current_stock    NUMERIC(14,3) NOT NULL DEFAULT 0,
  rate             NUMERIC(10,2) NOT NULL DEFAULT 0,
  purchase_rate    NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
--  4. MACHINES  (pump dispensers)
-- ============================================================
CREATE TABLE IF NOT EXISTS machines (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id       UUID REFERENCES products(id) ON DELETE SET NULL,
  machine_name     TEXT NOT NULL,
  machine_no       TEXT NOT NULL,
  nozzle_count     INT NOT NULL DEFAULT 1,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
--  5. PURCHASES  (stock incoming from suppliers)
-- ============================================================
CREATE TABLE IF NOT EXISTS purchases (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id       UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  supplier_id      UUID REFERENCES accounts(id) ON DELETE SET NULL,
  quantity         NUMERIC(14,3) NOT NULL,
  rate             NUMERIC(10,2) NOT NULL,
  total_amount     NUMERIC(14,2) NOT NULL,
  payment_mode     TEXT NOT NULL DEFAULT 'credit' CHECK (payment_mode IN ('cash', 'credit', 'bank', 'cheque')),
  invoice_no       TEXT,
  purchase_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  note             TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
--  6. SALES  (fuel dispensed to customers)
-- ============================================================
CREATE TABLE IF NOT EXISTS sales (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id       UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  customer_id      UUID REFERENCES accounts(id) ON DELETE SET NULL,
  machine_id       UUID REFERENCES machines(id) ON DELETE SET NULL,
  quantity         NUMERIC(14,3) NOT NULL,
  rate             NUMERIC(10,2) NOT NULL,
  total_amount     NUMERIC(14,2) NOT NULL,
  discount         NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_amount       NUMERIC(14,2) NOT NULL,
  payment_mode     TEXT NOT NULL DEFAULT 'cash' CHECK (payment_mode IN ('cash', 'credit', 'bank', 'upi', 'cheque')),
  sale_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  bill_no          TEXT,
  note             TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
--  7. VOUCHERS  (cash receipt / cash payment)
-- ============================================================
CREATE TABLE IF NOT EXISTS vouchers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  account_id       UUID REFERENCES accounts(id) ON DELETE SET NULL,
  voucher_type     TEXT NOT NULL CHECK (voucher_type IN ('receipt', 'payment')),
  amount           NUMERIC(14,2) NOT NULL,
  voucher_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  voucher_no       TEXT,
  description      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
--  8. EXPENSES
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category         TEXT NOT NULL,    -- Salary, Electricity, Maintenance, etc.
  amount           NUMERIC(14,2) NOT NULL,
  expense_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  paid_to          TEXT,
  description      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
--  9. RATE ADJUSTMENTS  (product price history)
-- ============================================================
CREATE TABLE IF NOT EXISTS rate_adjustments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id       UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  old_rate         NUMERIC(10,2) NOT NULL,
  new_rate         NUMERIC(10,2) NOT NULL,
  effective_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  reason           TEXT,
  adjusted_by      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
--  AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'companies','accounts','products','machines',
    'purchases','sales','vouchers','expenses'
  ] LOOP
    EXECUTE format(
      'CREATE OR REPLACE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION update_updated_at();', t, t
    );
  END LOOP;
END;
$$;


-- ============================================================
--  INDEXES  (for fast lookups)
-- ============================================================

-- Companies
CREATE INDEX IF NOT EXISTS idx_companies_pump_code ON companies(pump_code);
CREATE INDEX IF NOT EXISTS idx_companies_email     ON companies(email);

-- Accounts
CREATE INDEX IF NOT EXISTS idx_accounts_company    ON accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type       ON accounts(company_id, account_type);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_company    ON products(company_id);

-- Machines
CREATE INDEX IF NOT EXISTS idx_machines_company    ON machines(company_id);
CREATE INDEX IF NOT EXISTS idx_machines_product    ON machines(product_id);

-- Purchases
CREATE INDEX IF NOT EXISTS idx_purchases_company   ON purchases(company_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product   ON purchases(company_id, product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier  ON purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date      ON purchases(company_id, purchase_date);

-- Sales
CREATE INDEX IF NOT EXISTS idx_sales_company       ON sales(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_product       ON sales(company_id, product_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer      ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_date          ON sales(company_id, sale_date);

-- Vouchers
CREATE INDEX IF NOT EXISTS idx_vouchers_company    ON vouchers(company_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_account    ON vouchers(account_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_date       ON vouchers(company_id, voucher_date);

-- Expenses
CREATE INDEX IF NOT EXISTS idx_expenses_company    ON expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date       ON expenses(company_id, expense_date);

-- Rate Adjustments
CREATE INDEX IF NOT EXISTS idx_rate_adj_product    ON rate_adjustments(company_id, product_id);


-- ============================================================
--  ROW LEVEL SECURITY (RLS)
--  Each company only sees its own data
-- ============================================================

-- Enable RLS on every table
ALTER TABLE companies        ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines         ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales            ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_adjustments ENABLE ROW LEVEL SECURITY;

-- Companies: a user can only read their own company row
-- (pump_code stored in JWT custom claim "pump_code")
CREATE POLICY "company_self_access" ON companies
  FOR ALL USING (pump_code = current_setting('app.pump_code', TRUE));

-- Helper: reusable check
-- All child tables: only rows belonging to the authenticated company
CREATE POLICY "accounts_company_access" ON accounts
  FOR ALL USING (
    company_id = (
      SELECT id FROM companies
      WHERE pump_code = current_setting('app.pump_code', TRUE)
    )
  );

CREATE POLICY "products_company_access" ON products
  FOR ALL USING (
    company_id = (
      SELECT id FROM companies
      WHERE pump_code = current_setting('app.pump_code', TRUE)
    )
  );

CREATE POLICY "machines_company_access" ON machines
  FOR ALL USING (
    company_id = (
      SELECT id FROM companies
      WHERE pump_code = current_setting('app.pump_code', TRUE)
    )
  );

CREATE POLICY "purchases_company_access" ON purchases
  FOR ALL USING (
    company_id = (
      SELECT id FROM companies
      WHERE pump_code = current_setting('app.pump_code', TRUE)
    )
  );

CREATE POLICY "sales_company_access" ON sales
  FOR ALL USING (
    company_id = (
      SELECT id FROM companies
      WHERE pump_code = current_setting('app.pump_code', TRUE)
    )
  );

CREATE POLICY "vouchers_company_access" ON vouchers
  FOR ALL USING (
    company_id = (
      SELECT id FROM companies
      WHERE pump_code = current_setting('app.pump_code', TRUE)
    )
  );

CREATE POLICY "expenses_company_access" ON expenses
  FOR ALL USING (
    company_id = (
      SELECT id FROM companies
      WHERE pump_code = current_setting('app.pump_code', TRUE)
    )
  );

CREATE POLICY "rate_adj_company_access" ON rate_adjustments
  FOR ALL USING (
    company_id = (
      SELECT id FROM companies
      WHERE pump_code = current_setting('app.pump_code', TRUE)
    )
  );


-- ============================================================
--  VIEWS  (for Reports)
-- ============================================================

-- Monthly Sales Summary
CREATE OR REPLACE VIEW v_monthly_sales_summary AS
SELECT
  s.company_id,
  DATE_TRUNC('month', s.sale_date) AS month,
  p.name                           AS product_name,
  SUM(s.quantity)                  AS total_quantity,
  SUM(s.net_amount)                AS total_amount,
  COUNT(*)                         AS transaction_count
FROM sales s
JOIN products p ON p.id = s.product_id
GROUP BY s.company_id, DATE_TRUNC('month', s.sale_date), p.name;

-- Cash Receivable (customers who owe money)
CREATE OR REPLACE VIEW v_cash_receivable AS
SELECT
  a.company_id,
  a.id          AS account_id,
  a.name        AS customer_name,
  a.phone,
  a.current_balance AS amount_due
FROM accounts a
WHERE a.account_type = 'customer'
  AND a.current_balance > 0;

-- Cash Payable (suppliers we owe money to)
CREATE OR REPLACE VIEW v_cash_payable AS
SELECT
  a.company_id,
  a.id          AS account_id,
  a.name        AS supplier_name,
  a.phone,
  a.current_balance AS amount_payable
FROM accounts a
WHERE a.account_type = 'supplier'
  AND a.current_balance > 0;

-- Profit on Sales (sale revenue - purchase cost)
CREATE OR REPLACE VIEW v_profit_on_sales AS
SELECT
  s.company_id,
  s.sale_date,
  p.name           AS product_name,
  s.quantity,
  s.rate           AS sale_rate,
  p.purchase_rate,
  s.net_amount     AS sale_amount,
  (p.purchase_rate * s.quantity) AS cost_amount,
  (s.net_amount - (p.purchase_rate * s.quantity)) AS gross_profit
FROM sales s
JOIN products p ON p.id = s.product_id;

-- Stock Summary
CREATE OR REPLACE VIEW v_stock_summary AS
SELECT
  p.company_id,
  p.id,
  p.name,
  p.unit,
  p.current_stock,
  p.rate,
  p.purchase_rate,
  (p.current_stock * p.rate) AS stock_value
FROM products p
WHERE p.is_active = TRUE;

-- Daily Summary Sheet
CREATE OR REPLACE VIEW v_daily_summary AS
SELECT
  s.company_id,
  s.sale_date                          AS summary_date,
  SUM(s.net_amount)                    AS total_sales,
  COUNT(*)                             AS sale_count,
  SUM(CASE WHEN s.payment_mode = 'cash'   THEN s.net_amount ELSE 0 END) AS cash_sales,
  SUM(CASE WHEN s.payment_mode = 'credit' THEN s.net_amount ELSE 0 END) AS credit_sales,
  SUM(CASE WHEN s.payment_mode = 'upi'    THEN s.net_amount ELSE 0 END) AS upi_sales,
  SUM(CASE WHEN s.payment_mode = 'bank'   THEN s.net_amount ELSE 0 END) AS bank_sales
FROM sales s
GROUP BY s.company_id, s.sale_date;


-- ============================================================
--  STOCK TRIGGER — auto-adjust product stock on sale/purchase
-- ============================================================

-- Decrease stock on new sale
CREATE OR REPLACE FUNCTION trg_sale_stock_decrease()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET current_stock = current_stock - NEW.quantity,
      updated_at    = NOW()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_after_sale_insert
AFTER INSERT ON sales
FOR EACH ROW EXECUTE FUNCTION trg_sale_stock_decrease();

-- Restore stock when sale is deleted
CREATE OR REPLACE FUNCTION trg_sale_stock_restore()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET current_stock = current_stock + OLD.quantity,
      updated_at    = NOW()
  WHERE id = OLD.product_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_after_sale_delete
AFTER DELETE ON sales
FOR EACH ROW EXECUTE FUNCTION trg_sale_stock_restore();

-- Increase stock on new purchase
CREATE OR REPLACE FUNCTION trg_purchase_stock_increase()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET current_stock = current_stock + NEW.quantity,
      updated_at    = NOW()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_after_purchase_insert
AFTER INSERT ON purchases
FOR EACH ROW EXECUTE FUNCTION trg_purchase_stock_increase();

-- Restore stock when purchase is deleted
CREATE OR REPLACE FUNCTION trg_purchase_stock_restore()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET current_stock = current_stock - OLD.quantity,
      updated_at    = NOW()
  WHERE id = OLD.product_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_after_purchase_delete
AFTER DELETE ON purchases
FOR EACH ROW EXECUTE FUNCTION trg_purchase_stock_restore();


-- ============================================================
--  BALANCE TRIGGER — auto-adjust account balance
-- ============================================================

-- Credit sale → increase customer balance (they owe us)
CREATE OR REPLACE FUNCTION trg_sale_balance_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_mode = 'credit' AND NEW.customer_id IS NOT NULL THEN
    UPDATE accounts
    SET current_balance = current_balance + NEW.net_amount,
        updated_at      = NOW()
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_after_sale_balance
AFTER INSERT ON sales
FOR EACH ROW EXECUTE FUNCTION trg_sale_balance_update();

-- Purchase on credit → increase supplier balance (we owe them)
CREATE OR REPLACE FUNCTION trg_purchase_balance_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_mode = 'credit' AND NEW.supplier_id IS NOT NULL THEN
    UPDATE accounts
    SET current_balance = current_balance + NEW.total_amount,
        updated_at      = NOW()
    WHERE id = NEW.supplier_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_after_purchase_balance
AFTER INSERT ON purchases
FOR EACH ROW EXECUTE FUNCTION trg_purchase_balance_update();

-- Voucher receipt → decrease customer balance (they paid us)
-- Voucher payment → decrease supplier balance (we paid them)
CREATE OR REPLACE FUNCTION trg_voucher_balance_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.account_id IS NOT NULL THEN
    IF NEW.voucher_type = 'receipt' THEN
      UPDATE accounts
      SET current_balance = current_balance - NEW.amount,
          updated_at      = NOW()
      WHERE id = NEW.account_id;
    ELSIF NEW.voucher_type = 'payment' THEN
      UPDATE accounts
      SET current_balance = current_balance - NEW.amount,
          updated_at      = NOW()
      WHERE id = NEW.account_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_after_voucher_balance
AFTER INSERT ON vouchers
FOR EACH ROW EXECUTE FUNCTION trg_voucher_balance_update();


-- ============================================================
--  SEED — Default Products (run once per new company)
--  Replace 'YOUR_COMPANY_ID' with the actual company UUID
-- ============================================================

/*  EXAMPLE — uncomment and replace UUID after creating a company:

INSERT INTO products (company_id, name, unit, hsn_code, current_stock, rate, purchase_rate) VALUES
  ('YOUR_COMPANY_ID', 'Petrol',              'Ltr', '27101249', 0, 0, 0),
  ('YOUR_COMPANY_ID', 'Hi Speed Diesel',     'Ltr', '27101941', 0, 0, 0),
  ('YOUR_COMPANY_ID', 'Super Petrol',        'Ltr', '27101249', 0, 0, 0),
  ('YOUR_COMPANY_ID', 'Hi Octane Petrol',    'Ltr', '27101249', 0, 0, 0),
  ('YOUR_COMPANY_ID', 'Light Diesel Oil',    'Ltr', '27101941', 0, 0, 0),
  ('YOUR_COMPANY_ID', 'Kerosene Oil',        'Ltr', '27101921', 0, 0, 0),
  ('YOUR_COMPANY_ID', 'LPG',                 'Kg',  '27111300', 0, 0, 0),
  ('YOUR_COMPANY_ID', 'CNG',                 'Kg',  '27112100', 0, 0, 0);

*/


-- ============================================================
--  DONE ✓
--  Tables  : companies, accounts, products, machines,
--             purchases, sales, vouchers, expenses, rate_adjustments
--  Views   : v_monthly_sales_summary, v_cash_receivable,
--             v_cash_payable, v_profit_on_sales,
--             v_stock_summary, v_daily_summary
--  Triggers: stock auto-adjust (insert/delete on sales & purchases)
--            balance auto-adjust (credit sales, purchases, vouchers)
--            updated_at auto-refresh on all tables
--  Indexes : 18 indexes for fast report queries
--  RLS     : enabled on all 9 tables
-- ============================================================
