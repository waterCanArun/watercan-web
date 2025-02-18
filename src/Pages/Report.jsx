import React, { useEffect, useState, useRef } from "react";
import { Select, Button, Table, DatePicker, message, Row, Col, List, Typography } from "antd";
import { useMediaQuery } from "react-responsive";
import { CSVLink } from "react-csv";
import { TbTruckDelivery } from "react-icons/tb";
import { FaArrowCircleLeft } from "react-icons/fa";
import { TbTruckLoading } from "react-icons/tb";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs"; // Import dayjs
import customParseFormat from "dayjs/plugin/customParseFormat"; // Plugin for custom parsing
import isBetween from "dayjs/plugin/isBetween"; // Plugin for isBetween functionality
import { MailOutlined } from '@ant-design/icons';
import { FaWhatsapp } from 'react-icons/fa';
import { WIFI } from "../constant";

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

const { Option } = Select;
const { RangePicker } = DatePicker;

const TableTxn = ({ transactions }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 }); // Define mobile view breakpoint

  const columns = [
    {
      title: "Transaction ID",
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Combo Details",
      key: "comboDetails",
      render: (_, record) => (
        <ul>
          {record.combo.map((item, index) => (
            <li key={index}>
              <div style={{ fontWeight: "bolder" }}>Type: {item.type}</div>
              <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                <div style={{ color: "orange", fontWeight: "bolder" }}>
                  <FaArrowCircleLeft /> <div>{item.bottlesReceived}</div>
                </div>
                <div style={{ color: "green", fontWeight: "bolder" }}>
                  <TbTruckDelivery /> <div>{item.bottlesDelivered}</div>
                </div>
                <div style={{ color: "red", fontWeight: "bolder" }}>
                  <TbTruckLoading />{" "}
                  <div>{item.bottlesDelivered - item.bottlesReceived}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: "Total Bottles Left",
      dataIndex: "bottlesCount",
      key: "bottlesCount",
    },
    {
      title: "Amount",
      dataIndex: "paymentTaken",
      key: "paymentTaken",
    },
    {
      title: "Due Amount",
      dataIndex: "dueAmount",
      key: "dueAmount",
    },
    {
      title: "Date",
      dataIndex: "dateTime",
      key: "dateTime",
      render: (text) => dayjs(text).isValid() ? dayjs(text).format("DD-MM-YYYY") : "Invalid Date",

    },
    {
      title: "Driver Name",
      dataIndex: "driverName",
      key: "driverName",
    },
  ];
  

  return isMobile ? (
    <List
      dataSource={transactions}
      renderItem={(txn) => (
        <List.Item
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            marginBottom: "10px",
            padding: "10px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <div style={{ width: "100%" }}>
            <Typography.Title level={5}>Transaction ID: {txn._id}</Typography.Title>
            <p><strong>Customer Name:</strong> {txn.customerName}</p>
            <p><strong>Total Bottles Left:</strong> {txn.bottlesCount}</p>
            <p><strong>Amount:</strong> {txn.paymentTaken}</p>
            <p><strong>Due Amount:</strong> {txn.dueAmount}</p>
            <p><strong>Date:</strong> {dayjs(txn.dateTime, "YYYY-MM-DD").format("YYYY-MM-DD")}</p>
            <p><strong>Driver Name:</strong> {txn.driverName}</p>
            <strong>Combo Details:</strong>
            <ul>
              {txn.combo.map((item, index) => (
                <li key={index}>
                  <div>Type: {item.type}</div>
                  <div>
                    <FaArrowCircleLeft /> Received: {item.bottlesReceived}
                  </div>
                  <div>
                    <TbTruckDelivery /> Delivered: {item.bottlesDelivered}
                  </div>
                  <div>
                    <TbTruckLoading /> Balance:{" "}
                    {item.bottlesDelivered - item.bottlesReceived}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </List.Item>
      )}
    />
  ) : (
    <Table
      dataSource={[...transactions].reverse()}
      columns={columns}
      rowKey="_id"
      pagination={{ pageSize: 10 }}
      bordered
    />
  );
};

const Report = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const csvLinkRef = useRef(null);

  // Fetch data from API
  const fetchData = async () => {
    try {
      const response = await fetch(`http://${WIFI}/api/transaction-history`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
        setFilteredTransactions(data.transactions);
      } else {
        message.error("Error fetching transactions.");
      }
    } catch (err) {
      message.error("Failed to fetch transactions.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Extract unique customers and drivers
  const uniqueCustomers = [
    ...new Set(transactions.map((txn) => txn.customerName)),
  ];

  const uniqueDrivers = [...new Set(transactions.map((txn) => txn.driverName))];

  // Handle customer filter change
  const handleCustomerChange = (value) => {
    setSelectedCustomer(value);
  };

  // Handle driver filter change
  const handleDriverChange = (value) => {
    setSelectedDriver(value);
  };

  // Handle date range change
  const handleDateChange = (dates) => {
    if (dates) {
      setSelectedDateRange(dates);
    } else {
      setSelectedDateRange(null);
    }
  };

  // Apply filters whenever any filter state changes
  useEffect(() => {
    let filtered = [...transactions];

    if (selectedCustomer) {
      filtered = filtered.filter(
        (txn) => txn.customerName === selectedCustomer
      );
    }

    if (selectedDriver) {
      filtered = filtered.filter((txn) => txn.driverName === selectedDriver);
    }

    if (selectedDateRange) {
      const [start, end] = selectedDateRange;
      filtered = filtered.filter((txn) => {
        const txnDate = dayjs(txn.dateTime, "YYYY-MM-DD");
        return txnDate.isBetween(start, end, "day", "[]");
      });
    }

    setFilteredTransactions(filtered);
  }, [selectedCustomer, selectedDriver, selectedDateRange, transactions]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Vendor Details
    const vendorDetails = {
        plantName: "Plant ABC",
        vendorName: "Vendor XYZ",
        email: "vendor@example.com",
        city: "City Name",
        contactNumber: "1234567890",
    };

    // Add Vendor Details
    doc.setFontSize(14);
    doc.text("Vendor Details", 20, 20);
    doc.setFontSize(12);
    doc.text(`Plant Name: ${vendorDetails.plantName}`, 20, 30);
    doc.text(`Vendor Name: ${vendorDetails.vendorName}`, 20, 40);
    doc.text(`Email: ${vendorDetails.email}`, 20, 50);
    doc.text(`City: ${vendorDetails.city}`, 20, 60);
    doc.text(`Contact Number: ${vendorDetails.contactNumber}`, 20, 70);

    // Add Space Before Table
    const tableStartY = 80;

    // Table Header and Data
    autoTable(doc, {
        startY: tableStartY, // Start table below vendor details
        head: [["Transaction ID", "Customer Name", "Amount", "Due Amount", "Date"]],
        body: filteredTransactions.map((txn) => [
            txn._id,
            txn.customerName,
            txn.paymentTaken,
            txn.dueAmount,
              txn.dateTime,
          ]),
      }); 

      // Save PDF
      doc.save("transaction-report.pdf");
};

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={16}>
        <Col span={24} style={{ textAlign: "center" }}>
          <img
            src="../../public/images/logo1.jpg"
            alt="Company Logo"
            style={{ width: 150, marginBottom: "20px" }}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Select
            placeholder="Select Customer"
            style={{ width: "100%" }}
            onChange={handleCustomerChange}
            allowClear
          >
            {uniqueCustomers.map((customer) => (
              <Option key={customer} value={customer}>
                {customer}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <Select
            placeholder="Select Driver"
            style={{ width: "100%" }}
            onChange={handleDriverChange}
            allowClear
          >
            {uniqueDrivers.map((driver) => (
              <Option key={driver} value={driver}>
                {driver}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <RangePicker
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
            onChange={handleDateChange}
          />
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: "20px" }}>
        <Col span={24} style={{ textAlign: "center" }}>
          <Button type="primary" onClick={handleDownloadPDF}>
            Download PDF
          </Button>
          <CSVLink
            data={filteredTransactions}
            filename="transactions.csv"
            style={{ marginLeft: 20 }}
          >
            <Button>Download CSV</Button>
          </CSVLink>
          <a
            href="https://wa.me/your-phone-number"
            target="_blank"
            style={{ marginLeft: 20 }}
          >
            <FaWhatsapp size={30} />
          </a>
          <a
            href="mailto:your-email@example.com"
            style={{ marginLeft: 20 }}
          >
            <MailOutlined style={{ fontSize: 30 }} />
          </a>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: "20px" }}>
        <Col span={24}>
          <TableTxn transactions={filteredTransactions} />
        </Col>
      </Row>
    </div>
  );
};

export default Report;
