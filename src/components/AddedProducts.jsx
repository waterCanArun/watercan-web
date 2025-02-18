import React, { useState, useEffect } from 'react';
import { Card } from 'antd';

const AddedProducts = ({ productList }) => {
  // Assuming productList is an array of product objects with properties: productName, productDescription, productPrice

  // Use useEffect to log whenever productList changes
  useEffect(() => {
    console.log("Product list changed:", productList);
  }, [productList]);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '20px' }}>
      {productList && productList.map((product, index) => (
        <Card key={index} style={{ width: '300px', margin: '10px',boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px" }}>
          <p><strong>Name:</strong> {product.productName}</p>
          <p><strong>Description:</strong> {product.productDescription}</p>
          <p><strong>Price:</strong> {product.productPrice}</p>
          
        </Card>
      ))}
    </div>
  );
};

export default AddedProducts;
