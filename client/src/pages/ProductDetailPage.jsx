import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [variantId, setVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    api(`/products/${slug}`).then(setProduct);
  }, [slug]);

  if (!product) return <section className="container page"><div className="empty-state">Đang tải sản phẩm...</div></section>;
  const variant = product.variants?.find((item) => item.id === Number(variantId));
  const price = variant?.salePrice || variant?.regularPrice || product.salePrice || product.regularPrice;

  return (
    <section className="container page product-detail">
      <div className="detail-gallery">
        <img src={product.images?.[0]?.url || '/assets/dacsanvietLogo.png'} alt={product.name} />
      </div>
      <div className="detail-info">
        <Link to={`/danh-muc/${product.category?.slug}`}>{product.category?.name}</Link>
        <h1>{product.name}</h1>
        <div className="detail-price">{money(price)}</div>
        <div dangerouslySetInnerHTML={{ __html: product.shortDescription || product.description || '' }} />
        {product.variants?.length > 0 && (
          <select value={variantId} onChange={(e) => setVariantId(e.target.value)}>
            <option value="">Chọn phân loại</option>
            {product.variants.map((item) => <option key={item.id} value={item.id}>{item.name} - {money(item.salePrice || item.regularPrice)}</option>)}
          </select>
        )}
        <div className="purchase-row">
          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          <button className="btn btn-primary" onClick={() => addItem(product, variant, quantity)}>Thêm vào giỏ hàng</button>
        </div>
      </div>
      <div className="detail-description">
        <h2>Mô tả sản phẩm</h2>
        <div dangerouslySetInnerHTML={{ __html: product.description || product.shortDescription || 'Sản phẩm đặc sản Việt chất lượng tuyển chọn.' }} />
      </div>
    </section>
  );
}
