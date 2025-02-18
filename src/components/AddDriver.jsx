import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Table, Tooltip, Row, Col } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import axios from "axios";
import { WIFI } from "../constant";

const generateUniqueId = (name) => {
  const timestamp = Date.now().toString().slice(-5);
  const namePart = name.toLowerCase().replace(/\s+/g, "").slice(0, 3);
  return `${namePart}${timestamp}`;
};

const generatePassword = (name) => {
  // Simplified password generation: Take first 3 letters of the name + a 2-digit number.
  const namePart = name.toLowerCase().replace(/\s+/g, "").slice(0, 3);
  const randomDigits = Math.floor(Math.random() * 90 + 10); // Two-digit number (10-99)
  return namePart + randomDigits;
};

const AddDriver = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [passwordVisibility, setPasswordVisibility] = useState({});

  // Retrieve all drivers from API and manage password consistency
  const getAllDrivers = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("userInfo"))._id;
      const response = await axios.get(`http://${WIFI}/api/get-drivers/${userId}`);
      if (response.data.length > 0) {
        const driversWithPassword = response.data.map((driver) => {
          // Ensure password is consistent from localStorage or generated
          let password = localStorage.getItem(driver.name);
          if (!password) {
            password = generatePassword(driver.name);
            localStorage.setItem(driver.name, password); // Save the generated password in localStorage
          }

          return {
            ...driver,
            uniqueId: driver.uniqueId || generateUniqueId(driver.name),
            password: password, // Set password from localStorage or generated
          };
        });
        setDrivers(driversWithPassword);
      } else {
        message.error("No drivers found. Please add a driver.");
      }
    } catch (error) {
      console.error("Error Occurred", error);
      message.error("Failed to fetch drivers. Please try again.");
    }
  };

  useEffect(() => {
    // Initialize drivers from API and ensure password consistency
    getAllDrivers();
  }, []);

  // Handle form submission to add a new driver
  const handleAddDriver = async (formData) => {
    setLoading(true);
    const { name, email, mobileNo, address } = formData;

    const uniqueId = generateUniqueId(name);

    // Check if the password already exists in localStorage, otherwise generate it
    let password = localStorage.getItem(name);
    if (!password) {
      password = generatePassword(name);
      localStorage.setItem(name, password); // Save the generated password in localStorage
    }

    const newDriver = { name, email, mobileNo, address, uniqueId, password };
    try {
      const userId = JSON.parse(localStorage.getItem("userInfo"))._id;
      const response = await axios.post(
        `http://${WIFI}/api/new-driver/${userId}`,
        newDriver
      );

      if (response.data.success) {
        message.success("New Driver Added ✔");
        setDrivers([...drivers, newDriver]);
        form.resetFields();
      } else {
        message.error("Registration failed. Please try again later.");
      }
    } catch (error) {
   
      message.error("Failed to add driver. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteDriver = async (uniqueId) => {
    try {
      const response = await axios.delete(`http://${WIFI}/api/delete-driver/${uniqueId}`);
      if (response.data.success) {
        message.success("Driver deleted successfully ✔");
        setDrivers(drivers.filter(driver => driver.uniqueId !== uniqueId));
      } else {
        message.error("Please wait your driver deleted automatically.");
      }
    } catch (error) {
      console.error("Error occurred while deleting:", error);
      message.error(`Failed to delete the driver. Error: ${error.response?.data?.message || error.message}`);
    }
  };
  
  
  

  const togglePasswordVisibility = (uniqueId) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [uniqueId]: !prevState[uniqueId],
    }));
  };

  const columns = [
    {
      title: "Driver Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNo",
      key: "mobileNo",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Unique ID",
      dataIndex: "uniqueId",
      key: "uniqueId",
    },
    {
      title: "Password",
      dataIndex: "password",
      key: "password",
      render: (text, record) => (
        <div>
          <span>{passwordVisibility[record.uniqueId] ? text : "********"}</span>
          <Tooltip
            title={
              passwordVisibility[record.uniqueId]
                ? "Hide Password"
                : "Show Password"
            }
          >
            <Button
              icon={
                passwordVisibility[record.uniqueId] ? (
                  <EyeOutlined />
                ) : (
                  <EyeInvisibleOutlined />
                )
              }
              onClick={() => togglePasswordVisibility(record.uniqueId)}
              style={{ marginLeft: 8 }}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => deleteDriver(record._id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="add-driver-container">
      <Form
        form={form}
        name="addDriverForm"
        onFinish={handleAddDriver}
        layout="vertical"
        disabled={loading}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Driver Name"
              name="name"
              rules={[{ required: true, message: "Please enter driver name" }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Please enter driver email" },{ 
                    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Optional: Custom regex to ensure proper format
                    message: 'Please enter a valid email address' 
                  }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Mobile Number"
              name="mobileNo"
              rules={[
                {
                  required: true,
                  message: "Please enter driver mobile number",
                },
                { 
                      pattern: /^[0-9]{10}$/, // Regular expression to match exactly 10 digits
                      message: 'Please enter a valid 10-digit mobile number'
                    }
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true, message: "Please enter address" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Add Driver
          </Button>
        </Form.Item>
      </Form>

      <Table
        dataSource={drivers}
        columns={columns}
        rowKey="uniqueId"
        className="drivers-table"
        size="large"
        pagination={{ pageSize: 5 }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default AddDriver;
