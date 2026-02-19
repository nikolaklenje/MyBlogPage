import Head from 'next/head';

export default function SEO({
  title = 'Nicode',
  description = 'Welcome to Nicode, your go-to platform for the latest in technology, programming, and more.',
  url = 'https://www.nicode.io/',
  //image = 'https://www.nicode.io/og-image.png', to be added
}) {
  const fullTitle = title ? `${title} - Nicode` : 'Nicode';

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {/* <meta property="og:image" content={image} /> */}
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {/* <meta name="twitter:image" content={image} /> */}
    </Head>
  );
}
