import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

const fixedImages = [
  '/assets/uploads/2025/09/cuhudua-768x768.png',
  '/assets/uploads/2025/09/thumbKhaiTruong-768x768.png',
  '/assets/uploads/2025/09/5.10.14.jpg',
  '/assets/uploads/2025/09/mn-1-1024x629.jpg',
  '/assets/uploads/2025/09/mb-1-1320x880.jpg',
];

const preferredImageMap = {
  '/assets/uploads/2025/09/cuhudua.png': '/assets/uploads/2025/09/cuhudua-768x768.png',
  '/assets/uploads/2025/09/cuhudua-300x300.png': '/assets/uploads/2025/09/cuhudua-768x768.png',
  '/assets/thumbKhaiTruong.png': '/assets/uploads/2025/09/thumbKhaiTruong-768x768.png',
  '/assets/uploads/2025/09/thumbKhaiTruong.png': '/assets/uploads/2025/09/thumbKhaiTruong-768x768.png',
  '/assets/uploads/2025/09/5.10.14-300x200.jpg': '/assets/uploads/2025/09/5.10.14.jpg',
};

function readableImage(src, index = 0) {
  if (!src) return fixedImages[index % fixedImages.length];
  if (preferredImageMap[src]) return preferredImageMap[src];

  const size = src.match(/-(\d+)x(\d+)(?=\.(jpg|jpeg|png|webp)$)/i);
  if (size && Math.max(Number(size[1]), Number(size[2])) < 700) {
    return src.replace(/-\d+x\d+(?=\.(jpg|jpeg|png|webp)$)/i, '');
  }

  return src;
}

function normalizePost(post, index) {
  return {
    id: post.id || post.slug || index,
    slug: post.slug || fallbackNews[index % fallbackNews.length].slug,
    title: post.title || fallbackNews[index % fallbackNews.length].title,
    excerpt: post.excerpt || fallbackNews[index % fallbackNews.length].excerpt,
    imageUrl: readableImage(post.imageUrl, index),
    category: index === 1 ? 'Khuyến mãi' : 'Góc ẩm thực',
    date: '28 Tháng 9, 2025',
  };
}

