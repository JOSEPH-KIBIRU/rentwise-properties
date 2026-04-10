// scripts/generate-sitemap.mjs
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Trim to remove accidental spaces/newlines
const SUPABASE_URL = process.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY?.trim();

// Safe debug output (never logs full key)
console.log('🔍 URL:', SUPABASE_URL?.substring(0, 25) + '...');
console.log('🔑 Key length:', SUPABASE_KEY?.length || 0, 'chars');
console.log('🔑 Key starts with:', SUPABASE_KEY?.substring(0, 12) + '...');

if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_KEY.length < 50) {
  console.error('❌ Invalid Supabase key. Check .env format & re-copy from dashboard.');
  process.exit(1);
}

const TABLE_NAME = 'properties';
const URL_COLUMN = 'slug'; // Update if your column is named differently

async function generateSitemap() {
  const apiUrl = `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=${URL_COLUMN}`;
  
  const res = await fetch(apiUrl, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`❌ Supabase rejected request (${res.status}):`, err);
    process.exit(1);
  }

  const properties = await res.json();
  const baseUrl = 'https://rentwiseproperties.co.ke';

  const staticPages = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/properties', changefreq: 'daily', priority: '0.9' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.6' },
    { loc: '/blog', changefreq: 'weekly', priority: '0.8' }
  ];

  const propertyUrls = properties.map(p => `
    <url>
      <loc>${baseUrl}/properties/${p[URL_COLUMN]}</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(p => `
    <url>
      <loc>${baseUrl}${p.loc}</loc>
      <changefreq>${p.changefreq}</changefreq>
      <priority>${p.priority}</priority>
    </url>`).join('\n')}
  ${propertyUrls}
</urlset>`;

  const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, sitemap.trim());
  console.log(`✅ sitemap.xml generated with ${properties.length} properties!`);
}

generateSitemap();