import { Link, NavLink, Outlet } from 'react-router-dom';
import { Facebook, Mail, MapPin, Phone, Search, ShoppingCart, User, Youtube } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

const nav = [
  ['/', 'Trang chủ'],
  ['/san-pham', 'Sản phẩm'],
  ['/gioi-thieu', 'Giới thiệu'],
  ['/tin-tuc', 'Tin tức'],
  ['/lien-he', 'Liên hệ'],
];

export default function AppLayout() {
  const { count } = useCart();
  return (
    <>
      <header className="topbar">
        <div className="container header-inner">
          <Link to="/" className="brand">
            <img src="/assets/dacsanvietLogowTnB.png" alt="Đặc Sản Việt" />
          </Link>
          <nav className="main-nav">
            {nav.map(([to, label]) => (
              <NavLink key={to} to={to}>{label}</NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <Search size={19} />
            <Link to="/gio-hang" className="cart-link"><ShoppingCart size={20} /><span>{count}</span></Link>
            <Link to="/admin"><User size={19} /></Link>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-column">
            <img className="footer-logo" src="/assets/dacsanvietLogowTnB.png" alt="Đặc Sản Việt" />
            <p><MapPin size={16} /> 01 Võ Văn Ngân, Phường Thủ Đức, TP Hồ Chí Minh</p>
            <p><Phone size={16} /> (028) 3896 8641</p>
            <p><Mail size={16} /> hcth@hcmute.edu.vn</p>
          </div>
          <div className="footer-column">
            <h4>Về chúng tôi</h4>
            <Link to="/">Trang chủ</Link>
            <Link to="/gioi-thieu">Giới thiệu</Link>
            <Link to="/san-pham">Sản phẩm</Link>
            <Link to="/tin-tuc">Tin tức</Link>
            <Link to="/lien-he">Liên hệ</Link>
          </div>
          <div className="footer-column">
            <h4>Chính sách</h4>
            <span>Chính sách bảo mật</span>
            <span>Chính sách vận chuyển</span>
            <span>Chính sách đổi trả</span>
            <span>Quy định sử dụng</span>
            <div className="footer-social">
              <a href="https://facebook.com/nhatthien.nguyen.566" target="_blank" rel="noreferrer" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://www.youtube.com/@tee.2105" target="_blank" rel="noreferrer" aria-label="Youtube">
                <Youtube size={22} />
              </a>
              <Link to="/lien-he" aria-label="Email">
                <Mail size={20} />
              </Link>
            </div>
          </div>
          <div className="footer-map">
            <iframe
              title="Bản đồ Trường Đại học Công nghệ Kỹ thuật TP.HCM"
              src="https://www.google.com/maps?q=Tr%C6%B0%E1%BB%9Dng%20%C4%90%E1%BA%A1i%20h%E1%BB%8Dc%20C%C3%B4ng%20ngh%E1%BB%87%20K%E1%BB%B9%20thu%E1%BA%ADt%20TP.HCM&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
        <div className="copyright">Copyright © 2026 Đặc Sản Việt - Kết nối hương vị quê hương đến mọi miền</div>
      </footer>
    </>
  );
}