export default function NewsPage() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  const listingRef = useRef(null);

  useEffect(() => {
    api('/posts').then(setPosts).catch(() => setPosts([]));
  }, []);

  const news = useMemo(() => {
    const source = posts.length ? posts : fallbackNews;
    return source.map(normalizePost);
  }, [posts]);

  const latest = news.slice(0, 3);
  const foodPosts = news.slice(0, 2);

  // Pagination calculations
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = news.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(news.length / postsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setTimeout(() => {
      listingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <section className="wp-news-page">
      <div className="wp-breadcrumb container">Trang chủ / Tin tức</div>

      <section
        className="wp-news-hero"
        style={{ backgroundImage: "linear-gradient(rgba(0,0,0,.26), rgba(0,0,0,.26)), url('/assets/uploads/2025/09/news-hero-coconut-crop.png')" }}
      >
        <div className="wp-news-hero-content">
          <h1>TIN TỨC & SỰ KIỆN</h1>
          <p>Những câu chuyện ý nghĩa đằng sau các loại đặc sản, mẹo sử dụng và tin tức khuyến mãi hằng tuần.</p>
        </div>
      </section>

      <section className="container wp-news-section">
        <div className="wp-news-heading"><span>TIN MỚI NHẤT</span></div>
        <div className="wp-news-grid">
          {latest.map((post, index) => (
            <NewsCard key={post.id} post={post} image={fixedImages[index]} />
          ))}
        </div>
      </section>

      <section className="container wp-news-section">
        <div className="wp-news-heading"><span>GÓC ẨM THỰC</span></div>
        <div className="wp-feature-news">
          <NewsCard post={foodPosts[0] || fallbackNews[0]} image="/assets/uploads/2025/09/cuhudua-768x768.png" featured />
          <article className="wp-news-side-copy">
            <span>Bí quyết chọn quà</span>
            <h2>Đặc sản quê nhà, chọn sao cho đúng vị?</h2>
            <p>
              Cùng Đặc Sản Việt khám phá cách chọn mắm, khô cá, nem chua và các món quà quê
              phù hợp cho từng dịp: biếu tặng, dùng trong bữa cơm gia đình hoặc chuẩn bị cho chuyến đi xa.
            </p>
            <Link to="/san-pham" className="btn btn-primary">Xem sản phẩm</Link>
          </article>
        </div>
      </section>

      <section
        className="wp-news-cta"
        style={{ '--cta-bg': "url('/assets/uploads/2025/09/news-cta-vinhomes.jpg')" }}
      >
        <div>
          <h2>ƯU ĐÃI ĐỘC QUYỀN: KHÁM PHÁ CỬA HÀNG CỦA CHÚNG TÔI!</h2>
          <p>Tìm kiếm nguyên liệu, đặc sản địa phương hoặc món quà làm bếp chất lượng? Mua sắm ngay để nhận mã giảm giá đặc biệt.</p>
          <Link to="/san-pham" className="btn btn-light">Mua sắm ngay!</Link>
        </div>
      </section>

      <section className="container wp-news-section" ref={listingRef}>
        <div className="wp-news-heading"><span>TẤT CẢ BÀI VIẾT</span></div>
        <div className="wp-news-listing">
          {currentPosts.map((post, index) => (
            <Link to={`/${post.slug}`} className="wp-news-row" key={`${post.slug}-${index}`}>
              <img src={post.imageUrl} alt={post.title} />
              <div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <strong>Tìm hiểu thêm »</strong>
              </div>
            </Link>
          ))}
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '36px' }}>
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="admin-secondary"
              style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer', padding: '8px 16px', fontSize: '14px', borderRadius: '6px' }}
            >
              « Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={currentPage === pageNumber ? 'admin-primary' : 'admin-secondary'}
                style={{ cursor: 'pointer', padding: '8px 16px', fontSize: '14px', borderRadius: '6px', fontWeight: currentPage === pageNumber ? 'bold' : 'normal' }}
              >
                {pageNumber}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="admin-secondary"
              style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', padding: '8px 16px', fontSize: '14px', borderRadius: '6px' }}
            >
              Sau »
            </button>
          </div>
        )}
      </section>
    </section>
  );
}

function NewsCard({ post, image, featured = false }) {
  const card = normalizePost(post, 0);

  return (
    <Link to={`/${card.slug}`} className={featured ? 'wp-news-card wp-news-card-featured' : 'wp-news-card'}>
      <div className="wp-news-image">
        <img src={image || card.imageUrl} alt={card.title} />
        <span>{card.category}</span>
      </div>
      <div className="wp-news-body">
        <h2>{card.title}</h2>
        <p>{card.excerpt}</p>
        <strong>Tìm hiểu ngay »</strong>
      </div>
      <div className="wp-news-meta">{card.date} · Không có bình luận</div>
    </Link>
  );
}

const fallbackNews = [
  {
    slug: 'cu-hu-dua-ben-tre-tinh-hoa-giua-long-xu-dua',
    title: 'Củ Hủ Dừa Bến Tre - “Tinh hoa” giữa lòng xứ dừa',
    excerpt: 'Khi nhắc đến Bến Tre, người ta thường nghĩ ngay đến những rặng dừa xanh bạt ngàn, những con kênh mát lành.',
    imageUrl: '/assets/uploads/2025/09/cuhudua-768x768.png',
  },
  {
    slug: 'khai-truong-tung-bung-ngap-tran-uu-dai',
    title: 'Khai trương tưng bừng - ngập tràn ưu đãi',
    excerpt: 'Đặc Sản Việt kết nối hương vị quê hương đến mọi miền với nhiều ưu đãi hấp dẫn trong tuần khai trương.',
    imageUrl: '/assets/uploads/2025/09/thumbKhaiTruong-768x768.png',
  },
  {
    slug: 'chao-tat-ca-moi-nguoi',
    title: 'Chào tất cả mọi người!',
    excerpt: 'Cảm ơn vì đã sử dụng WordPress. Đây là bài viết đầu tiên của bạn. Sửa hoặc xoá nó, và bắt đầu viết.',
    imageUrl: '/assets/uploads/2025/09/5.10.14.jpg',
  },
];
