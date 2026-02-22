// pages/server-sitemap.xml.ts
import { getServerSideSitemap, ISitemapField } from 'next-sitemap';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function getServerSideProps() {
  const postsDirectory = path.join(process.cwd(), 'src/listOfBlogs');
  const filenames = fs.readdirSync(postsDirectory);

  const fields: ISitemapField[] = filenames
    .filter((file) => file.endsWith('.md'))
    .map((filename) => {
      const filePath = path.join(postsDirectory, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      const stats = fs.statSync(filePath);

      return {
        loc: `https://nicode.ai/blogs/${data.id}`,
        lastmod: stats.mtime.toISOString(),
        priority: 0.9,
        changefreq: 'weekly' as const,
      };
    });

  return getServerSideSitemap(fields);
}

export default function SitemapIndex() {
  return null;
}
