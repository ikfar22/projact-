import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { inventoryAPI, salesAPI, logsAPI } from '../api/client';

export function useStockData() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [salesLog, setSalesLog] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data on mount / token change
  const refreshData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [invRes, salesRes, logsRes] = await Promise.all([
        inventoryAPI.getAll(),
        salesAPI.getAll(),
        logsAPI.getAll(30),
      ]);
      setProducts(invRes.data);
      setSalesLog(salesRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'ไม่สามารถดึงข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const updateProduct = useCallback(async (updatedProduct) => {
    try {
      const { data } = await inventoryAPI.update(updatedProduct.id, updatedProduct);
      setProducts(prev => prev.map(p => p.id === data.id ? data : p));
      // Refresh logs
      const logsRes = await logsAPI.getAll(30);
      setLogs(logsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'แก้ไขไม่สำเร็จ');
    }
  }, []);

  const addProduct = useCallback(async (product) => {
    try {
      const { data } = await inventoryAPI.create(product);
      setProducts(prev => [...prev, data]);
      const logsRes = await logsAPI.getAll(30);
      setLogs(logsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'เพิ่มไม่สำเร็จ');
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    try {
      await inventoryAPI.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      const logsRes = await logsAPI.getAll(30);
      setLogs(logsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'ลบไม่สำเร็จ');
    }
  }, []);

  const recordSale = useCallback(async (productId, quantity) => {
    try {
      const { data } = await inventoryAPI.recordSale({ inventory_id: productId, quantity });
      setProducts(prev => prev.map(p => p.id === data.product.id ? data.product : p));
      // Refresh sales log and activity logs
      const [salesRes, logsRes] = await Promise.all([
        salesAPI.getAll(),
        logsAPI.getAll(30),
      ]);
      setSalesLog(salesRes.data);
      setLogs(logsRes.data);
      return data.product;
    } catch (err) {
      setError(err.response?.data?.error || 'บันทึกขายไม่สำเร็จ');
      return null;
    }
  }, []);

  const transferProduct = useCallback(async (id, to_location) => {
    try {
      const { data } = await inventoryAPI.transfer(id, { to_location });
      setProducts(prev => prev.map(p => p.id === data.product.id ? data.product : p));
      const logsRes = await logsAPI.getAll(30);
      setLogs(logsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'ย้ายโซนไม่สำเร็จ');
    }
  }, []);

  const reconcileProducts = useCallback(async (items) => {
    try {
      const { data } = await inventoryAPI.reconcile({ items });
      // Refresh all products and logs
      const [invRes, logsRes] = await Promise.all([
        inventoryAPI.getAll(),
        logsAPI.getAll(30),
      ]);
      setProducts(invRes.data);
      setLogs(logsRes.data);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'ตรวจนับสต็อกไม่สำเร็จ');
      return null;
    }
  }, []);

  return {
    products,
    salesLog,
    logs,
    loading,
    error,
    updateProduct,
    addProduct,
    deleteProduct,
    recordSale,
    transferProduct,
    reconcileProducts,
    refreshData,
  };
}
