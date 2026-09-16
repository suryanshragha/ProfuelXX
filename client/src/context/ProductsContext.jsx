import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getProducts().then(setProducts).catch((e) => setError(e.message));
  }, []);

  return (
    <ProductsContext.Provider value={{ products, error, loading: !products && !error }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
