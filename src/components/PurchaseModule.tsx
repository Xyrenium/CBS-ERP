import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store';
import { Product, Customer } from '../types';
import { Plus, Trash2, ArrowLeft, Download, FileText, CheckCircle2, Calendar, DollarSign, Receipt, Package, Truck, Eye, X } from 'lucide-react';

interface PurchaseOrderItem {
  productId: string;
  description: string;
  quantity: number;
  price: number;
  discount: number;
  taxRate: number; // e.g. 11 for 11% PPN, or 0
  total: number;
}

interface PurchaseOrder {
  id: string; // PO/CBS/2026/0001
  date: string;
  supplierId: string;
  supplierName: string;
  tempo: number; // in days
  dueDate: string; // auto calculated
  loadingDate: string;
  deliveryDate: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingCost?: number;
  grandTotal: number;
  status: 'Completed' | 'Pending Payment';
}

interface PurchaseInvoice {
  id: string; // INV-PO-0001
  purchaseOrderId: string;
  date: string;
  dueDate: string;
  supplierName: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingCost?: number;
  grandTotal: number;
  tempo: number;
  status: 'LUNAS' | 'BELUM LUNAS';
}

interface PurchaseReceipt {
  id: string; // KUI-PO-0001
  purchaseInvoiceId: string;
  purchaseOrderId: string;
  date: string;
  supplierName: string;
  amount: number;
  status: 'PAID';
}

interface GoodsReceipt {
  id: string; // SPB-PO-0001
  purchaseOrderId: string;
  date: string;
  supplierName: string;
  loadingDate: string;
  deliveryDate: string;
  status: 'DITERIMA';
}

interface PurchaseModuleProps {
  activeSubView?: string;
  setActiveView?: (view: string) => void;
}

