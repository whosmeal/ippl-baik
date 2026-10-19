import { BrowserRouter, Link, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import { CartProvider } from '../context/CartContext.jsx';
import { FavoritesProvider } from '../context/FavoritesContext.jsx';
import { Layout } from '../components/common/Layout.jsx';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import Cart from '../pages/buyer/Cart.jsx';
import Catalog from '../pages/buyer/Catalog.jsx';
import Checkout from '../pages/buyer/Checkout.jsx';
import Home from '../pages/buyer/Home.jsx';
import MyOrders from '../pages/buyer/MyOrders.jsx';
import Payment from '../pages/buyer/Payment.jsx';
import ProductDetail from '../pages/buyer/ProductDetail.jsx';
import ReviewPage from '../pages/buyer/ReviewPage.jsx';
import TrackOrder from '../pages/buyer/TrackOrder.jsx';
import TryOn from '../pages/buyer/TryOn.jsx';
import AdminDashboard from '../pages/admin/Dashboard.jsx';
import FinancialReport from '../pages/admin/FinancialReport.jsx';
import ManageUsers from '../pages/admin/ManageUsers.jsx';
import VerifyStore from '../pages/admin/VerifyStore.jsx';
import SellerAssets from '../pages/seller/Upload3DAsset.jsx';
import SellerBalance from '../pages/seller/Balance.jsx';
import SellerDashboard from '../pages/seller/Dashboard.jsx';
import SellerOrders from '../pages/seller/IncomingOrders.jsx';
import SellerProductForm from '../pages/seller/ProductForm.jsx';
import SellerProducts from '../pages/seller/MyProducts.jsx';
import { Account, About, Favorites } from '../pages/buyer/ExtraPages.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

function Guard({ roles, children }) {
  return <ProtectedRoute roles={roles}>{children}</ProtectedRoute>;
}

function NotFound() {
  return <section className="page-container"><div className="empty-panel"><span className="section-kicker">404 · HALAMAN TIDAK DITEMUKAN</span><h1>Sepertinya kamu tersesat.</h1><p>Halaman yang dicari tidak tersedia.</p><Link className="button button-dark" to="/">Kembali ke beranda</Link></div></section>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout><Outlet /></Layout>}>
        <Route index element={<Home />} />
        <Route path="produk" element={<Catalog />} />
        <Route path="produk/:productId" element={<ProductDetail />} />
        <Route path="favorit" element={<Favorites />} />
        <Route path="account" element={<Guard><Account /></Guard>} />
        <Route path="tentang" element={<About />} />
        <Route path="try-on/:productId?" element={<TryOn />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Guard roles={['pembeli']}><Checkout /></Guard>} />
        <Route path="payment/:orderId" element={<Guard roles={['pembeli']}><Payment /></Guard>} />
        <Route path="orders" element={<Guard roles={['pembeli']}><MyOrders /></Guard>} />
        <Route path="orders/:orderId" element={<Guard roles={['pembeli']}><TrackOrder /></Guard>} />
        <Route path="review/:orderId" element={<Guard roles={['pembeli']}><ReviewPage /></Guard>} />
        <Route path="seller" element={<Guard roles={['penjual']}><SellerDashboard /></Guard>} />
        <Route path="seller/products" element={<Guard roles={['penjual']}><SellerProducts /></Guard>} />
        <Route path="seller/products/new" element={<Guard roles={['penjual']}><SellerProductForm /></Guard>} />
        <Route path="seller/assets" element={<Guard roles={['penjual']}><SellerAssets /></Guard>} />
        <Route path="seller/orders" element={<Guard roles={['penjual']}><SellerOrders /></Guard>} />
        <Route path="seller/balance" element={<Guard roles={['penjual']}><SellerBalance /></Guard>} />
        <Route path="admin" element={<Guard roles={['admin']}><AdminDashboard /></Guard>} />
        <Route path="admin/stores" element={<Guard roles={['admin']}><VerifyStore /></Guard>} />
        <Route path="admin/users" element={<Guard roles={['admin']}><ManageUsers /></Guard>} />
        <Route path="admin/reports" element={<Guard roles={['admin']}><FinancialReport /></Guard>} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
    </Routes>
  );
}

export default function AppRouter() {
  return <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AuthProvider><CartProvider><FavoritesProvider><AppRoutes /></FavoritesProvider></CartProvider></AuthProvider></BrowserRouter>;
}