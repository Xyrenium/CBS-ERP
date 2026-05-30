import React, { createContext, useContext, useState } from 'react';
import { Role, Customer, Product, Purchase, Sale, Account, JournalEntry, User } from './types';
import { initialCustomers, initialProducts, initialAccounts, initialJournalEntries, initialUsers, initialPurchases, initialSales } from './data';

interface AppState {
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  users: User[];
  setUsers: (u: User[]) => void;
  // Fallback old role (for backward compatibility, though maybe tied to currentUser)
  role: Role;
  setRole: (r: Role) => void;
  customers: Customer[];
  setCustomers: (c: Customer[]) => void;
  products: Product[];
  setProducts: (p: Product[]) => void;
  purchases: Purchase[];
  sales: Sale[];
  accounts: Account[];
  journalEntries: JournalEntry[];
  addPurchase: (p: Purchase) => void;
  addSale: (s: Sale) => void;
  addJournalEntry: (j: JournalEntry) => void;
}

const StoreContext = createContext<AppState | null>(null);

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Deriving role from currentUser if it exists, otherwise use fallback (default Admin/null)
  const role = currentUser ? currentUser.role : 'Admin';
  const setRole = (r: Role) => {
    // If we want to change current user's role on the fly just for testing (if needed)
    if (currentUser) {
        setCurrentUser({ ...currentUser, role: r });
    }
  };

  const [customers, setCustomers] = useState(initialCustomers);
  const [products, setProducts] = useState(initialProducts);
  const [purchases, setPurchases] = useState(initialPurchases);
  const [sales, setSales] = useState(initialSales);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [journalEntries, setJournalEntries] = useState(initialJournalEntries);

  const applyJournalToAccounts = (entry: JournalEntry, currentAccounts: Account[]) => {
      let updatedAccounts = [...currentAccounts];
      const applyAmount = (code: string, amount: number, isDebit: boolean) => {
          const accIndex = updatedAccounts.findIndex(a => a.code === code);
          if (accIndex > -1) {
              const acc = updatedAccounts[accIndex];
              let multiplier = (acc.type === 'Asset' || acc.type === 'Expense') ? 1 : -1;
              if (!isDebit) multiplier *= -1;
              updatedAccounts[accIndex] = { ...acc, balance: acc.balance + (amount * multiplier) };
          }
      };
      entry.debits.forEach(d => applyAmount(d.accountCode, d.amount, true));
      entry.credits.forEach(c => applyAmount(c.accountCode, c.amount, false));
      return updatedAccounts;
  };

  const addJournalEntry = (entry: JournalEntry) => {
      setJournalEntries(prev => [...prev, entry]);
      setAccounts(prev => applyJournalToAccounts(entry, prev));
  };

  const addPurchase = (purchase: Purchase) => {
    setPurchases(prev => [...prev, purchase]);
    
    let updatedProducts = [...products];
    purchase.items.forEach(item => {
        const pIdx = updatedProducts.findIndex(p => p.id === item.productId);
        if(pIdx > -1) {
            const p = updatedProducts[pIdx];
            const newStock = p.stock + item.quantity;
            const newTotalValue = (p.stock * p.buyPrice) + (item.quantity * item.price);
            const newBuyPrice = newTotalValue / newStock; 
            updatedProducts[pIdx] = { ...p, stock: newStock, buyPrice: newBuyPrice };
        }
    });
    setProducts(updatedProducts);

    const journal: JournalEntry = {
        id: `J-PUR-${Date.now()}`,
        date: purchase.date,
        description: `Pembelian dari ${purchase.supplier}`,
        debits: [{ accountCode: '1-3000', amount: purchase.total }],
        credits: [{ accountCode: '1-1000', amount: purchase.total }]
    };
    
    setJournalEntries(prev => [...prev, journal]);
    setAccounts(prev => applyJournalToAccounts(journal, prev));
  };

  const addSale = (sale: Sale) => {
    setSales(prev => [...prev, sale]);
    
    let totalHPP = 0;
    let updatedProducts = [...products];
    sale.items.forEach(item => {
        const pIdx = updatedProducts.findIndex(p => p.id === item.productId);
        if(pIdx > -1) {
            const p = updatedProducts[pIdx];
            updatedProducts[pIdx] = { ...p, stock: p.stock - item.quantity };
            totalHPP += (p.buyPrice * item.quantity);
        }
    });
    setProducts(updatedProducts);
    
    const isCredit = (sale.topDays || 0) > 0;
    const accountD = isCredit ? '1-2000' : '1-1000'; 

    const journal1: JournalEntry = {
        id: `J-SAL-${Date.now()}-1`,
        date: sale.date,
        description: `Penjualan ke Customer ${sale.customerId}`,
        debits: [{ accountCode: accountD, amount: sale.total }],
        credits: [{ accountCode: '4-1000', amount: sale.total }]
    };
    
    const journal2: JournalEntry = {
        id: `J-SAL-${Date.now()}-2`,
        date: sale.date,
        description: `Pengakuan HPP untuk penjualan ${sale.customerId}`,
        debits: [{ accountCode: '5-1000', amount: totalHPP }],
        credits: [{ accountCode: '1-3000', amount: totalHPP }]
    };

    setJournalEntries(prev => [...prev, journal1, journal2]);
    setAccounts(prev => applyJournalToAccounts(journal2, applyJournalToAccounts(journal1, prev)));
  };

  return (
    <StoreContext.Provider value={{
      currentUser, setCurrentUser, users, setUsers,
      role, setRole, customers, setCustomers, products, setProducts,
      purchases, sales, accounts, journalEntries, addPurchase, addSale, addJournalEntry
    }}>
      {children}
    </StoreContext.Provider>
  );
}
