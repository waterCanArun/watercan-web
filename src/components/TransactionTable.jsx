import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Collapse,
  Tooltip,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  message,
  Modal,
} from "antd";
import axios from "axios";
import "./txn.css";
import { TbTruckDelivery, TbTruckLoading } from "react-icons/tb";
import { FaArrowCircleLeft } from "react-icons/fa";
import { WIFI } from "../constant";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs"; // Ensure you have dayjs imported
import { FaWhatsapp } from "react-icons/fa"; // Import WhatsApp logo

const { Panel } = Collapse;
const { Option } = Select;

const TransactionTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [selectedToDate, setSelectedToDate] = useState(null);

  // State for Mobile and Address
  const [mobileNumber, setMobileNumber] = useState(
    localStorage.getItem("mobileNumber")
  );
  const [address, setAddress] = useState(localStorage.getItem("address") || ""); // Default address from localStorage if available
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [
    searchText,
    selectedDriver,
    selectedFromDate,
    selectedToDate,
    transactions,
  ]);

  const fetchData = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("userInfo"))._id; // Get the logged-in user's ID

      const response = await axios.get(
        `http://${WIFI}/api/transaction-history`
      );
      if (response.data.success) {
        const filteredTransactions = response.data.transactions.filter(
          (txn) => txn.userId === userId // Filter transactions based on userId
        );
        setTransactions(filteredTransactions);
        setFilteredTransactions(filteredTransactions);
      }
    } catch (err) {
      console.error("Error in backend of transaction", err);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;
    if (searchText) {
      filtered = filtered.filter(
        (txn) =>
          txn.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
          txn.driverName.toLowerCase().includes(searchText.toLowerCase()) ||
          txn._id.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (selectedDriver)
      filtered = filtered.filter((txn) => txn.driverName === selectedDriver);
    if (selectedFromDate)
      filtered = filtered.filter(
        (txn) =>
          new Date(txn.dateTime) >= selectedFromDate.startOf("day").toDate()
      );
    if (selectedToDate)
      filtered = filtered.filter(
        (txn) => new Date(txn.dateTime) <= selectedToDate.endOf("day").toDate()
      );
    setFilteredTransactions(filtered);
  };

  const getRowClassName = (record, index) => (index === 0 ? "first-row" : "");

  const columns = [
    { title: "Transaction ID", dataIndex: "_id", key: "_id" },
    { title: "Customer Name", dataIndex: "customerName", key: "customerName" },
    {
      title: "Combo Details",
      key: "comboDetails",
      render: (_, record) => (
        <Collapse bordered={false} defaultActiveKey={["0"]}>
          {record.combo.map((item, index) => (
            <Panel
              header={`Combo ${index + 1} - Type: ${item.type}`}
              key={index}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "orange",
                    color: "white",
                    padding: "5px 10px",
                  }}
                >
                  <Tooltip title="Bottles Received">
                    <FaArrowCircleLeft /> {item.bottlesReceived}
                  </Tooltip>
                </div>
                <div
                  style={{
                    backgroundColor: "green",
                    color: "white",
                    padding: "5px 10px",
                  }}
                >
                  <Tooltip title="Bottles Delivered">
                    <TbTruckDelivery /> {item.bottlesDelivered}
                  </Tooltip>
                </div>
                <div
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    padding: "5px 10px",
                  }}
                >
                  <Tooltip title="Bottles Left">
                    <TbTruckLoading />{" "}
                    {item.bottlesDelivered - item.bottlesReceived}
                  </Tooltip>
                </div>
              </div>
            </Panel>
          ))}
        </Collapse>
      ),
    },
    {
      title: "Total Bottles Left",
      dataIndex: "bottlesCount",
      key: "bottlesCount",
    },
    { title: "Amount", dataIndex: "paymentTaken", key: "paymentTaken" },
    { title: "Due Amount", dataIndex: "dueAmount", key: "dueAmount" },
    { title: "Date", dataIndex: "dateTime", key: "dateTime" },
    { title: "Driver Name", dataIndex: "driverName", key: "driverName" },
  ];

  const handleDownloadPDF = () => {
    // Show modal before proceeding
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    if (!mobileNumber || !address) {
      message.error("Please enter both mobile number and address.");
      return;
    }
    
    localStorage.setItem("mobileNumber", mobileNumber);
    localStorage.setItem("address", address);

    // Proceed to generate PDF
    const doc = new jsPDF("landscape");

    // Retrieve user information from localStorage
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (!user) {
      message.error("User data not found. Please log in.");
      return;
    }

    const vendorDetails = {
      vendorName: user.name || "N/A",
      email: user.email || "N/A",
      mobileNumber,
      address,
    };

    doc.setFontSize(14);
    doc.text("Vendor Details", 20, 20);
    doc.setFontSize(12);

    doc.text(`Vendor Name: ${vendorDetails.vendorName}`, 20, 40);
    doc.text(`Email: ${vendorDetails.email}`, 20, 50);
    doc.text(`Mobile Number: +91 ${vendorDetails.mobileNumber}`, 20, 60);
    doc.text(`Address: ${vendorDetails.address}`, 20, 70);

    const tableStartY = 80;
    const tableData = filteredTransactions.map((txn) => {
      let comboDetails = txn.combo
        .map((combo) => {
          return `Type: ${combo.type}\nReceived: ${
            combo.bottlesReceived
          }\nDelivered: ${combo.bottlesDelivered}\nLeft: ${
            combo.bottlesDelivered - combo.bottlesReceived
          }`;
        })
        .join("\n\n");

      return [
        txn._id,
        txn.customerName,
        txn.paymentTaken,
        txn.dueAmount,
        txn.dateTime,
        txn.driverName,
        comboDetails,
      ];
    });

    doc.autoTable({
      startY: tableStartY,
      head: [
        [
          "Transaction ID",
          "Customer Name",
          "Amount",
          "Due Amount",
          "Date",
          "Driver Name",
          "Combo Details",
        ],
      ],
      body: tableData,
      margin: { top: 100 },
      styles: {
        cellPadding: 5,
        fontSize: 10,
        overflow: "linebreak",
        minCellHeight: 10,
      },
      headStyles: {
        fontStyle: "bold",
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        halign: "center",
      },
      bodyStyles: {
        valign: "top",
        fontSize: 10,
      },
    });

    doc.save("transaction-report.pdf");
    setIsModalVisible(false); // Close modal after generating PDF
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const formatMessage = () => {
    let message = "📋 *Transaction Details*\n\n";
    if (filteredTransactions.length === 0) {
      message.warning("No data to share.");
      return "";
    }

    filteredTransactions.forEach((txn) => {
      message += `*Transaction ID:* ${txn._id}\n`;
      message += `*Customer Name:* ${txn.customerName}\n`;
      message += `*Bottles Left:* ${txn.bottlesCount}\n`;
      message += `*Bottles Received:* ${txn.combo.reduce(
        (total, item) => total + item.bottlesReceived,
        0
      )}\n`;
      message += `*Bottles Delivered:* ${txn.combo.reduce(
        (total, item) => total + item.bottlesDelivered,
        0
      )}\n`;
      message += `*Amount:* ${txn.paymentTaken}\n`;
      message += `*Due Amount:* ${txn.dueAmount}\n`;
      message += `*Date:* ${dayjs(txn.dateTime, "YYYY-MM-DD").format(
        "YYYY-MM-DD"
      )}\n`;
      message += `*Driver Name:* ${txn.driverName}\n\n`;
      message += "----------------------\n";
    });

    message += "Thank you for your business! 😊";

    return encodeURIComponent(message);
  };

  const shareOnWhatsApp = () => {
    const message = formatMessage();
    if (message) {
      const whatsappUrl = `https://api.whatsapp.com/send?text=${message}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  const handleRefresh = () => {
    setSearchText("");
    setSelectedDriver("");
    setSelectedFromDate(null);
    setSelectedToDate(null);
    fetchData();
  };

  return (
    <>
      <Row gutter={16} style={{ marginBottom: "1rem" }}>
        <Col span={6}>
          <Input
            placeholder="Search by Transaction ID, Customer, or Driver"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>
        <Col span={6}>
          <Select
            style={{ width: "100%" }}
            placeholder="Select Driver"
            value={selectedDriver}
            onChange={(value) => setSelectedDriver(value)}
          >
            <Option value="">All Drivers</Option>
            {Array.from(new Set(transactions.map((txn) => txn.driverName))).map(
              (driver) => (
                <Option key={driver} value={driver}>
                  {driver}
                </Option>
              )
            )}
          </Select>
        </Col>
        <Col span={4}>
          <DatePicker
            style={{ width: "100%" }}
            placeholder="From Date"
            value={selectedFromDate}
            onChange={(date) => setSelectedFromDate(date)}
          />
        </Col>
        <Col span={4}>
          <DatePicker
            style={{ width: "100%" }}
            placeholder="To Date"
            value={selectedToDate}
            onChange={(date) => setSelectedToDate(date)}
          />
        </Col>
      </Row>

      <Button
        type="primary"
        onClick={handleDownloadPDF}
        style={{ marginBottom: "1rem" }}
      >
        Download PDF
      </Button>

      <Button
        type="default"
        onClick={shareOnWhatsApp}
        style={{
          marginBottom: "1rem",
          marginLeft: "1rem",
          backgroundColor: "green",
          color: "white",
        }}
      >
        <FaWhatsapp style={{ marginRight: "8px" }} />
        Share on WhatsApp
      </Button>

      <Button
        type="default"
        onClick={handleRefresh}
        style={{
          marginBottom: "1rem",
          marginLeft: "1rem",
          backgroundColor: "#1890ff",
          color: "white",
        }}
      >
        Refresh Data
      </Button>

      {/* Modal for Mobile Number and Address */}
      <Modal
        title="Enter Vendor Details"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Input
          placeholder="Mobile Number"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          onInput={(e) => (e.target.value = e.target.value.replace(/\D/g, ""))} 
          maxLength={10}
          style={{ marginBottom: "10px" }}
        />

        <Input
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </Modal>

      <Table
        dataSource={[...filteredTransactions].reverse()}
        columns={columns}
        rowKey="_id"
        pagination={true}
        rowClassName={getRowClassName}
        scroll={{ x: "max-content" }}
        responsive={true}
      />
    </>
  );
};

export default TransactionTable;
