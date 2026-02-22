/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://nicode.ai',
  generateRobotsTxt: true, // also generates robots.txt for free
  sitemapSize: 7000, // splits into multiple files if you exceed this
  changefreq: 'weekly',
  priority: 0.7,
  robotsTxtOptions: {
    additionalSitemaps: ['https://nicode.ai/server-sitemap.xml'],
  },

  // Pages you want excluded from the sitemap
  exclude: ['/404', '/500', '/admin/*', '/api/*'],

  transform: async (config, path) => {
    // Give homepage highest priority
    if (path === '/') {
      return {
        loc: path,
        priority: 1.0,
        changefreq: 'daily',
        lastmod: new Date().toISOString(),
      };
    }
    if (path.startsWith('/blogs/')) {
      return {
        loc: path,
        priority: 0.9,
        changefreq: 'weekly',
        lastmod: new Date().toISOString(),
      };
    }
    // Default transformation for other pages

    return {
      loc: path,
      priority: config.priority,
      changefreq: config.changefreq,
      lastmod: new Date().toISOString(),
    };
  },
};
