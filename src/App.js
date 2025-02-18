import './App.css';
import AuthPage from './Pages/AuthPage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import AdminDashboard from './Pages/AdminDashboard';
import { UserTypeProvider } from './contexts/UserType';
import { ProductListProvider } from './contexts/ProductList';
import AddCustomer from './components/AddCustomer';
function App() {
  return (
    <ProductListProvider>
      <UserTypeProvider>
        <Toaster/>
        <Router>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Router>
      </UserTypeProvider>
    </ProductListProvider>
  );
}

export default App;
