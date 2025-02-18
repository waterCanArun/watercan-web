import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Select } from "antd";
import axios from "axios";
import { WIFI } from "../constant";

const { Option } = Select;

const AddRoute = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  useEffect(() => {
    fetchCustomers();
    fetchDrivers();
  }, []);

  const fetchCustomers = async () => {
    const userId = JSON.parse(localStorage.getItem("userInfo"))._id;
    try {
      const response = await axios.get(`http://${WIFI}/api/get-customers`);
      const filteredCustomers = response.data.filter(customer => customer.userId === userId);
      setCustomers(filteredCustomers); // Set only customers with the same userId
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };
  

  const fetchDrivers = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("userInfo"))._id;
      const response = await axios.get(`http://${WIFI}/api/get-drivers/${userId}`);
      setDrivers(response.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const handleCustomerChange = (value) => {
    setSelectedCustomers(value);
  };

  const handleAddRoute = async (formData) => {
    setLoading(true);
    const user = localStorage.getItem("userInfo");
    const userInfo = JSON.parse(user);
    if (!formData.name || !formData.driver) {
      message.error("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`http://${WIFI}/api/route`, {
        name: formData.name,
        customers: selectedCustomers,
        driverId: formData.driver,
        userId: userInfo._id,
      });
      if (response.data.success) {
        message.success("Route Added ✔");
        form.resetFields();
        setSelectedCustomers([]);
      } else {
        message.error("Adding route failed. Please try again later.");
      }
    } catch (error) {
      message.error(`${error.response.data.error}`);
    }
    setLoading(false);
  };

  const onFinishFailed = (errorInfo) => {
    console.error("Failed:", errorInfo);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <Form
        form={form}
        name="AddRouteForm"
        onFinish={handleAddRoute}
        onFinishFailed={onFinishFailed}
        layout="vertical"
      >
        <Form.Item
          label="Route Name"
          name="name"
          rules={[{ required: true, message: "Please enter route name" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Customers"
          name="customers"
          // rules={[{ required: false, message: 'Please select at least one customer' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select customers"
            onChange={handleCustomerChange}
            value={selectedCustomers}
          >
            {customers.map((customer) => (
              <Option key={customer._id} value={customer._id}>
                {customer.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Driver"
          name="driver"
          rules={[{ required: true, message: "Please select a driver" }]}
        >
          <Select placeholder="Select a driver">
            {drivers.map((driver) => (
              <Option key={driver._id} value={driver._id}>
                {driver.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Add Route
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddRoute;
