import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useUserType } from "../contexts/UserType";
import axios from 'axios';
import {message} from 'antd';
const AuthCustomer = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { userType } = useUserType();

  const handleAuthAction = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (isLogin) {
      await handleLogin();
    } else {
      await handleRegister();
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter email and password.');
      return;
    }
    try{
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/verify`, {
            email,
            password,
          }); 
          if(response.data.success){
            const userInfo = response.data.customer;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            
            // userType ? navigate('/admin/dashboard') : navigate('/customer/home');
            // Clear form fields after successful registration
            userType ? navigate('/admin/dashboard') : navigate('/customer/home');
            message.success("Logged in succesfully")
          }else{
            message.error("Login with correct credentials")
          }
    }catch(error){
        message.error("Error while Login")
    }
    // Perform actual login logic here
  };

const handleRegister = async () => {
    if (!email || !password) {
      alert('Please fill in all fields.');
      return;
    }
  
    try {
      // Send the registration request to your backend
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users`, {
        email,
        password,
        mobileNo,
        address,
        name,
        location:"55.00023,34.00234"
        // Include additional fields as needed
      });
      if (response.data.success) {
        // Registration successful
        // Optionally, you can navigate the user to the appropriate dashboard
        
        // Set customer info in local storage
        const userInfo = response.data.data;
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        
        // Clear form fields after successful registration
        userType ? navigate('/admin/dashboard') : navigate('/customer/home');
        setEmail('');
        setPassword('');
        setRememberMe(false);
  
        message.success("Registered Successfully,Now directed to home")
      } else {
        // Registration failed, handle the error
        // Optionally, you can show an error message to the user
        message.error('Registration failed. Please try again later.');
      }
    } catch (error) {
      // An error occurred while registering the user
      message.error('Registration Error:', error);
      // Optionally, you can show an error message to the user
    //   alert('An error occurred while registering. Please try again later.');
    }
  };
  
  

  return (
    <div style={{ backgroundColor: "white", borderRadius: "10px", padding: "30px", width: "300px", fontSize: "10px" }}>
      <form onSubmit={handleAuthAction}>
        <h3 style={{ textAlign: "center", margin: "10px 0", paddingBottom: "10px", fontSize: "10px" }}>{isLogin ? 'Login to your Account' : 'Create Account'}</h3>
        {!isLogin && (
          <div style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
            <label htmlFor="name" style={{ fontSize: "10px" }}>Name</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} style={{ paddingLeft: "5px", marginBottom: '5px', height: "30px", fontSize: "10px" }} />
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
          <label htmlFor="email" style={{ fontSize: "10px" }}>Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: "5px", marginBottom: '5px', height: "30px", fontSize: "10px" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
          <label htmlFor="password" style={{ fontSize: "10px" }}>Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingLeft: "5px", marginBottom: '5px', height: "30px", fontSize: "10px" }} />
        </div>
        {!isLogin && (
          <div style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
            <label htmlFor="address" style={{ fontSize: "10px" }}>Address</label>
            <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} style={{ paddingLeft: "5px", marginBottom: '5px', height: "30px", fontSize: "10px" }} />
          </div>
        )}
        {!isLogin && (
          <div style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
            <label htmlFor="mobileNo" style={{ fontSize: "10px" }}>Mobile No</label>
            <input type="tel" id="mobileNo" value={mobileNo} onChange={(e) => setMobileNo(e.target.value)} style={{ paddingLeft: "5px", marginBottom: '5px', height: "30px", fontSize: "10px" }} />
          </div>
        )}
        <label style={{ display: "flex", alignItems: "center", fontSize: "10px", marginBottom: "10px" }}>
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ width: "15px", height: "15px", marginRight: "5px", fontSize: "10px" }} />
          Remember Me
        </label>
        <button type="submit" style={{ width: "100%", padding: "10px", marginBottom: '10px', border: "none", color: "white", backgroundColor: "#1e4d91", fontSize: "10px" }}>{isLogin ? 'Login' : 'Sign Up'}</button>
        <p style={{ fontSize: "10px", textAlign: "center", margin: "5px 0" }}>{isLogin ? "New to MyApp?" : 'Already have an account?'} <Link to="" style={{ fontSize: "10px", color: "blue" }} onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Sign Up' : 'Login'}</Link></p>
      </form>
    </div>
  );
};

export default AuthCustomer;
