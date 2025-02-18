import React, { useEffect, useState, useRef } from "react";
import {
  Select,
  Button,
  Table,
  DatePicker,
  Card,
  Collapse,
  Row,
  Col,
  Statistic,
  message,
} from "antd";
import axios from "axios";
import { CSVLink } from "react-csv";
import { TbTruckDelivery, TbTruckLoading } from "react-icons/tb";
import { FaArrowCircleLeft } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import { WIFI } from "../constant";

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const Home = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const csvLinkRef = useRef(null);
  const fetchData = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("userInfo"))._id; // Get the logged-in user's ID
      
      const response = await axios.get(`http://${WIFI}/api/transaction-history`);
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

  useEffect(() => {
    fetchData();
  }, []);

  const uniqueCustomers = [
    ...new Set(transactions.map((txn) => txn.customerName)),
  ];
  const uniqueDrivers = [...new Set(transactions.map((txn) => txn.driverName))];

  const handleFilterChange = (setter) => (value) => setter(value);
  const handleDateChange = (dates) => setSelectedDateRange(dates || null);

  useEffect(() => {
    let filtered = [...transactions];
    if (selectedCustomer)
      filtered = filtered.filter(
        (txn) => txn.customerName === selectedCustomer
      );
    if (selectedDriver)
      filtered = filtered.filter((txn) => txn.driverName === selectedDriver);
    if (selectedDateRange && selectedDateRange.length === 2) {
      const [start, end] = selectedDateRange;
      filtered = filtered.filter((txn) => {
        const txnDate = dayjs(txn.dateTime, "YYYY-MM-DD", true);
        if (!txnDate.isValid()) return false;
        return txnDate.isBetween(start, end, "day", "[]");
      });
    }
    setFilteredTransactions(filtered);
  }, [transactions, selectedCustomer, selectedDriver, selectedDateRange]);

  const overallTotals = filteredTransactions.reduce(
    (acc, txn) => {
      const bottlesReceived = txn.combo.reduce(
        (total, item) => total + item.bottlesReceived,
        0
      );
      const bottlesDelivered = txn.combo.reduce(
        (total, item) => total + item.bottlesDelivered,
        0
      );
      acc.totalBottles += bottlesReceived + bottlesDelivered;
      acc.totalAmount += txn.paymentTaken;
      acc.totalDue += txn.dueAmount;
      return acc;
    },
    { totalBottles: 0, totalAmount: 0, totalDue: 0 }
  );

  const driverSummary = filteredTransactions.reduce((acc, txn) => {
    const driver = txn.driverName || "Unknown Driver";
    const bottlesReceived = txn.combo.reduce(
      (total, item) => total + item.bottlesReceived,
      0
    );
    const bottlesDelivered = txn.combo.reduce(
      (total, item) => total + item.bottlesDelivered,
      0
    );
    if (!acc[driver])
      acc[driver] = {
        driverName: driver,
        totalBottles: 0,
        totalExpenses: 0,
        totalDueAmount: 0,
      };
    acc[driver].totalBottles += bottlesDelivered - bottlesReceived;
    acc[driver].totalExpenses += txn.paymentTaken;
    acc[driver].totalDueAmount += txn.dueAmount;
    return acc;
  }, {});

  const summaryArray = Object.values(driverSummary);

  const summaryColumns = [
    { title: "Driver Name", dataIndex: "driverName", key: "driverName" },
    { title: "Total Bottles", dataIndex: "totalBottles", key: "totalBottles" },
    {
      title: "Total Expenses (₹)",
      dataIndex: "totalExpenses",
      key: "totalExpenses",
      render: (value) => value.toFixed(2),
    },
    {
      title: "Total Due Amount (₹)",
      dataIndex: "totalDueAmount",
      key: "totalDueAmount",
      render: (value) => value.toFixed(2),
    },
  ];

  const handlePDFDownload = () => {
    if (filteredTransactions.length === 0) {
      message.warning("No data to download.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Bill Report", 14, 20);
    doc.setFontSize(12);
    doc.text("Transactions:", 14, 30);
    doc.autoTable({
      head: [
        [
          "Transaction ID",
          "Customer Name",
          "Bottles Received",
          "Bottles Delivered",
          "Bottles Left",
          "Amount (₹)",
          "Due Amount (₹)",
          "Date",
          "Driver Name",
        ],
      ],
      body: filteredTransactions.map((txn) => [
        txn._id,
        txn.customerName,
        txn.combo.reduce((total, item) => total + item.bottlesReceived, 0),
        txn.combo.reduce((total, item) => total + item.bottlesDelivered, 0),
        txn.bottlesCount,
        txn.paymentTaken.toFixed(2),
        txn.dueAmount.toFixed(2),
        txn.dateTime,
        txn.driverName,
      ]),
      startY: 35,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
      pageBreak: "auto",
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Total Bottles: ${overallTotals.totalBottles}`, 14, finalY);
    doc.text(
      `Total Amount: ₹${overallTotals.totalAmount.toFixed(2)}`,
      14,
      finalY + 10
    );
    doc.text(
      `Total Due Amount: ₹${overallTotals.totalDue.toFixed(2)}`,
      14,
      finalY + 20
    );

    doc.text("Driver Summary:", 14, finalY + 30);
    doc.autoTable({
      head: [
        [
          "Driver Name",
          "Total Bottles",
          "Total Expenses (₹)",
          "Total Due Amount (₹)",
        ],
      ],
      body: summaryArray.map((driver) => [
        driver.driverName,
        driver.totalBottles,
        driver.totalExpenses.toFixed(2),
        driver.totalDueAmount.toFixed(2),
      ]),
      startY: finalY + 35,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save("transactions_report.pdf");
  };

  const csvData = filteredTransactions.map((txn) => ({
    "Transaction ID": txn._id,
    "Customer Name": txn.customerName,
    "Bottles Left": txn.bottlesCount,
    "Bottles Received": txn.combo.reduce(
      (total, item) => total + item.bottlesReceived,
      0
    ),
    "Bottles Delivered": txn.combo.reduce(
      (total, item) => total + item.bottlesDelivered,
      0
    ),
    "Amount (₹)": txn.paymentTaken.toFixed(2),
    "Due Amount (₹)": txn.dueAmount.toFixed(2),
    Date: txn.dateTime,
    "Driver Name": txn.driverName,
  }));

  const toggleTable = () => setShowTable(!showTable);

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            style={{ width: "100%" }}
            placeholder="Select a customer"
            onChange={handleFilterChange(setSelectedCustomer)}
            value={selectedCustomer}
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {uniqueCustomers.map((customer) => (
              <Option key={customer} value={customer}>
                {customer}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            style={{ width: "100%" }}
            placeholder="Select a driver"
            onChange={handleFilterChange(setSelectedDriver)}
            value={selectedDriver}
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {uniqueDrivers.map((driver) => (
              <Option key={driver} value={driver}>
                {driver}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={24} md={8} lg={12}>
          <RangePicker
            style={{ width: "100%" }}
            onChange={handleDateChange}
            allowClear
            format="YYYY-MM-DD"
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: "10px" }}>
        <Col>
          <Button onClick={handlePDFDownload} type="primary">
            Download PDF
          </Button>
        </Col>
        <Col>
          <CSVLink
            data={csvData}
            filename={"transactions.csv"}
            className="hidden"
            ref={csvLinkRef}
          ></CSVLink>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Bottles"
              value={overallTotals.totalBottles}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Amount (₹)"
              value={overallTotals.totalAmount}
              precision={2}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Due Amount (₹)"
              value={overallTotals.totalDue}
              precision={2}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
        <Col>
          <Button onClick={toggleTable} type="primary">
            {showTable ? "Hide Transactions" : "Show Transactions"}
          </Button>
        </Col>
      </Row>
      {showTable && (
        <div style={{ marginTop: "20px" }}>
          <Table
            dataSource={[...filteredTransactions].reverse()}
            columns={[
              { title: "Transaction ID", dataIndex: "_id", key: "_id" },
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
                        <div style={{ fontWeight: "bolder" }}>
                          Type: {item.type}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-evenly",
                          }}
                        >
                          <div
                            style={{ color: "orange", fontWeight: "bolder" }}
                          >
                            <FaArrowCircleLeft />{" "}
                            <div>{item.bottlesReceived}</div>
                          </div>
                          <div style={{ color: "green", fontWeight: "bolder" }}>
                            <TbTruckDelivery />{" "}
                            <div>{item.bottlesDelivered}</div>
                          </div>
                          <div style={{ color: "red", fontWeight: "bolder" }}>
                            <TbTruckLoading />{" "}
                            <div>
                              {item.bottlesDelivered - item.bottlesReceived}
                            </div>
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
                title: "Amount (₹)",
                dataIndex: "paymentTaken",
                key: "paymentTaken",
                render: (value) => `₹${value.toFixed(2)}`,
              },
              {
                title: "Due Amount (₹)",
                dataIndex: "dueAmount",
                key: "dueAmount",
                render: (value) => `₹${value.toFixed(2)}`,
              },
              {
                title: "Date",
                dataIndex: "dateTime",
                key: "dateTime",
                render: (text) =>
                  dayjs(text, "YYYY-MM-DD").format("YYYY-MM-DD"),
              },
              {
                title: "Driver Name",
                dataIndex: "driverName",
                key: "driverName",
              },
            ]}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </div>
      )}
      <Collapse style={{ marginTop: "20px" }}>
        <Panel header="Driver Summary" key="1">
          <Table
            dataSource={summaryArray}
            columns={summaryColumns}
            rowKey="driverName"
            pagination={false}
            bordered
          />
        </Panel>
      </Collapse>
    </div>
  );
};

export default Home;
