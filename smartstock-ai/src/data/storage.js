const STORAGE_KEY = 'smartstock_products';
const SALES_LOG_KEY = 'smartstock_sales_log';

export const loadProducts = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveProducts = (products) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

export const loadSalesLog = () => {
  try {
    const data = localStorage.getItem(SALES_LOG_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveSalesLog = (log) => {
  localStorage.setItem(SALES_LOG_KEY, JSON.stringify(log));
};

export const recordSale = (productId, quantity) => {
  const products = loadProducts();
  const product = products.find(p => p.id === productId);
  if (product) {
    product.quantity = Math.max(0, product.quantity - quantity);
    saveProducts(products);
  }

  const log = loadSalesLog();
  log.push({ id: Date.now(), productId, quantity, date: new Date().toISOString() });
  saveSalesLog(log);

  return products;
};

export const initializeStorage = (initialProducts) => {
  if (!loadProducts()) {
    saveProducts(initialProducts);
  }
};
