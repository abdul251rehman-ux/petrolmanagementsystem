'use client';
import { useRouter } from 'next/navigation';
import { getCompany, clearSession } from '../lib/store';
import { useState, useEffect, useRef } from 'react';

const IconMenu = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconFuel = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M3 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>
    <path d="M3 11h12"/>
    <path d="M13 6l4 4"/>
    <path d="M17 10v6a2 2 0 0 0 4 0v-4l-2-2"/>
  </svg>
);
const IconEdit = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconLock = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconLogout = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconChevron = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconBell = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

export default function Header({ onToggleSidebar }) {
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setCompany(getCompany());
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = () => {
    clearSession();
    router.push('/signin');
  };

  const initials = company?.businessName
    ? company.businessName.slice(0, 2).toUpperCase()
    : 'PS';

  return (
    <header style={{
      height: '64px',
      minHeight: '64px',
      background: 'linear-gradient(135deg, #0a1540 0%, #0f1f5c 60%, #1a237e 100%)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'relative',
      zIndex: 40,
      boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
    }}>
      {/* ── Left ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '9px',
            color: '#93c5fd',
            cursor: 'pointer',
            padding: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
        >
          <IconMenu />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white',
            boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
          }}>
            <IconFuel />
          </div>
          <div className="hidden sm:block">
            <span style={{ color: 'white', fontWeight: 800, fontSize: '15px', letterSpacing: '0.05em' }}>
              PETRO<span style={{ color: '#f59e0b' }}>STATION</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Center: Pump Code Badge ── */}
      {company && (
        <div
          className="hidden md:flex"
          style={{
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '999px',
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.3)',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 6px #10b981',
          }} />
          <span style={{ color: '#fcd34d', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em' }}>
            PUMP CODE:
          </span>
          <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: 800, letterSpacing: '0.18em' }}>
            {company.pumpCode || 'N/A'}
          </span>
        </div>
      )}

      {/* ── Right ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Bell */}
        <button
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '9px',
            color: '#93c5fd',
            cursor: 'pointer',
            padding: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
        >
          <IconBell />
        </button>

        {/* User dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '5px 10px 5px 5px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={e => { if (!showDropdown) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          >
            <div style={{
              width: '30px', height: '30px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white',
              fontWeight: 800, fontSize: '12px',
              letterSpacing: '0.02em',
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div className="hidden sm:block" style={{ textAlign: 'left' }}>
              <div style={{ color: 'white', fontSize: '12px', fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {company?.businessName || 'Admin'}
              </div>
              <div style={{ color: '#64748b', fontSize: '10px' }}>Administrator</div>
            </div>
            <span style={{ color: '#64748b' }}><IconChevron /></span>
          </button>

          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '220px',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '14px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
                overflow: 'hidden',
                zIndex: 100,
                animation: 'slideInDown 0.2s ease',
              }}
            >
              {/* Header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #334155', background: 'rgba(15,31,92,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 800, fontSize: '14px',
                  }}>
                    {initials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: 'white', fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {company?.businessName || 'Admin'}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {company?.email || ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              {[
                { label: 'Edit Profile', icon: <IconEdit />, href: '/dashboard/security/company-info', color: '#93c5fd' },
                { label: 'Change Password', icon: <IconLock />, href: '/dashboard/security/change-password', color: '#93c5fd' },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => { setShowDropdown(false); router.push(item.href); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%',
                    padding: '11px 16px',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: '#cbd5e1', fontSize: '13px', fontWeight: 500,
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}
                >
                  <span style={{ color: item.color, opacity: 0.8 }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}

              <div style={{ borderTop: '1px solid #334155' }}>
                <button
                  onClick={() => { setShowDropdown(false); handleSignOut(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%',
                    padding: '11px 16px',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: '#f87171', fontSize: '13px', fontWeight: 600,
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <IconLogout />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick sign out button */}
        <button
          onClick={handleSignOut}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 12px',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '9px',
            color: '#fca5a5',
            fontSize: '12px', fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.22)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
        >
          <IconLogout />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
