import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import ProductGrid from '../components/ProductGrid.jsx';

export default function ProductsPage() {
  const { category } = useParams();
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const search = params.get('search') || '';
  const sort = params.get('sort') || 'newest';

  const query = useMemo(() => {
    const q = new URLSearchParams({ limit: '48', sort });
    if (category) q.set('category', category);
    if (search) q.set('search', search);
    return q.toString();
  }, [category, search, sort]);

  useEffect(() => {
    setLoading(true);
    api(`/products?${query}`).then((data) => setProducts(data.items)).finally(() => setLoading(false));
    api('/categories').then(setCategories).catch(() => setCategories([]));
  }, [query]);

  function update(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  return (
    <section className="container page">
      <div className="shop-header">
        <div>
          <span>Sản phẩm</span>
          <h1>{categories.find((item) => item.slug === category)?.name || 'Tất cả đặc sản'}</h1>
        </div>
        <div className="filters">
          <input value={search} placeholder="Tìm sản phẩm..." onChange={(e) => update('search', e.target.value)} />
          <select value={sort} onChange={(e) => update('sort', e.target.value)}>
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>
        </div>
      </div>
      {loading ? <div className="empty-state">Đang tải sản phẩm...</div> : <ProductGrid products={products} />}
    </section>
  );
}
