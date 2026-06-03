import Head from 'next/head';
import Script from 'next/script'; // add this
import { supabase } from '@/library/supabaseApi';
import 'animate.css';
import '@/styles/globals.css';
import { Connections, Header } from '@/components/layout';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
      </Head>

      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-W493VYG8FR"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-W493VYG8FR');
        `}
      </Script>

      <main className="flex min-h-screen w-full flex-col items-center">
        <Header user={user} />
        <Connections />
        <Component {...pageProps} />
      </main>
    </>
  );
}
