import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import slugify from 'slugify';
import { prisma } from '../src/db.js';

const springRoot = path.resolve(process.env.SPRING_PROJECT_PATH || '/Users/tee/UTE/WebCode/CodeMac/DacSanViet');
const sqlPath = path.resolve(process.env.SPRING_SQL_PATH || '/Users/tee/Desktop/DacSanViet.sql');
const clientAssets = path.resolve(process.cwd(), '../client/public/assets');
const fallbackStorePath = path.resolve(process.cwd(), 'data/spring-store.json');
const springAssetPrefix = '/assets/spring';
const dryRun = process.argv.includes('--dry-run');
const exportJson = process.argv.includes('--export-json');

function stripHtml(html = '') {
  return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBool(value) {
  return value === true || value === 1 || value === '1' || value === '\u0001';
}

function uniqueSlug(value, id) {
  const base = slugify(value || `item-${id}`, { lower: true, strict: true, locale: 'vi' });
  return base || `item-${id}`;
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
    if (depth > 0) current += ch;
  }
  return tuples;
}

function cleanSqlValue(value) {
  const trimmed = value.trim();
  if (trimmed.toUpperCase() === 'NULL') return null;
  if (trimmed.startsWith("_binary '")) {
    const inner = trimmed.slice(9, -1);
    return inner.includes('\u0001');
  }
  if (!trimmed.startsWith("'")) return trimmed;
  return trimmed
    .slice(1, -1)
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r');
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

function getColumns(sql, tableName) {
  const match = sql.match(new RegExp(`CREATE TABLE \`${tableName}\` \\((.*?)\\) ENGINE=`, 's'));
  if (!match) return [];
  return match[1]
    .split('\n')
    .map((line) => line.match(/^\s*`([^`]+)`/))
    .filter(Boolean)
    .map((matchLine) => matchLine[1]);
}

function splitInsertStatements(sql, tableName) {
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
    if (start === -1) break;
  }
  return statements;
}

function parseTable(sql, tableName) {
  const fallbackColumns = getColumns(sql, tableName);
  const rows = [];
  for (const statement of splitInsertStatements(sql, tableName)) {
    let rest = statement.slice(`INSERT INTO \`${tableName}\``.length).trim();
    let columns = fallbackColumns;
    if (rest.startsWith('(')) {
      const end = rest.indexOf(')');
      columns = rest.slice(1, end).split(',').map((col) => col.replace(/`/g, '').trim());
      rest = rest.slice(end + 1).trim();
    }
    if (!rest.startsWith('VALUES')) continue;
    const values = rest.slice('VALUES'.length).replace(/;$/, '').trim();
    for (const tuple of splitTuples(values)) {
      const fields = splitFields(tuple);
      rows.push(Object.fromEntries(columns.map((col, index) => [col, fields[index]])));
    }
  }
  return rows;
}

function copySpringAssets() {
  const uploads = path.join(springRoot, 'uploads');
  if (fs.existsSync(uploads)) {
    fs.cpSync(uploads, path.join(clientAssets, 'spring/uploads'), { recursive: true, force: true });
  }
  const staticDir = path.join(springRoot, 'src/main/resources/static');
  if (fs.existsSync(staticDir)) {
    fs.cpSync(staticDir, path.join(clientAssets, 'spring/static'), { recursive: true, force: true });
  }
}

function normalizeAsset(value) {
  if (!value) return null;
  if (/^https?:\/\//.test(value)) return value;
  if (value.startsWith('/uploads/')) return `${springAssetPrefix}${value}`;
  if (value.startsWith('uploads/')) return `${springAssetPrefix}/${value}`;
  if (value.startsWith('/images/')) return `${springAssetPrefix}/static${value}`;
  if (value.startsWith('images/')) return `${springAssetPrefix}/static/${value}`;
  return value;
}

function buildProductDescription(product, reviews, qas) {
  const chunks = [product.description];
  const facts = [
    product.origin && `<strong>Xuất xứ:</strong> ${product.origin}`,
    product.weight_grams && `<strong>Khối lượng:</strong> ${product.weight_grams}g`,
  ].filter(Boolean);
  if (facts.length) chunks.push(`<p>${facts.join('<br />')}</p>`);
  if (product.story) chunks.push(`<h3>Câu chuyện sản phẩm</h3><p>${product.story}</p>`);
  const productReviews = reviews.filter((review) => String(review.product_id) === String(product.id));
  if (productReviews.length) {
    chunks.push(`<h3>Đánh giá từ khách hàng</h3><ul>${productReviews
      .map((review) => `<li><strong>${review.reviewer_name || 'Khách hàng'} (${review.rating || 5}/5):</strong> ${review.comment || review.title || ''}</li>`)
      .join('')}</ul>`);
  }
  const productQa = qas.filter((qa) => String(qa.product_id) === String(product.id) && !qa.parent_id);
  if (productQa.length) {
    chunks.push(`<h3>Hỏi đáp sản phẩm</h3><ul>${productQa
      .map((qa) => `<li><strong>${qa.question}</strong>${qa.answer ? `<br />${qa.answer}` : ''}</li>`)
      .join('')}</ul>`);
  }
  return chunks.filter(Boolean).join('\n');
}

async function importData(tables) {
  copySpringAssets();
  const categoriesByOldId = new Map();

  for (const category of tables.categories.filter((item) => toBool(item.is_active))) {
    const slug = uniqueSlug(category.name, category.id);
    const saved = await prisma.category.upsert({
      where: { slug },
      update: {
        name: category.name,
        description: category.description || null,
      },
      create: {
        name: category.name,
        slug,
        description: category.description || null,
      },
    });
    categoriesByOldId.set(String(category.id), saved);
  }

  for (const category of tables.categories.filter((item) => toBool(item.is_active) && item.parent_id)) {
    const saved = categoriesByOldId.get(String(category.id));
    const parent = categoriesByOldId.get(String(category.parent_id));
    if (saved && parent) {
      await prisma.category.update({ where: { id: saved.id }, data: { parentId: parent.id } });
    }
  }

  let productCount = 0;
  for (const productRow of tables.products.filter((item) => toBool(item.is_active))) {
    const category = categoriesByOldId.get(String(productRow.category_id));
    const slug = uniqueSlug(productRow.name, productRow.id);
    const description = buildProductDescription(productRow, tables.product_reviews, tables.product_qa);
    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        name: productRow.name,
        shortDescription: productRow.short_description || stripHtml(productRow.description).slice(0, 220),
        description,
        regularPrice: toNumber(productRow.price),
        salePrice: productRow.sale_price ? toNumber(productRow.sale_price) : null,
        stockQuantity: toNumber(productRow.stock_quantity),
        featured: toBool(productRow.is_featured),
        status: toBool(productRow.is_active) ? 'ACTIVE' : 'ARCHIVED',
        categoryId: category?.id,
      },
      create: {
        name: productRow.name,
        slug,
        shortDescription: productRow.short_description || stripHtml(productRow.description).slice(0, 220),
        description,
        regularPrice: toNumber(productRow.price),
        salePrice: productRow.sale_price ? toNumber(productRow.sale_price) : null,
        stockQuantity: toNumber(productRow.stock_quantity),
        featured: toBool(productRow.is_featured),
        status: toBool(productRow.is_active) ? 'ACTIVE' : 'ARCHIVED',
        categoryId: category?.id,
      },
    });

    const imageRows = tables.product_images
      .filter((image) => String(image.product_id) === String(productRow.id))
      .sort((a, b) => toNumber(a.display_order) - toNumber(b.display_order));
    const images = [
      productRow.image_url && { url: normalizeAsset(productRow.image_url), alt: productRow.name, sortOrder: 0 },
      ...imageRows.map((image, index) => ({
        url: normalizeAsset(image.image_url),
        alt: image.alt_text || productRow.name,
        sortOrder: index + 1,
      })),
    ].filter((image, index, list) => image?.url && list.findIndex((item) => item?.url === image.url) === index);

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    if (images.length) {
      await prisma.productImage.createMany({ data: images.map((image) => ({ ...image, productId: product.id })) });
    }
    productCount += 1;
  }

  let postCount = 0;
  for (const article of tables.news_articles.filter((item) => item.status === 'PUBLISHED')) {
    const imageUrl = normalizeAsset(article.featured_image || article.thumbnail_image);
    await prisma.contentPage.upsert({
      where: { slug: article.slug },
      update: {
        type: 'post',
        title: article.title,
        excerpt: article.excerpt || article.meta_description || stripHtml(article.content).slice(0, 180),
        body: article.content,
        imageUrl,
        published: true,
      },
      create: {
        type: 'post',
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || article.meta_description || stripHtml(article.content).slice(0, 180),
        body: article.content,
        imageUrl,
        published: true,
      },
    });
    postCount += 1;
  }

  console.log(`Imported SpringBoot SQL: ${categoriesByOldId.size} categories, ${productCount} products, ${postCount} posts.`);
}

function buildFallbackStore(tables) {
  copySpringAssets();
  const categoryByOldId = new Map();
  const categories = tables.categories
    .filter((item) => toBool(item.is_active))
    .map((category) => {
      const mapped = {
        id: toNumber(category.id),
        name: category.name,
        slug: uniqueSlug(category.name, category.id),
        description: category.description || null,
        parentId: category.parent_id ? toNumber(category.parent_id) : null,
        children: [],
        _count: { products: 0 },
      };
      categoryByOldId.set(String(category.id), mapped);
      return mapped;
    });
  for (const category of categories) {
    if (category.parentId && categoryByOldId.has(String(category.parentId))) {
      categoryByOldId.get(String(category.parentId)).children.push(category);
    }
  }

  const products = tables.products
    .filter((item) => toBool(item.is_active))
    .map((product) => {
      const category = categoryByOldId.get(String(product.category_id)) || null;
      if (category) category._count.products += 1;
      const imageRows = tables.product_images
        .filter((image) => String(image.product_id) === String(product.id))
        .sort((a, b) => toNumber(a.display_order) - toNumber(b.display_order));
      const images = [
        product.image_url && { url: normalizeAsset(product.image_url), alt: product.name, sortOrder: 0 },
        ...imageRows.map((image, index) => ({
          url: normalizeAsset(image.image_url),
          alt: image.alt_text || product.name,
          sortOrder: index + 1,
        })),
      ].filter((image, index, list) => image?.url && list.findIndex((item) => item?.url === image.url) === index);
      return {
        id: toNumber(product.id),
        name: product.name,
        slug: uniqueSlug(product.name, product.id),
        shortDescription: product.short_description || stripHtml(product.description).slice(0, 220),
        description: buildProductDescription(product, tables.product_reviews, tables.product_qa),
        sku: null,
        regularPrice: toNumber(product.price),
        salePrice: product.sale_price ? toNumber(product.sale_price) : null,
        stockQuantity: toNumber(product.stock_quantity),
        featured: toBool(product.is_featured),
        status: 'ACTIVE',
        categoryId: category?.id || null,
        category,
        images,
        variants: [],
        relatedProducts: [],
      };
    });

  for (const product of products) {
    product.relatedProducts = products
      .filter((item) => item.id !== product.id && item.categoryId === product.categoryId)
      .map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        shortDescription: item.shortDescription,
        regularPrice: item.regularPrice,
        salePrice: item.salePrice,
        featured: item.featured,
        category: item.category,
        images: item.images,
        variants: [],
      }))
      .slice(0, 3);
  }

  const posts = tables.news_articles
    .filter((item) => item.status === 'PUBLISHED')
    .map((article) => ({
      id: toNumber(article.id),
      type: 'post',
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || article.meta_description || stripHtml(article.content).slice(0, 180),
      body: article.content,
      imageUrl: normalizeAsset(article.featured_image || article.thumbnail_image),
      published: true,
      createdAt: article.published_at || article.created_at,
    }));

  return { categories, products, posts };
}

async function main() {
  if (!fs.existsSync(sqlPath)) throw new Error(`Spring SQL file not found: ${sqlPath}`);
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const tables = {
    categories: parseTable(sql, 'categories'),
    products: parseTable(sql, 'products'),
    product_images: parseTable(sql, 'product_images'),
    news_articles: parseTable(sql, 'news_articles'),
    product_reviews: parseTable(sql, 'product_reviews'),
    product_qa: parseTable(sql, 'product_qa'),
  };

  console.log(`Parsed SpringBoot SQL: ${tables.categories.length} categories, ${tables.products.length} products, ${tables.product_images.length} product images, ${tables.news_articles.length} news articles, ${tables.product_reviews.length} reviews, ${tables.product_qa.length} Q&A rows.`);
  if (exportJson) {
    fs.mkdirSync(path.dirname(fallbackStorePath), { recursive: true });
    fs.writeFileSync(fallbackStorePath, JSON.stringify(buildFallbackStore(tables), null, 2));
    console.log(`Exported fallback store to ${fallbackStorePath}`);
    return;
  }
  if (dryRun) return;
  await importData(tables);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
