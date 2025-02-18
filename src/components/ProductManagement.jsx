import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Modal, Input, Button, message } from "antd";
import { MdOutlineAddShoppingCart } from "react-icons/md";
import { WIFI } from "../constant";
const { TextArea } = Input;

const ProductManagement = ({ userId }) => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [updatedValues, setUpdatedValues] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("userInfo"))._id;
      const response = await axios.get(
        `http://${WIFI}/api/getAllProducts`
      );
      const filteredproduct = response.data.filter(products => products.userId === userId);
      setProducts(filteredproduct);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const addProduct = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("userInfo"))._id;
      await axios.post(
        `http://${WIFI}/api/addNewProduct/${userId}`,
        newProduct
      );
      fetchProducts(); 
      message.success("Product added successfully!");
    } catch (error) {
      console.error("Error adding product:", error);
      message.error("Failed to add product. Please try again.");
    }
  };

  const updateProduct = async (productId, updatedProduct) => {
    try {
      await axios.put(
        `http://${WIFI}/api/products/${productId}`,
        updatedProduct
      );
      setModalVisible(false); // Close the modal after updating
      fetchProducts(); // Refresh products list after updating
      message.success("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product:", error);
      message.error("Failed to update product. Please try again.");
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const response = await axios.delete(
        `http://${WIFI}/api/products/${productId}`
      );
      if (response.status === 200) {  // Confirm deletion success
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product._id !== productId)
        );
        message.success("Product deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      message.error("Failed to delete product. Please try again.");
    }
  };
  

  const handleUpdateModal = (productId, name, description, price) => {
    setSelectedProductId(productId);
    setUpdatedValues({ name, description, price });
    setModalVisible(true);
  };

  const handleSaveUpdatedValues = () => {
    updateProduct(selectedProductId, updatedValues);
  };

  return (
    <div style={{ margin: "20px" }}>
      <h2>Product Management</h2>
      <div style={{ width: "50%", marginBottom: "20px" }}>
        <h3>Add New Product</h3>
        <label>Product Name</label>
        <Input
          type="text"
          placeholder="Name"
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
        />
        <label>Product Description</label>
        <Input
          type="text"
          placeholder="Description"
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
        />
        <label>Price</label>
        <Input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: e.target.value })
          }
        />
        <Button
          type="primary"
          style={{ marginTop: "10px", width: "100%" }}
          onClick={addProduct}
        >
          Add Product <MdOutlineAddShoppingCart />
        </Button>
      </div>

      <h3>Products List</h3>
      {/* Product cards */}
      <div style={{ display: "flex", flexWrap: "wrap", marginTop: "20px" }}>
        {products &&
          products.map((product) => (
            <Card
              key={product._id}
              style={{
                width: "300px",
                margin: "10px",
                boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
              }}
              actions={[
                <Button
                  type="primary"
                  onClick={() =>
                    handleUpdateModal(
                      product._id,
                      product.productName,
                      product.productDescription,
                      product.productPrice
                    )
                  }
                >
                  Update
                </Button>,
                <Button
                  type="danger"
                  onClick={() => deleteProduct(product._id)}
                >
                  Delete
                </Button>,
              ]}
            >
              <p>
                <strong>Name:</strong> {product.productName}
              </p>
              <p>
                <strong>Description:</strong> {product.productDescription}
              </p>
              <p>
                <strong>Price:</strong> {product.productPrice}
              </p>
            </Card>
          ))}
      </div>

      <Modal
        title="Update Product"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSaveUpdatedValues}
      >
        <label>Product Name</label>
        <Input
          placeholder="Name"
          value={updatedValues.name}
          onChange={(e) =>
            setUpdatedValues({ ...updatedValues, name: e.target.value })
          }
        />
        <label>Product Description</label>
        <TextArea
          placeholder="Description"
          value={updatedValues.description}
          onChange={(e) =>
            setUpdatedValues({ ...updatedValues, description: e.target.value })
          }
        />
        <label>Price</label>
        <Input
          type="number"
          placeholder="Price"
          value={updatedValues.price}
          onChange={(e) =>
            setUpdatedValues({ ...updatedValues, price: e.target.value })
          }
        />
      </Modal>
    </div>
  );
};

export default ProductManagement;
