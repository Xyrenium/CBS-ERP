import { Customer, Product, Account, JournalEntry, User, Purchase, Sale } from './types';

export const initialUsers: User[] = [
  { id: 'U001', name: 'Admin', email: 'admin@cbs.com', password: 'password', role: 'Admin', status: 'active' },
  { id: 'U002', name: 'Karyawan', email: 'karyawan@cbs.com', password: 'password', role: 'Karyawan', status: 'active' },
];

export const initialCustomers: Customer[] = [
  { 
    id: 'C001', 
    category: 'Client',
    badanUsaha: 'PT',
    name: 'Samudra Logistik Bintang', 
    phone: '081234567890', 
    email: 'samudra@logistik.com',
    address: 'Jl. Pelabuhan Raya No. 12, Tanjung Priok, Jakarta Utara',
    active: true, 
    notes: 'VIP Client' 
  },
  { 
    id: 'C002', 
    category: 'Client',
    badanUsaha: 'CV',
    name: 'Maritim Maju Bersama', 
    phone: '081234567891', 
    email: 'maritim@maju.com',
    address: 'Kawasan Berikat Nusantara Blok C-15, Cilincing, Jakarta',
    active: true, 
    notes: 'Reguler' 
  },
  { 
    id: 'C003', 
    category: 'Supplier',
    badanUsaha: 'PT',
    name: 'Nusantara Shipping Line', 
    phone: '081234567892', 
    email: 'contact@nusantara.com',
    address: 'Jl. Boulevard Kelapa Gading Blok MA No. 8, Jakarta Utara',
    active: false, 
    notes: 'Non-aktif sejak 2024',
    bankAccount: 'Mandiri 120-00-1122334-4 an PT NSL'
  },
];

