import React, { createContext, useContext, useState } from 'react';

// Create a new context object
const ProductListContext = createContext();

// Export a custom hook to use the context
export const useProductList = () => useContext(ProductListContext);

// Create a provider component
export const ProductListProvider = ({ children }) => {
  const [productList, setProductList] = useState(null);
  const [coords,setCoords] = useState()
  return (
    <ProductListContext.Provider value={{ productList, setProductList,coords,setCoords }}>
      {children}
    </ProductListContext.Provider>
  );
};
