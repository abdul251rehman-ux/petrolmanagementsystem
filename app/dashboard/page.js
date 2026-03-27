'use client';
import { useState, useEffect } from 'react';
import { getDashboardSummary, getCompany } from '../../lib/store';
import Link from 'next/link';

const fmt = (n) => new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

// ── Icons ──────────────────────────────────────
const IconUsers = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconCart = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const IconTrending = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconExpense = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const IconFuel = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M3 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>
    <path d="M3 11h12"/><path d="M13 6l4 4"/>
    <path d="M17 10v6a2 2 0 0 0 4 0v-4l-2-2"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconBarrel = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 2C6.5 2 2 4.5 2 7v10c0 2.5 4.5 5 10 5s10-2.5 10-5V7c0-2.5-4.5-5-10-5z"/>
    <path d="M2 7c0 2.5 4.5 5 10 5s10-2.5 10-5"/>
    <path d="M2 12c0 2.5 4.5 5 10 5s10-2.5 10-5"/>
  </svg>
);
const IconCash = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const IconArrowRight = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconArrowUp = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
  </svg>
);
const IconLightning = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconManage = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

// ── Stat Card ──────────────────────────────────
function StatCard({ Icon, label, value, color, bgGrad, iconBg, sub, accentColor }) {
  return (
    <div className="ps-stat-card" style={{ cursor: 'default', borderBottom: `3px solid ${accentColor}` }}>
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{
            width: '48px', height: '48px',
            borderRadius: '14px',
            background: iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accentColor,
            boxShadow: `0 4px 12px ${accentColor}30`,
          }}>
            <Icon />
          </div>
          <span style={{
            display: 'flex', alignItems: 'center', gap: '3px',
            fontSize: '11px', fontWeight: 600,
            color: '#10b981',
            background: '#dcfce7',
            padding: '3px 8px',
            borderRadius: '99px',
          }}>
            <IconArrowUp /> Live
          </span>
        </div>
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>
          {label}
        </p>
        <p style={{ fontSize: '22px', fontWeight: 800, color, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          {value}
        </p>
        {sub && <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Stock Row ──────────────────────────────────
function StockRow({ name, stock, unit, rate }) {
  const value = stock * rate;
  const isLow = stock < 500;
  const isEmpty = stock === 0;
  return (
    <tr>
      <td style={{ padding: '13px 16px', color: '#1e293b', fontWeight: 600, fontSize: '13px' }}>{name}</td>
      <td style={{ padding: '13px 16px', textAlign: 'right' }}>
        <span style={{
          fontWeight: 700, fontSize: '13px',
          color: isEmpty ? '#ef4444' : isLow ? '#f59e0b' : '#10b981',
        }}>
          {fmt(stock)}
        </span>
        <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '4px' }}>{unit}</span>
      </td>
      <td style={{ padding: '13px 16px', textAlign: 'right', color: '#475569', fontSize: '13px' }}>
        Rs. {fmt(rate)}
      </td>
      <td style={{ padding: '13px 16px', textAlign: 'right', fontWeight: 700, color: '#0f1f5c', fontSize: '13px' }}>
        Rs. {fmt(value)}
      </td>
      <td style={{ padding: '13px 16px', textAlign: 'center' }}>
        {isEmpty ? (
          <span className="badge badge-danger">Out of Stock</span>
        ) : isLow ? (
          <span className="badge badge-warning">Low Stock</span>
        ) : (
          <span className="badge badge-success">Available</span>
        )}
      </td>
    </tr>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [company, setCompany] = useState(null);
  const [now, setNow] = useState('');

  useEffect(() => {
    setSummary(getDashboardSummary());
    setCompany(getCompany());
    setNow(new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  if (!summary) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: '32px', height: '32px', borderTopColor: '#0f1f5c', borderColor: '#e2e8f0', borderWidth: '3px', margin: '0 auto 12px' }} />
        <p style={{ color: '#64748b', fontSize: '14px' }}>Loading dashboard...</p>
      </div>
    </div>
  );

  const totalStockValue = summary.stockDetails.reduce((s, d) => s + d.stock * d.rate, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Welcome Banner ── */}
      <div style={{
        borderRadius: '18px',
        padding: '28px 32px',
        background: 'linear-gradient(135deg, #0a1540 0%, #0f1f5c 50%, #1a237e 100%)',
        boxShadow: '0 8px 32px rgba(15,31,92,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '16px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute', right: '-40px', top: '-40px',
          width: '200px', height: '200px',
          borderRadius: '50%',
          background: 'rgba(245,158,11,0.06)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: '60px', bottom: '-60px',
          width: '160px', height: '160px',
          borderRadius: '50%',
          background: 'rgba(245,158,11,0.04)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '18px', fontWeight: 800,
              boxShadow: '0 4px 16px rgba(245,158,11,0.5)',
            }}>
              {company?.businessName?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div>
              <h1 style={{ color: 'white', fontWeight: 800, fontSize: '20px', margin: 0, letterSpacing: '-0.01em' }}>
                Welcome back, {company?.businessName || 'Admin'}
              </h1>
              <p style={{ color: '#93c5fd', fontSize: '13px', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconCalendar /> {now}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px', borderRadius: '999px',
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.35)',
              color: '#fcd34d', fontSize: '12px', fontWeight: 700,
              letterSpacing: '0.1em',
            }}>
              <IconFuel /> Pump Code: {company?.pumpCode}
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '5px 12px', borderRadius: '999px',
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#6ee7b7', fontSize: '12px', fontWeight: 600,
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', display: 'inline-block' }} />
              System Online
            </span>
          </div>
        </div>

        <div className="hidden md:flex" style={{ gap: '10px' }}>
          <Link
            href="/dashboard/sales/add"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white', fontWeight: 700, fontSize: '13px',
              borderRadius: '10px', textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(245,158,11,0.4)',
            }}
          >
            <IconTrending /> Add Sale
          </Link>
          <Link
            href="/dashboard/purchase/add"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '10px 18px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', fontWeight: 600, fontSize: '13px',
              borderRadius: '10px', textDecoration: 'none',
            }}
          >
            <IconCart /> Add Purchase
          </Link>
        </div>
      </div>

      {/* ── Monthly Summary ── */}
      <div className="ps-card">
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #0f1f5c, #1e3a8a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            }}>
              <IconCalendar />
            </div>
            <h2 style={{ fontWeight: 700, fontSize: '15px', color: '#0f1f5c', margin: 0 }}>
              Monthly Sales Summary
            </h2>
          </div>
          <span style={{
            fontSize: '11px', fontWeight: 600, color: '#64748b',
            background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px',
          }}>
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { label: 'Total Sale Amount', value: `Rs. ${fmt(summary.monthlySaleAmt)}`, color: '#10b981', bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', iconBg: '#10b981', Icon: IconCash },
            { label: 'Petrol Sold', value: `${fmt(summary.petrolLtr)} Ltr`, color: '#0f1f5c', bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)', iconBg: '#0f1f5c', Icon: IconFuel },
            { label: 'Diesel Sold', value: `${fmt(summary.dieselLtr)} Ltr`, color: '#d97706', bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)', iconBg: '#f59e0b', Icon: IconBarrel },
          ].map((item, i) => (
            <div
              key={item.label}
              style={{
                padding: '20px',
                background: item.bg,
                borderRight: i < 2 ? '1px solid #f1f5f9' : 'none',
                textAlign: 'center',
              }}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: item.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', margin: '0 auto 10px',
                boxShadow: `0 4px 12px ${item.iconBg}60`,
              }}>
                <item.Icon />
              </div>
              <p style={{ fontSize: '22px', fontWeight: 800, color: item.color, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                {item.value}
              </p>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="lg:grid-cols-4">
        <StatCard
          Icon={IconUsers}
          label="Total Accounts"
          value={summary.accountsCount}
          color="#0f1f5c"
          iconBg="#eff6ff"
          accentColor="#0f1f5c"
          sub="Customers & Suppliers"
        />
        <StatCard
          Icon={IconCart}
          label="Total Purchases"
          value={`Rs. ${fmt(summary.totalPurchaseAmt)}`}
          color="#7c3aed"
          iconBg="#f5f3ff"
          accentColor="#7c3aed"
          sub="All time"
        />
        <StatCard
          Icon={IconTrending}
          label="Total Sales"
          value={`Rs. ${fmt(summary.totalSaleAmt)}`}
          color="#10b981"
          iconBg="#f0fdf4"
          accentColor="#10b981"
          sub="All time"
        />
        <StatCard
          Icon={IconExpense}
          label="Total Expenses"
          value={`Rs. ${fmt(summary.totalExpenseAmt)}`}
          color="#ef4444"
          iconBg="#fef2f2"
          accentColor="#ef4444"
          sub="All time"
        />
      </div>

      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }} className="xl:grid-cols-3">
        {/* Stock Table */}
        <div className="ps-card xl:col-span-2">
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              }}>
                <IconBarrel />
              </div>
              <h2 style={{ fontWeight: 700, fontSize: '15px', color: '#0f1f5c', margin: 0 }}>
                Stock Details
              </h2>
            </div>
            <Link
              href="/dashboard/products/manage"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontSize: '12px', fontWeight: 600, color: '#0f1f5c', textDecoration: 'none',
                padding: '5px 10px', borderRadius: '7px', background: '#f1f5f9',
              }}
            >
              Manage <IconArrowRight />
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="ps-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: 'right' }}>Stock</th>
                  <th style={{ textAlign: 'right' }}>Rate</th>
                  <th style={{ textAlign: 'right' }}>Value</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.stockDetails.map(d => (
                  <StockRow key={d.name} {...d} />
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ padding: '14px 16px', fontWeight: 700, fontSize: '13px', color: '#0f1f5c' }}>
                    Total Stock Value
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: '#10b981', fontSize: '14px' }}>
                    Rs. {fmt(totalStockValue)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Cash in Hand */}
          <div className="ps-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              }}>
                <IconCash />
              </div>
              <h2 style={{ fontWeight: 700, fontSize: '15px', color: '#0f1f5c', margin: 0 }}>
                Cash in Hand
              </h2>
            </div>
            <div style={{
              borderRadius: '14px',
              padding: '20px',
              background: 'linear-gradient(135deg, #0a1540, #0f1f5c)',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(15,31,92,0.3)',
            }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: '#93c5fd', textTransform: 'uppercase', margin: '0 0 8px' }}>
                Available Cash
              </p>
              <p style={{ fontSize: '30px', fontWeight: 800, color: 'white', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                Rs. {fmt(summary.cashInHand > 0 ? summary.cashInHand : 0)}
              </p>
              {summary.cashInHand < 0 && (
                <p style={{ fontSize: '12px', color: '#fca5a5', margin: '4px 0 0' }}>Cash deficit</p>
              )}
            </div>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                href="/dashboard/vouchers?type=receipt"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 14px', borderRadius: '10px',
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                  color: '#15803d', textDecoration: 'none', fontSize: '13px', fontWeight: 600,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#dcfce7'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  Cash Receipt
                </span>
                <IconArrowRight />
              </Link>
              <Link
                href="/dashboard/vouchers?type=payment"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 14px', borderRadius: '10px',
                  background: '#fef2f2', border: '1px solid #fecaca',
                  color: '#b91c1c', textDecoration: 'none', fontSize: '13px', fontWeight: 600,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                  Cash Payment
                </span>
                <IconArrowRight />
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="ps-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              }}>
                <IconLightning />
              </div>
              <h2 style={{ fontWeight: 700, fontSize: '15px', color: '#0f1f5c', margin: 0 }}>
                Quick Actions
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Add Sale',     href: '/dashboard/sales/add',      Icon: IconTrending, color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
                { label: 'Add Purchase', href: '/dashboard/purchase/add',   Icon: IconCart,     color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
                { label: 'Add Account', href: '/dashboard/accounts/add',    Icon: IconUsers,    color: '#0f1f5c', bg: '#eff6ff', border: '#bfdbfe' },
                { label: 'Reports',     href: '/dashboard/reports/summary-sheet', Icon: IconManage, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
              ].map(a => (
                <Link
                  key={a.label}
                  href={a.href}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px',
                    padding: '14px 10px', borderRadius: '12px',
                    background: a.bg, border: `1px solid ${a.border}`,
                    textDecoration: 'none', textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <span style={{ color: a.color }}><a.Icon /></span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: a.color }}>{a.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
