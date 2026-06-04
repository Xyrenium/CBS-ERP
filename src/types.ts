export type Role = 'Admin' | 'Karyawan';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  status: 'active' | 'pending';
}

export interface Customer {
  id: string;
  category: 'Client' | 'Supplier';
  badanUsaha: 'PT' | 'CV' | 'PT Perseorangan' | 'Perorangan' | 'UD' | 'Lainnya';
  name: string;
  phone: string;
  email: string;
  address: string;
  active: boolean;
  notes: string;
  bankAccount?: string;
}

export interface Product {
  id: string; // SKU / Kode Produk
  name: string;
  description: string;
  category: string;
  unitCategory: string; // Kategori unit
  basicUnit: string; // Satuan Dasar (e.g. Kg, gr, Ltr, pcs)
  stock: number;
  minStock: number;
  buyPrice: number;
  sellPrice: number;
}

export interface TransactionItem {
  productId: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Purchase {
  id: string;
  date: string;
  supplier: string;
  items: TransactionItem[];
  total: number;
}

export interface Sale {
  id: string;
  date: string;
  customerId: string;
  items: TransactionItem[];
  total: number;
  topDays?: number;
}

export interface Account {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number; 
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debits: { accountCode: string; amount: number }[];
  credits: { accountCode: string; amount: number }[];
}
