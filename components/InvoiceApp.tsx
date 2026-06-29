'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Navbar from './Navbar';
import ShareBanner from './ShareBanner';
import FormPanel from './FormPanel';
import HistorySidePanel from './HistorySidePanel';
import SettingsSidePanel from './SettingsSidePanel';
import InvoicePreview from './InvoicePreview';
import type { InvoiceState, LineItem } from '@/lib/types';
import { formatDateInput, generateInvoiceNumber } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

function getDefaultState(): InvoiceState {
  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 30);
  return {
    fromName: '', fromAddress: '', fromEmail: '', fromPhone: '', fromWebsite: '',
    logoDataUrl: null,
    toName: '', toAddress: '', toEmail: '', toPhone: '',
    invoiceNumber: generateInvoiceNumber(today),
    invoiceDate: formatDateInput(today),
    dueDate: formatDateInput(due),
    poNumber: '',
    currency: 'USD',
    items: [{ id: 1, desc: '', qty: 1, rate: 0 }],
    discountType: 'percent', discountValue: 0,
    taxType: 'percent', taxValue: 0,
    shippingValue: 0,
    sgstType: 'percent', sgstValue: 0,
    cgstType: 'percent', cgstValue: 0,
    notes: '', terms: '', bankDetails: '',
    theme: 't-blue',
    customColor: '#6366F1',
    template: 'classic',
  };
}

