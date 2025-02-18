import React, { useState, useEffect } from "react";
import {
  message,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Input,
  Modal,
  Select,
  Table,
} from "antd";
import axios from "axios";
import Loading from "./Loading";
import { useNavigate } from "react-router-dom";
import { WIFI } from "../constant";

const { Title } = Typography;
const { TextArea } = Input;

const DisplayData = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [customerId, setCustomerId] = useState();
  const [updatedCustomerValues, setUpdatedCustomerValues] = useState({
    name: "",
    mobileNo: "",
    address: "",
    email: "",
  });
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [routeId, setRouteId] = useState();
  const [updatedRouteValues, setUpdatedRouteValues] = useState([]);
  const [routeModalVisible, setRouteModalVisible] = useState(false);
  const [updatedDriverId, setUpdatedDriverId] = useState(null);

  // Fetch routes based on the current user's userId
  const fetchRoutes = async () => {
    const userId = JSON.parse(localStorage.getItem("userInfo"))._id;
    axios
      .get(`http://${WIFI}/api/get-route`, {
        params: { userId }, // Fetch routes based on userId
      })
      .then((response) => {
        setRoutes(response.data.routes);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching routes:", error);
      });
  };

  // Fetch customers based on the current user's userId
  const fetchCustomers = async () => {
    const userId = JSON.parse(localStorage.getItem("userInfo"))._id;
    await axios
      .get(`http://${WIFI}/api/get-customers`, { params: { userId } })
      .then((response) => {
        setCustomers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching customers:", error);
      });
  };

  // Fetch drivers based on the current user's userId
  const fetchDrivers = async () => {
    const userId = JSON.parse(localStorage.getItem("userInfo"))._id;
    await axios
      .get(`http://${WIFI}/api/get-drivers/${userId}`)
      .then((response) => {
        setDrivers(response.data); // Assuming driver data comes as an array
      })
      .catch((error) => {
        console.error("Error fetching drivers:", error);
      });
  };

  // Fetch routes, customers, and drivers when the component mounts
  useEffect(() => {
    fetchRoutes();
    fetchCustomers();
    fetchDrivers();
  }, []);

  // Filter customers by those associated with the routes of the current user
  const filteredCustomers = customers
  .filter((customer) => {
    // Check if the customer is part of any route
    return routes.some((route) => route.customers.includes(customer._id));
  })
  .filter((customer) => {
    // Search filter: checking if searchValue matches customer name (case insensitive)
    return customer.name.toLowerCase().includes(searchValue.toLowerCase());
  });

