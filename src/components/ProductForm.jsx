import React, { useState } from 'react';

const ProductForm = ({ onSubmit }) => {
  const [productData, setProductData] = useState({
    productName: '',
    productDescription: '',
    productPrice: ''
    // Add more fields as needed
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear form fields after submitting
    setProductData({
      productName: '',
      productDescription: '',
      productPrice: ''
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="productName" placeholder="Product Name" value={productData.productName} onChange={handleChange} />
      <input type="text" name="productDescription" placeholder="Product Description" value={productData.productDescription} onChange={handleChange} />
      <input type="number" name="productPrice" placeholder="Product Price" value={productData.productPrice} onChange={handleChange} />
      {/* Add more input fields for other product attributes */}
      <button type="submit">Add Product</button>
    </form>
  );
}

export default ProductForm;