export const initialProducts: Product[] = [
  { id: 'P001', name: 'Pipa hitam seamless', description: 'Pipa besi baja karbon medium schedule 40 tanpa sambungan', category: 'Pipa hitam seamless', unitCategory: 'Piping & Logam', basicUnit: 'Pcs', stock: 120, minStock: 50, buyPrice: 500000, sellPrice: 650000 },
  { id: 'P002', name: 'Pipa galvanis spindo', description: 'Pipa baja lapis seng anti karat standar Spindo SNI', category: 'Pipa galvanis spindo', unitCategory: 'Piping & Logam', basicUnit: 'Pcs', stock: 80, minStock: 30, buyPrice: 400000, sellPrice: 550000 },
  { id: 'P003', name: 'Mur baut', description: 'Sumbu pengikat ulir presisi tinggi stainless steel 304', category: 'Mur baut', unitCategory: 'Hardware & Fastener', basicUnit: 'Pcs', stock: 5000, minStock: 1000, buyPrice: 2000, sellPrice: 5000 },
  { id: 'P004', name: 'Alat tulis kantor', description: 'Paket pena kertas map kantor internal dan operasional', category: 'Alat tulis kantor', unitCategory: 'Atk & Umum', basicUnit: 'Pcs', stock: 200, minStock: 50, buyPrice: 15000, sellPrice: 25000 },
  { id: 'P005', name: 'Aksesoris pipa carbon steel', description: 'Elbow, reducer, tee carbon steel fitting sambungan pipa', category: 'Aksesoris pipa carbon steel', unitCategory: 'Piping & Fitting', basicUnit: 'Pcs', stock: 150, minStock: 50, buyPrice: 120000, sellPrice: 180000 },
  { id: 'P006', name: 'Betonneser', description: 'Besi beton polos SNI kualitas tinggi untuk instalasi galangan', category: 'Betonneser', unitCategory: 'Material Struktur', basicUnit: 'Kg', stock: 500, minStock: 200, buyPrice: 80000, sellPrice: 110000 },
  { id: 'P007', name: 'Besi persegi empat', description: 'Besi as lapis pelindung struktur kerangka kapal', category: 'Besi persegi empat', unitCategory: 'Material Struktur', basicUnit: 'Kg', stock: 300, minStock: 100, buyPrice: 250000, sellPrice: 350000 },
  { id: 'P008', name: 'Alat navigasi', description: 'GPS kelautan sonar radar pencari rute perairan laut dalam', category: 'Alat navigasi', unitCategory: 'Elektronik & Navigasi', basicUnit: 'Pcs', stock: 3, minStock: 5, buyPrice: 12000000, sellPrice: 18000000 },
  { id: 'P009', name: 'Aksesoris jangkar dan jangkar kapal', description: 'Rantai jangkar marine grade shackle swivel penyambung', category: 'Aksesoris jangkar dan jangkar kapal', unitCategory: 'Galangan & Deck', basicUnit: 'Pcs', stock: 20, minStock: 5, buyPrice: 4500000, sellPrice: 6500000 },
  { id: 'P010', name: 'Mesin tempel', description: 'Motor penggerak perahu 4-Stroke tenaga 40 HP efisien', category: 'Mesin tempel', unitCategory: 'Mesin & Propulsion', basicUnit: 'Pcs', stock: 10, minStock: 3, buyPrice: 15000000, sellPrice: 22000000 },
  { id: 'P011', name: 'Alat keselamatan kapal', description: 'Jaket pelampung marine lifejacket standar SOLAS dilengkapi peluit', category: 'Alat keselamatan kapal', unitCategory: 'Safety & Marine', basicUnit: 'Pcs', stock: 20, minStock: 50, buyPrice: 350000, sellPrice: 500000 },
  { id: 'P012', name: 'Valves', description: 'Gate valve bronze marine grade ketahanan karat air garam', category: 'Valves', unitCategory: 'Piping & Fitting', basicUnit: 'Pcs', stock: 250, minStock: 100, buyPrice: 750000, sellPrice: 1100000 },
  { id: 'P013', name: 'Mesin induk kapal', description: 'Main Engine Diesel kelautan silinder ganda putaran menengah', category: 'Mesin induk kapal', unitCategory: 'Mesin & Propulsion', basicUnit: 'Pcs', stock: 2, minStock: 1, buyPrice: 550000000, sellPrice: 750000000 },
  { id: 'P014', name: 'Mesin bantu kapal', description: 'Auxiliary Engine Generator set kelautan penyuplai daya kapal', category: 'Mesin bantu kapal', unitCategory: 'Mesin & Propulsion', basicUnit: 'Pcs', stock: 3, minStock: 1, buyPrice: 120000000, sellPrice: 180000000 },
  { id: 'P015', name: 'Wire roope', description: 'Tali kawat baja pilin pelindung gesekan beban berat', category: 'Wire roope', unitCategory: 'Galangan & Deck', basicUnit: 'Pcs', stock: 15, minStock: 20, buyPrice: 1500000, sellPrice: 2100000 },
];

export const initialAccounts: Account[] = [
  { code: '1-1000', name: 'Kas & Bank', type: 'Asset', balance: 4968000000 },
  { code: '1-2000', name: 'Piutang Usaha', type: 'Asset', balance: 1119000000 },
  { code: '1-3000', name: 'Persediaan', type: 'Asset', balance: 1463550000 }, 
  { code: '1-4000', name: 'Aset Tetap (Aktiva)', type: 'Asset', balance: 850000000 }, 
  { code: '2-1000', name: 'Hutang Usaha', type: 'Liability', balance: 0 },
  { code: '2-2000', name: 'Kewajiban Bank & Pinjaman', type: 'Liability', balance: 350000000 },
  { code: '3-1000', name: 'Modal & Laba Ditahan', type: 'Equity', balance: 7225300000 }, 
  { code: '3-2000', name: 'Prive & Pembagian Dividen', type: 'Equity', balance: 0 }, 
  { code: '4-1000', name: 'Penjualan', type: 'Revenue', balance: 1127000000 },
  { code: '4-2000', name: 'Pendapatan Non-Operasional', type: 'Revenue', balance: 0 },
  { code: '5-1000', name: 'HPP', type: 'Expense', balance: 801750000 },
  { code: '5-2000', name: 'Pembelian', type: 'Expense', balance: 0 },
  { code: '6-1000', name: 'Biaya Operasional', type: 'Expense', balance: 0 },
  { code: '6-2000', name: 'Beban Pajak', type: 'Expense', balance: 0 },
];

