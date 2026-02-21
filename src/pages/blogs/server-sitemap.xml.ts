// pages/server-sitemap.xml.ts
import { getServerSideSitemap, ISitemapField } from 'next-sitemap';
import fs from 'fs';
import path from 'path';

export async function getServerSideProps(ctx: any) {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const filenames = fs.readdirSync(postsDirectory);

  const fields: ISitemapField[] = filenames
    .filter((file) => file.endsWith('.md'))
    .map((filename) => {
      const filePath = path.join(postsDirectory, filename);
      const stats = fs.statSync(filePath);

      return {
        loc: `https://nicode.ai/blog/${filename.replace('.md', '')}`,
        lastmod: stats.mtime.toISOString(),
        priority: 0.9,
        changefreq: 'weekly' as const,
      };
    });

  return getServerSideSitemap(fields); // ← remove ctx from here, newer versions don't need it
}

export default function SitemapIndex() {}
