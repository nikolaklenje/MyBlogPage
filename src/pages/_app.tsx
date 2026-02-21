import Head from 'next/head';
import 'animate.css';
import '@/styles/globals.css';
import { Connections, Header } from '@/components/layout';

import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* Makes  site responsive on mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Tells search engines to index your site */}
        <meta name="robots" content="index, follow" />
      </Head>
      <main className="flex min-h-screen w-full flex-col items-center">
        <Header />
        <Connections />
        <Component {...pageProps} />
      </main>
    </>
  );
}
