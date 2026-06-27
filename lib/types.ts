export interface LineItem {
  id: number;
  desc: string;
  qty: number;
  rate: number;
}

export type DiscountType = 'percent' | 'fixed';
export type Theme = 't-blue' | 't-dark' | 't-teal' | 't-emerald' | 't-violet' | 't-rose' | 't-custom';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'AED' | 'CAD' | 'AUD' | 'SGD' | 'JPY';
export type Template = 'classic' | 'modern' | 'bold' | 'minimal';

export interface InvoiceState {
  fromName: string;
  fromAddress: string;
  fromEmail: string;
  fromPhone: string;
  fromWebsite: string;
  logoDataUrl: string | null;

  toName: string;
  toAddress: string;
  toEmail: string;
  toPhone: string;

  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  poNumber: string;
  currency: Currency;

  items: LineItem[];

  discountType: DiscountType;
  discountValue: number;
  taxType: DiscountType;
  taxValue: number;
  shippingValue: number;

  sgstType: DiscountType;
  sgstValue: number;
  cgstType: DiscountType;
  cgstValue: number;

  notes: string;
  terms: string;
  bankDetails: string;

  theme: Theme;
  customColor: string;
  template: Template;
}

export interface Totals {
  subtotal: number;
  discountAmt: number;
  taxAmt: number;
  sgstAmt: number;
  cgstAmt: number;
  shipping: number;
  total: number;
}
