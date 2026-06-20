import fs from 'node:fs';
import path from 'node:path';

const storePath = path.resolve(process.cwd(), 'data/spring-store.json');
let cache = null;

export function getFallbackStore() {
  if (cache) return cache;
  if (!fs.existsSync(storePath)) return null;
  cache = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  return cache;
}

export function isDatabaseConnectionError(err) {
  return err?.name === 'PrismaClientInitializationError' || /Can't reach database server/i.test(err?.message || '');
}

export function listFallbackProducts(query = {}) {
  const store = getFallbackStore();
  if (!store) return null;
  let items = [...store.products];
  if (query.category) items = items.filter((item) => item.category?.slug === query.category);
  if (query.featured === 'true') items = items.filter((item) => item.featured);
  if (query.search) {
    const needle = String(query.search).toLowerCase();
    items = items.filter((item) => [item.name, item.shortDescription, item.description].some((value) => String(value || '').toLowerCase().includes(needle)));
  }
  if (query.sort === 'price_asc') items.sort((a, b) => Number(a.salePrice || a.regularPrice) - Number(b.salePrice || b.regularPrice));
  else if (query.sort === 'price_desc') items.sort((a, b) => Number(b.salePrice || b.regularPrice) - Number(a.salePrice || a.regularPrice));
  else if (query.sort !== 'oldest') items.sort((a, b) => b.id - a.id);
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 12), 1), 60);
  return { items: items.slice((page - 1) * limit, page * limit), total: items.length, page, limit };
}

export function getFallbackProduct(slug) {
  const store = getFallbackStore();
  if (!store) return null;
  return store.products.find((item) => item.slug === slug) || null;
}

export function listFallbackCategories() {
  return getFallbackStore()?.categories || null;
}

export function listFallbackPosts() {
  const posts = getFallbackStore()?.posts;
  if (!posts) return null;
  return [...posts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export function getFallbackContent(slug, type = null) {
  const store = getFallbackStore();
  if (!store) return null;
  const post = store.posts.find((item) => item.slug === slug && (!type || item.type === type));
  return post || null;
}
