import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products }) {
  if (!products?.length) return <div className="empty-state">Chưa có sản phẩm phù hợp.</div>;
  return <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}
