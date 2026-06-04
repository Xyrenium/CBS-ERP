import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store';
import { Product, Customer } from '../types';
import { Plus, Trash2, Printer, Download, Eye, ArrowLeft, ArrowUpRight, CheckCircle2, FileText, ShoppingBag, Truck, Receipt, Calendar, CreditCard, Layers } from 'lucide-react';

// Define localized types for the submenus
interface SalesOrder {
  id: string; // CBS/2026/XXXX
  date: string;
  customerId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    discount?: number; // optional, Rp
    total: number;
  }[];
  taxRate: number; // e.g. 11%
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingFee?: number;
  grandTotal: number;
  status: 'Draft' | 'Approved' | 'Invoiced';
  downPayment?: number;
}

interface DPInvoice {
  id: string; // DP/CBS/2026/XXXX
  salesOrderId: string;
  date: string;
  customerId: string;
  dpPercentage: number; // e.g. 30%
  dpAmount: number;
  taxRate: number;
  taxTotal: number;
  totalWithTax: number;
  notes: string;
}

interface SalesInvoice {
  id: string; // INV/CBS/2026/XXXX
  salesOrderId: string;
  date: string;
  customerId: string;
  subtotal: string | number;
  dpDeduction: number;
  taxRate: number;
  taxTotal: number;
  shippingFee?: number;
  grandTotal: number;
  topDays: number;
}

interface DeliveryOrder {
  id: string; // SJ/CBS/2026/XXXX
  referenceId: string; // SO or Invoice
  date: string;
  customerId: string;
  driverName: string;
  vehicleNo: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  notes: string;
}

interface SalesReceipt {
  id: string; // REC/CBS/2026/XXXX
  invoiceId: string;
  date: string;
  customerId: string;
  amount: number;
  paymentMethod: string;
  notes: string;
}

interface SalesModuleProps {
  activeSubView?: string;
  setActiveView?: (view: string) => void;
}

