import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./components/Home";
import Products from "./components/Products";
import Category from "./components/Category";
import SubCategory from "./components/SubCategory";
import ProductOrders from "./components/ProductOrders";
import Customers from "./components/Customers";
import Settings from "./components/Settings";
import Login from "./components/Login";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
          <Route path="/category" element={<PrivateRoute><Category /></PrivateRoute>} />
          <Route path="/subcategory" element={<PrivateRoute><SubCategory /></PrivateRoute>} />
          <Route path="/product-orders" element={<PrivateRoute><ProductOrders /></PrivateRoute>} />
          <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
