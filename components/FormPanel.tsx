'use client';

import React, { useState, useCallback } from 'react';
import type { InvoiceState, LineItem, Currency, Theme, Template } from '@/lib/types';
import { CURRENCY_SYMBOLS, formatCurrency, calcTotals } from '@/lib/utils';

interface FormPanelProps {
  state: InvoiceState;
  onChange: (updates: Partial<InvoiceState>) => void;
  onAddItem: () => void;
  onRemoveItem: (id: number) => void;
  onUpdateItem: (id: number, field: keyof LineItem, value: string | number) => void;
  mobileVisible: boolean;
}

function ChevronIcon() {
  return (
    <svg className="card-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

interface CardProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Card({ id, title, icon, collapsed, onToggle, children }: CardProps) {
  return (
    <div className={`card${collapsed ? ' collapsed' : ''}`} id={id}>
      <div className="card-header" onClick={onToggle}>
        <div className="card-header-left">
          <div className="card-icon">{icon}</div>
          <span className="card-title">{title}</span>
        </div>
        <ChevronIcon />
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

const THEMES: { id: Theme; color: string; label: string }[] = [
  { id: 't-blue',    color: '#0057FF', label: 'Blueprint Blue' },
  { id: 't-dark',    color: '#1E293B', label: 'Midnight Dark' },
  { id: 't-teal',    color: '#0891B2', label: 'Ocean Teal' },
  { id: 't-emerald', color: '#059669', label: 'Emerald Green' },
  { id: 't-violet',  color: '#7C3AED', label: 'Violet' },
  { id: 't-rose',    color: '#E11D48', label: 'Rose Red' },
];

const TEMPLATES: { id: Template; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'modern',  label: 'Modern'  },
  // { id: 'bold',    label: 'Bold'    },
  { id: 'minimal', label: 'Minimal' },
];

function ThumbClassic() {
  return (
    <svg viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="60" height="40" fill="#F4F5F8"/>
      <rect width="60" height="11" fill="#0057FF" opacity="0.8"/>
      <rect x="38" y="3" width="18" height="5" rx="1" fill="white" opacity="0.3"/>
      <rect x="4" y="3.5" width="16" height="3" rx="1" fill="white" opacity="0.6"/>
      <rect x="4" y="15" width="22" height="2.5" rx="1" fill="#D1D5DB"/>
      <rect x="4" y="19.5" width="16" height="1.5" rx="1" fill="#E5E7EB"/>
      <rect x="4" y="25" width="52" height="0.8" fill="#E5E7EB"/>
      <rect x="4" y="29" width="45" height="0.8" fill="#E5E7EB"/>
      <rect x="33" y="33" width="23" height="5" rx="2" fill="#0057FF" opacity="0.2"/>
    </svg>
  );
}

function ThumbModern() {
  return (
    <svg viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="60" height="40" fill="#F4F5F8"/>
      <rect width="60" height="17" fill="#0057FF" opacity="0.85"/>
      <rect x="4" y="4" width="20" height="3" rx="1" fill="white" opacity="0.7"/>
      <rect x="4" y="9" width="28" height="2" rx="1" fill="white" opacity="0.35"/>
      <rect x="38" y="4" width="18" height="9" rx="1" fill="white" opacity="0.15"/>
      <rect x="4" y="21" width="18" height="2" rx="1" fill="#D1D5DB"/>
      <rect x="4" y="27" width="52" height="0.8" fill="#E5E7EB"/>
      <rect x="4" y="31" width="44" height="0.8" fill="#E5E7EB"/>
      <rect x="34" y="35" width="22" height="4" rx="2" fill="#0057FF" opacity="0.2"/>
    </svg>
  );
}

function ThumbBold() {
  return (
    <svg viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="60" height="40" fill="#F4F5F8"/>
      <rect width="18" height="40" fill="#0057FF" opacity="0.85"/>
      <rect x="3" y="5" width="12" height="3" rx="1" fill="white" opacity="0.5"/>
      <rect x="3" y="11" width="10" height="2" rx="1" fill="white" opacity="0.3"/>
      <rect x="3" y="16" width="12" height="1.5" rx="1" fill="white" opacity="0.25"/>
      <rect x="22" y="6" width="30" height="2.5" rx="1" fill="#D1D5DB"/>
      <rect x="22" y="13" width="34" height="0.8" fill="#E5E7EB"/>
      <rect x="22" y="18" width="28" height="0.8" fill="#E5E7EB"/>
      <rect x="22" y="23" width="31" height="0.8" fill="#E5E7EB"/>
      <rect x="28" y="29" width="28" height="5" rx="2" fill="#0057FF" opacity="0.2"/>
    </svg>
  );
}

function ThumbMinimal() {
  return (
    <svg viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="60" height="40" fill="#F4F5F8"/>
      <rect x="4" y="4" width="20" height="3" rx="1" fill="#374151" opacity="0.85"/>
      <rect x="4" y="9" width="30" height="1.5" rx="1" fill="#D1D5DB"/>
      <line x1="4" y1="15" x2="56" y2="15" stroke="#E5E7EB" strokeWidth="1"/>
      <rect x="4" y="18" width="12" height="1.5" rx="1" fill="#9CA3AF"/>
      <rect x="4" y="22.5" width="52" height="0.8" fill="#E5E7EB"/>
      <rect x="4" y="27" width="44" height="0.8" fill="#E5E7EB"/>
      <line x1="4" y1="32" x2="56" y2="32" stroke="#E5E7EB" strokeWidth="0.5"/>
      <rect x="32" y="35" width="24" height="3" rx="1" fill="#374151" opacity="0.65"/>
    </svg>
  );
}

const THUMB_MAP: Record<Template, () => React.ReactElement> = {
  classic: ThumbClassic,
  modern:  ThumbModern,
  bold:    ThumbBold,
  minimal: ThumbMinimal,
};

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
  { value: 'INR', label: '₹ INR' },
  { value: 'AED', label: 'D AED' },
  { value: 'CAD', label: '$ CAD' },
  { value: 'AUD', label: '$ AUD' },
  { value: 'SGD', label: '$ SGD' },
  { value: 'JPY', label: '¥ JPY' },
];

export default function FormPanel({ state, onChange, onAddItem, onRemoveItem, onUpdateItem, mobileVisible }: FormPanelProps) {
  const ALL_CARDS = ['style', 'from', 'to', 'details', 'items', 'totals', 'notes'];
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set(['from', 'to', 'details', 'items', 'totals', 'notes']));
  const [dragOver, setDragOver] = useState(false);

  const toggleCard = (id: string) => {
    setCollapsed(prev => {
      if (!prev.has(id)) {
        // Already open — close it
        return new Set([...prev, id]);
      }
      // Open this one, collapse everything else
      return new Set(ALL_CARDS.filter(c => c !== id));
    });
  };

  const handleLogoFile = useCallback((file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 4 * 1024 * 1024) { alert('File too large. Max 4 MB.'); return; }
    const reader = new FileReader();
    reader.onload = e => onChange({ logoDataUrl: e.target?.result as string });
    reader.readAsDataURL(file);
  }, [onChange]);

  const fmt = (n: number) => formatCurrency(n, state.currency);
  const totals = calcTotals(state);
  const currencySymbol = CURRENCY_SYMBOLS[state.currency] ?? '$';

  return (
    <aside className={`form-panel${mobileVisible ? ' mobile-visible' : ''}`}>
      <div className="form-panel-inner">

        {/* Customize Style */}
        <Card
          id="card-style" title="Customize Style" collapsed={collapsed.has('style')}
          onToggle={() => toggleCard('style')}
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>}
        >
          <div className="form-group">
            <label className="form-label">Invoice Template</label>
            <div className="template-grid">
              {TEMPLATES.map(t => {
                const Thumb = THUMB_MAP[t.id];
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`template-card${state.template === t.id ? ' active' : ''}`}
                    onClick={() => onChange({ template: t.id })}
                  >
                    <div className="template-thumb"><Thumb /></div>
                    <span className="template-name">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Color Theme</label>
            <div className="theme-picker">
              {THEMES.map(t => (
                <div
                  key={t.id}
                  className={`theme-swatch${state.theme === t.id ? ' active' : ''}`}
                  style={{ background: t.color }}
                  title={t.label}
                  onClick={() => onChange({ theme: t.id })}
                />
              ))}
              <label
                className={`theme-swatch theme-swatch-custom${state.theme === 't-custom' ? ' active' : ''}`}
                style={{ background: state.theme === 't-custom' ? state.customColor : 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}
                title="Custom Color"
              >
                <input
                  type="color"
                  value={state.customColor}
                  onChange={e => onChange({ theme: 't-custom', customColor: e.target.value })}
                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                />
              </label>
            </div>
          </div>
        </Card>

        {/* Your Business */}
        <Card
          id="card-from" title="Your Business" collapsed={collapsed.has('from')}
          onToggle={() => toggleCard('from')}
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}
        >
          <div className="form-group">
            <label className="form-label">Company Logo</label>
            {state.logoDataUrl ? (
              <div className="logo-preview-wrap">
                <img src={state.logoDataUrl} className="logo-preview-img" alt="Logo" />
                <span className="logo-preview-name">Logo uploaded</span>
                <button className="logo-remove-btn" onClick={() => onChange({ logoDataUrl: null })} title="Remove">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ) : (
              <div
                className={`logo-upload-area${dragOver ? ' drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleLogoFile(e.dataTransfer.files[0]); }}
              >
                <input type="file" accept="image/*" onChange={e => handleLogoFile(e.target.files?.[0] ?? null)} />
                <svg className="upload-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <div className="upload-text">Click or drag to upload logo</div>
                <div className="upload-hint">PNG, JPG, SVG — max 4 MB</div>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Business Name</label>
            <input className="form-input" placeholder="Acme Corp" value={state.fromName} onChange={e => onChange({ fromName: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="form-textarea" rows={3} placeholder={"123 Main Street\nCity, State 10001\nCountry"} value={state.fromAddress} onChange={e => onChange({ fromAddress: e.target.value })} />
          </div>
          <div className="form-row cols-2">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="hello@company.com" value={state.fromEmail} onChange={e => onChange({ fromEmail: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" className="form-input" placeholder="+1 555 000 0000" value={state.fromPhone} onChange={e => onChange({ fromPhone: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Website</label>
            <input type="url" className="form-input" placeholder="www.company.com" value={state.fromWebsite} onChange={e => onChange({ fromWebsite: e.target.value })} />
          </div>
        </Card>

        {/* Bill To */}
        <Card
          id="card-to" title="Bill To" collapsed={collapsed.has('to')}
          onToggle={() => toggleCard('to')}
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
        >
          <div className="form-group">
            <label className="form-label">Client / Company Name</label>
            <input className="form-input" placeholder="Client Company Ltd." value={state.toName} onChange={e => onChange({ toName: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="form-textarea" rows={3} placeholder={"456 Client Ave\nCity, State 20002\nCountry"} value={state.toAddress} onChange={e => onChange({ toAddress: e.target.value })} />
          </div>
          <div className="form-row cols-2">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="billing@client.com" value={state.toEmail} onChange={e => onChange({ toEmail: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" className="form-input" placeholder="+1 555 000 0000" value={state.toPhone} onChange={e => onChange({ toPhone: e.target.value })} />
            </div>
          </div>
        </Card>

        {/* Invoice Details */}
        <Card
          id="card-details" title="Invoice Details" collapsed={collapsed.has('details')}
          onToggle={() => toggleCard('details')}
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
        >
          <div className="form-row cols-2">
            <div className="form-group">
              <label className="form-label">Invoice #</label>
              <input className="form-input" value={state.invoiceNumber} onChange={e => onChange({ invoiceNumber: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select className="form-select" value={state.currency} onChange={e => onChange({ currency: e.target.value as Currency })}>
                {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row cols-2">
            <div className="form-group">
              <label className="form-label">Issue Date</label>
              <input type="date" className="form-input" value={state.invoiceDate} onChange={e => onChange({ invoiceDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-input" value={state.dueDate} onChange={e => onChange({ dueDate: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">PO / Reference <span style={{ color: 'var(--muted-light)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
            <input className="form-input" placeholder="PO-2024-001" value={state.poNumber} onChange={e => onChange({ poNumber: e.target.value })} />
          </div>
        </Card>

        {/* Line Items */}
        <Card
          id="card-items" title="Line Items" collapsed={collapsed.has('items')}
          onToggle={() => toggleCard('items')}
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>}
        >
          <div className="items-table-wrap">
            <table className="items-table">
              <colgroup>
                <col />
                <col className="col-qty" />
                <col className="col-rate" />
                <col className="col-amount" />
                <col style={{ width: 36 }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {state.items.map(item => (
                  <tr key={item.id} className="item-row">
                    <td>
                      <input className="form-input" placeholder="Item or service" value={item.desc}
                        onChange={e => onUpdateItem(item.id, 'desc', e.target.value)} />
                    </td>
                    <td>
                      <input type="number" className="form-input" value={item.qty} min={0} step={0.01}
                        style={{ textAlign: 'right' }}
                        onChange={e => onUpdateItem(item.id, 'qty', parseFloat(e.target.value) || 0)} />
                    </td>
                    <td>
                      <input type="number" className="form-input" value={item.rate} min={0} step={0.01}
                        style={{ textAlign: 'right' }}
                        onChange={e => onUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} />
                    </td>
                    <td className="item-amount-cell">{fmt(item.qty * item.rate)}</td>
                    <td>
                      <button className="item-delete-btn" onClick={() => onRemoveItem(item.id)}
                        disabled={state.items.length <= 1} title="Remove item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="add-item-btn" onClick={onAddItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Line Item
          </button>
        </Card>

        {/* Tax & Totals */}
        <Card
          id="card-totals" title="Tax & Totals" collapsed={collapsed.has('totals')}
          onToggle={() => toggleCard('totals')}
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        >
          <div className="totals-section">
            <div className="totals-row">
              <span className="totals-label">Discount</span>
              <div className="input-with-type">
                <input type="number" className="form-input" value={state.discountValue} min={0} step={1}
                  style={{ flex: 1, minWidth: 0 }}
                  onChange={e => onChange({ discountValue: parseFloat(e.target.value) || 0 })} />
                <div className="type-toggle">
                  <button className={state.discountType === 'percent' ? 'active' : ''} onClick={() => onChange({ discountType: 'percent' })}>%</button>
                  <button className={state.discountType === 'fixed' ? 'active' : ''} onClick={() => onChange({ discountType: 'fixed' })}>{currencySymbol}</button>
                </div>
              </div>
            </div>
            <div className="totals-row">
              <span className="totals-label">Shipping</span>
              <input type="number" className="form-input" value={state.shippingValue} min={0} step={1}
                style={{ flex: 1 }}
                onChange={e => onChange({ shippingValue: parseFloat(e.target.value) || 0 })} />
            </div>
            {state.currency === 'INR' ? (
              <>
                <div className="totals-row">
                  <span className="totals-label">SGST</span>
                  <div className="input-with-type">
                    <input type="number" className="form-input" value={state.sgstValue} min={0} step={1}
                      style={{ flex: 1, minWidth: 0 }}
                      onChange={e => onChange({ sgstValue: parseFloat(e.target.value) || 0 })} />
                    <div className="type-toggle">
                      <button className={state.sgstType === 'percent' ? 'active' : ''} onClick={() => onChange({ sgstType: 'percent' })}>%</button>
                      <button className={state.sgstType === 'fixed' ? 'active' : ''} onClick={() => onChange({ sgstType: 'fixed' })}>{currencySymbol}</button>
                    </div>
                  </div>
                </div>
                <div className="totals-row">
                  <span className="totals-label">CGST</span>
                  <div className="input-with-type">
                    <input type="number" className="form-input" value={state.cgstValue} min={0} step={1}
                      style={{ flex: 1, minWidth: 0 }}
                      onChange={e => onChange({ cgstValue: parseFloat(e.target.value) || 0 })} />
                    <div className="type-toggle">
                      <button className={state.cgstType === 'percent' ? 'active' : ''} onClick={() => onChange({ cgstType: 'percent' })}>%</button>
                      <button className={state.cgstType === 'fixed' ? 'active' : ''} onClick={() => onChange({ cgstType: 'fixed' })}>{currencySymbol}</button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="totals-row">
                <span className="totals-label">Tax</span>
                <div className="input-with-type">
                  <input type="number" className="form-input" value={state.taxValue} min={0} step={1}
                    style={{ flex: 1, minWidth: 0 }}
                    onChange={e => onChange({ taxValue: parseFloat(e.target.value) || 0 })} />
                  <div className="type-toggle">
                    <button className={state.taxType === 'percent' ? 'active' : ''} onClick={() => onChange({ taxType: 'percent' })}>%</button>
                    <button className={state.taxType === 'fixed' ? 'active' : ''} onClick={() => onChange({ taxType: 'fixed' })}>{currencySymbol}</button>
                  </div>
                </div>
              </div>
            )}
            <div className="totals-divider" />
            <div className="total-summary">
              <div className="total-summary-row">
                <span className="ts-label">Subtotal</span>
                <span className="ts-value">{fmt(totals.subtotal)}</span>
              </div>
              {totals.discountAmt > 0 && (
                <div className="total-summary-row">
                  <span className="ts-label">Discount</span>
                  <span className="ts-value">−{fmt(totals.discountAmt)}</span>
                </div>
              )}
              {totals.shipping > 0 && (
                <div className="total-summary-row">
                  <span className="ts-label">Shipping</span>
                  <span className="ts-value">{fmt(totals.shipping)}</span>
                </div>
              )}
              {state.currency === 'INR' ? (
                <>
                  {totals.sgstAmt > 0 && (
                    <div className="total-summary-row">
                      <span className="ts-label">SGST{state.sgstType === 'percent' ? ` (${state.sgstValue}%)` : ''}</span>
                      <span className="ts-value">{fmt(totals.sgstAmt)}</span>
                    </div>
                  )}
                  {totals.cgstAmt > 0 && (
                    <div className="total-summary-row">
                      <span className="ts-label">CGST{state.cgstType === 'percent' ? ` (${state.cgstValue}%)` : ''}</span>
                      <span className="ts-value">{fmt(totals.cgstAmt)}</span>
                    </div>
                  )}
                </>
              ) : (
                totals.taxAmt > 0 && (
                  <div className="total-summary-row">
                    <span className="ts-label">Tax</span>
                    <span className="ts-value">{fmt(totals.taxAmt)}</span>
                  </div>
                )
              )}
              <div className="total-summary-row grand">
                <span className="ts-label">Total</span>
                <span className="ts-value">{fmt(totals.total)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Notes & Terms */}
        <Card
          id="card-notes" title="Notes & Terms" collapsed={collapsed.has('notes')}
          onToggle={() => toggleCard('notes')}
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
        >
          <div className="form-group">
            <label className="form-label">Notes to Client</label>
            <textarea className="form-textarea" placeholder="Thank you for your business!" value={state.notes} onChange={e => onChange({ notes: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Payment Terms</label>
            <textarea className="form-textarea" placeholder="Payment due within 30 days." value={state.terms} onChange={e => onChange({ terms: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Bank Details <span style={{ color: 'var(--muted-light)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
            <textarea className="form-textarea" rows={4} placeholder={"Bank: HDFC Bank\nAccount No: 1234567890\nIFSC: HDFC0001234\nBranch: MG Road, Bengaluru"} value={state.bankDetails} onChange={e => onChange({ bankDetails: e.target.value })} />
          </div>
        </Card>

        <div style={{ height: 8 }} />
      </div>
    </aside>
  );
}
