import React, { useState } from "react";
import { Link } from "react-router-dom"; 
import { useUserType } from "../contexts/UserType";
const SelectType = () => {
  const [isHoveredAdmin, setIsHoveredAdmin] = useState(false);
  const [isHoveredCustomer, setIsHoveredCustomer] = useState(false);
  const {setUserType}=useUserType(false)
  return (
    <div
      style={{
        backgroundColor: "#202124",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: "2rem" }}>You are ..</div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          width: "80%",
          maxWidth: "800px",
        }}
      >
        <div
          onMouseEnter={() => setIsHoveredAdmin(true)}
          onMouseLeave={() => setIsHoveredAdmin(false)}
          onClick={()=>setUserType(true)}
          style={{
            width: "35%",
            padding: "20px",
            border: "2px solid #333",
            textAlign: "center",
            transition: "all 0.3s",
            cursor: "pointer",
            backgroundColor: isHoveredAdmin ? "#C4C2C2" : "#202124",
          }}
        >
          <Link
            to="/admin"
            style={{ width: "100%", color: "white", textDecoration: "none" }}
          >
            <img
              src="./images/admin.png"
              alt="admin"
              style={{ width: "140px" }}
            />
            <h4>Continue as Admin</h4>
          </Link>
        </div>
        <div
          onMouseEnter={() => setIsHoveredCustomer(true)}
          onMouseLeave={() => setIsHoveredCustomer(false)}
          onClick={()=>setUserType(false)}
          style={{
            width: "35%",
            padding: "20px",
            border: "2px solid #333",
            textAlign: "center",
            transition: "all 0.3s",
            cursor: "pointer",
            backgroundColor: isHoveredCustomer ? "#C4C2C2" : "#202124",
          }}
        >
          <Link
            to="/customer"
            style={{ width: "100%", color: "white", textDecoration: "none" }}
          >
            <img
              src="./images/customer.png"
              alt="customer"
              style={{ width: "140px" }}
            />
            <h4>Continue as Customer</h4>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SelectType;
