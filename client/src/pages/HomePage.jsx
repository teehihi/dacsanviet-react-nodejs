import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Headphones, ShieldCheck, Truck, Undo2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import ProductGrid from '../components/ProductGrid.jsx';

const slides = [
  ['Món ăn vặt quốc dân của giới trẻ', 'Chua, cay, mặn, ngọt hòa quyện trong từng sợi bánh tráng, ăn kèm xoài xanh, khô bò, trứng cút...', '/assets/Slider/3.png'],
  ['Top 10 món ngon từ Bắc đến Nam', 'Khám phá tinh hoa ẩm thực Việt trong từng miếng ăn.', '/assets/Slider/1.png'],
  ['Linh hồn ẩm thực miền sông nước', 'Đậm đà, dân dã và đặc trưng miền Tây.', '/assets/Slider/4.png'],
];

function SectionTitle({ title, subtitle, align = 'center' }) {
  return (
    <div className={`section-heading ${align === 'left' ? 'section-heading-left' : ''}`}>
      <span>{title}</span>
      {subtitle && <small>{subtitle}</small>}
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    api('/products?limit=18').then((data) => setProducts(data.items)).catch(() => setProducts([]));
    api('/posts').then(setPosts).catch(() => setPosts([]));
  }, []);

  const westernProducts = products.filter((item) => ['cac-loai-mam', 'cac-loai-kho', 'mien-tay'].includes(item.category?.slug));
  const featuredProducts = products.filter((item) => item.featured);
  const goToSlide = (direction) => setSlideIndex((current) => (current + direction + slides.length) % slides.length);

  return (
    <>
      <section className="hero">
        <button className="hero-arrow hero-arrow-left" onClick={() => goToSlide(-1)} aria-label="Slide trước">
          <ChevronLeft size={28} />
        </button>
        <div className="hero-track" style={{ transform: `translateX(-${slideIndex * 100}%)` }}>
          {slides.map(([title, text, image]) => (
            <article className="hero-slide" key={title} style={{ backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.48), rgba(0,0,0,.2)), url("${image}")` }}>
              <div className="container hero-content">
                <h1>{title}</h1>
                <p>{text}</p>
                <Link className="btn btn-light" to="/san-pham">Tìm hiểu ngay</Link>
              </div>
            </article>
          ))}
        </div>
        <button className="hero-arrow hero-arrow-right" onClick={() => goToSlide(1)} aria-label="Slide sau">
          <ChevronRight size={28} />
        </button>
        <div className="hero-dots">
          {slides.map((slide, index) => (
            <button key={slide[0]} className={index === slideIndex ? 'active' : ''} onClick={() => setSlideIndex(index)} aria-label={`Đến slide ${index + 1}`} />
          ))}
        </div>
      </section>

      <section className="service-strip container">
        <div><Truck /> <strong>Giao hàng miễn phí</strong><span>Miễn phí giao hàng nội thành cho đơn hàng từ 300.000đ</span></div>
        <div><Headphones /> <strong>Hỗ trợ 24/7</strong><span>Hotline hỗ trợ tất cả ngày trong tuần</span></div>
        <div><Undo2 /> <strong>7 ngày đổi trả</strong><span>Cam kết chất lượng, bao đổi trả trong vòng 7 ngày</span></div>
        <div><ShieldCheck /> <strong>Thanh toán an toàn</strong><span>Đảm bảo thanh toán an toàn với COD, QR</span></div>
      </section>

      <section className="container section compact-section">
        <SectionTitle title="SẢN PHẨM MỚI" subtitle="Hàng mới vừa về cửa hàng" />
        <ProductGrid products={products.slice(0, 6)} />
        <div className="center-action"><Link className="btn btn-primary" to="/san-pham">Xem tất cả</Link></div>
      </section>

      <section className="container section compact-section">
        <SectionTitle title="ĐẶC SẢN MIỀN TÂY" subtitle="Ngọt ngào tình sông nước, mang đậm bản sắc miền Tây." />
        <ProductGrid products={(westernProducts.length ? westernProducts : products).slice(0, 6)} />
        <div className="center-action"><Link className="btn btn-primary" to="/danh-muc/mien-tay">Xem tất cả</Link></div>
      </section>

      <section className="container section compact-section">
        <SectionTitle title="SẢN PHẨM NỔI BẬT" subtitle="Sản phẩm được nhiều khách hàng tin dùng" />
        <ProductGrid products={(featuredProducts.length ? featuredProducts : products).slice(0, 6)} />
      </section>

      <section className="container promo-panel">
        <img src="/assets/dacsanvietLogo.png" alt="Đặc Sản Việt" />
        <div className="promo-photo"><img src="/assets/uploads/2025/09/sellingpoint.jpg" alt="Tinh hoa đặc sản Việt" /></div>
        <div>
          <h2>Tinh hoa đặc sản Việt</h2>
          <p>Gửi trọn hương vị quê hương đến mọi nhà</p>
        </div>
      </section>

      <section className="container section news-contact">
        <div>
          <SectionTitle title="TIN TỨC" align="left" />
          <div className="news-list">
            {posts.slice(0, 3).map((post) => (
              <Link to={`/${post.slug}`} className="news-item" key={post.id}>
                <img src={post.imageUrl || '/assets/thumbKhaiTruong.png'} alt={post.title} />
                <div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <span>Tìm hiểu ngay »</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <aside className="contact-sidebar">
          <form>
            <h3>Liên hệ tư vấn mua hàng</h3>
            <input placeholder="Họ và tên của bạn..." />
            <input placeholder="Số điện thoại..." />
            <textarea placeholder="Nội dung cần tư vấn..." />
            <button className="btn btn-primary" type="button">Gửi yêu cầu</button>
          </form>
          <div className="social-box">Fanpage / video giới thiệu</div>
        </aside>
      </section>
    </>
  );
}
