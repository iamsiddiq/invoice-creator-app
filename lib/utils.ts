import type { InvoiceState, Totals, Currency } from './types';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$', EUR: '€', GBP: '£', INR: '₹',
  AED: 'D ', CAD: '$', AUD: '$', SGD: '$', JPY: '¥',
};

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? '$';
  if (currency === 'JPY') return symbol + Math.round(amount).toLocaleString();
  return symbol + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDateDisplay(str: string): string {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[Number(m) - 1]} ${Number(d)}, ${y}`;
}

export function formatDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function generateInvoiceNumber(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `INV-${y}${m}-001`;
}

export function calcTotals(state: Pick<InvoiceState, 'items' | 'discountType' | 'discountValue' | 'taxType' | 'taxValue' | 'shippingValue' | 'currency' | 'sgstType' | 'sgstValue' | 'cgstType' | 'cgstValue'>): Totals {
  const subtotal = state.items.reduce((s, i) => s + i.qty * i.rate, 0);
  const discountAmt = state.discountType === 'percent'
    ? (subtotal * state.discountValue) / 100
    : state.discountValue;
  const afterDiscount = Math.max(0, subtotal - discountAmt);

  let taxAmt = 0, sgstAmt = 0, cgstAmt = 0;
  if (state.currency === 'INR') {
    sgstAmt = state.sgstType === 'percent'
      ? (afterDiscount * state.sgstValue) / 100
      : state.sgstValue;
    cgstAmt = state.cgstType === 'percent'
      ? (afterDiscount * state.cgstValue) / 100
      : state.cgstValue;
  } else {
    taxAmt = state.taxType === 'percent'
      ? (afterDiscount * state.taxValue) / 100
      : state.taxValue;
  }

  const total = afterDiscount + taxAmt + sgstAmt + cgstAmt + state.shippingValue;
  return { subtotal, discountAmt, taxAmt, sgstAmt, cgstAmt, shipping: state.shippingValue, total };
}
