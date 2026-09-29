import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { Toaster } from 'react-hot-toast';
import AuthContext, { AuthProvider } from './context/AuthContext';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerOrders from './pages/farmer/FarmerOrders';
import Shop from './pages/customer/Shop';
import Cart from './pages/customer/Cart';
import MyOrders from './pages/customer/MyOrders';
import WalletPage from './pages/customer/WalletPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ProductApprovals from './pages/admin/ProductApprovals';
import WarehouseDashboard from './pages/admin/WarehouseDashboard';
import ShipmentManagerDashboard from './pages/shipment/ShipmentManagerDashboard';
import DeliveryBoyDashboard from './pages/delivery/DeliveryBoyDashboard';
import ProductVerification from './pages/ProductVerification';
import { CartProvider } from './context/CartContext';
import { BlockchainProvider } from './context/BlockchainContext';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  return <ProtectedRouteHelper roles={roles}>{children}</ProtectedRouteHelper>;
};

const ProtectedRouteHelper = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#2E8B57',
              secondary: '#fff',
            },
          },
        }}
      />
      <BlockchainProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Public Routes */}
                <Route index element={
                  <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-b from-farmer-yellow/10 to-white text-center px-4">
                    <h1 className="text-5xl md:text-6xl font-bold text-farmer-green mb-6 animate-fade-in-up">
                      Fresh from the Farm,<br />Straight to your Table.
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                      CropLink bridges the gap between hardworking farmers and conscious consumers.
                      No middlemen, just pure quality and fair prices.
                    </p>
                    <div className="flex gap-4">
                      <a href="/shop" className="px-8 py-3 bg-farmer-green text-white text-lg rounded-full shadow-lg hover:bg-green-700 transition transform hover:scale-105">
                        Browse Marketplace
                      </a>
                      <a href="/register" className="px-8 py-3 bg-white text-farmer-green border-2 border-farmer-green text-lg rounded-full hover:bg-green-50 transition transform hover:scale-105">
                        Join as Farmer
                      </a>
                    </div>
                  </div>
                } />
                <Route path="shop" element={<Shop />} />
                <Route path="cart" element={<Cart />} />
                <Route path="orders" element={
                  <ProtectedRoute roles={['customer', 'farmer', 'admin']}>
                    <MyOrders />
                  </ProtectedRoute>
                } />
                <Route path="wallet" element={
                  <ProtectedRoute roles={['customer', 'farmer', 'admin']}>
                    <WalletPage />
                  </ProtectedRoute>
                } />

                {/* Auth Routes */}
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />

                {/* Protected Routes */}
                {/* Farmer Routes - Nested */}
                <Route path="farmer">
                  <Route index element={
                    <ProtectedRoute roles={['farmer']}>
                      <FarmerDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="orders" element={
                    <ProtectedRoute roles={['farmer']}>
                      <FarmerOrders />
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Admin Routes - Nested */}
                <Route path="admin">
                  <Route index element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="users" element={
                    <ProtectedRoute roles={['admin']}>
                      <UserManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="products" element={
                    <ProtectedRoute roles={['admin']}>
                      <ProductApprovals />
                    </ProtectedRoute>
                  } />
                  <Route path="warehouse" element={
                    <ProtectedRoute roles={['admin', 'warehouse']}>
                      <WarehouseDashboard />
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Shipment Manager Routes */}
                <Route path="shipment" element={
                  <ProtectedRoute roles={['admin', 'shipment_manager']}>
                    <ShipmentManagerDashboard />
                  </ProtectedRoute>
                } />

                {/* Delivery Boy Routes */}
                <Route path="delivery" element={
                  <ProtectedRoute roles={['admin', 'delivery_boy']}>
                    <DeliveryBoyDashboard />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Standalone Route - No Layout (Navbar/Sidebar) */}
              <Route path="/verify/:id" element={<ProductVerification />} />
            </Routes>
          </Router>
        </CartProvider>
      </BlockchainProvider>
    </AuthProvider>
  );
}

export default App;
