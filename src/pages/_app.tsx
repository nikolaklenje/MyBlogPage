import 'animate.css';
import '@/styles/globals.css';
import { Connections, Header } from '@/components/layout';

import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className="flex min-h-screen w-full flex-col items-center">
      <Header />
      <Connections />
      <Component {...pageProps} />
    </main>
  );
}
