// scripts/generate-sitemap.ts
// This script generates a sitemap.xml file for better SEO

import fs from 'fs';
import path from 'path';
import { pool } from '../server/db';
import { languages, lessons } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function generateSitemap() {
  console.log('Generating sitemap.xml...');
  
  try {
    // Connect to the database
    const languagesResult = await pool.query(
      sql`SELECT ${languages.code} FROM ${languages}`
    );
    
    const languageCodes = languagesResult.rows.map(row => row.code);
    
    // Base URLs for the sitemap
    const baseUrl = 'https://lingomitra.com';
    const urls = [
      baseUrl, // Homepage
      `${baseUrl}/about`,
      `${baseUrl}/auth`,
      `${baseUrl}/profile`
    ];
    
    // Add language URLs
    for (const code of languageCodes) {
      urls.push(`${baseUrl}/language/${code}`);
      
      // Get lessons for this language
      const lessonsResult = await pool.query(
        sql`SELECT ${lessons.lessonId} FROM ${lessons} WHERE ${lessons.languageCode} = ${code}`
      );
      
      for (const lesson of lessonsResult.rows) {
        const lessonNumber = lesson.lessonId.match(/lesson(\d+)/)[1];
        urls.push(`${baseUrl}/${code}/lesson/${lessonNumber}`);
      }
    }
    
    // Generate XML content
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
    
    // Add each URL to the sitemap
    urls.forEach(url => {
      xmlContent += `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });
    
    // Close the XML
    xmlContent += '</urlset>';
    
    // Write the file
    const outputPath = path.resolve('./client/public/sitemap.xml');
    fs.writeFileSync(outputPath, xmlContent);
    
    console.log(`Sitemap generated at ${outputPath}`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the function
generateSitemap().catch(console.error);