export const initialPurchases: Purchase[] = [
  {
    id: 'PO-202310-001',
    date: '2023-10-05',
    supplier: 'PT. Krakatau Steel',
    items: [
      { productId: 'P001', quantity: 50, price: 490000, total: 24500000 },
      { productId: 'P002', quantity: 30, price: 390000, total: 11700000 }
    ],
    total: 36200000
  },
  {
    id: 'PO-202310-002',
    date: '2023-10-15',
    supplier: 'CV. Baut Nusantara',
    items: [
      { productId: 'P003', quantity: 2000, price: 1900, total: 3800000 }
    ],
    total: 3800000
  }
];

export const initialSales: Sale[] = [
  {
    id: 'INV-202310-001',
    date: '2023-10-10',
    customerId: 'C001',
    topDays: 30,
    items: [
      { productId: 'P001', quantity: 10, price: 650000, total: 6500000 },
      { productId: 'P003', quantity: 500, price: 5000, total: 2500000 }
    ],
    total: 9000000
  },
  {
    id: 'INV-202310-002',
    date: '2023-10-20',
    customerId: 'C002',
    topDays: 0,
    items: [
      { productId: 'P006', quantity: 50, price: 110000, total: 5500000 },
      { productId: 'P011', quantity: 5, price: 500000, total: 2500000 }
    ],
    total: 8000000
  },
  {
    id: 'INV-202311-001',
    date: '2023-11-05',
    customerId: 'C001',
    topDays: 14,
    items: [
      { productId: 'P013', quantity: 1, price: 750000000, total: 750000000 },
      { productId: 'P014', quantity: 2, price: 180000000, total: 360000000 }
    ],
    total: 1110000000
  }
];

export const initialJournalEntries: JournalEntry[] = [
    {
        id: 'J-0001',
        date: new Date().toISOString().split('T')[0],
        description: 'Setoran Modal Awal & Pembelian Persediaan',
        debits: [
            { accountCode: '1-1000', amount: 5000000000 },
            { accountCode: '1-3000', amount: 2225300000 }
        ],
        credits: [{ accountCode: '3-1000', amount: 7225300000 }]
    },
    {
        id: 'J-0002',
        date: '2023-10-05',
        description: 'Pembelian PO-202310-001',
        debits: [{ accountCode: '1-3000', amount: 36200000 }],
        credits: [{ accountCode: '1-1000', amount: 36200000 }]
    },
    {
        id: 'J-0003',
        date: '2023-10-10',
        description: 'Penjualan INV-202310-001 (Piutang)',
        debits: [{ accountCode: '1-2000', amount: 9000000 }],
        credits: [{ accountCode: '4-1000', amount: 9000000 }]
    },
    {
        id: 'J-0004',
        date: '2023-10-15',
        description: 'Pembelian PO-202310-002',
        debits: [{ accountCode: '1-3000', amount: 3800000 }],
        credits: [{ accountCode: '1-1000', amount: 3800000 }]
    },
    {
        id: 'J-0005',
        date: '2023-10-20',
        description: 'Penjualan INV-202310-002 (Kas)',
        debits: [{ accountCode: '1-1000', amount: 8000000 }],
        credits: [{ accountCode: '4-1000', amount: 8000000 }]
    },
    {
        id: 'J-0006',
        date: '2023-11-05',
        description: 'Penjualan INV-202311-001 (Piutang)',
        debits: [{ accountCode: '1-2000', amount: 1110000000 }],
        credits: [{ accountCode: '4-1000', amount: 1110000000 }]
    },
    {
        id: 'J-0007',
        date: '2023-10-10',
        description: 'HPP untuk Penjualan INV-202310-001',
        debits: [{ accountCode: '5-1000', amount: 6000000 }],
        credits: [{ accountCode: '1-3000', amount: 6000000 }]
    },
    {
        id: 'J-0008',
        date: '2023-10-20',
        description: 'HPP untuk Penjualan INV-202310-002',
        debits: [{ accountCode: '5-1000', amount: 5750000 }],
        credits: [{ accountCode: '1-3000', amount: 5750000 }]
    },
    {
        id: 'J-0009',
        date: '2023-11-05',
        description: 'HPP untuk Penjualan INV-202311-001',
        debits: [{ accountCode: '5-1000', amount: 790000000 }],
        credits: [{ accountCode: '1-3000', amount: 790000000 }]
    }
];