export function PurchaseModule({ activeSubView = 'pembelian_order', setActiveView }: PurchaseModuleProps) {
  const { products, setProducts, customers, addPurchase } = useStore();

  // Filters supplier list
  const suppliers = useMemo(() => {
    return customers.filter(c => c.category === 'Supplier');
  }, [customers]);

  // ----------------- LOCAL PERSISTENCE STATES -----------------
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('cbs_purchase_orders');
    if (saved) return JSON.parse(saved);
    // Seed data
    return [
      {
        id: 'PO/CBS/2026/0001',
        date: '2026-05-15',
        supplierId: 'SUP-001',
        supplierName: 'PT Samudra Logistik Pratama',
        tempo: 30,
        dueDate: '2026-06-14',
        loadingDate: '2026-05-16',
        deliveryDate: '2026-05-20',
        items: [
          {
            productId: 'P-SEAMLESS-01',
            description: 'Pipa Seamless Carbon Steel Grade B 4 Inch',
            quantity: 50,
            price: 450000,
            discount: 10000,
            taxRate: 11,
            total: 24420000
          }
        ],
        subtotal: 22000000,
        discountTotal: 500000,
        taxTotal: 2365000,
        grandTotal: 23865000,
        status: 'Pending Payment'
      },
      {
        id: 'PO/CBS/2026/0002',
        date: '2026-06-01',
        supplierId: 'SUP-002',
        supplierName: 'Indo Vessel Supply',
        tempo: 0,
        dueDate: '2026-06-01',
        loadingDate: '2026-06-02',
        deliveryDate: '2026-06-03',
        items: [
          {
            productId: 'P-VALVE-02',
            description: 'Cast Steel Gate Valve ANSI 150 RF',
            quantity: 10,
            price: 1250000,
            discount: 0,
            taxRate: 11,
            total: 13875000
          }
        ],
        subtotal: 12500000,
        discountTotal: 0,
        taxTotal: 1375000,
        grandTotal: 13875000,
        status: 'Completed'
      }
    ] as PurchaseOrder[];
  });

  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>(() => {
    const saved = localStorage.getItem('cbs_purchase_invoices');
    if (saved) return JSON.parse(saved);
    // Seed corresponding to seed POs
    return [
      {
        id: 'INV/PO/2026/0001',
        purchaseOrderId: 'PO/CBS/2026/0001',
        date: '2026-05-15',
        dueDate: '2026-06-14',
        supplierName: 'PT Samudra Logistik Pratama',
        subtotal: 22000000,
        discountTotal: 500000,
        taxTotal: 2365000,
        grandTotal: 23865000,
        tempo: 30,
        status: 'BELUM LUNAS'
      },
      {
        id: 'INV/PO/2026/0002',
        purchaseOrderId: 'PO/CBS/2026/0002',
        date: '2026-06-01',
        dueDate: '2026-06-01',
        supplierName: 'Indo Vessel Supply',
        subtotal: 12500000,
        discountTotal: 0,
        taxTotal: 1375000,
        grandTotal: 13875000,
        tempo: 0,
        status: 'LUNAS'
      }
    ] as PurchaseInvoice[];
  });

  const [purchaseReceipts, setPurchaseReceipts] = useState<PurchaseReceipt[]>(() => {
    const saved = localStorage.getItem('cbs_purchase_receipts');
    if (saved) return JSON.parse(saved);
    // Seed corresponding to seed PO 2 (Completed)
    return [
      {
        id: 'KUI/PO/2026/0001',
        purchaseInvoiceId: 'INV/PO/2026/0002',
        purchaseOrderId: 'PO/CBS/2026/0002',
        date: '2026-06-01',
        supplierName: 'Indo Vessel Supply',
        amount: 13875000,
        status: 'PAID'
      }
    ] as PurchaseReceipt[];
  });

  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>(() => {
    const saved = localStorage.getItem('cbs_goods_receipts');
    if (saved) return JSON.parse(saved);
    // Seed
    return [
      {
        id: 'SPB/PO/2026/0001',
        purchaseOrderId: 'PO/CBS/2026/0001',
        date: '2026-05-16',
        supplierName: 'PT Samudra Logistik Pratama',
        loadingDate: '2026-05-16',
        deliveryDate: '2026-05-20',
        status: 'DITERIMA'
      },
      {
        id: 'SPB/PO/2026/0002',
        purchaseOrderId: 'PO/CBS/2026/0002',
        date: '2026-06-02',
        supplierName: 'Indo Vessel Supply',
        loadingDate: '2026-06-02',
        deliveryDate: '2026-06-03',
        status: 'DITERIMA'
      }
    ] as GoodsReceipt[];
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('cbs_purchase_orders', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('cbs_purchase_invoices', JSON.stringify(purchaseInvoices));
  }, [purchaseInvoices]);

  useEffect(() => {
    localStorage.setItem('cbs_purchase_receipts', JSON.stringify(purchaseReceipts));
  }, [purchaseReceipts]);

  useEffect(() => {
    localStorage.setItem('cbs_goods_receipts', JSON.stringify(goodsReceipts));
  }, [goodsReceipts]);

  // ----------------- FORM ORDER PEMBELIAN STATES -----------------
  const [poDate, setPoDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poTempo, setPoTempo] = useState<number>(0);
  const [poShippingCost, setPoShippingCost] = useState<number>(0);
  const [poLoadingDate, setPoLoadingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [poDeliveryDate, setPoDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [poItems, setPoItems] = useState<PurchaseOrderItem[]>([
    { productId: '', description: '', quantity: 1, price: 0, discount: 0, taxRate: 11, total: 0 }
  ]);

  // Quick Product Addition states
  const [showQuickAddProduct, setShowQuickAddProduct] = useState(false);
  const [quickProductRowIndex, setQuickProductRowIndex] = useState<number | null>(null);
  const [quickProduct, setQuickProduct] = useState({
    id: '',
    name: '',
    description: '',
    category: 'Valves',
    unitCategory: 'Maritim',
    basicUnit: 'pcs',
    stock: 100,
    minStock: 5,
    buyPrice: 150000,
    sellPrice: 200000
  });

  // Standard product categories
  const categoriesList = [
    'Pipa hitam seamless',
    'Cargo fittings',
    'Aksesoris jangkar dan jangkar kapal',
    'Mesin tempel',
    'Alat keselamatan kapal',
    'Valves',
    'Mesin induk kapal',
    'Mesin bantu kapal',
    'Wire roope'
  ];

  // Auto PO sequence number
  const generatedPoNumber = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const prefix = `PO/CBS/${currentYear}/`;
    const count = purchaseOrders.length + 1;
    const seq = String(count).padStart(4, '0');
    return `${prefix}${seq}`;
  }, [purchaseOrders]);

  // Due date auto calculation
  const calculatedDueDate = useMemo(() => {
    if (!poDate) return '';
    const d = new Date(poDate);
    d.setDate(d.getDate() + poTempo);
    return d.toISOString().split('T')[0];
  }, [poDate, poTempo]);

  // Live total calculation for active PO form
  const calculatedPo = useMemo(() => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;
    const itemTotals = poItems.map(item => {
      const discountedPrice = Math.max(0, item.price - item.discount);
      const rawTotal = item.quantity * discountedPrice;
      const taxAmount = item.taxRate > 0 ? (rawTotal * (item.taxRate / 100)) : 0;
      subtotal += item.quantity * item.price;
      discountTotal += item.quantity * item.discount;
      taxTotal += taxAmount;
      return rawTotal + taxAmount;
    });

    const grandTotal = subtotal - discountTotal + taxTotal + poShippingCost;

    return {
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal,
      itemTotals
    };
  }, [poItems, poShippingCost]);

  const handleAddPoItemRow = () => {
    setPoItems([...poItems, { productId: '', description: '', quantity: 1, price: 0, discount: 0, taxRate: 11, total: 0 }]);
  };

  const handleRemovePoItemRow = (idx: number) => {
    if (poItems.length === 1) return;
    setPoItems(poItems.filter((_, i) => i !== idx));
  };

  const handleUpdatePoItemRow = (idx: number, field: keyof PurchaseOrderItem, value: any) => {
    if (field === 'productId' && value === 'ADD_NEW_PRODUCT') {
      setQuickProductRowIndex(idx);
      setShowQuickAddProduct(true);
      return;
    }

    const updated = [...poItems];
    const item = { ...updated[idx] };

    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      item.productId = value;
      item.price = prod ? prod.buyPrice : 0;
      item.description = prod ? prod.description : '';
    } else if (field === 'price') {
      item.price = parseFloat(value) || 0;
    } else if (field === 'quantity') {
      item.quantity = parseInt(value) || 0;
    } else if (field === 'discount') {
      item.discount = parseFloat(value) || 0;
    } else if (field === 'taxRate') {
      item.taxRate = parseFloat(value) || 0;
    } else if (field === 'description') {
      item.description = value;
    }

    // Recalculate row total
    const discountedPrice = Math.max(0, item.price - item.discount);
    const rawTotal = item.quantity * discountedPrice;
    const taxAmount = item.taxRate > 0 ? (rawTotal * (item.taxRate / 100)) : 0;
    item.total = rawTotal + taxAmount;

    updated[idx] = item;
    setPoItems(updated);
  };

  // Quick Product Addition handler
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
      const updated = [...poItems];
      if (updated[quickProductRowIndex]) {
        updated[quickProductRowIndex].productId = quickProduct.id;
        updated[quickProductRowIndex].price = quickProduct.buyPrice;
        updated[quickProductRowIndex].description = quickProduct.description;
        
        // recalculate row total
        const row = updated[quickProductRowIndex];
        const rawTotal = row.quantity * Math.max(0, row.price - row.discount);
        row.total = rawTotal + (row.taxRate > 0 ? rawTotal * (row.taxRate / 100) : 0);
      }
      setPoItems(updated);
      setQuickProductRowIndex(null);
    }

    setShowQuickAddProduct(false);
    setQuickProduct({
      id: '',
      name: '',
      description: '',
      category: 'Valves',
      unitCategory: 'Maritim',
      basicUnit: 'pcs',
      stock: 100,
      minStock: 5,
      buyPrice: 150000,
      sellPrice: 200000
    });
  };

  // Submit Order Pembelian Form
  const handleSavePurchaseOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poSupplierId) {
      alert("Silakan pilih Supplier Terdaftar.");
      return;
    }
    if (poItems.some(i => !i.productId || i.quantity <= 0)) {
      alert("Harap lengkapi item produk dan jumlah!");
      return;
    }

    const supplierObject = suppliers.find(s => s.id === poSupplierId);
    const supplierName = supplierObject ? supplierObject.name : 'Unknown Supplier';

    const isLunas = poTempo === 0;

    // Create Purchase Order object
    const newPO: PurchaseOrder = {
      id: generatedPoNumber,
      date: poDate,
      supplierId: poSupplierId,
      supplierName: supplierName,
      tempo: poTempo,
      dueDate: calculatedDueDate,
      loadingDate: poLoadingDate,
      deliveryDate: poDeliveryDate,
      items: poItems.map((item, i) => ({ ...item, total: calculatedPo.itemTotals[i] })),
      subtotal: calculatedPo.subtotal,
      discountTotal: calculatedPo.discountTotal,
      taxTotal: calculatedPo.taxTotal,
      shippingCost: poShippingCost,
      grandTotal: calculatedPo.grandTotal,
      status: isLunas ? 'Completed' : 'Pending Payment'
    };

    // 1. Create Invoice Pembelian
    const countInv = purchaseInvoices.length + 1;
    const newInvoiceId = `INV/PO/2026/${String(countInv).padStart(4, '0')}`;
    const newInvoice: PurchaseInvoice = {
      id: newInvoiceId,
      purchaseOrderId: generatedPoNumber,
      date: poDate,
      dueDate: calculatedDueDate,
      supplierName: supplierName,
      subtotal: calculatedPo.subtotal,
      discountTotal: calculatedPo.discountTotal,
      taxTotal: calculatedPo.taxTotal,
      shippingCost: poShippingCost,
      grandTotal: calculatedPo.grandTotal,
      tempo: poTempo,
      status: isLunas ? 'LUNAS' : 'BELUM LUNAS'
    };

    // 2. Create Surat Penerimaan Barang (Goods Receipt)
    const countGR = goodsReceipts.length + 1;
    const newGoodsReceiptId = `SPB/PO/2026/${String(countGR).padStart(4, '0')}`;
    const newGoodsReceipt: GoodsReceipt = {
      id: newGoodsReceiptId,
      purchaseOrderId: generatedPoNumber,
      date: poLoadingDate,
      supplierName: supplierName,
      loadingDate: poLoadingDate,
      deliveryDate: poDeliveryDate,
      status: 'DITERIMA'
    };

    // 3. Create Kuitansi Pembelian if lunas
    let newReceipt: PurchaseReceipt | null = null;
    if (isLunas) {
      const countReceipt = purchaseReceipts.length + 1;
      const newReceiptId = `KUI/PO/2026/${String(countReceipt).padStart(4, '0')}`;
      newReceipt = {
        id: newReceiptId,
        purchaseInvoiceId: newInvoiceId,
        purchaseOrderId: generatedPoNumber,
        date: poDate,
        supplierName: supplierName,
        amount: calculatedPo.grandTotal,
        status: 'PAID'
      };
    }

    // Persist and register transaction in physical inventory ledger (store context)
    addPurchase({
      id: generatedPoNumber,
      date: poDate,
      supplier: supplierName,
      items: poItems.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.price,
        total: i.quantity * i.price
      })),
      total: calculatedPo.grandTotal
    });

    // Save states
    setPurchaseOrders([newPO, ...purchaseOrders]);
    setPurchaseInvoices([newInvoice, ...purchaseInvoices]);
    setGoodsReceipts([newGoodsReceipt, ...goodsReceipts]);
    if (newReceipt) {
      setPurchaseReceipts([newReceipt, ...purchaseReceipts]);
    }

    // Success alert
    if (isLunas) {
      alert(`Sukses! PO ${generatedPoNumber} disimpan.\n- Invoice ${newInvoiceId} diterbitkan (LUNAS).\n- Surat Penerimaan ${newGoodsReceiptId} otomatis diterima.\n- Kuitansi Lunas ${newReceipt?.id} otomatis diarsipkan.\nStok bertambah.`);
    } else {
      alert(`Sukses! PO ${generatedPoNumber} disimpan.\n- Invoice ${newInvoiceId} diterbitkan (PENDING ${poTempo} hari).\n- Surat Penerimaan ${newGoodsReceiptId} otomatis diterima.\nStok bertambah.`);
    }

    // Reset Form
    setPoItems([{ productId: '', description: '', quantity: 1, price: 0, discount: 0, taxRate: 11, total: 0 }]);
    setPoSupplierId('');
    setPoTempo(0);
    setPoShippingCost(0);
  };

  // Helper action to manually pay an unpaid purchase invoice
  const handlePayInvoice = (inv: PurchaseInvoice) => {
    if (inv.status === 'LUNAS') return;

    const countReceipt = purchaseReceipts.length + 1;
    const newReceiptId = `KUI/PO/2026/${String(countReceipt).padStart(4, '0')}`;
    const newReceipt: PurchaseReceipt = {
      id: newReceiptId,
      purchaseInvoiceId: inv.id,
      purchaseOrderId: inv.purchaseOrderId,
      date: new Date().toISOString().split('T')[0],
      supplierName: inv.supplierName,
      amount: inv.grandTotal,
      status: 'PAID'
    };

    setPurchaseReceipts([newReceipt, ...purchaseReceipts]);
    setPurchaseInvoices(purchaseInvoices.map(item => item.id === inv.id ? { ...item, status: 'LUNAS' } : item));
    setPurchaseOrders(purchaseOrders.map(p => p.id === inv.purchaseOrderId ? { ...p, status: 'Completed' } : p));

    alert(`Kuitansi Pelunasan ${newReceiptId} berhasil dibuat. Status Invoice ${inv.id} kini LUNAS.`);
  };

  // Printable receipt state
  const [printDoc, setPrintDoc] = useState<{ data: any; type: 'PO' | 'Invoice' | 'Receipt' | 'SPB' } | null>(null);

  if (printDoc) {
    const doc = printDoc.data;
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center no-print">
          <button onClick={() => setPrintDoc(null)} className="flex items-center text-indigo-700 hover:text-slate-800 bg-white border border-slate-200 px-4 py-2 rounded-md font-bold transition-colors shadow-sm text-xs">
            <ArrowLeft size={16} className="mr-2"/> Kembali
          </button>
          <button onClick={() => window.print()} className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-bold transition-colors shadow-sm text-xs cursor-pointer">
            <Download size={16} className="mr-2"/> Cetak Dokumen PDF
          </button>
        </div>

        <div className="bg-white p-10 rounded-xl report-font print-area text-slate-800 max-w-4xl mx-auto border border-slate-200 shadow-md">
          {/* Header */}
          <div className="flex justify-between items-center border-b-2 border-slate-300 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded flex items-center justify-center overflow-hidden shrink-0">
                <img src="/logo cbs.png" alt="Logo" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
              </div>
              <div className="text-left font-sans">
                <h1 className="text-lg font-extrabold text-slate-800">PT. CARACA BINTANG SAMUDRA</h1>
                <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest leading-none mt-0.5">Maritime Supplier & Logistik Kargo</p>
                <p className="text-[10px] text-slate-450 mt-1">Jl. Pelabuhan Raya No. 88, Tanjung Priok, Jakarta, 14310</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xs font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md inline-block">
                {printDoc.type === 'PO' && 'Purchase Order (PO)'}
                {printDoc.type === 'Invoice' && 'Invoice Pembelian'}
                {printDoc.type === 'Receipt' && 'Kuitansi Pembelian'}
                {printDoc.type === 'SPB' && 'Surat Penerimaan Barang'}
              </h2>
              <p className="text-[11px] text-slate-500 font-bold mt-1.5">No: <span className="text-slate-800 font-mono">{doc.id}</span></p>
            </div>
          </div>

          {/* Core metadata info */}
          <div className="grid grid-cols-2 gap-8 mb-8 text-xs text-slate-705">
            <div>
              <p className="font-bold text-indigo-800 uppercase tracking-wider text-[9px] mb-2">Informasi Transaksi</p>
              {printDoc.type === 'Receipt' ? (
                <div className="space-y-1">
                  <p><span className="text-slate-400">Tanggal Bayar:</span> <span className="font-semibold">{doc.date}</span></p>
                  <p><span className="text-slate-400">Metode:</span> <span className="font-semibold">Transfer Bank Mandiri</span></p>
                  <p><span className="text-slate-400">Sanggutan Ref Invoice:</span> <span className="font-mono font-semibold">{doc.purchaseInvoiceId}</span></p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p><span className="text-slate-400">Tanggal Dokumen:</span> <span className="font-semibold">{doc.date}</span></p>
                  {doc.dueDate && <p><span className="text-slate-400">Jatuh Tempo:</span> <span className="font-semibold text-red-600">{doc.dueDate}</span></p>}
                  {doc.loadingDate && <p><span className="text-slate-400">Loading Kargo:</span> <span className="font-semibold">{doc.loadingDate}</span></p>}
                  {doc.deliveryDate && <p><span className="text-slate-400">Pengiriman:</span> <span className="font-semibold">{doc.deliveryDate}</span></p>}
                </div>
              )}
            </div>

            <div className="text-right">
              <p className="font-bold text-indigo-800 uppercase tracking-wider text-[9px] mb-2">Vendor / Supplier</p>
              <p className="font-extrabold text-sm text-slate-900">{doc.supplierName || doc.supplier}</p>
              <p className="text-[11px] text-slate-500 mt-1">Status Kemitraan: <span className="font-bold text-emerald-700">Verifikasi Terdaftar</span></p>
            </div>
          </div>

          {/* Details Table */}
          {printDoc.type !== 'Receipt' && doc.items ? (
            <div className="border border-slate-200 rounded-lg overflow-x-auto mb-6">
              <table className="w-full text-xs font-medium text-slate-700 min-w-[600px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 uppercase text-[9px] font-bold">
                  <tr>
                    <th className="px-4 py-2 text-left">SKU Produk</th>
                    <th className="px-4 py-2 text-left">Deskripsi Kargo / Spesifikasi</th>
                    <th className="px-4 py-2 text-center w-16">QTY</th>
                    <th className="px-4 py-2 text-right w-24">Harga</th>
                    <th className="px-4 py-2 text-right w-20">Diskon</th>
                    <th className="px-4 py-2 text-right w-24">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {doc.items.map((it: any, idx: number) => {
                    const lineSub = it.quantity * (it.price - it.discount);
                    const lineTax = it.taxRate > 0 ? (lineSub * (it.taxRate / 100)) : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-semibold text-indigo-850">{it.productId}</td>
                        <td className="px-4 py-3 text-slate-650">{it.description || 'Barang Logistik PT Caraca'}</td>
                        <td className="px-4 py-3 text-center font-bold">{it.quantity}</td>
                        <td className="px-4 py-3 text-right">Rp {it.price.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3 text-right">Rp {it.discount.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3 text-right font-semibold">Rp {(lineSub + lineTax).toLocaleString('id-ID')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : printDoc.type === 'Receipt' ? (
            <div className="bg-emerald-50/45 border-2 border-dashed border-emerald-300 p-8 rounded-xl text-center my-6">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Jumlah Terbayar Lunas</span>
              <p className="text-3xl font-black text-emerald-700 mt-2 font-mono">Rp {doc.amount.toLocaleString('id-ID')}</p>
              <p className="text-xs text-slate-500 mt-1.5">Kwitansi dikeluarkan resmi oleh PT Caraca Bintang Samudra</p>
            </div>
          ) : null}

          {/* Subtotals & Signature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs pt-4 border-t border-slate-205">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Pemberitahuan Internal</p>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Dokumen komersial ini sah dikeluarkan melalui sistem ERP internal PT Caraca Bintang Samudra. Penerimaan logistik divalidasi oleh otoritas gudang utama Tanjung Priok.
              </p>
            </div>
            
            {printDoc.type !== 'Receipt' && doc.subtotal && (
              <div className="space-y-1.5 font-bold text-slate-650 text-right">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono text-slate-800">Rp {doc.subtotal.toLocaleString('id-ID')}</span>
                </div>
                {doc.discountTotal > 0 && (
                  <div className="flex justify-between text-indigo-700">
                    <span>Dipotong Diskon:</span>
                    <span className="font-mono">- Rp {doc.discountTotal.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-indigo-700">
                  <span>PPN Pajak Total:</span>
                  <span className="font-mono">Rp {doc.taxTotal.toLocaleString('id-ID')}</span>
                </div>
                {doc.shippingCost > 0 && (
                  <div className="flex justify-between text-indigo-700">
                    <span>Biaya Pengiriman:</span>
                    <span className="font-mono text-slate-800">Rp {doc.shippingCost.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 border-t border-slate-200/50 pt-2 text-md font-black">
                  <span>Grand Total Tagihan:</span>
                  <span className="font-mono text-xl text-indigo-850">Rp {doc.grandTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 mt-12 text-center text-xs">
            <div>
              <p className="text-slate-400 uppercase tracking-wider text-[9px] mb-12">Disetujui Oleh</p>
              <div className="font-bold border-b border-slate-300 pb-1 mx-8 text-slate-800">{printDoc.type === 'Receipt' ? doc.supplierName : 'Authorized Officer'}</div>
              <p className="text-[9px] text-slate-400 font-medium mt-1">PT Caraca Bintang Samudra</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase tracking-wider text-[9px] mb-12">Penerima Barang</p>
              <div className="font-bold border-b border-slate-300 pb-1 mx-8 text-slate-800">{printDoc.type === 'Receipt' ? 'PT Caraca Bintang Samudra' : (doc.supplierName || 'Operational Team')}</div>
              <p className="text-[9px] text-slate-400 font-medium mt-1">Stempel & Tanda Tangan Basah</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ------------------------------------------------ */}
      {/* ORDER PEMBELIAN SUB-VIEW */}
      {/* ------------------------------------------------ */}
      {activeSubView === 'pembelian_order' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Entry Form Column */}
          <div className="lg:col-span-8 glow-card rounded-xl overflow-hidden p-6 space-y-6">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Form Order Pembelian (PO Baru)</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Menerbitkan dokumen kontrak pengadaan kargo logistik resmi.</p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-150 rounded text-[11px] font-black text-indigo-700 font-mono">
                No PO: {generatedPoNumber}
              </span>
            </div>

            <form onSubmit={handleSavePurchaseOrder} className="space-y-6 text-xs text-slate-700">
              
              {/* Core attributes input */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1.5">Supplier / Vendor Berizin</label>
                  <select 
                    required 
                    value={poSupplierId} 
                    onChange={e => setPoSupplierId(e.target.value)} 
                    className="w-full p-2 bg-white/80 border border-slate-200 rounded text-xs cursor-pointer font-bold text-slate-700 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  >
                    <option value="">-- Cari Supplier Master --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.badanUsaha})</option>
                    ))}
                  </select>
                  {suppliers.length === 0 && (
                    <p className="text-[9px] text-red-500 font-bold mt-1 uppercase">Belum ada Supplier di Master Data Customer!</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1.5">Termin Tempo (Hari)</label>
                  <input 
                    type="number" 
                    required 
                    min="0" 
                    placeholder="Masukkan jumlah hari" 
                    value={poTempo || ''} 
                    onChange={e => setPoTempo(Math.max(0, parseInt(e.target.value) || 0))} 
                    className="w-full px-3 py-2 bg-white/80 border border-slate-200 rounded text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1.5">Tanggal Jatuh Tempo</label>
                  <input 
                    type="date" 
                    readOnly 
                    value={calculatedDueDate} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-extrabold text-indigo-900 focus:outline-none cursor-not-allowed" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1.5">Tanggal Pembelian (Tanggal Transaksi)</label>
                  <input 
                    type="date" 
                    required 
                    value={poDate} 
                    onChange={e => setPoDate(e.target.value)} 
                    className="w-full px-3 py-2 bg-white/80 border border-slate-200 rounded text-xs font-medium focus:outline-none focus:border-indigo-600" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1.5">Tanggal Loading</label>
                  <input 
                    type="date" 
                    required 
                    value={poLoadingDate} 
                    onChange={e => setPoLoadingDate(e.target.value)} 
                    className="w-full px-3 py-2 bg-white/80 border border-slate-200 rounded text-xs font-medium focus:outline-none focus:border-indigo-600" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1.5">Tanggal Pengiriman (ETA)</label>
                  <input 
                    type="date" 
                    required 
                    value={poDeliveryDate} 
                    onChange={e => setPoDeliveryDate(e.target.value)} 
                    className="w-full px-3 py-2 bg-white/80 border border-slate-200 rounded text-xs font-medium focus:outline-none focus:border-indigo-600" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1.5">Biaya Pengiriman (Rp)</label>
                  <input 
                    type="number" 
                    min="0" 
                    placeholder="Biaya kirim..." 
                    value={poShippingCost || ''} 
                    onChange={e => setPoShippingCost(Math.max(0, parseInt(e.target.value) || 0))} 
                    className="w-full px-3 py-2 bg-white/80 border border-slate-200 rounded text-xs font-bold text-indigo-900 font-mono focus:outline-none focus:border-indigo-600 focus:bg-white" 
                  />
                </div>
              </div>

              {/* Items listing table */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[10px] font-black text-indigo-850 uppercase tracking-wider">Metode Pengadaan Produk Items</span>
                  <button 
                    type="button" 
                    onClick={handleAddPoItemRow} 
                    className="text-[10px] font-black text-emerald-700 hover:text-slate-800 uppercase cursor-pointer"
                  >
                    + Tambah Baris
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-lg bg-white/60">
                  <table className="w-full min-w-[700px] text-xs">
                    <thead className="bg-slate-50/70 border-b border-slate-150 text-[10px] font-black text-indigo-900 uppercase">
                      <tr>
                        <th className="p-2 text-left">SKU Master</th>
                        <th className="p-2 text-left">Keterangan / Deskripsi Khusus</th>
                        <th className="p-2 text-center w-20">Kuantitas</th>
                        <th className="p-2 text-right w-28">Harga Beli (Rp)</th>
                        <th className="p-2 text-right w-24">Diskon (Rp)</th>
                        <th className="p-2 text-center w-24">Pajak PPN</th>
                        <th className="p-2 text-right w-28">Total</th>
                        <th className="p-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {poItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/40">
                          <td className="p-2">
                            <select 
                              required 
                              value={item.productId} 
                              onChange={e => handleUpdatePoItemRow(idx, 'productId', e.target.value)} 
                              className="w-full p-2 bg-white border border-slate-200 text-xs cursor-pointer font-bold rounded scrollbar-none"
                            >
                              <option value="">-- Cari SKU Master --</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.id} - {p.name}</option>)}
                              <option value="ADD_NEW_PRODUCT" className="text-indigo-600 font-extrabold bg-indigo-50 hover:bg-slate-200">+ Tambah Produk Baru...</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input 
                              type="text" 
                              required 
                              value={item.description} 
                              onChange={e => handleUpdatePoItemRow(idx, 'description', e.target.value)} 
                              className="w-full p-2 bg-white border border-slate-200 rounded text-xs" 
                              placeholder="Keterangan spesifikasi..." 
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="number" 
                              required 
                              min="1" 
                              value={item.quantity} 
                              onChange={e => handleUpdatePoItemRow(idx, 'quantity', e.target.value)} 
                              className="w-full p-2 bg-white border border-slate-200 rounded text-xs text-center font-bold" 
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="number" 
                              required 
                              min="0" 
                              value={item.price} 
                              onChange={e => handleUpdatePoItemRow(idx, 'price', e.target.value)} 
                              className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-mono font-bold text-right" 
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="number" 
                              required 
                              min="0" 
                              value={item.discount} 
                              onChange={e => handleUpdatePoItemRow(idx, 'discount', e.target.value)} 
                              className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-mono text-indigo-700 text-right" 
                            />
                          </td>
                          <td className="p-2">
                            <select 
                              value={item.taxRate} 
                              onChange={e => handleUpdatePoItemRow(idx, 'taxRate', e.target.value)} 
                              className="w-full p-2 bg-white border border-slate-200 rounded text-xs text-center cursor-pointer"
                            >
                              <option value="11">PPN 11%</option>
                              <option value="0">Bebas Pajak (0%)</option>
                            </select>
                          </td>
                          <td className="p-2 text-right font-mono font-bold font-black text-slate-800 pr-3">
                            Rp {calculatedPo.itemTotals[idx].toLocaleString('id-ID')}
                          </td>
                          <td className="p-2 text-center">
                            <button 
                              type="button" 
                              disabled={poItems.length === 1} 
                              onClick={() => handleRemovePoItemRow(idx)} 
                              className="text-slate-300 hover:text-red-500 disabled:opacity-30 cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculator Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/70 p-5 rounded-xl border border-slate-200/50">
                <div className="text-[10px] text-slate-450 leading-relaxed font-semibold self-center">
                  <span className="font-bold text-indigo-850 block mb-1">KETENTUAN PENGADAAN BARANG:</span>
                  Semua transaksi pesanan pembelian diarsipkan ke dalam basis data Surat Jalan logistik untuk proses rekonsiliasi pengiriman fasa pelabuhan. Pengisian tempo otomatis dialokasikan ke hutang usaha.
                </div>

                <div className="space-y-2 text-xs font-bold text-slate-650">
                  <div className="flex justify-between">
                    <span>Subtotal Kotor:</span>
                    <span className="font-mono text-slate-800">Rp {calculatedPo.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {calculatedPo.discountTotal > 0 && (
                    <div className="flex justify-between text-indigo-700">
                      <span>Jumlah Diskon Vendor:</span>
                      <span className="font-mono">- Rp {calculatedPo.discountTotal.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-indigo-700">
                    <span>Apaliasi Pajak (PPN):</span>
                    <span className="font-mono">Rp {calculatedPo.taxTotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-indigo-850 border-t border-slate-200 pt-2 text-sm font-black">
                    <span>Grand Total:</span>
                    <span className="font-mono text-lg text-indigo-900">Rp {calculatedPo.grandTotal.toLocaleString('id-ID')}</span>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white font-extrabold uppercase tracking-wide rounded shadow mt-3 cursor-pointer"
                  >
                    Simpan Order & Terbitkan Invoice
                  </button>
                </div>
              </div>

            </form>
          </div>

          {/* List of saved PO history in sidebar */}
          <div className="lg:col-span-4 glow-card flex flex-col p-6 h-fit space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Daftar Purchase Orders (PO)</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Riwayat PO diarsip resmi dalam sistem CBS ERP.</p>
            </div>

            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {purchaseOrders.map(po => (
                <div key={po.id} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0 font-medium">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-[11px] text-indigo-750 font-mono">{po.id}</span>
                    <button 
                      onClick={() => setPrintDoc({ data: po, type: 'PO' })} 
                      className="text-[9px] hover:underline font-bold text-indigo-600 flex items-center gap-0.5 cursor-pointer bg-indigo-50 px-1 py-0.5 rounded"
                    >
                      <Eye size={10} /> Lihat PDF
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-850 font-bold mt-1">{po.supplierName}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                    <span>Total: <b className="text-slate-850 font-mono">Rp {po.grandTotal.toLocaleString('id-ID')}</b></span>
                    <span>{po.date}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1.5 pt-1 border-t border-slate-50">
                    <span className="text-[9px] text-slate-400">Tempo: <b className="text-indigo-700">{po.tempo} Hari</b></span>
                    <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded uppercase ${
                      po.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {po.status === 'Completed' ? 'LUNAS' : 'TEMPO'}
                    </span>
                  </div>
                </div>
              ))}
              {purchaseOrders.length === 0 && (
                <p className="text-[10px] text-slate-400 uppercase text-center py-6 font-bold tracking-wider">Belum ada PO tersimpan.</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* INVOICE PEMBELIAN SUB-VIEW */}
      {/* ------------------------------------------------ */}
      {activeSubView === 'pembelian_invoice' && (
        <div className="lg:col-span-12 glow-card rounded-xl overflow-hidden min-h-[500px]">
          <div className="px-6 py-4 border-b border-slate-100 bg-white/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="text-xs font-black text-slate-800 tracking-tight uppercase">Daftar Invoice Pembelian (Komersial)</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Katalog penagihan logistik kapal dari supplier resmi terverifikasi.</p>
            </div>
            <button 
              onClick={() => setActiveView && setActiveView('pembelian_order')} 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white text-[11px] font-black tracking-wider uppercase rounded-md shadow flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <Plus size={14} /> Buat PO Baru
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[700px]">
              <thead className="bg-slate-50 border-b border-indigo-50/50 text-[10px] text-indigo-850 font-black uppercase text-left">
                <tr>
                  <th className="p-3">ID Invoice</th>
                  <th className="p-3">Ref PO</th>
                  <th className="p-3">Tanggal Terbit</th>
                  <th className="p-3">Supplier Vendor</th>
                  <th className="p-3">Jatuh Tempo</th>
                  <th className="p-3 text-right">Nilai Tagihan</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/30">
                    <td className="p-3 font-semibold text-indigo-700 font-mono text-[11px]">{inv.id}</td>
                    <td className="p-3 font-mono text-slate-500 text-[10px]">{inv.purchaseOrderId}</td>
                    <td className="p-3 font-semibold text-slate-700">{inv.date}</td>
                    <td className="p-3 font-bold text-slate-800">{inv.supplierName}</td>
                    <td className="p-3 font-bold text-indigo-800 font-mono">{inv.dueDate}</td>
                    <td className="p-3 text-right font-bold text-slate-900 font-mono">Rp {inv.grandTotal.toLocaleString('id-ID')}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 text-[8px] font-bold rounded-full ${
                        inv.status === 'LUNAS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-600 border border-red-150'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5">
                      {inv.status === 'BELUM LUNAS' && (
                        <button 
                          onClick={() => handlePayInvoice(inv)} 
                          className="px-2 py-1 bg-yellow-50 hover:bg-yellow-100 border border-yellow-250 text-yellow-800 font-extrabold text-[9px] rounded uppercase cursor-pointer"
                        >
                          Bayar Lunas
                        </button>
                      )}
                      <button 
                        onClick={() => setPrintDoc({ data: inv, type: 'Invoice' })} 
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-780 font-extrabold text-[9px] rounded uppercase cursor-pointer inline-flex items-center gap-0.5"
                      >
                        <Eye size={10} /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
                {purchaseInvoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Belum ada invoice pembelian tersimpan dalam database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* KUITANSI PEMBELIAN SUB-VIEW */}
      {/* ------------------------------------------------ */}
      {activeSubView === 'pembelian_kuitansi' && (
        <div className="lg:col-span-12 glow-card rounded-xl overflow-hidden min-h-[500px]">
          <div className="px-6 py-4 border-b border-slate-100 bg-white/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="text-xs font-black text-slate-800 tracking-tight uppercase">Buku Kuitansi Pembelian (Arsip Pembayaran)</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Buku registrasi pengeluaran kas pelunasan tagihan supplier kargo.</p>
            </div>
            <button 
              onClick={() => setActiveView && setActiveView('pembelian_order')} 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white text-[11px] font-black tracking-wider uppercase rounded-md shadow flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <Plus size={14} /> Buat PO Baru
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[700px]">
              <thead className="bg-slate-50 border-b border-indigo-50/50 text-[10px] text-indigo-850 font-black uppercase text-left">
                <tr>
                  <th className="p-3">ID Kuitansi</th>
                  <th className="p-3">ID Invoice Ref</th>
                  <th className="p-3">Ref PO</th>
                  <th className="p-3">Tanggal Bayar</th>
                  <th className="p-3">Supplier Penerima</th>
                  <th className="p-3 text-right">Kelaharan Kas (Rp)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseReceipts.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/30">
                    <td className="p-3 font-semibold text-emerald-800 font-mono text-[11px]">{rec.id}</td>
                    <td className="p-3 font-mono text-slate-500 text-[10px]">{rec.purchaseInvoiceId}</td>
                    <td className="p-3 font-mono text-slate-500 text-[10px]">{rec.purchaseOrderId}</td>
                    <td className="p-3 font-semibold text-slate-700">{rec.date}</td>
                    <td className="p-3 font-bold text-slate-800">{rec.supplierName}</td>
                    <td className="p-3 text-right font-bold text-emerald-700 font-mono">Rp {rec.amount.toLocaleString('id-ID')}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-black rounded uppercase">
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => setPrintDoc({ data: rec, type: 'Receipt' })} 
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-105 text-indigo-750 border border-indigo-200 font-extrabold text-[9px] rounded uppercase cursor-pointer inline-flex items-center gap-0.5"
                      >
                        <Eye size={10} /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
                {purchaseReceipts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Belum ada arsip kuitansi lunas tersimpan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* SURAT PENERIMAAN BARANG SUB-VIEW */}
      {/* ------------------------------------------------ */}
      {activeSubView === 'pembelian_penerimaan' && (
        <div className="lg:col-span-12 glow-card rounded-xl overflow-hidden min-h-[500px]">
          <div className="px-6 py-4 border-b border-slate-100 bg-white/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="text-xs font-black text-slate-800 tracking-tight uppercase">Surat Penerimaan Barang (SPB Logistik)</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Buku penerimaan kargo berstempel sah masuk ke Terminal Gudang Tanjung Priok.</p>
            </div>
            <button 
              onClick={() => setActiveView && setActiveView('pembelian_order')} 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white text-[11px] font-black tracking-wider uppercase rounded-md shadow flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <Plus size={14} /> Buat PO Baru
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[700px]">
              <thead className="bg-slate-50 border-b border-indigo-50/50 text-[10px] text-indigo-850 font-black uppercase text-left">
                <tr>
                  <th className="p-3">No. SPB</th>
                  <th className="p-3">No. PO Ref</th>
                  <th className="p-3">Tanggal Diterima</th>
                  <th className="p-3">Supplier Pengirim</th>
                  <th className="p-3">Tanggal Loading</th>
                  <th className="p-3">Instruksi Pengiriman</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {goodsReceipts.map(gr => {
                  // find associated po to fetch items for printing
                  const associatedPo = purchaseOrders.find(po => po.id === gr.purchaseOrderId);
                  const grWithItems = { ...gr, items: associatedPo?.items, subtotal: associatedPo?.subtotal, discountTotal: associatedPo?.discountTotal, taxTotal: associatedPo?.taxTotal, grandTotal: associatedPo?.grandTotal };
                  return (
                    <tr key={gr.id} className="hover:bg-slate-50/30">
                      <td className="p-3 font-semibold text-indigo-700 font-mono text-[11px]">{gr.id}</td>
                      <td className="p-3 font-mono text-slate-500 text-[10px]">{gr.purchaseOrderId}</td>
                      <td className="p-3 font-semibold text-slate-700">{gr.date}</td>
                      <td className="p-3 font-bold text-slate-800">{gr.supplierName}</td>
                      <td className="p-3 font-bold text-slate-650 font-mono">{gr.loadingDate}</td>
                      <td className="p-3 text-slate-500 text-[11px]">Diterima di Dermaga 88 (Priok)</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-250 text-[9px] font-black rounded uppercase">
                          {gr.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => setPrintDoc({ data: grWithItems, type: 'SPB' })} 
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-105 text-indigo-750 border border-indigo-200 font-extrabold text-[9px] rounded uppercase cursor-pointer inline-flex items-center gap-0.5"
                        >
                          <Eye size={10} /> PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {goodsReceipts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Belum ada arsip penerimaan logistik (SPB) tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* QUICK PRODUCT ADDITION FORM OVERLAY MODAL */}
      {/* ------------------------------------------------ */}
      {showQuickAddProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="glow-card rounded-xl max-w-lg w-full overflow-hidden flex flex-col border border-slate-205 shadow-xl">
            <div className="p-4 border-b border-indigo-50 bg-white/60 flex justify-between items-center">
              <h3 className="text-xs font-black text-indigo-900 uppercase">Tambah Registrasi Master SKU Baru</h3>
              <button 
                type="button" 
                onClick={() => setShowQuickAddProduct(false)} 
                className="text-slate-400 hover:text-slate-800 font-bold text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleQuickAddProductSubmit} className="p-5 bg-white/60 space-y-4 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black uppercase text-indigo-700 mb-1">Kode SKU / Kode Produk / No Part</label>
                  <input 
                    type="text" 
                    required 
                    value={quickProduct.id} 
                    onChange={e => setQuickProduct({ ...quickProduct, id: e.target.value.toUpperCase() })} 
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-205 rounded font-bold placeholder-slate-350 focus:outline-none" 
                    placeholder="e.g. SKU-X-99" 
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-indigo-700 mb-1">Nama Deskripsi Produk</label>
                  <input 
                    type="text" 
                    required 
                    value={quickProduct.name} 
                    onChange={e => setQuickProduct({ ...quickProduct, name: e.target.value })} 
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-205 rounded font-bold focus:outline-none" 
                    placeholder="e.g. Gate Valve Carbon Steel" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase text-indigo-700 mb-1">Keterangan / Spesifikasi Khusus</label>
                <textarea 
                  rows={2} 
                  required 
                  value={quickProduct.description} 
                  onChange={e => setQuickProduct({ ...quickProduct, description: e.target.value })} 
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-205 rounded text-xs leading-relaxed resize-none focus:outline-none focus:border-indigo-50" 
                  placeholder="Keterangan part, bahan logam, atau standar internasional..." 
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] font-black uppercase text-indigo-700 mb-1">Kategori Kelompok</label>
                  <select 
                    value={quickProduct.category} 
                    onChange={e => setQuickProduct({ ...quickProduct, category: e.target.value })} 
                    className="w-full p-1.5 bg-slate-50 border border-slate-205 rounded cursor-pointer font-bold focus:outline-none"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-indigo-700 mb-1">Jenis Divisi Unit</label>
                  <input 
                    type="text" 
                    required 
                    value={quickProduct.unitCategory} 
                    onChange={e => setQuickProduct({ ...quickProduct, unitCategory: e.target.value })} 
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-205 rounded focus:outline-none" 
                    placeholder="e.g. Maritim" 
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-indigo-700 mb-1">Satuan Dasar</label>
                  <input 
                    type="text" 
                    required 
                    value={quickProduct.basicUnit} 
                    onChange={e => setQuickProduct({ ...quickProduct, basicUnit: e.target.value })} 
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-205 rounded focus:outline-none" 
                    placeholder="Kg, Ltr, pcs, dsb." 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black uppercase text-indigo-700 mb-1">Harga Beli Standar (Rp)</label>
                  <input 
                    type="number" 
                    required 
                    min="0" 
                    value={quickProduct.buyPrice || ''} 
                    onChange={e => setQuickProduct({ ...quickProduct, buyPrice: parseInt(e.target.value) || 0 })} 
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-205 rounded font-mono focus:outline-none text-emerald-805" 
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-indigo-700 mb-1">Harga Jual Standar (Rp)</label>
                  <input 
                    type="number" 
                    required 
                    min="0" 
                    value={quickProduct.sellPrice || ''} 
                    onChange={e => setQuickProduct({ ...quickProduct, sellPrice: parseInt(e.target.value) || 0 })} 
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-205 rounded font-mono focus:outline-none text-indigo-850" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowQuickAddProduct(false)} 
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded cursor-pointer uppercase text-[10px]"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded cursor-pointer uppercase text-[10px]"
                >
                  Registrasi & Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
