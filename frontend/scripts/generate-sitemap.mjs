// scripts/generate-sitemap.mjs
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get Supabase credentials from environment
const SUPABASE_URL = process.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY?.trim();

// 🔧 UPDATE THESE to match your Supabase setup
const TABLE_NAME = 'properties';
const URL_COLUMN = 'slug'; // Change to 'id' if you use IDs in URLs

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase env variables. Check your .env file.');
  process.exit(1);
}

if (SUPABASE_KEY.length < 50) {
  console.error('❌ Invalid Supabase key. Check .env format & re-copy from dashboard.');
  process.exit(1);
}

async function generateSitemap() {
  try {
    // Fetch properties from Supabase
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=${URL_COLUMN}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Failed to fetch properties (${res.status}):`, errorText);
      process.exit(1);
    }

    const properties = await res.json();
    console.log(`📊 Fetched ${properties.length} properties from Supabase`);

    const baseUrl = 'https://rentwiseproperties.co.ke';

    // Static pages
    const staticPages = [
      { loc: '/', changefreq: 'daily', priority: '1.0' },
      { loc: '/properties', changefreq: 'daily', priority: '0.9' },
      { loc: '/contact', changefreq: 'monthly', priority: '0.6' },
      { loc: '/blog', changefreq: 'weekly', priority: '0.8' }
    ];

    // Generate property URLs
    const propertyUrls = properties.map(p => {
      const slug = p[URL_COLUMN];
      if (!slug) {
        console.warn('⚠️ Property missing slug:', p);
        return null;
      }
      return `
    <url>
      <loc>${baseUrl}/properties/${slug}</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`;
    }).filter(Boolean); // Remove null entries

    // 🔥 CRITICAL: XML declaration MUST be first (no spaces/BOM before it)
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => `  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
${propertyUrls.join('\n')}
</urlset>`;

    // Write to public folder (Vite copies this to dist/ on build)
    const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(outputPath, sitemap, 'utf8');
    
    console.log(`✅ sitemap.xml generated successfully!`);
    console.log(`📁 Location: ${outputPath}`);
    console.log(`📄 Total URLs: ${staticPages.length + propertyUrls.length}`);
    console.log(`   - Static pages: ${staticPages.length}`);
    console.log(`   - Property pages: ${propertyUrls.length}`);

  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    process.exit(1);
  }
}

generateSitemap();