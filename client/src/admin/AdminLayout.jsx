import {
  BarChart3,
  Folder,
  Home,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  Users,
} from 'lucide-react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/admin', label: 'Tổng Quan', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Đơn Hàng', icon: ShoppingBag },
  { to: '/admin/products', label: 'Sản Phẩm', icon: Package },
  { to: '/admin/categories', label: 'Danh Mục', icon: Folder },
  { to: '/admin/customers', label: 'Khách Hàng', icon: Users },
  { to: '/admin/promotions', label: 'Khuyến Mãi', icon: Tags },
  { to: '/admin/news', label: 'Tin Tức', icon: Newspaper },
  { to: '/admin/reports', label: 'Thống Kê', icon: BarChart3 },
  { to: '/admin/settings', label: 'Cài Đặt', icon: Settings },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem('dsv_admin_token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/assets/dacsanvietLogowTnB.png" alt="Đặc Sản Việt" />
          <span>Trang Quản Trị</span>
        </div>
        <nav className="admin-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end}>
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="admin-sidebar-bottom">
          <NavLink to="/">
            <Home size={20} />
            <span>Về Cửa Hàng</span>
          </NavLink>
          <button onClick={() => { localStorage.removeItem('dsv_admin_token'); navigate('/admin/login'); }}>
            <LogOut size={20} />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </aside>
      <main className="admin-main"><Outlet /></main>
    </div>
  );
}
