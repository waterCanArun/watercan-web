import React, { useEffect, useState } from 'react';
import { useProductList } from '../contexts/ProductList';
import AddedProducts from '../components/AddedProducts';
import ProductService from '../services/ProductService';
import { Card, Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';

const { Meta } = Card;
const { Sider } = Layout;

const HomePage = () => {
  const { productList, setProductList } = useProductList();
  const [customerInfo, setCustomerInfo] = useState(null); // Initialize with null

  useEffect(() => {
    // Fetch the list of products from the backend when the component mounts
    fetchProductList();

    // Retrieve customer info from local storage
    const storedCustomerInfo = localStorage.getItem('customerInfo');
    if (storedCustomerInfo) {
      setCustomerInfo(JSON.parse(storedCustomerInfo));
    }
  }, []);

  const fetchProductList = async () => {
    try {
      const response = await ProductService.getAllProducts();
      setProductList(response);
    } catch (error) {
      console.error('Error fetching product list:', error);
    }
  };

  return (
    <>
        <Layout style={{ padding: '0 24px 24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2>Available Items</h2>
            <div><AddedProducts productList={productList} /></div>
          </div>
        </Layout>
    </>
  );
};

export default HomePage;
