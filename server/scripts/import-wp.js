import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import slugify from 'slugify';
import { prisma } from '../src/db.js';
import { extractWpressFile } from './extract-wpress.js';
import { fallbackCategories, fallbackPages, fallbackProducts } from './fallback-data.js';

const htdocsPath = path.resolve(process.cwd(), process.env.WP_HTDOCS_PATH || '../../htdocs');
const archivePath = path.resolve(process.cwd(), process.env.WPRESS_PATH || '../../DacSanViet_resource/www-dacsanviet-site-20251103-100939-hwzemsbn157g.wpress');
const sqlPath = path.resolve(process.cwd(), 'tmp/wp/database.sql');
const clientAssets = path.resolve(process.cwd(), '../client/public/assets');
const tablePrefixes = ['dacsanviet8m_', 'SERVMASK_PREFIX_'];
const wpColumns = {
  posts: ['ID', 'post_author', 'post_date', 'post_date_gmt', 'post_content', 'post_title', 'post_excerpt', 'post_status', 'comment_status', 'ping_status', 'post_password', 'post_name', 'to_ping', 'pinged', 'post_modified', 'post_modified_gmt', 'post_content_filtered', 'post_parent', 'guid', 'menu_order', 'post_type', 'post_mime_type', 'comment_count'],
  postmeta: ['meta_id', 'post_id', 'meta_key', 'meta_value'],
  terms: ['term_id', 'name', 'slug', 'term_group'],
  term_taxonomy: ['term_taxonomy_id', 'term_id', 'taxonomy', 'description', 'parent', 'count'],
  term_relationships: ['object_id', 'term_taxonomy_id', 'term_order'],
};

function stripHtml(html = '') {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeAsset(urlOrPath) {
  if (!urlOrPath) return '/assets/dacsanvietLogo.png';
  const value = String(urlOrPath);
  const marker = 'wp-content/uploads/';
  if (value.includes(marker)) return `/assets/uploads/${value.split(marker)[1]}`;
  if (value.startsWith('/assets/')) return value;
  return value;
}

function splitTuples(values) {
  const tuples = [];
  let current = '';
  let depth = 0;
  let quote = false;
  let escaped = false;
  for (const ch of values) {
    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      current += ch;
      escaped = true;
      continue;
    }
    if (depth === 0 && !quote && ch !== '(') continue;
    if (ch === "'") quote = !quote;
    if (!quote && ch === '(') {
      depth += 1;
      if (depth === 1) continue;
    }
    if (!quote && ch === ')') {
      depth -= 1;
      if (depth === 0) {
        tuples.push(current);
        current = '';
        continue;
      }
    }
    if (depth > 0) {
      current += ch;
    }
  }
  return tuples;
}

function splitStatements(sql, tableName) {
  const statements = [];
  const marker = `INSERT INTO \`${tableName}\``;
  let start = sql.indexOf(marker);
  while (start !== -1) {
    let quote = false;
    let escaped = false;
    for (let i = start; i < sql.length; i += 1) {
      const ch = sql[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === "'") quote = !quote;
      if (!quote && ch === ';') {
        statements.push(sql.slice(start, i + 1));
        start = sql.indexOf(marker, i + 1);
        break;
      }
    }
    if (statements.length && sql.indexOf(marker, statements[statements.length - 1].length + start) === -1) break;
    if (start === -1) break;
  }
  return statements;
}

