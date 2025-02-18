import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router";
import { useUserType } from "../contexts/UserType";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { message } from "antd";
import Loading from "./Loading";
import "./Auth.css";
import { WIFI } from "../constant";
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const { userType } = useUserType();

  const handleAuthAction = async (e) => {
    e.preventDefault();
    isLogin ? await handleLogin() : await handleRegister();
  };

  const handleLogin = async () => {
    setLoading(true);
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }
  
    try {
      const response = await axios.post(
        `http://${WIFI}/api/users/verify`,
        { email, password }
      );
  
      if (response.data.success) {
        const userInfo = response.data.user;
        // Save the entire user info (including address, mobileNo) in localStorage
        localStorage.setItem("userInfo", JSON.stringify(userInfo)); // Store the full user object including address and mobileNo
        message.success("Login Successfully, Now directed to home");
        setTimeout(() => {
          navigate("/admin");
          setLoading(false);
        }, 3000);
      } else {
        message.error("Login with correct credentials");
      }
    } catch (error) {
      message.error("Error while Login");
    }
  };
  
  
  

  const handleRegister = async () => {
    if (!email || !password || !name || !address || !mobileNo) {
      alert("Please fill in all fields.");
      return;
    }
  
    try {
      const response = await axios.post(`http://${WIFI}/api/users`, {
        name,
        email,
        password,
        mobileNo,
        address,
      });
  
      if (response.data.success) {
        const userInfo = response.data.user; // The backend should return this with address and mobileNo
        localStorage.setItem("userInfo", JSON.stringify(userInfo)); // Store the full user object including address and mobileNo
        message.success("Registered Successfully, Now directed to home");
        setTimeout(() => {
          navigate("/admin");
        }, 3000);
      } else {
        toast("Registration failed. Please try again later.", {
          style: { backgroundColor: "red", color: "white" },
        });
      }
    } catch (error) {
      toast("Registration ERROR:", error);
    }
  };
  


  return (
    <div
      style={{
        backgroundImage: "url('/images/waterCan.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {!loading ? (
        <div className="auth-container">
          <Toaster />
          <form onSubmit={handleAuthAction} className="auth-form">
            <h3 className="form-title">{isLogin ? "LOGIN" : "REGISTER"}</h3>
            {!isLogin && (
              <div className="input-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input"
                />
              </div>
            )}
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  type={passwordVisible ? "text" : "password"} // Toggle between text and password
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                />
                <span
                  onClick={() => setPasswordVisible(!passwordVisible)} // Toggle visibility on icon click
                  className="eye-icon"
                >
                  {passwordVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </span>
              </div>
            </div>
            {!isLogin && (
              <>
                <div className="input-group">
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="auth-input"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="mobileNo">Mobile No</label>
                  <input
                    type="tel"
                    id="mobileNo"
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                    className="auth-input"
                  />
                </div>
              </>
            )}
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>
            <button type="submit" className="auth-button">
              {isLogin ? "Login" : "Sign Up"}
            </button>
            <p className="toggle-auth">
              {isLogin ? "New to MyApp?" : "Already have an account?"}{" "}
              <Link
                to=""
                className="toggle-link"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Sign Up" : "Login"}
              </Link>
            </p>
          </form>
        </div>

      ) : (
        <div className="loading-container">
          <Loading />
        </div>
      )}
    </div>
  );
};

export default Auth;
