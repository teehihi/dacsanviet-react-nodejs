import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem('dsv_admin_token');
  if (!token) {
    navigate('/admin/login');
    return null;
  }
  return (
    <div className="admin-shell">
      <aside>
        <img src="/assets/dacsanvietLogowTnB.png" alt="Đặc Sản Việt" />
        <NavLink to="/admin">Tổng quan</NavLink>
        <NavLink to="/admin/products">Sản phẩm</NavLink>
        <NavLink to="/admin/orders">Đơn hàng</NavLink>
        <button onClick={() => { localStorage.removeItem('dsv_admin_token'); navigate('/admin/login'); }}>Đăng xuất</button>
      </aside>
      <main><Outlet /></main>
    </div>
  );
}
