import Head from 'next/head';

export default function SEO({
  title = 'Nicode',
  description = 'Welcome to Nicode, your go-to platform for the latest in technology, programming, and more.',
  url = 'https://www.nicode.ai/',
  image = 'https://nicode.ai/nicode-ai-logo-og.png',
}) {
  const fullTitle = title ? `${title} ` : 'Nicode';

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <link rel="icon" href="/nicode-ai-logo-square.png" />
      <link rel="apple-touch-icon" href="/nicode-ai-logo-square.png" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
  );
}