function getInsertParts(statement, tableName) {
  const prefix = `INSERT INTO \`${tableName}\``;
  let rest = statement.slice(prefix.length).trim();
  let columns = null;
  if (rest.startsWith('(')) {
    const end = rest.indexOf(')');
    columns = rest.slice(1, end).split(',').map((col) => col.replace(/`/g, '').trim());
    rest = rest.slice(end + 1).trim();
  }
  if (!rest.startsWith('VALUES')) return null;
  return { columns, values: rest.slice('VALUES'.length).replace(/;$/, '').trim() };
}
function splitFields(tuple) {
  const fields = [];
  let current = '';
  let quote = false;
  let escaped = false;
  for (const ch of tuple) {
    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      current += ch;
      escaped = true;
      continue;
    }
    if (ch === "'") quote = !quote;
    if (!quote && ch === ',') {
      fields.push(cleanSqlValue(current));
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(cleanSqlValue(current));
  return fields;
}

function cleanSqlValue(value) {
  const trimmed = value.trim();
  if (trimmed.toUpperCase() === 'NULL') return null;
  if (!trimmed.startsWith("'")) return trimmed;
  return trimmed
    .slice(1, -1)
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r');
}

function parseTable(sql, tableName, fallbackColumns = null) {
  const rows = [];
  for (const statement of splitStatements(sql, tableName)) {
    const parts = getInsertParts(statement, tableName);
    if (!parts) continue;
    const columns = parts.columns || fallbackColumns;
    if (!columns) continue;
    for (const tuple of splitTuples(parts.values)) {
      const values = splitFields(tuple);
      rows.push(Object.fromEntries(columns.map((col, index) => [col, values[index]])));
    }
  }
  return rows;
}

function parseWpTable(sql, name) {
  for (const candidatePrefix of tablePrefixes) {
    const rows = parseTable(sql, `${candidatePrefix}${name}`, wpColumns[name]);
    if (rows.length) return rows;
  }
  return [];
}

async function copyAssets() {
  fs.mkdirSync(clientAssets, { recursive: true });
  const resourcePath = path.resolve(process.cwd(), '../../DacSanViet_resource');
  if (fs.existsSync(resourcePath)) {
    for (const entry of fs.readdirSync(resourcePath)) {
      if (entry.endsWith('.wpress') || entry === '.DS_Store') continue;
      fs.cpSync(path.join(resourcePath, entry), path.join(clientAssets, entry), { recursive: true, force: true });
    }
  }
  const uploads = path.join(htdocsPath, 'wp-content/uploads/2025');
  if (fs.existsSync(uploads)) {
    fs.cpSync(uploads, path.join(clientAssets, 'uploads/2025'), { recursive: true, force: true });
  }
}

async function seedFallback() {
  const categoryBySlug = new Map();
  for (const item of fallbackCategories.filter((cat) => !cat.parentSlug)) {
    const saved = await prisma.category.upsert({ where: { slug: item.slug }, update: item, create: item });
    categoryBySlug.set(saved.slug, saved);
  }
  for (const item of fallbackCategories.filter((cat) => cat.parentSlug)) {
    const parent = categoryBySlug.get(item.parentSlug);
    const saved = await prisma.category.upsert({
      where: { slug: item.slug },
      update: { name: item.name, parentId: parent?.id },
      create: { name: item.name, slug: item.slug, parentId: parent?.id },
    });
    categoryBySlug.set(saved.slug, saved);
  }
  for (const item of fallbackProducts) {
    const category = categoryBySlug.get(item.categorySlug);
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        categoryId: category?.id,
        regularPrice: item.regularPrice,
        salePrice: item.salePrice,
        featured: item.featured || false,
        shortDescription: 'Sản phẩm đặc sản Việt được tuyển chọn kỹ lưỡng, giao nhanh toàn quốc.',
      },
      create: {
        name: item.name,
        slug: item.slug,
        categoryId: category?.id,
        regularPrice: item.regularPrice,
        salePrice: item.salePrice,
        featured: item.featured || false,
        shortDescription: 'Sản phẩm đặc sản Việt được tuyển chọn kỹ lưỡng, giao nhanh toàn quốc.',
        description: '<p>Đặc sản chất lượng, phù hợp làm quà biếu hoặc dùng trong bữa ăn gia đình.</p>',
        images: { create: [{ url: item.image, alt: item.name, sortOrder: 0 }] },
        variants: { create: item.variants || [] },
      },
      include: { images: true },
    });
    if (!product.images.length) {
      await prisma.productImage.create({ data: { productId: product.id, url: item.image, alt: item.name } });
    }
  }
  for (const page of fallbackPages) {
    await prisma.contentPage.upsert({ where: { slug: page.slug }, update: page, create: page });
  }
}

async function importFromSql(sql) {
  const posts = parseWpTable(sql, 'posts');
  const postmeta = parseWpTable(sql, 'postmeta');
  const terms = parseWpTable(sql, 'terms');
  const termTaxonomy = parseWpTable(sql, 'term_taxonomy');
  const relationships = parseWpTable(sql, 'term_relationships');
  if (!posts.length) return false;
  console.log(`Parsed WP dump: ${posts.length} posts, ${postmeta.length} postmeta, ${terms.length} terms, ${termTaxonomy.length} taxonomies.`);

  const metaByPost = new Map();
  for (const meta of postmeta) {
    if (!metaByPost.has(meta.post_id)) metaByPost.set(meta.post_id, {});
    metaByPost.get(meta.post_id)[meta.meta_key] = meta.meta_value;
  }
  const attachments = new Map(posts.filter((post) => post.post_type === 'attachment').map((post) => [post.ID, post]));
  const termById = new Map(terms.map((term) => [term.term_id, term]));
  const taxById = new Map(termTaxonomy.map((tax) => [tax.term_taxonomy_id, tax]));

  const categoryByTermTax = new Map();
  for (const tax of termTaxonomy.filter((item) => item.taxonomy === 'product_cat')) {
    const term = termById.get(tax.term_id);
    if (!term) continue;
    const saved = await prisma.category.upsert({
      where: { slug: term.slug },
      update: { name: term.name, description: tax.description || null },
      create: { name: term.name, slug: term.slug, description: tax.description || null },
    });
    categoryByTermTax.set(tax.term_taxonomy_id, saved);
  }

  let imported = 0;
  const productPosts = posts.filter((item) => item.post_type === 'product' && item.post_status !== 'trash');
  console.log(`Found ${productPosts.length} WooCommerce products.`);
  for (const post of productPosts) {
    const meta = metaByPost.get(post.ID) || {};
    const rel = relationships.find((item) => item.object_id === post.ID && categoryByTermTax.has(item.term_taxonomy_id));
    const category = rel ? categoryByTermTax.get(rel.term_taxonomy_id) : null;
    const thumbnail = attachments.get(meta._thumbnail_id);
    const galleryIds = String(meta._product_image_gallery || '').split(',').filter(Boolean);
    const images = [thumbnail, ...galleryIds.map((id) => attachments.get(id))]
      .filter(Boolean)
      .map((attachment, index) => ({ url: normalizeAsset(attachment.guid), alt: post.post_title, sortOrder: index }));

    const product = await prisma.product.upsert({
      where: { slug: post.post_name || slugify(post.post_title, { lower: true, strict: true, locale: 'vi' }) },
      update: {
        wpId: Number(post.ID),
        name: post.post_title,
        shortDescription: post.post_excerpt || stripHtml(post.post_content).slice(0, 220),
        description: post.post_content,
        sku: meta._sku || null,
        regularPrice: Number(meta._regular_price || meta._price || 0),
        salePrice: meta._sale_price ? Number(meta._sale_price) : null,
        stockQuantity: Number(meta._stock || 0),
        categoryId: category?.id,
      },
      create: {
        wpId: Number(post.ID),
        name: post.post_title,
        slug: post.post_name || slugify(post.post_title, { lower: true, strict: true, locale: 'vi' }),
        shortDescription: post.post_excerpt || stripHtml(post.post_content).slice(0, 220),
        description: post.post_content,
        sku: meta._sku || null,
        regularPrice: Number(meta._regular_price || meta._price || 0),
        salePrice: meta._sale_price ? Number(meta._sale_price) : null,
        stockQuantity: Number(meta._stock || 0),
        categoryId: category?.id,
      },
    });
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    if (images.length) await prisma.productImage.createMany({ data: images.map((image) => ({ ...image, productId: product.id })) });
    imported += 1;
  }
  console.log(`Imported ${imported} products.`);

  for (const post of posts.filter((item) => ['page', 'post'].includes(item.post_type) && item.post_status === 'publish')) {
    const meta = metaByPost.get(post.ID) || {};
    const image = attachments.get(meta._thumbnail_id);
    await prisma.contentPage.upsert({
      where: { slug: post.post_name || slugify(post.post_title, { lower: true, strict: true, locale: 'vi' }) },
      update: {
        type: post.post_type,
        title: post.post_title,
        excerpt: post.post_excerpt || stripHtml(post.post_content).slice(0, 180),
        body: post.post_content,
        imageUrl: normalizeAsset(image?.guid),
      },
      create: {
        type: post.post_type,
        title: post.post_title,
        slug: post.post_name || slugify(post.post_title, { lower: true, strict: true, locale: 'vi' }),
        excerpt: post.post_excerpt || stripHtml(post.post_content).slice(0, 180),
        body: post.post_content,
        imageUrl: normalizeAsset(image?.guid),
      },
    });
  }
  return imported > 0;
}

async function main() {
  await copyAssets();
  if (!fs.existsSync(sqlPath) && fs.existsSync(archivePath)) {
    console.log('Extracting database.sql from .wpress...');
    extractWpressFile(archivePath, 'database.sql', sqlPath);
  }
  let imported = false;
  if (fs.existsSync(sqlPath)) {
    console.log(`Importing WooCommerce data from ${sqlPath}`);
    imported = await importFromSql(fs.readFileSync(sqlPath, 'utf8'));
  }
  if (!imported) {
    console.log('WooCommerce SQL not available or empty, using fallback storefront data.');
    await seedFallback();
  }
  console.log('Import complete.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