export default function InvoiceApp() {
  const [state, setState] = useState<InvoiceState>(getDefaultState);
  const [mobilePanel, setMobilePanel] = useState<'form' | 'preview'>('form');
  const [sidePanel, setSidePanel] = useState<'form' | 'history' | 'settings'>('form');
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [shareBannerVisible, setShareBannerVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [signInBannerDismissed, setSignInBannerDismissed] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Load invoice from history ("Edit" button) and check auth state on mount
  useEffect(() => {
    const pending = localStorage.getItem('marav_pending_invoice');
    if (pending) {
      try {
        const loaded = JSON.parse(pending) as Partial<InvoiceState>;
        setState(s => ({ ...s, ...loaded, logoDataUrl: null }));
      } catch {}
      localStorage.removeItem('marav_pending_invoice');
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleChange = useCallback((updates: Partial<InvoiceState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleAddItem = useCallback(() => {
    setState(prev => {
      const nextId = prev.items.length === 0 ? 1 : Math.max(...prev.items.map(i => i.id)) + 1;
      return { ...prev, items: [...prev.items, { id: nextId, desc: '', qty: 1, rate: 0 }] };
    });
  }, []);

  const handleRemoveItem = useCallback((id: number) => {
    setState(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  }, []);

  const handleUpdateItem = useCallback((id: number, field: keyof LineItem, value: string | number) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item),
    }));
  }, []);

  const downloadPDF = useCallback(async () => {
    const el = invoiceRef.current;
    if (!el || isGenerating) return;

    setIsGenerating(true);
    // Expand to A4 proportional height for the element's actual rendered width, then restore
    const prevMinHeight = el.style.minHeight;
    const a4MinHeight = Math.ceil(el.offsetWidth * 297 / 210);
    el.style.minHeight = `${a4MinHeight}px`;
    // Hide preview-only placeholders so they don't appear in the PDF
    const placeholders = el.querySelectorAll<HTMLElement>('.preview-placeholder');
    placeholders.forEach(p => { p.style.display = 'none'; });
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      // A4 dimensions in mm
      const PAGE_W = 210;
      const PAGE_H = 297;

      // Scale image to fill A4 width exactly
      const imgW = PAGE_W;
      const imgH = (canvas.height / canvas.width) * PAGE_W;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Paginate: slide the image up by PAGE_H on each new page
      let yOffset = 0;
      while (yOffset < imgH) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, -yOffset, imgW, imgH);
        yOffset += PAGE_H;
      }

      // Add clickable link annotations (html2canvas flattens to image, so links must be re-added)
      const elRect = el.getBoundingClientRect();
      const linkScale = PAGE_W / el.offsetWidth;
      el.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(anchor => {
        const rect = anchor.getBoundingClientRect();
        const x = (rect.left - elRect.left) * linkScale;
        const y = (rect.top - elRect.top) * linkScale;
        const w = rect.width * linkScale;
        const h = rect.height * linkScale;
        const pageNum = Math.floor(y / PAGE_H) + 1;
        const yOnPage = y - (pageNum - 1) * PAGE_H;
        if (pageNum >= 1 && pageNum <= pdf.getNumberOfPages()) {
          pdf.setPage(pageNum);
          pdf.link(x, yOnPage, w, h, { url: anchor.href });
        }
      });

      const filename = `Invoice-${state.invoiceNumber || 'document'}.pdf`;
      const pdfBlob = pdf.output('blob');

      // Trigger browser download (instant)
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(downloadUrl);

      // Restore UI now so the button re-enables before the async save
      el.style.minHeight = prevMinHeight;
      placeholders.forEach(p => { p.style.display = ''; });
      setIsGenerating(false);

      // Await the cloud save (non-blocking to user — PDF already downloaded)
      try {
        const formData = new FormData();
        formData.append('pdf', pdfBlob, filename);
        formData.append('state', JSON.stringify(state));
        const res = await fetch('/api/save-invoice', { method: 'POST', body: formData });
        const json = await res.json();
        if (json.ok && json.id) {
          setShareId(json.id);
          setShareBannerVisible(true);
        }
      } catch {
        // save failed silently — share link just won't appear
      }
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed. Please try again.');
      el.style.minHeight = prevMinHeight;
      placeholders.forEach(p => { p.style.display = ''; });
      setIsGenerating(false);
    }
  }, [isGenerating, state]);

  const loadInvoice = useCallback((loaded: Partial<InvoiceState>) => {
    setState(s => ({ ...s, ...loaded, logoDataUrl: null }));
  }, []);

  return (
    <div className="app">
      <Navbar
        onDownload={downloadPDF}
        isGenerating={isGenerating}
        onShowHistory={() => { setSidePanel('history'); setMobilePanel('form'); }}
        onShowSettings={() => { setSidePanel('settings'); setMobilePanel('form'); }}
      />
      {shareBannerVisible && shareId && (
        <ShareBanner shareId={shareId} onDismiss={() => setShareBannerVisible(false)} />
      )}
      {isAuthenticated === false && !signInBannerDismissed && (
        <div className="signin-banner">
          <span className="signin-banner-text">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Sign in to save your invoice history and sync across devices.
          </span>
          <button className="signin-banner-btn cursor-pointer" onClick={() => document.dispatchEvent(new CustomEvent('marav:open-auth'))}>Sign In</button>
        </div>
      )}
      <div className="mobile-tab-bar">
        <button
          className={mobilePanel === 'form' ? 'active' : ''}
          onClick={() => setMobilePanel('form')}
        >
          Edit
        </button>
        <button
          className={mobilePanel === 'preview' ? 'active' : ''}
          onClick={() => setMobilePanel('preview')}
        >
          Preview
        </button>
      </div>
      <div className="app-body">
        {sidePanel === 'history' ? (
          <HistorySidePanel
            onBack={() => setSidePanel('form')}
            onLoad={loadInvoice}
            mobileVisible={mobilePanel === 'form'}
          />
        ) : sidePanel === 'settings' ? (
          <SettingsSidePanel
            onBack={() => setSidePanel('form')}
            mobileVisible={mobilePanel === 'form'}
          />
        ) : (
          <FormPanel
            state={state}
            onChange={handleChange}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onUpdateItem={handleUpdateItem}
            mobileVisible={mobilePanel === 'form'}
          />
        )}
        <InvoicePreview
          ref={invoiceRef}
          state={state}
          mobileVisible={mobilePanel === 'preview'}
        />
      </div>
    </div>
  );
}