export function SalesModule({ activeSubView = 'penjualan_order', setActiveView }: SalesModuleProps) {
  const { products, setProducts, customers, addSale, sales } = useStore();

  // Local Storage for state persistence of custom submodels
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => {
    const saved = localStorage.getItem('cbs_sales_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [dpInvoices, setDpInvoices] = useState<DPInvoice[]>(() => {
    const saved = localStorage.getItem('cbs_dp_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>(() => {
    const saved = localStorage.getItem('cbs_sales_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>(() => {
    const saved = localStorage.getItem('cbs_delivery_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [receipts, setReceipts] = useState<SalesReceipt[]>(() => {
    const saved = localStorage.getItem('cbs_sales_receipts');
    return saved ? JSON.parse(saved) : [];
  });

  // Save states back to localStorage
  useEffect(() => {
    localStorage.setItem('cbs_sales_orders', JSON.stringify(salesOrders));
  }, [salesOrders]);

  useEffect(() => {
    localStorage.setItem('cbs_dp_invoices', JSON.stringify(dpInvoices));
  }, [dpInvoices]);

  useEffect(() => {
    localStorage.setItem('cbs_sales_invoices', JSON.stringify(salesInvoices));
  }, [salesInvoices]);

  useEffect(() => {
    localStorage.setItem('cbs_delivery_orders', JSON.stringify(deliveryOrders));
  }, [deliveryOrders]);

  useEffect(() => {
    localStorage.setItem('cbs_sales_receipts', JSON.stringify(receipts));
  }, [receipts]);

  // Sidebar Sub-navigation Mapping details
  const activeTab = activeSubView.replace('penjualan_', '');

  // Master product list helper
  const activeMitraCustomers = useMemo(() => {
    return customers.filter(c => c.active && c.category === 'Client');
  }, [customers]);

  // Master categories for on-the-fly product addition
  const categories = [
    'Pipa hitam seamless',
    'Pipa galvanis spindo',
    'Mur baut',
    'Alat tulis kantor',
    'Aksesoris pipa carbon steel',
    'Betonneser',
    'Besi persegi empat',
    'Alat navigasi',
    'Aksesoris jangkar dan jangkar kapal',
    'Mesin tempel',
    'Alat keselamatan kapal',
    'Valves',
    'Mesin induk kapal',
    'Mesin bantu kapal',
    'Wire roope'
  ];

  // Printable layout state
  const [printDoc, setPrintDoc] = useState<{ data: any; type: string } | null>(null);

  // Quick Product Addition Modal in Form Order Penjualan
  const [showQuickAddProduct, setShowQuickAddProduct] = useState(false);
  const [quickProduct, setQuickProduct] = useState({
    id: '',
    name: '',
    description: '',
    category: 'Pipa hitam seamless',
    unitCategory: 'Maritim',
    basicUnit: 'pcs',
    stock: 100,
    minStock: 10,
    buyPrice: 100000,
    sellPrice: 150000
  });

  // 1. STATE FOR ORDER PENJUALAN FORM
  const [soDate, setSoDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [soCustomerId, setSoCustomerId] = useState('');
  const [soTaxRate, setSoTaxRate] = useState<number>(11);
  const [soDownPayment, setSoDownPayment] = useState<number>(0);
  const [soShippingFee, setSoShippingFee] = useState<number>(0);
  const [quickProductRowIndex, setQuickProductRowIndex] = useState<number | null>(null);
  const [soItems, setSoItems] = useState<{ productId: string; quantity: number; price: number; discount: number }[]>([
    { productId: '', quantity: 1, price: 0, discount: 0 }
  ]);

  const handleQuickAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickProduct.id || !quickProduct.name) {
      alert("Mohon lengkapi SKU dan nama produk.");
      return;
    }
    if (products.some(p => p.id.toLowerCase() === quickProduct.id.toLowerCase())) {
      alert("Produk dengan SKU ini sudah terdaftar!");
      return;
    }
    const newProduct = { ...quickProduct } as Product;
    setProducts([...products, newProduct]);
    alert(`Produk "${quickProduct.name}" berhasil ditambahkan ke master.`);
    
    if (quickProductRowIndex !== null) {
      const updated = [...soItems];
      if (updated[quickProductRowIndex]) {
        updated[quickProductRowIndex].productId = quickProduct.id;
        updated[quickProductRowIndex].price = quickProduct.sellPrice;
        setSoItems(updated);
      }
      setQuickProductRowIndex(null);
    }

    setShowQuickAddProduct(false);
    setQuickProduct({
      id: '',
      name: '',
      description: '',
      category: 'Pipa hitam seamless',
      unitCategory: 'Maritim',
      basicUnit: 'pcs',
      stock: 100,
      minStock: 10,
      buyPrice: 100000,
      sellPrice: 150000
    });
  };

  // Automatic SO numbering generator
  const generatedSoNumber = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const prefix = `CBS/${currentYear}/`;
    const count = salesOrders.length + 1;
    const seq = String(count).padStart(4, '0');
    return `${prefix}${seq}`;
  }, [salesOrders]);

  // LIVE CALCULATIONS FOR ACTIVE SALES ORDER DRAFT
  const calculatedSo = useMemo(() => {
    let subtotal = 0;
    let discountTotal = 0;
    const itemTotals = soItems.map(item => {
      const prod = products.find(p => p.id === item.productId);
      const rate = item.price || (prod ? prod.sellPrice : 0);
      const gross = rate * item.quantity;
      const diskon = item.discount || 0;
      const net = Math.max(0, gross - diskon);
      subtotal += gross;
      discountTotal += diskon;
      return net;
    });

    const taxTotal = Math.max(0, (subtotal - discountTotal) * (soTaxRate / 100));
    const grandTotal = Math.max(0, subtotal - discountTotal + taxTotal + soShippingFee);

    return {
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal,
      itemTotals
    };
  }, [soItems, products, soTaxRate, soShippingFee]);

  const handleAddSoItemRow = () => {
    setSoItems([...soItems, { productId: '', quantity: 1, price: 0, discount: 0 }]);
  };

  const handleUpdateSoItemRow = (idx: number, field: string, value: any) => {
    if (field === 'productId' && value === 'ADD_NEW_PRODUCT') {
      setQuickProductRowIndex(idx);
      setShowQuickAddProduct(true);
      return;
    }
    const updated = [...soItems];
    const row = { ...updated[idx] };

    if (field === 'productId') {
      row.productId = value;
      const prod = products.find(p => p.id === value);
      row.price = prod ? prod.sellPrice : 0;
    } else if (field === 'quantity') {
      row.quantity = parseInt(value) || 0;
    } else if (field === 'price') {
      row.price = parseInt(value) || 0;
    } else if (field === 'discount') {
      row.discount = parseInt(value) || 0;
    }

    updated[idx] = row;
    setSoItems(updated);
  };

  const handleRemoveSoItemRow = (idx: number) => {
    setSoItems(soItems.filter((_, i) => i !== idx));
  };

  const handleSaveSalesOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!soCustomerId) {
      alert("Mohon pilih Mitra/Client terlebih dahulu.");
      return;
    }
    if (soItems.some(i => !i.productId || i.quantity <= 0)) {
      alert("Mohon lengkapi baris produk dengan kuantitas valid.");
      return;
    }

    // Verify stock first
    for (const item of soItems) {
      const p = products.find(prod => prod.id === item.productId);
      if (p && p.stock < item.quantity) {
        alert(`Gagal! Stok barang ${p.name} tidak cukup (Stok sisa: ${p.stock}).`);
        return;
      }
    }

    const hasDp = soDownPayment > 0;
    const newSO: SalesOrder = {
      id: generatedSoNumber,
      date: soDate,
      customerId: soCustomerId,
      items: soItems.map((item, idx) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        total: calculatedSo.itemTotals[idx]
      })),
      taxRate: soTaxRate,
      subtotal: calculatedSo.subtotal,
      discountTotal: calculatedSo.discountTotal,
      taxTotal: calculatedSo.taxTotal,
      shippingFee: soShippingFee,
      grandTotal: calculatedSo.grandTotal,
      status: hasDp ? 'Approved' : 'Invoiced',
      downPayment: soDownPayment
    };

    if (hasDp) {
      // Create DP Invoice
      const count = dpInvoices.length + 1;
      const newDpId = `DP/CBS/2026/${String(count).padStart(4, '0')}`;
      const dpAmount = soDownPayment;
      const dpTax = dpAmount * (soTaxRate / 100);

      const newDp: DPInvoice = {
        id: newDpId,
        salesOrderId: generatedSoNumber,
        date: soDate,
        customerId: soCustomerId,
        dpPercentage: Math.round((soDownPayment / calculatedSo.grandTotal) * 100),
        dpAmount: dpAmount,
        taxRate: soTaxRate,
        taxTotal: dpTax,
        totalWithTax: dpAmount + dpTax,
        notes: `Uang muka otomatis dari Sales Order ${generatedSoNumber}`
      };

      setDpInvoices([newDp, ...dpInvoices]);
      setSalesOrders([newSO, ...salesOrders]);
      alert(`Sales Order ${newSO.id} disimpan dan Invoice Uang Muka ${newDp.id} otomatis diterbitkan.`);
    } else {
      // Create Final Sales Invoice (Lunas)
      const count = salesInvoices.length + 1;
      const newInvId = `INV/CBS/2026/${String(count).padStart(4, '0')}`;
      const newInvoice: SalesInvoice = {
        id: newInvId,
        salesOrderId: generatedSoNumber,
        date: soDate,
        customerId: soCustomerId,
        subtotal: calculatedSo.subtotal - calculatedSo.discountTotal,
        dpDeduction: 0,
        taxRate: soTaxRate,
        taxTotal: calculatedSo.taxTotal,
        shippingFee: soShippingFee,
        grandTotal: calculatedSo.grandTotal,
        topDays: 0
      };

      setSalesInvoices([newInvoice, ...salesInvoices]);
      setSalesOrders([newSO, ...salesOrders]);

      // Register inside parent store context
      addSale({
        id: newInvoice.id,
        date: soDate,
        customerId: soCustomerId,
        items: soItems.map((i, idx) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
          total: calculatedSo.itemTotals[idx]
        })),
        total: calculatedSo.grandTotal,
        topDays: 0
      });

      alert(`Sales Order ${newSO.id} disimpan dan Invoice Penjualan ${newInvoice.id} otomatis diterbitkan karena Lunas.`);
    }

    // Clear form
    setSoItems([{ productId: '', quantity: 1, price: 0, discount: 0 }]);
    setSoDownPayment(0);
    setSoShippingFee(0);
  };

  const handleDeleteSalesOrder = (id: string) => {
    if (confirm(`Hapus Sales Order ${id}?`)) {
      setSalesOrders(salesOrders.filter(so => so.id !== id));
    }
  };

  // Convert SO Draft to Approved
  const handleApproveSO = (so: SalesOrder) => {
    const updated = salesOrders.map(item => {
      if (item.id === so.id) {
        return { ...item, status: 'Approved' as const };
      }
      return item;
    });
    setSalesOrders(updated);
    alert(`Sales Order ${so.id} disetujui untuk pemrosesan logistik.`);
  };


  // 2. STATE FOR INVOICE UANG MUKA (DP)
  const [dpSoRef, setDpSoRef] = useState('');
  const [dpPercentage, setDpPercentage] = useState<number>(30);
  const [dpDate, setDpDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dpNotes, setDpNotes] = useState('Uang muka pesanan pengadaan logistik maritim');

  // Filter approved/draft SO for downpayment
  const availableSoForDp = useMemo(() => {
    return salesOrders.filter(so => so.status !== 'Invoiced');
  }, [salesOrders]);

  const generatedDpInvoiceNumber = useMemo(() => {
    const count = dpInvoices.length + 1;
    return `DP/CBS/2026/${String(count).padStart(4, '0')}`;
  }, [dpInvoices]);

  const calculatedDp = useMemo(() => {
    const so = salesOrders.find(s => s.id === dpSoRef);
    if (!so) return { amount: 0, tax: 0, total: 0 };
    const amount = (so.subtotal - so.discountTotal) * (dpPercentage / 100);
    const tax = amount * (so.taxRate / 100);
    return {
      amount,
      tax,
      total: amount + tax
    };
  }, [dpSoRef, dpPercentage, salesOrders]);

  const handleSaveDpInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dpSoRef) {
      alert("Mohon pilih link referensi Sales Order (SO).");
      return;
    }
    const soRef = salesOrders.find(s => s.id === dpSoRef);
    if (!soRef) return;

    const newDp: DPInvoice = {
      id: generatedDpInvoiceNumber,
      salesOrderId: dpSoRef,
      date: dpDate,
      customerId: soRef.customerId,
      dpPercentage: dpPercentage,
      dpAmount: calculatedDp.amount,
      taxRate: soRef.taxRate,
      taxTotal: calculatedDp.tax,
      totalWithTax: calculatedDp.total,
      notes: dpNotes
    };

    setDpInvoices([newDp, ...dpInvoices]);
    setDpSoRef('');
    alert(`Invoice Uang Muka ${newDp.id} berhasil dibuat.`);
  };

  const handleDeleteDpInvoice = (id: string) => {
    if (confirm(`Hapus Invoice DP ${id}?`)) {
      setDpInvoices(dpInvoices.filter(d => d.id !== id));
    }
  };


  // 3. STATE FOR INVOICE PENJUALAN (FINAL)
  const [finalSoRef, setFinalSoRef] = useState('');
  const [finalDate, setFinalDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [finalTop, setFinalTop] = useState<number>(30); // Term 30 days

  const generatedFinalInvoiceNumber = useMemo(() => {
    const count = salesInvoices.length + 1;
    return `INV/CBS/2026/${String(count).padStart(4, '0')}`;
  }, [salesInvoices]);

  const calculatedFinalInvoice = useMemo(() => {
    const so = salesOrders.find(s => s.id === finalSoRef);
    if (!so) return { subtotal: 0, dpDeduction: 0, tax: 0, total: 0, shippingFee: 0 };
    
    // Find any DPs already invoiced for this SO
    const linkedDps = dpInvoices.filter(d => d.salesOrderId === finalSoRef);
    const dpDeduction = linkedDps.reduce((sum, d) => sum + d.dpAmount, 0);

    const netSubtotal = Math.max(0, (so.subtotal - so.discountTotal) - dpDeduction);
    const tax = netSubtotal * (so.taxRate / 100);
    const shipping = so.shippingFee || 0;

    return {
      subtotal: so.subtotal - so.discountTotal,
      dpDeduction,
      tax,
      total: netSubtotal + tax + shipping,
      shippingFee: shipping
    };
  }, [finalSoRef, salesOrders, dpInvoices]);

  const handleSaveFinalInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalSoRef) {
      alert("Pilih referensi Sales Order.");
      return;
    }
    const soRef = salesOrders.find(s => s.id === finalSoRef);
    if (!soRef) return;

    // Check inventory stock limits & finalize
    for (const item of soRef.items) {
      const p = products.find(prod => prod.id === item.productId);
      if (p && p.stock < item.quantity) {
        alert(`Gagal! Stok barang ${p.name} tidak cukup (Stok sisa: ${p.stock}).`);
        return;
      }
    }

    const newInvoice: SalesInvoice = {
      id: generatedFinalInvoiceNumber,
      salesOrderId: finalSoRef,
      date: finalDate,
      customerId: soRef.customerId,
      subtotal: calculatedFinalInvoice.subtotal,
      dpDeduction: calculatedFinalInvoice.dpDeduction,
      taxRate: soRef.taxRate,
      taxTotal: calculatedFinalInvoice.tax,
      shippingFee: calculatedFinalInvoice.shippingFee,
      grandTotal: calculatedFinalInvoice.total,
      topDays: finalTop
    };

    setSalesInvoices([newInvoice, ...salesInvoices]);

    // Also register inside parent store context to trigger auto ledger general journals
    addSale({
      id: newInvoice.id,
      date: finalDate,
      customerId: soRef.customerId,
      items: soRef.items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.price,
        total: i.total
      })),
      total: calculatedFinalInvoice.total,
      topDays: finalTop
    });

    // Mark Sales Order status as invoiced
    setSalesOrders(salesOrders.map(item => {
      if (item.id === finalSoRef) {
        return { ...item, status: 'Invoiced' as const };
      }
      return item;
    }));

    setFinalSoRef('');
    alert(`Transaksi Berhasil! Invoice final ${newInvoice.id} telah dicetak dan jurnal keuangan otomatis dibentuk.`);
  };

  const handleDeleteFinalInvoice = (id: string) => {
    if (confirm(`Hapus Invoice ${id}?`)) {
      setSalesInvoices(salesInvoices.filter(i => i.id !== id));
    }
  };


  // 4. KUITANSI PEMBAYARAN STATE
  const [receiptInvoiceRef, setReceiptInvoiceRef] = useState('');
  const [receiptDate, setReceiptDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [receiptPaymentMethod, setReceiptPaymentMethod] = useState('Transfer Mandiri');
  const [receiptNotes, setReceiptNotes] = useState('Pelunasan invoice logistik perkapalan resmi');

  const generatedReceiptNumber = useMemo(() => {
    const count = receipts.length + 1;
    return `KWT/CBS/2026/${String(count).padStart(4, '0')}`;
  }, [receipts]);

  const activeInvoices = useMemo(() => {
    // Collect both DP and Final Invoices
    const dps = dpInvoices.map(d => ({ id: d.id, val: d.totalWithTax, customer: d.customerId, type: 'Uang Muka' }));
    const finals = salesInvoices.map(f => ({ id: f.id, val: f.grandTotal, customer: f.customerId, type: 'Final Invoice' }));
    return [...dps, ...finals];
  }, [dpInvoices, salesInvoices]);

  const calculatedReceiptValue = useMemo(() => {
    const inv = activeInvoices.find(i => i.id === receiptInvoiceRef);
    return inv ? inv.val : 0;
  }, [receiptInvoiceRef, activeInvoices]);

  const handleSaveReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptInvoiceRef) {
      alert("Pilih referensi invoice.");
      return;
    }
    const invRef = activeInvoices.find(i => i.id === receiptInvoiceRef);
    if (!invRef) return;

    const newReceipt: SalesReceipt = {
      id: generatedReceiptNumber,
      invoiceId: receiptInvoiceRef,
      date: receiptDate,
      customerId: invRef.customer,
      amount: calculatedReceiptValue,
      paymentMethod: receiptPaymentMethod,
      notes: receiptNotes
    };

    setReceipts([newReceipt, ...receipts]);
    setReceiptInvoiceRef('');
    alert(`Kuitansi Penerimaan Pembayaran ${newReceipt.id} berhasil diterbitkan.`);
  };

  const handleDeleteReceipt = (id: string) => {
    if (confirm(`Hapus kuitansi ${id}?`)) {
      setReceipts(receipts.filter(r => r.id !== id));
    }
  };


  // 5. SURAT JALAN (DELIVERY ORDER) STATE
  const [sjRef, setSjRef] = useState('');
  const [sjDriver, setSjDriver] = useState('');
  const [sjVehicle, setSjVehicle] = useState('');
  const [sjDate, setSjDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [sjNotes, setSjNotes] = useState('Barang diantar dalam kondisi segel pelabuhan laut utara');

  const generatedSjNumber = useMemo(() => {
    const count = deliveryOrders.length + 1;
    return `SJ/CBS/2026/${String(count).padStart(4, '0')}`;
  }, [deliveryOrders]);

  const handleSaveSj = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sjRef) {
      alert("Mohon pilih referensi dokumen penjualan.");
      return;
    }
    // Find source items
    const so = salesOrders.find(s => s.id === sjRef);
    const customerId = so ? so.customerId : '';
    const items = so ? so.items.map(i => ({ productId: i.productId, quantity: i.quantity })) : [];

    const newSj: DeliveryOrder = {
      id: generatedSjNumber,
      referenceId: sjRef,
      date: sjDate,
      customerId,
      driverName: sjDriver,
      vehicleNo: sjVehicle,
      items,
      notes: sjNotes
    };

    setDeliveryOrders([newSj, ...deliveryOrders]);
    setSjRef('');
    setSjDriver('');
    setSjVehicle('');
    alert(`Surat Jalan ${newSj.id} sukses dibentuk.`);
  };

  const handleDeleteSj = (id: string) => {
    if (confirm(`Hapus Surat Jalan ${id}?`)) {
      setDeliveryOrders(deliveryOrders.filter(d => d.id !== id));
    }
  };

  // RENDER DOKUMEN CETAK VIEW FULL-TAB COHERENTLY
  if (printDoc) {
    const cust = customers.find(c => c.id === printDoc.data.customerId);

    return (
      <div className="min-h-screen p-4 md:p-8 animate-in fade-in max-w-4xl mx-auto space-y-6 relative">
        <div className="flex justify-between items-center no-print">
          <button 
            onClick={() => setPrintDoc(null)} 
            className="flex items-center text-indigo-700 hover:text-slate-800 border border-white/50 bg-white/60 px-4 py-2 rounded-md text-xs font-bold transition-all uppercase tracking-wider glow-card shadow-sm"
          >
            <ArrowLeft size={16} className="mr-2"/> Kembali
          </button>
          <button 
            onClick={() => window.print()} 
            className="flex items-center glow-button px-6 py-2 rounded-md text-xs font-bold transition-colors uppercase tracking-wider"
          >
            <Download size={16} className="mr-2"/> Cetak / Simpan PDF
          </button>
        </div>

        <div className="glow-card w-full print-area p-8 sm:p-12 rounded-xl text-slate-700 text-sm border border-white/50 bg-white relative shadow-lg">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-300 pb-6 mb-6 gap-6">
            <div className="flex gap-4 items-start">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                <img src="/logo cbs.png" alt="CBS LOGO" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
              </div>
              <div className="text-left font-sans">
                <h1 className="text-lg font-black tracking-tight text-slate-850 uppercase">PT. CARACA BINTANG SAMUDRA</h1>
                <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest mt-0.5">Maritime Logistical Ship Supplier</p>
                <p className="text-xs text-slate-400 mt-2">Jl. Pelabuhan Raya No. 88, Tanjung Priok, Jakarta<br/>T: (021) 555-0192 | E: sales@caracabintang.com</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <h2 className="text-xl font-black uppercase text-indigo-700 tracking-wide">{printDoc.type.replace('_', ' ')}</h2>
              <div className="mt-2 text-xs grid grid-cols-2 gap-x-4 border border-indigo-50 p-2.5 rounded bg-slate-50/60 text-left">
                <span className="font-bold text-indigo-700 uppercase text-[9px] tracking-wider">No. Dokumen</span>
                <span className="font-bold text-slate-800 text-right font-mono">{printDoc.data.id}</span>
                <span className="font-bold text-indigo-700 uppercase text-[9px] tracking-wider">Tanggal</span>
                <span className="text-right font-medium text-slate-800">{printDoc.data.date}</span>
                {printDoc.data.topDays && (
                  <>
                    <span className="font-bold text-indigo-700 uppercase text-[9px] tracking-wider">Termin</span>
                    <span className="text-right font-bold text-emerald-700">{printDoc.data.topDays} Hari</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Customer / Entitas */}
          <div className="mb-6 p-4 bg-slate-50 border border-slate-150 rounded-lg">
            <p className="text-[10px] font-bold text-indigo-700 uppercase mb-1.5 tracking-wider">Tujuan Pengadaan Logistik (Client Mitra):</p>
            <p className="font-extrabold text-slate-800 text-base">{cust?.name || 'Customer'}</p>
            <p className="text-xs text-slate-500 mt-1">Telp: {cust?.phone} ・ Alamat: {cust?.address}</p>
          </div>

          {/* Items Table details */}
          {printDoc.data.items && printDoc.data.items.length > 0 && (
            <div className="mb-8 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-55 border-b border-slate-200 text-indigo-900 text-[10px] font-black uppercase tracking-wider">
                    <th className="py-2.5 px-4 w-12 text-center">No</th>
                    <th className="py-2.5 px-4">Deskripsi Inventory Barang</th>
                    <th className="py-2.5 px-4 text-center w-24">QTY</th>
                    {printDoc.type !== 'SURAT_JALAN' && <th className="py-2.5 px-4 text-right">Harga Satuan</th>}
                    {printDoc.type !== 'SURAT_JALAN' && <th className="py-2.5 px-4 text-right">Total</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {printDoc.data.items.map((it: any, idx: number) => {
                    const p = products.find(item => item.id === it.productId);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-800">{p?.name || it.productId}</p>
                          <p className="text-[10px] text-slate-400">SKU: {it.productId} ・ Kategori: {p?.category}</p>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800">{it.quantity} {p?.basicUnit || 'pcs'}</td>
                        {printDoc.type !== 'SURAT_JALAN' && <td className="py-3 px-4 text-right font-medium text-slate-600">Rp {it.price?.toLocaleString('id-ID')}</td>}
                        {printDoc.type !== 'SURAT_JALAN' && <td className="py-3 px-4 text-right font-bold text-slate-800 font-mono">Rp {it.total?.toLocaleString('id-ID')}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Breakdown for Receipt & Down Payment Special parameters */}
          {printDoc.type === 'KUITANSI_PEMBAYARAN' && (
            <div className="my-6 p-6 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Telah Terima Pembayaran Sejumlah:</span>
              <p className="text-3xl font-black text-emerald-700 font-mono tracking-tight text-left">Rp {printDoc.data.amount?.toLocaleString('id-ID')}</p>
              <div className="pt-3 border-t border-emerald-100/50 text-xs text-emerald-800/80 space-y-1 font-semibold">
                <p>Metode Pembayaran: <span className="text-slate-800 font-bold ml-1">{printDoc.data.paymentMethod}</span></p>
                <p>Keterangan: <span className="text-slate-800 font-bold ml-1">{printDoc.data.notes}</span></p>
              </div>
            </div>
          )}

          {printDoc.type === 'INVOICE_UANG_MUKA' && (
            <div className="my-6 p-6 bg-indigo-50/50 border border-indigo-150 rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-indigo-800 tracking-wider">Detail Pembayaran Uang Muka ({printDoc.data.dpPercentage}%):</span>
              <p className="text-2xl font-black text-indigo-700 font-mono text-left">Rp {printDoc.data.dpAmount?.toLocaleString('id-ID')}</p>
              <div className="pt-3 border-t border-indigo-150 text-xs text-indigo-800/80 space-y-1 font-medium">
                <p>Total Nilai Kontrak SO: <span className="text-slate-800 font-bold ml-1">Rp {salesOrders.find(s=>s.id===printDoc.data.salesOrderId)?.grandTotal.toLocaleString('id-ID')}</span></p>
                <p>PPN / Pajak Uang Muka: <span className="text-slate-800 font-bold ml-1">Rp {printDoc.data.taxTotal.toLocaleString('id-ID')} ({printDoc.data.dpPercentage}% PPN)</span></p>
                <p className="text-sm font-black text-slate-800 pt-1 border-t border-dashed border-indigo-100 mt-2 text-right">Grand Total Duit Muka: Rp {printDoc.data.totalWithTax.toLocaleString('id-ID')}</p>
              </div>
            </div>
          )}

          {printDoc.type === 'FINAL_INVOICE' && (
            <div className="flex justify-end pt-3 border-t-2 border-slate-200">
              <div className="w-full sm:w-80 space-y-2 text-xs font-semibold text-slate-650">
                <div className="flex justify-between">
                  <span>Kontrak Penjualan Kotor:</span>
                  <span className="font-bold text-slate-800">Rp {printDoc.data.subtotal.toLocaleString('id-ID')}</span>
                </div>
                {printDoc.data.dpDeduction > 0 && (
                  <div className="flex justify-between text-indigo-850">
                    <span>Pemotongan Uang Muka (DP):</span>
                    <span className="font-bold text-red-600">- Rp {printDoc.data.dpDeduction.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Pajak ({printDoc.data.taxRate}%):</span>
                  <span className="font-bold text-slate-800">Rp {printDoc.data.taxTotal.toLocaleString('id-ID')}</span>
                </div>
                {printDoc.data.shippingFee > 0 && (
                  <div className="flex justify-between">
                    <span>Biaya Pengiriman:</span>
                    <span className="font-bold text-slate-800">Rp {printDoc.data.shippingFee.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-800 border-t border-slate-200 pt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-indigo-800 uppercase text-[9px] tracking-wider">Net Tagihan Akhir:</span>
                  <span className="text-emerald-700 font-mono">Rp {printDoc.data.grandTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          )}

          {printDoc.type === 'ORDER_PENJUALAN' && (
            <div className="flex justify-end pt-3 border-t-2 border-slate-200">
              <div className="w-full sm:w-80 space-y-2 text-xs font-semibold text-slate-650">
                <div className="flex justify-between">
                  <span>Kontrak Penjualan Kotor (Subtotal):</span>
                  <span className="font-bold text-slate-800">Rp {printDoc.data.subtotal.toLocaleString('id-ID')}</span>
                </div>
                {printDoc.data.discountTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Diskon Kontrak:</span>
                    <span className="font-bold text-red-600">- Rp {printDoc.data.discountTotal.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Pajak (PPN {printDoc.data.taxRate}%):</span>
                  <span className="font-bold text-slate-800">Rp {printDoc.data.taxTotal.toLocaleString('id-ID')}</span>
                </div>
                {printDoc.data.shippingFee > 0 && (
                  <div className="flex justify-between">
                    <span>Biaya Pengiriman:</span>
                    <span className="font-bold text-slate-800">Rp {printDoc.data.shippingFee.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-800 border-t border-slate-200 pt-2 bg-slate-50 p-2.5 rounded-lg border border-indigo-100">
                  <span className="text-indigo-800 uppercase text-[9px] tracking-wider">Total Kontrak Penjualan (SO):</span>
                  <span className="text-emerald-700 font-mono">Rp {printDoc.data.grandTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Delivery order notes */}
          {printDoc.type === 'SURAT_JALAN' && (
            <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-amber-50/50 border border-amber-100 rounded-lg text-xs text-slate-800">
              <div>
                <p className="font-bold text-slate-600 uppercase text-[9px] tracking-wider">Logistik Pengirim (Driver):</p>
                <p className="font-bold mt-1 text-slate-800 text-sm">{printDoc.data.driverName || '-'}</p>
                <p className="text-[10px] text-slate-500">No. Kendaraan: {printDoc.data.vehicleNo || '-'}</p>
              </div>
              <div>
                <p className="font-bold text-slate-600 uppercase text-[9px] tracking-wider">Catatan Pengantaran:</p>
                <p className="mt-1 text-xs text-slate-500 italic">{printDoc.data.notes}</p>
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="mt-16 grid grid-cols-3 gap-6 text-center text-xs relative font-medium text-slate-500">
            <div>
              <p className="mb-20">Dibaringkan Oleh (Logistik),</p>
              <p className="font-bold uppercase tracking-wide text-slate-800 border-t border-slate-250 pt-1.5 w-40 mx-auto">Authorized Staff</p>
            </div>
            <div>
              <p className="mb-20">Menyetujui (Manager),</p>
              <p className="font-bold uppercase tracking-wide text-slate-800 border-t border-slate-250 pt-1.5 w-40 mx-auto">Finance Director</p>
            </div>
            <div>
              <p className="mb-20">Diterima Diatas Kapal Oleh,</p>
              <p className="font-bold uppercase tracking-wide text-indigo-700 border-t border-slate-250 pt-1.5 w-40 mx-auto">Pihak Client / Klien</p>
              <p className="text-[9px] text-slate-400 mt-1">(Nama Jelas & Stempel Resmi)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // SUBVIEW RENDER ROUTER
  // ----------------------------------------
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
        <div>
          <h2 className="text-xl font-bold text-slate-850 tracking-tight flex items-center gap-2">
            {activeTab === 'order' && <><ShoppingBag className="text-indigo-600"/> Order Penjualan (SO) </>}
            {activeTab === 'riwayat' && <><Layers className="text-indigo-600"/> Riwayat Penjualan (Ledger) </>}
            {activeTab === 'dp' && <><CreditCard className="text-indigo-600"/> Invoice Uang Muka (DP) </>}
            {activeTab === 'invoice' && <><FileText className="text-indigo-600"/> Invoice Penjualan (Final) </>}
            {activeTab === 'kuitansi' && <><Receipt className="text-indigo-600"/> Kuitansi Penjualan (Receipt) </>}
            {activeTab === 'jalan' && <><Truck className="text-indigo-600"/> Surat Jalan (Delivery Order) </>}
          </h2>
          <p className="text-xs text-indigo-750 opacity-80 mt-1 font-medium">
            {activeTab === 'order' && 'Pencatatan kontrak awal penjualan maritime supply dengan client mitra.'}
            {activeTab === 'riwayat' && 'Informasi ledger history transaksi penjualan kargo/barang niaga.'}
            {activeTab === 'dp' && 'Penerbitan billing uang muka sesuai kesepakatan persentase termin.'}
            {activeTab === 'invoice' && 'Penagihan final balance piutang setelah barang dipasok sempurna.'}
            {activeTab === 'kuitansi' && 'Tanda terima pelunasan kuitansi resmi berstempel digital.'}
            {activeTab === 'jalan' && 'Surat pengantar muatan rute gudang menuju dek palka kapal.'}
          </p>
        </div>

        {/* Action button to quickly jump between areas */}
        <div className="flex gap-2 shrink-0">
          {activeTab !== 'order' && (
            <button 
              onClick={() => setActiveView && setActiveView('penjualan_order')} 
              className="px-3.5 py-1.5 border border-indigo-200 hover:bg-indigo-50 text-[11px] font-bold text-indigo-700 bg-white shadow-sm rounded-lg transition-all"
            >
              + Buat SO Baru
            </button>
          )}
        </div>
      </div>

      {/* QUICK ADD PRODUCT ON-THE-FLY MODAL */}
      {showQuickAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="glow-card rounded-2xl w-full max-w-md overflow-hidden bg-white border border-indigo-100 flex flex-col shadow-2xl">
            <div className="p-5 border-b border-indigo-50 flex justify-between items-center bg-indigo-50/20">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                <ShoppingBag size={18} className="text-indigo-600" />
                Registrasi Cepat Master Produk
              </h3>
              <button onClick={() => setShowQuickAddProduct(false)} className="text-slate-400 hover:text-slate-800 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleQuickAddProductSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">SKU / Kode Produk</label>
                  <input type="text" required value={quickProduct.id} onChange={e => setQuickProduct({...quickProduct, id: e.target.value})} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs" placeholder="SKU-XXXX"/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Nama Produk</label>
                  <input type="text" required value={quickProduct.name} onChange={e => setQuickProduct({...quickProduct, name: e.target.value})} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs" placeholder="Nama Benda..."/>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Deskripsi Spesifikasi</label>
                <textarea rows={2} required value={quickProduct.description} onChange={e => setQuickProduct({...quickProduct, description: e.target.value})} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs resize-none" placeholder="Isi spesifikasi kapal..."/>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Kategori</label>
                  <select value={quickProduct.category} onChange={e => setQuickProduct({...quickProduct, category: e.target.value})} className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs cursor-pointer">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Kategori Unit</label>
                  <input type="text" required value={quickProduct.unitCategory} onChange={e => setQuickProduct({...quickProduct, unitCategory: e.target.value})} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs" placeholder="e.g. Valve"/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Satuan Dasar</label>
                  <input type="text" required value={quickProduct.basicUnit} onChange={e => setQuickProduct({...quickProduct, basicUnit: e.target.value})} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs" placeholder="Kg, Ltr, pcs"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div>
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Harga Beli (HPP)</label>
                  <input type="number" required value={quickProduct.buyPrice} onChange={e => setQuickProduct({...quickProduct, buyPrice: parseInt(e.target.value) || 0})} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono"/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Harga Jual</label>
                  <input type="number" required value={quickProduct.sellPrice} onChange={e => setQuickProduct({...quickProduct, sellPrice: parseInt(e.target.value) || 0})} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono"/>
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-xs uppercase tracking-wider mt-4">
                Simpan & Populasikan
              </button>
            </form>
          </div>
        </div>
      )}


      {/* ------------------------------------------------ */}
      {/* 1. ORDER PENJUALAN RENDER MODULE */}
      {/* ------------------------------------------------ */}
      {activeTab === 'order' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form */}
          <div className="lg:col-span-8 glow-card rounded-xl overflow-hidden p-6">
            <div className="border-b border-indigo-50 pb-3 mb-5 flex justify-between items-center text-xs">
              <h3 className="font-extrabold text-slate-800 tracking-tight uppercase">Form Order Penjualan Baru</h3>
              <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-1.5 rounded-lg border border-indigo-100 font-bold">
                No SO: {generatedSoNumber}
              </span>
            </div>

            <form onSubmit={handleSaveSalesOrder} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Tanggal Transaksi</label>
                  <input type="date" required value={soDate} onChange={e => setSoDate(e.target.value)} className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded text-xs font-medium" />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Pilih Mitra (Customer Client)</label>
                  <select required value={soCustomerId} onChange={e => setSoCustomerId(e.target.value)} className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded text-xs font-bold text-slate-700 cursor-pointer">
                    <option value="">-- Hubungkan Mitra --</option>
                    {activeMitraCustomers.map(c => <option key={c.id} value={c.id}>{c.badanUsaha} {c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Tarif Pajak PPN (%)</label>
                  <input type="number" required min="0" max="50" value={soTaxRate} onChange={e => setSoTaxRate(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded text-xs font-semibold" />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Down Payment / DP (Rp)</label>
                  <input type="number" min="0" value={soDownPayment || ''} onChange={e => setSoDownPayment(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-white/70 border border-slate-250 border-dashed rounded text-xs font-black text-emerald-700 font-mono focus:outline-none focus:border-indigo-55 focus:bg-white" placeholder="Kosongkan jika Lunas" />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Biaya Pengiriman (Rp)</label>
                  <input type="number" min="0" value={soShippingFee || ''} onChange={e => setSoShippingFee(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded text-xs font-bold text-indigo-900 font-mono focus:outline-none focus:border-indigo-55 focus:bg-white" placeholder="0" />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-indigo-800 uppercase tracking-wider">Metode Pengadaan Produk Items</span>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={handleAddSoItemRow} className="text-[10px] font-black text-emerald-700 uppercase cursor-pointer">
                      + Tambah Baris
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-lg bg-slate-50/50">
                  <table className="w-full min-w-[700px] text-xs">
                    <thead>
                      <tr className="bg-white/80 border-b border-slate-200 text-indigo-900 text-[10px] font-bold uppercase">
                        <th className="p-3 w-1/3">Pilihan Produk</th>
                        <th className="p-3 w-20 text-center">QTY</th>
                        <th className="p-3 text-right">Harga Jual (Rp)</th>
                        <th className="p-3 text-right w-36">Diskon (Rp)</th>
                        <th className="p-3 text-right">Net Sub</th>
                        <th className="p-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 font-medium">
                      {soItems.map((item, idx) => {
                        const prod = products.find(p => p.id === item.productId);
                        return (
                          <tr key={idx} className="hover:bg-white/40">
                            <td className="p-2">
                              <select required value={item.productId} onChange={e => handleUpdateSoItemRow(idx, 'productId', e.target.value)} className="w-full p-2 bg-white border border-slate-200 text-xs cursor-pointer font-semibold rounded scrollbar-none">
                                <option value="">-- Cari SKU Master --</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.id} - {p.name} ({p.basicUnit})</option>)}
                                <option value="ADD_NEW_PRODUCT" className="text-indigo-600 font-extrabold bg-indigo-50 hover:bg-indigo-100">+ Tambah Produk Baru...</option>
                              </select>
                            </td>
                            <td className="p-2">
                              <input type="number" required min="1" value={item.quantity} onChange={e => handleUpdateSoItemRow(idx, 'quantity', e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded text-xs text-center font-bold" />
                            </td>
                            <td className="p-2">
                              <div className="relative">
                                <span className="absolute left-2 top-2 text-slate-400 text-[10px]">Rp</span>
                                <input type="number" required min="0" value={item.price} onChange={e => handleUpdateSoItemRow(idx, 'price', e.target.value)} className="w-full p-2 pl-7 border border-slate-200 bg-white rounded text-xs font-mono font-bold" />
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="relative">
                                <span className="absolute left-2 top-2 text-slate-400 text-[10px]">Rp</span>
                                <input type="number" min="0" value={item.discount} onChange={e => handleUpdateSoItemRow(idx, 'discount', e.target.value)} className="w-full p-2 pl-7 border border-slate-200 bg-white rounded text-xs font-mono font-bold" placeholder="Optional" />
                              </div>
                            </td>
                            <td className="p-2 text-right font-black text-slate-800 font-mono">
                              Rp {calculatedSo.itemTotals[idx]?.toLocaleString('id-ID')}
                            </td>
                            <td className="p-2 text-center">
                              <button type="button" onClick={() => handleRemoveSoItemRow(idx)} className="text-red-500 hover:text-red-700 transition-colors">
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {soItems.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-white">
                            Belum ada baris pemasokan kargo ditambahkan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary and submit */}
              <div className="flex flex-col sm:flex-row justify-between items-center bg-indigo-50/20 p-5 rounded-xl border border-indigo-50">
                <div className="text-[10px] text-slate-500 max-w-sm leading-relaxed mb-4 sm:mb-0">
                  * Mengeset kalkulasi otomatis (Subtotal kotor, opsional diskon, dan PPN). Simpan draf sebelum meneruskan approval atau final penagihan.
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-wider text-indigo-700 font-extrabold">Grand Total Kontrak SO</p>
                    <p className="text-2xl font-black text-emerald-700 font-mono">Rp {calculatedSo.grandTotal.toLocaleString('id-ID')}</p>
                  </div>
                  <button type="submit" className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-xs tracking-wider uppercase font-extrabold rounded-lg shadow transition-all">
                    Simpan Sales Order
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* List of SOs */}
          <div className="lg:col-span-4 glow-card rounded-xl p-5 h-fit space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 tracking-tight uppercase border-b border-indigo-50 pb-3">Daftar Sales Orders (SO)</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
              {salesOrders.map(so => {
                const c = customers.find(item => item.id === so.customerId);
                return (
                  <div key={so.id} className="p-4 border border-indigo-100 rounded-xl bg-indigo-50/10 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold text-slate-800 text-sm block">{so.id}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{so.date} ・ {c?.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        so.status === 'Invoiced' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        so.status === 'Approved' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {so.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-slate-100 font-bold">
                      <span className="text-slate-400">Total Kontrak:</span>
                      <span className="text-slate-700 font-mono">Rp {so.grandTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button onClick={() => setPrintDoc({ data: so, type: 'ORDER_PENJUALAN' })} className="p-1 px-2.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 rounded flex items-center gap-1 font-bold text-[9px]">
                        <Eye size={10} /> Preview
                      </button>
                      {so.status === 'Draft' && (
                        <button onClick={() => handleApproveSO(so)} className="p-1 px-2.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-1 font-bold text-[9px]">
                          Approve
                        </button>
                      )}
                      <button onClick={() => handleDeleteSalesOrder(so.id)} className="p-1 px-2 bg-red-50 text-red-500 rounded hover:bg-red-100 flex items-center gap-1 font-bold text-[9px]">
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
              {salesOrders.length === 0 && (
                <div className="text-center py-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Order penjualan kosong
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* ------------------------------------------------ */}
      {/* 2. RIWAYAT PENJUALAN RENDER MODULE */}
      {/* ------------------------------------------------ */}
      {activeTab === 'riwayat' && (
        <div className="glow-card rounded-xl overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-indigo-50 bg-white/60 flex justify-between items-center">
            <h4 className="text-xs font-extrabold text-slate-800 tracking-tight uppercase">Buku Pendapatan & Riwayat Logistik Penjualan</h4>
            <button onClick={() => window.print()} className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold tracking-wider uppercase rounded-md shadow flex items-center gap-1">
              <Printer size={13} /> Cetak Buku Penjualan
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[700px]">
              <thead className="bg-slate-50 text-[10px] text-indigo-900 border-b border-slate-200 font-extrabold uppercase">
                <tr>
                  <th className="p-3 text-left">No. Invoice</th>
                  <th className="p-3 text-left">Tanggal</th>
                  <th className="p-3 text-left">Nama Pelanggan</th>
                  <th className="p-3 text-right">Term (Hari)</th>
                  <th className="p-3 text-right">Nilai Total Bersih (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-650">
                {sales.map(s => {
                  const c = customers.find(item => item.id === s.customerId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-55/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-800">{s.id}</td>
                      <td className="p-3">{s.date}</td>
                      <td className="p-3 font-bold">{c?.badanUsaha} {c?.name || 'Klien Kapal'}</td>
                      <td className="p-3 text-right font-bold text-indigo-700">{s.topDays ?? 'Cash'}</td>
                      <td className="p-3 text-right font-black text-slate-800 font-mono">Rp {s.total.toLocaleString('id-ID')}</td>
                    </tr>
                  );
                })}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Belum ada transaksi logistik final tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* ------------------------------------------------ */}
      {/* 3. INVOICE UANG MUKA (DP) MODULE */}
      {/* ------------------------------------------------ */}
      {activeTab === 'dp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List */}
          <div className="lg:col-span-12 glow-card rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-indigo-50 bg-white/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 tracking-tight uppercase">Daftar Tagihan Invoice Uang Muka (DP)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Semua invoice down payment otomatis dari pesanan penjualan kargo/barang niaga.</p>
              </div>
              <button 
                onClick={() => setActiveView && setActiveView('penjualan_order')} 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold tracking-wider uppercase rounded-md shadow flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <Plus size={14} /> Buat Invoice Baru
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[600px]">
                <thead className="bg-slate-50 text-[10px] text-indigo-900 border-b border-slate-200 font-extrabold uppercase">
                  <tr>
                    <th className="p-3 text-left">No. Invoice DP</th>
                    <th className="p-3 text-left">SO Link</th>
                    <th className="p-3 text-left">Mitra Klien</th>
                    <th className="p-3 text-center">Persen DP</th>
                    <th className="p-3 text-right">Nilai DP + Pajak (Rp)</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {dpInvoices.map(dp => {
                    const c = customers.find(item => item.id === dp.customerId);
                    return (
                      <tr key={dp.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-800">{dp.id}</td>
                        <td className="p-3 font-bold text-indigo-700">{dp.salesOrderId}</td>
                        <td className="p-3">{c?.name}</td>
                        <td className="p-3 text-center text-emerald-700 font-black">{dp.dpPercentage}%</td>
                        <td className="p-3 text-right font-black text-slate-800 font-mono">Rp {dp.totalWithTax.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right flex justify-end gap-2">
                          <button onClick={() => setPrintDoc({ data: dp, type: 'INVOICE_UANG_MUKA' })} className="p-1 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[9px] font-bold flex items-center gap-1 uppercase tracking-wider">
                            <Printer size={10} /> Cetak
                          </button>
                          <button onClick={() => handleDeleteDpInvoice(dp.id)} className="p-1 px-2 bg-red-50 hover:bg-red-100 text-red-500 rounded text-[9px] font-bold flex items-center gap-1 uppercase tracking-wider">
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {dpInvoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Belum ada invoice DOWN payment diterbitkan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ------------------------------------------------ */}
      {/* 4. INVOICE PENJUALAN (FINAL) MODULE */}
      {/* ------------------------------------------------ */}
      {activeTab === 'invoice' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List */}
          <div className="lg:col-span-12 glow-card rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-indigo-50 bg-white/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 tracking-tight uppercase">Buku Invoice Komersial Penjualan Final</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Semua invoice penjualan berstempel resmi dari pengadaan kargo lunas.</p>
              </div>
              <button 
                onClick={() => setActiveView && setActiveView('penjualan_order')} 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold tracking-wider uppercase rounded-md shadow flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <Plus size={14} /> Buat Invoice Baru
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[600px]">
                <thead className="bg-slate-50 text-[10px] text-indigo-900 border-b border-slate-200 font-extrabold uppercase">
                  <tr>
                    <th className="p-3 text-left">No. Invoice Resmi</th>
                    <th className="p-3 text-left">SO Link</th>
                    <th className="p-3 text-left">Mitra Klien</th>
                    <th className="p-3 text-right">Tenur TOP</th>
                    <th className="p-3 text-right">Nilai Penagihan (Rp)</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-650">
                  {salesInvoices.map(inv => {
                    const c = customers.find(item => item.id === inv.customerId);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-850">{inv.id}</td>
                        <td className="p-3 font-bold text-indigo-700">{inv.salesOrderId}</td>
                        <td className="p-3 font-bold">{c?.name}</td>
                        <td className="p-3 text-right font-black text-slate-600">{inv.topDays} Hari</td>
                        <td className="p-3 text-right font-black text-slate-800 font-mono">Rp {inv.grandTotal.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right flex justify-end gap-2">
                          <button onClick={() => setPrintDoc({ data: inv, type: 'FINAL_INVOICE' })} className="p-1 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[9px] font-bold flex items-center gap-1 uppercase tracking-wider">
                            <Printer size={10} /> Cetak
                          </button>
                          <button onClick={() => handleDeleteFinalInvoice(inv.id)} className="p-1 px-2 bg-red-50 hover:bg-red-100 text-red-500 rounded text-[9px] font-bold flex items-center gap-1 uppercase tracking-wider">
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {salesInvoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Belum ada draf invoice komersial disimpan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ------------------------------------------------ */}
      {/* 5. KUITANSI PEMBAYARAN MODULE */}
      {/* ------------------------------------------------ */}
      {activeTab === 'kuitansi' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form */}
          <div className="lg:col-span-4 glow-card p-6 h-fit space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 tracking-tight uppercase border-b border-indigo-50 pb-3">Penerbitan Kuitansi Pelunasan</h3>
            <form onSubmit={handleSaveReceipt} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Pilih Link Invoice Terbayar</label>
                <select required value={receiptInvoiceRef} onChange={e => setReceiptInvoiceRef(e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded text-xs cursor-pointer font-bold text-slate-700">
                  <option value="">-- Cari Invoice --</option>
                  {activeInvoices.map(inv => <option key={inv.id} value={inv.id}>[{inv.type}] {inv.id} ・ Rp {inv.val.toLocaleString('id-ID')}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Metode Bayar (Bank/Kas)</label>
                  <input type="text" required value={receiptPaymentMethod} onChange={e => setReceiptPaymentMethod(e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Tanggal Melunasi</label>
                  <input type="date" required value={receiptDate} onChange={e => setReceiptDate(e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Rincian Keterangan</label>
                <textarea rows={2} required value={receiptNotes} onChange={e => setReceiptNotes(e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded text-xs resize-none" />
              </div>

              <div className="my-2 p-3 bg-emerald-50/40 rounded border border-emerald-100 text-[11px] font-bold text-emerald-800">
                Pencairan Kas Masuk: Rp {calculatedReceiptValue.toLocaleString('id-ID')}
              </div>

              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded uppercase tracking-wider text-xs">
                Simpan & Terbitkan Kuitansi
              </button>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-8 glow-card rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-indigo-50 bg-white/60">
              <h4 className="text-xs font-extrabold text-slate-800 tracking-tight uppercase">Buku Arsip Kuitansi Resmi Perusahaan</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[600px]">
                <thead className="bg-slate-50 text-[10px] text-indigo-900 border-b border-slate-200 font-extrabold uppercase">
                  <tr>
                    <th className="p-3 text-left">No. Kuitansi</th>
                    <th className="p-3 text-left">Invoice Referensi</th>
                    <th className="p-3 text-left">Membayar (Mitra)</th>
                    <th className="p-3 text-left">Metode</th>
                    <th className="p-3 text-right">Nilai Nominal (Rp)</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {receipts.map(rec => {
                    const c = customers.find(item => item.id === rec.customerId);
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-850">{rec.id}</td>
                        <td className="p-3 font-mono font-bold text-indigo-705">{rec.invoiceId}</td>
                        <td className="p-3 font-bold">{c?.name}</td>
                        <td className="p-3 font-semibold text-slate-650">{rec.paymentMethod}</td>
                        <td className="p-3 text-right font-black text-emerald-700 font-mono">Rp {rec.amount.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right flex justify-end gap-2">
                          <button onClick={() => setPrintDoc({ data: rec, type: 'KUITANSI_PEMBAYARAN' })} className="p-1 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[9px] font-bold flex items-center gap-1 uppercase tracking-wider">
                            <Printer size={10} /> Cetak
                          </button>
                          <button onClick={() => handleDeleteReceipt(rec.id)} className="p-1 px-2 bg-red-50 hover:bg-red-100 text-red-500 rounded text-[9px] font-bold flex items-center gap-1 uppercase tracking-wider">
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {receipts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Belum ada kuitansi pembayaran resmi dicatatkan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ------------------------------------------------ */}
      {/* 6. SURAT JALAN (DELIVERY ORDER) MODULE */}
      {/* ------------------------------------------------ */}
      {activeTab === 'jalan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form */}
          <div className="lg:col-span-4 glow-card p-6 h-fit space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 tracking-tight uppercase border-b border-indigo-50 pb-3">Buat Surat Jalan (Manifest Cargo)</h3>
            <form onSubmit={handleSaveSj} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Hubungkan Link Rujukan SO</label>
                <select required value={sjRef} onChange={e => setSjRef(e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded text-xs cursor-pointer font-bold text-slate-700">
                  <option value="">-- Pilih Sales Order --</option>
                  {salesOrders.map(so => <option key={so.id} value={so.id}>{so.id} ・ {customers.find(c=>c.id===so.customerId)?.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Nama Supir (Driver)</label>
                  <input type="text" required value={sjDriver} onChange={e => setSjDriver(e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded text-xs" placeholder="e.g. Supir Expedisi" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">No. Plat Mobil</label>
                  <input type="text" required value={sjVehicle} onChange={e => setSjVehicle(e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded text-xs" placeholder="e.g. B 9918 TQA" />
                </div>
              </div>
              <div className="grid grid-cols-1">
                <div>
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Tanggal Pengiriman</label>
                  <input type="date" required value={sjDate} onChange={e => setSjDate(e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">Catatan Pemuatan</label>
                <textarea rows={2} required value={sjNotes} onChange={e => setSjNotes(e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded text-xs resize-none" />
              </div>

              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded uppercase tracking-wider text-xs">
                Simpan & Terbitkan Surat Jalan
              </button>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-8 glow-card rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-indigo-50 bg-white/60">
              <h4 className="text-xs font-extrabold text-slate-800 tracking-tight uppercase">Daftar Surat Jalan (Surat Pengantar Cargo)</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[600px]">
                <thead className="bg-slate-50 text-[10px] text-indigo-900 border-b border-slate-200 font-extrabold uppercase">
                  <tr>
                    <th className="p-3 text-left">No. Surat Jalan</th>
                    <th className="p-3 text-left">No. SO Rujukan</th>
                    <th className="p-3 text-left">Tujuan (Mitra)</th>
                    <th className="p-3 text-left">Supir Cargo</th>
                    <th className="p-3 text-center">Nopol Supir</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {deliveryOrders.map(sj => {
                    const c = customers.find(item => item.id === sj.customerId);
                    return (
                      <tr key={sj.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-850">{sj.id}</td>
                        <td className="p-3 font-mono font-bold text-indigo-700">{sj.referenceId}</td>
                        <td className="p-3 font-bold">{c?.name}</td>
                        <td className="p-3 font-bold text-slate-600">{sj.driverName}</td>
                        <td className="p-3 text-center font-bold text-slate-600">{sj.vehicleNo}</td>
                        <td className="p-3 text-right flex justify-end gap-2">
                          <button onClick={() => setPrintDoc({ data: sj, type: 'SURAT_JALAN' })} className="p-1 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[9px] font-bold flex items-center gap-1 uppercase tracking-wider">
                            <Printer size={10} /> Cetak
                          </button>
                          <button onClick={() => handleDeleteSj(sj.id)} className="p-1 px-2 bg-red-50 hover:bg-red-100 text-red-500 rounded text-[9px] font-bold flex items-center gap-1 uppercase tracking-wider">
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {deliveryOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Belum ada manifest logistik / surat jalan dibuat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
