import { Link } from 'react-router-dom';
import { money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const hasVariants = product.variants?.length > 0;
  const price = product.salePrice || product.regularPrice;
  return (
    <article className="product-card">
      <Link to={`/san-pham/${product.slug}`} className="product-image-wrap">
        {product.salePrice && <span className="sale-badge">Giảm giá!</span>}
        <img src={product.images?.[0]?.url || '/assets/dacsanvietLogo.png'} alt={product.name} />
      </Link>
      <div className="product-meta">{product.category?.name || 'Đặc sản Việt'}</div>
      <Link to={`/san-pham/${product.slug}`} className="product-title">{product.name}</Link>
      <div className="price">
        {product.salePrice && <del>{money(product.regularPrice)}</del>}
        <strong>{money(price)}</strong>
      </div>
      {hasVariants ? (
        <Link className="btn btn-outline" to={`/san-pham/${product.slug}`}>Chọn</Link>
      ) : (
        <button className="btn btn-primary" onClick={() => addItem(product, null, 1)}>Thêm vào giỏ hàng</button>
      )}
    </article>
  );
}
