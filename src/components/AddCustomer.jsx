import React, { useState ,useEffect} from 'react';
import { Form, Input, Button, message,Select} from 'antd';
import axios from 'axios';
import { useProductList } from '../contexts/ProductList';
import GoogleMapComponent from './GoogleMapComponent';
import { WIFI } from '../constant';
const { Option } = Select;
const AddCustomer = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { coords, setCoords } = useProductList();
  const [routes,setRoutes] = useState()
  const [selectedRoute,setSelectedRoute] = useState()
  useEffect(() => {
    // Fetch routes and customers on component mount
      fetchRoutes();
  }, []);
  const fetchRoutes = async () => {
    const userId = JSON.parse(localStorage.getItem("userInfo"))._id;
    axios
      .get(`http://${WIFI}/api/get-route`, {
        params: { userId }  // Use 'params' to send query parameters in GET request
      })
      .then((response) => {
        setRoutes(response.data.routes);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching routes:", error);
      });
  };
  const handleRouteChange = (value) => {

    setSelectedRoute(value);
  };
  const handleAddCustomer = async (formData) => {
    setLoading(true);
    const { name, address, mobileNo, email, route } = formData;
    const location = coords ? `${coords[0]},${coords[1]}` : '0,0'; 
    const payload = { name, address, location, mobileNo, email, route };
  
    try {
      const userId = JSON.parse(localStorage.getItem('userInfo'))._id; 
      const response = await axios.post(`http://${WIFI}/api/customers/to/${userId}`, payload);
      
      if (response.data.success) {
        message.success('Customer Added and Assigned to Route ✔');
        form.resetFields(); // Reset form fields on success
        setCoords(null); // Reset coords after adding customer
  
        // Optionally update routes state if needed (e.g., fetching the updated route)
        fetchRoutes();  // Refresh routes data to show the updated route
      } else {
        message.error('Registration failed. Please try again later.');
      }
    } catch (error) {
      message.error('Registration Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  

  const onFinishFailed = (errorInfo) => {
    console.error('Failed:', errorInfo);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <Form
        form={form}
        name="addCustomerForm"
        onFinish={handleAddCustomer}
        onFinishFailed={onFinishFailed}
        layout="vertical"
        initialValues={{
          location: coords ? `${coords[0]},${coords[1]}` : '', 
        }}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter customer name' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
  label="Email"
  name="email"
  rules={[
    { required: true, message: 'Please enter customer email' },
    { 
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Optional: Custom regex to ensure proper format
      message: 'Please enter a valid email address' 
    }
  ]}
>
  <Input />
</Form.Item>


        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: 'Please enter customer address' }]}
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item
  label="Mobile Number"
  name="mobileNo"
  rules={[
    { required: true, message: 'Please enter customer mobile number' },
    { 
      pattern: /^[0-9]{10}$/, // Regular expression to match exactly 10 digits
      message: 'Please enter a valid 10-digit mobile number'
    }
  ]}
>
  <Input />
</Form.Item>
        <Form.Item
          label="Route :"
          name="route"
          rules={[{ required: false, message: 'Please select at least one customer' }]}
        >
          <Select
            // mode="multiple"
            placeholder="Select Route"
            onChange={handleRouteChange}
            value={selectedRoute}
          >
            {routes&&routes.map(route => (
              <Option key={route._id} value={route._id}>{route.name}</Option>
            ))}
          </Select>
        </Form.Item>
       {/* <Form.Item> */}
 
      <GoogleMapComponent />
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={{marginTop: 20, height: 50, width: 150}}>
            Add Customer
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddCustomer;
