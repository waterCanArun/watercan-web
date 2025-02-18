import axios from 'axios';
import { message } from 'antd';

const ProductService = {
  addProduct: async (productData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/products`, productData);
      if (response.status === 201) {
        // Show success message
        message.success('Product added successfully');
      } else {
        console.error('Failed to add product');
        // Show error message
        message.error('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      // Show network error message
      message.error('Error adding product. Please try again later.');
    }
  },
  getAllProducts: async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/allproducts`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default ProductService;
