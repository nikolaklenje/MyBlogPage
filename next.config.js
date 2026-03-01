/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' https://*.supabase.co;
    upgrade-insecure-requests;
`;
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          //prevents clickjacking attacks by preventing the site from being embedded in frames from other originss
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          //prevents MIME type sniffing by instructing the browser to strictly follow the declared content type
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          //enforces secure connections by instructing the browser to only access the site over HTTPS for a specified duration
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          //controls the referrer information sent with requests, enhancing privacy by limiting referrer data to same-origin requests
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          //enables the XSS filter built into most modern browsers, providing an additional layer of protection against cross-site scripting attacks
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;
