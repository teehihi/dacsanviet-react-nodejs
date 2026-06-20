import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Headphones, RefreshCcw, ShieldCheck, Truck } from 'lucide-react';
import { api, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import ProductCard from '../components/ProductCard.jsx';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [variantId, setVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    setProduct(null);
    setVariantId('');
    setActiveImage('');
    api(`/products/${slug}`).then((data) => {
      setProduct(data);
      setActiveImage(data.images?.[0]?.url || '/assets/dacsanvietLogo.png');
    });
  }, [slug]);

  if (!product) return <section className="container page"><div className="empty-state">Đang tải sản phẩm...</div></section>;
  const variant = product.variants?.find((item) => item.id === Number(variantId));
  const price = variant?.salePrice || variant?.regularPrice || product.salePrice || product.regularPrice;
  const gallery = product.images?.length ? product.images : [{ url: '/assets/dacsanvietLogo.png', alt: product.name }];
  const attributeRows = buildAttributeRows(product, variant);
  const relatedProducts = product.relatedProducts || [];

  return (
    <section className="container page product-detail-page">
      <div className="product-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        {product.category && <Link to={`/danh-muc/${product.category.slug}`}>{product.category.name}</Link>}
        <span>/</span>
        <strong>{product.name}</strong>
      </div>

      <div className="product-detail">
        <div className="detail-gallery">
          <div className="detail-main-image">
            {product.salePrice && <span className="sale-badge">Giảm giá!</span>}
            <img src={activeImage} alt={product.name} />
          </div>
          <div className="detail-thumbs">
            {gallery.map((image, index) => (
              <button
                className={activeImage === image.url ? 'active' : ''}
                key={`${image.url}-${index}`}
                onClick={() => setActiveImage(image.url)}
                type="button"
              >
                <img src={image.url} alt={image.alt || product.name} />
              </button>
            ))}
          </div>
        </div>

        <div className="detail-info">
          <h1>{product.name}</h1>
          <div className="detail-meta">
            {product.sku && <span>SKU {product.sku}</span>}
            {product.category && <span>Categories <Link to={`/danh-muc/${product.category.slug}`}>{product.category.name}</Link></span>}
          </div>
          <div className="detail-price">{formatPriceRange(product, variant ? price : null)}</div>
          <div className="detail-short" dangerouslySetInnerHTML={{ __html: product.shortDescription || product.description || '' }} />
          {product.variants?.length > 0 && (
            <label className="variant-picker">
              <span>Loại</span>
              <select value={variantId} onChange={(e) => setVariantId(e.target.value)}>
                <option value="">Chọn một tùy chọn</option>
                {product.variants.map((item) => <option key={item.id} value={item.id}>{item.name} - {money(item.salePrice || item.regularPrice)}</option>)}
              </select>
            </label>
          )}
          <div className="purchase-row">
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            <button className="btn btn-primary" onClick={() => addItem(product, variant, quantity)}>Thêm vào giỏ hàng</button>
          </div>
        </div>
      </div>

      <div className="detail-tabs">
        <span>Mô tả</span>
        <span>Thông tin bổ sung</span>
        <span>Đánh giá (0)</span>
      </div>
      <div className="detail-description">
        <div dangerouslySetInnerHTML={{ __html: product.description || product.shortDescription || 'Sản phẩm đặc sản Việt chất lượng tuyển chọn.' }} />
        {attributeRows.length > 0 && (
          <table>
            <tbody>
              {attributeRows.map((row) => (
                <tr key={row.label}>
                  <th>{row.label}</th>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {relatedProducts.length > 0 && (
        <section className="detail-section">
          <h2>Sản phẩm liên quan</h2>
          <div className="related-grid">
            {relatedProducts.map((item) => <ProductCard product={item} key={item.id} />)}
          </div>
        </section>
      )}

      <section className="detail-section faq-grid">
        <h2>Câu hỏi thường gặp</h2>
        {faqs.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </section>

      <section className="customer-reviews">
        <h2>Đánh giá của khách hàng</h2>
        <div>
          {reviews.map((item) => (
            <article key={item.name}>
              <p>{item.text}</p>
              <strong>{item.name}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="why-dsv">
        <h2>Tại sao nên chọn DacSanViet?</h2>
        <div>
          <article><Truck /><strong>Giao hàng miễn phí</strong><span>Miễn phí giao hàng nội thành cho đơn hàng từ 300.000đ</span></article>
          <article><Headphones /><strong>Hỗ trợ 24/7</strong><span>Hotline hỗ trợ tất cả ngày trong tuần</span></article>
          <article><RefreshCcw /><strong>7 ngày đổi trả</strong><span>Cam kết đổi trả trong vòng 7 ngày</span></article>
          <article><ShieldCheck /><strong>Thanh toán an toàn</strong><span>Đảm bảo bảo mật khi thanh toán</span></article>
        </div>
      </section>
    </section>
  );
}

function formatPriceRange(product, selectedPrice) {
  if (product.variants?.length > 1 && !selectedPrice) {
    const prices = product.variants
      .map((item) => Number(item.salePrice || item.regularPrice || 0))
      .filter(Boolean);
    if (prices.length) return `${money(Math.min(...prices))} - ${money(Math.max(...prices))}`;
  }
  return money(selectedPrice || product.salePrice || product.regularPrice);
}

function buildAttributeRows(product, variant) {
  const rows = [];
  const attributes = variant?.attributes || product.variants?.find((item) => item.attributes)?.attributes || {};
  if (product.sku) rows.push({ label: 'SKU', value: product.sku });
  for (const [label, value] of Object.entries(attributes)) {
    if (!value) continue;
    rows.push({ label: label.replace(/^pa_/, '').replace(/_/g, ' '), value: Array.isArray(value) ? value.join(', ') : String(value) });
  }
  return rows;
}

const faqs = [
  { question: 'Sản phẩm của shop có đảm bảo an toàn vệ sinh thực phẩm không?', answer: 'Sản phẩm được tuyển chọn từ nhà cung cấp uy tín, đóng gói sạch sẽ trước khi giao đến khách hàng.' },
  { question: 'Shop có giao hàng toàn quốc không?', answer: 'Shop hỗ trợ giao hàng toàn quốc, phí vận chuyển được báo rõ khi đặt hàng.' },
  { question: 'Tôi có được kiểm tra hàng trước khi nhận không?', answer: 'Khách hàng có thể kiểm tra tình trạng đóng gói và liên hệ shop nếu cần hỗ trợ đổi trả.' },
  { question: 'Chính sách đổi trả sản phẩm như thế nào?', answer: 'Sản phẩm lỗi, hư hỏng do vận chuyển hoặc không đúng đơn sẽ được hỗ trợ đổi trả theo chính sách của shop.' },
];

const reviews = [
  { name: 'Nguyễn Ngọc Tuấn', text: 'Sản phẩm rất ngon và chất lượng. Tôi đã mua đặc sản cá khô và mắm, đóng gói sạch sẽ, giao hàng nhanh.' },
  { name: 'Trần Văn Hoàng', text: 'Dịch vụ khách hàng tận tình, sản phẩm tư vấn đúng nhu cầu. Giao hàng cũng cực kỳ nhanh.' },
  { name: 'Lê Kim Nghĩa', text: 'Trải nghiệm mua sắm dễ chịu, website dễ dùng và sản phẩm đa dạng.' },
];
