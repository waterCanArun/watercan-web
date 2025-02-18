import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
import {
  HomeOutlined,
  UserAddOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import Home from "../components/Home";
import AddCustomer from "../components/AddCustomer";
import AddedProducts from "../components/AddedProducts";
import AddRoute from "../components/AddRoute";
import DisplayData from "../components/DisplayData";
import TransactionTable from "../components/TransactionTable";
import Report from "./Report";
import AddDriver from "../components/AddDriver";
import ProductManagement from "../components/ProductManagement";

const { Header, Content, Footer, Sider } = Layout;

const AdminDashboard = () => {
  const [selectedKey, setSelectedKey] = useState("1");
  const [collapsed, setCollapsed] = useState(false);

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
  };

  const renderContent = () => {
    switch (selectedKey) {
      case "1":
        return <DisplayData />;
      case "2":
        return <AddCustomer />;
      case "3":
        return <AddRoute />;
      case "4":
        const user = JSON.parse(localStorage.getItem("userInfo"));
        return <ProductManagement userId={user._id} />;
      case "5":
        return <TransactionTable />;
      case "6":
        return <Report />;
      case "7":
        return <Home />;
      case "8":
        return <AddDriver />;
      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", overflow: 'hidden' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        style={{
          display: collapsed ? 'none' : 'block',
          position: 'fixed',
          height: '100vh',
          overflow: 'hidden',
          left: 0,
          transition: 'all 0.2s',
        }}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
        >
          <Menu.Item key="1" icon={<HomeOutlined />}>
            Home
          </Menu.Item>
          <Menu.Item key="2" icon={<UserAddOutlined />}>
            Add Customer
          </Menu.Item>
          <Menu.Item key="3" icon={<LogoutOutlined />}>
            Add Route
          </Menu.Item>
          <Menu.Item key="4" icon={<LogoutOutlined />}>
            Add Products
          </Menu.Item>
          <Menu.Item key="5" icon={<LogoutOutlined />}>
            Transaction History
          </Menu.Item>
         
          <Menu.Item key="7" icon={<LogoutOutlined />}>
            Plant Owner
          </Menu.Item>
          <Menu.Item key="8" icon={<LogoutOutlined />}>
            Add Driver
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 0 : 200 }}>
        <Header
          style={{
            padding: 0,
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "fixed",
            width: `calc(100% - ${collapsed ? 0 : 200}px)`,
            zIndex: 1,
            background: "#001529",
            transition: "all 0.3s",
          }}
        >
          <Button
            type="primary"
            onClick={() => setCollapsed(!collapsed)}
            style={{
              marginLeft: 16,
              display: collapsed ? "block" : "none",
            }}
            icon={<MenuOutlined />}
          />
        </Header>
        <Content
          style={{
            margin: "24px 16px 0",
            paddingTop: collapsed ? 64 : 64, 
          }}
        >
          <div style={{ padding: 24, minHeight: 360 }}>{renderContent()}</div>
        </Content>
        <Footer style={{ textAlign: "center" }}> </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