// Handle customer search input
const handleSearchChange = (e) => {
  setSearchValue(e.target.value); // Update the search value state
};

  // Handle updating customer details
  const handleEditCustomer = (customer) => {
    setUpdatedCustomerValues({
      name: customer.name,
      mobileNo: customer.mobileNo,
      address: customer.address,
      email: customer.email,
    });
    setCustomerId(customer._id);
    setCustomerModalVisible(true);
  };

  // Update customer in the backend
  const handleUpdateCustomer = async () => {
    await updateCustomer(customerId, updatedCustomerValues);
  };

  // Update customer details via API
  const updateCustomer = async (customerId, updatedCustomerValues) => {
    try {
      const res = await axios.put(
        `http://${WIFI}/api/update-customer/${customerId}`,
        updatedCustomerValues
      );
      if (res.data.success) {
        setCustomerModalVisible(false);
        fetchCustomers();
        message.info("Customer Updated Successfully");
      }
    } catch (err) {
      message.error("Error Updating Customers : ", err);
    }
  };

  // Handle deleting a customer
  const handleDeleteCustomer = async (customerId) => {
    try {
      await axios.delete(`http://${WIFI}/api/delete-customer/${customerId}`);
      message.success("Customer Deleted ✔");
      fetchCustomers();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Error deleting Customer. Please try again.";
      console.error("Error deleting customer:", errorMessage);
      message.error(errorMessage);
    }
  };

  // Handle deleting a route
  const handleDeleteRoute = async (routeId) => {
    try {
      await axios.delete(`http://${WIFI}/api/delete-route/${routeId}`);
      message.success("Route Deleted ✔");
      fetchRoutes();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Error deleting route. Please try again.";
      console.error("Error deleting route:", errorMessage);
      message.error(errorMessage);
    }
  };

  // Handle updating a route with new customers or driver
  const handleUpdateRoute = async (routeId, updatedRouteValues, driverId) => {
    try {
      const payload = {
        customers: updatedRouteValues.length > 0 ? updatedRouteValues : [],
        driver: driverId || null,
      };

      const response = await axios.put(
        `http://${WIFI}/api/update-route/${routeId}`,
        payload
      );

      if (response.data.success) {
        message.success("Route updated successfully!");
        fetchRoutes();
        setRouteModalVisible(false);
        setRouteId(null);
        setUpdatedRouteValues([]);
        setUpdatedDriverId(null);
      } else {
        message.error(
          `Failed to update route: ${response.data.message || "Unknown error"}`
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Error updating route. Please try again.";
      console.error("Error updating route:", error);
      message.error(errorMessage);
    }
  };

  // Logout handler
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    alert("You have logged out successfully!");
    navigate("/");
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Mobile No",
      dataIndex: "mobileNo",
      key: "mobileNo",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, customer) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            style={{
              backgroundColor: "#08083b",
              color: "white",
            }}
            onClick={() => handleEditCustomer(customer)}
          >
            Edit
          </Button>
          <Button
            style={{
              backgroundColor: "white",
              color: "#F34840",
              border: "1px solid #F34840",
            }}
            onClick={() => handleDeleteCustomer(customer._id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Loading />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <Title level={2} style={{ textAlign: "center" }}>
        Welcome to the Dashboard
      </Title>
      <Row justify="center" style={{ marginBottom: "20px" }}>
        <Button
          onClick={handleLogout}
          style={{
            backgroundColor: "#f34840",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
          }}
        >
          Logout
        </Button>
      </Row>
      <Row gutter={[16, 16]}>
        {routes.map((route) => (
          <Col xs={24} sm={12} md={8} lg={6} key={route._id}>
            <Card title={route.name}>
              <p>Customers: {route.customers.length}</p>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  style={{
                    backgroundColor: "#1677ff",
                    color: "white",
                    borderRadius: "5px",
                  }}
                  onClick={() => {
                    setRouteId(route._id);
                    setUpdatedRouteValues(route.customers);
                    setUpdatedDriverId(route.driver ? route.driver._id : null);
                    setRouteModalVisible(true);
                  }}
                >
                  Update
                </Button>
                <Button
                  style={{
                    backgroundColor: "white",
                    color: "#F34840",
                    border: "1px solid #F34840",
                  }}
                  onClick={() => handleDeleteRoute(route._id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <div style={{ marginTop: "20px" }}>
        <h3>Search Customers</h3>
        <Input
          placeholder="Search by Name"
          value={searchValue}
          onChange={handleSearchChange}
          style={{ marginBottom: "10px" }}
        />
        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </div>
      <Modal
        title="Edit Customer"
        visible={customerModalVisible}
        onOk={handleUpdateCustomer}
        onCancel={() => setCustomerModalVisible(false)}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Input
            placeholder="Name"
            value={updatedCustomerValues.name}
            onChange={(e) =>
              setUpdatedCustomerValues((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
          />
          <Input
            placeholder="Mobile Number"
            value={updatedCustomerValues.mobileNo}
            onChange={(e) =>
              setUpdatedCustomerValues((prev) => ({
                ...prev,
                mobileNo: e.target.value,
              }))
            }
          />
          <Input
            placeholder="Email"
            value={updatedCustomerValues.email}
            onChange={(e) =>
              setUpdatedCustomerValues((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
          />
          <TextArea
            rows={4}
            placeholder="Address"
            value={updatedCustomerValues.address}
            onChange={(e) =>
              setUpdatedCustomerValues((prev) => ({
                ...prev,
                address: e.target.value,
              }))
            }
          />
        </div>
      </Modal>
      <Modal
        title="Update Route"
        visible={routeModalVisible}
        onOk={() =>
          handleUpdateRoute(routeId, updatedRouteValues, updatedDriverId)
        }
        onCancel={() => {
          setRouteModalVisible(false);
          setRouteId(null);
          setUpdatedRouteValues([]);
          setUpdatedDriverId(null);
        }}
      >
        <Select
          mode="multiple"
          placeholder="Select Customers"
          value={updatedRouteValues}
          onChange={setUpdatedRouteValues}
          style={{ width: "100%" }}
          showSearch
          filterOption={(input, option) => {
            return (
              option.children.toLowerCase().includes(input.toLowerCase()) || // Match name
              option.key.toLowerCase().includes(input.toLowerCase()) // Match customer ID
            );
          }}
        >
          {filteredCustomers.map((customer) => (
            <Select.Option key={customer._id} value={customer._id}>
              {customer.name}
            </Select.Option>
          ))}
        </Select>
        <Select
          placeholder="Select Driver"
          value={updatedDriverId}
          onChange={setUpdatedDriverId}
          style={{ width: "100%", marginTop: "20px" }}
          showSearch
          filterOption={(input, option) => {
            return (
              option.children.toLowerCase().includes(input.toLowerCase()) || // Match name
              option.key.toLowerCase().includes(input.toLowerCase()) // Match driver ID
            );
          }}
        >
          {drivers.map((driver) => (
            <Select.Option key={driver._id} value={driver._id}>
              {driver.name}
            </Select.Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default DisplayData;
