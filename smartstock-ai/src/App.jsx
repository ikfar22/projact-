import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import SalePage from './pages/SalePage';
import SettingsPage from './pages/SettingsPage';
import ReconciliationPage from './pages/ReconciliationPage';
import { useStockData } from './hooks/useStockData';
import { Loader2, LogOut } from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { products, salesLog, logs, loading, error, updateProduct, addProduct, deleteProduct, recordSale, transferProduct, reconcileProducts, refreshData } = useStockData();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const pages = {
    dashboard: <DashboardPage products={products} logs={logs} />,
    inventory: <InventoryPage products={products} onUpdateProduct={updateProduct} onAddProduct={addProduct} onTransferProduct={transferProduct} />,
    sale: <SalePage products={products} onRecordSale={recordSale} salesLog={salesLog} />,
    reconciliation: <ReconciliationPage products={products} onReconcile={reconcileProducts} />,
    settings: <SettingsPage products={products} onUpdateProduct={updateProduct} onAddProduct={addProduct} onDeleteProduct={deleteProduct} />,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} shopName={user?.shop_name} />
      <main className="pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b border-slate-100 px-6 lg:px-10 py-3 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              สวัสดี, <span className="font-semibold text-slate-900">{user?.username}</span>
            </span>
            <button
              onClick={() => { logout(); setCurrentPage('dashboard'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
              ออกจากระบบ
            </button>
          </div>
        </div>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-indigo-600" />
              <span className="ml-3 text-slate-500 font-medium">กำลังโหลดข้อมูล...</span>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center justify-between">
              <span>{error}</span>
              <button onClick={refreshData} className="text-red-600 underline text-xs font-bold">ลองใหม่</button>
            </div>
          )}

          {!loading && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {pages[currentPage]}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
