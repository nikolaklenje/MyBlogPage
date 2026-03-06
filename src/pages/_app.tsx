import Head from 'next/head';
import { supabase } from '@/library/supabaseApi';
import 'animate.css';
import '@/styles/globals.css';
import { Connections, Header } from '@/components/layout';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    //initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  });
  return (
    <>
      <Head>
        {/* Makes  site responsive on mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Tells search engines to index your site */}
        <meta name="robots" content="index, follow" />
      </Head>
      <main className="flex min-h-screen w-full flex-col items-center">
        <Header user={user} />
        <Connections />
        <Component {...pageProps} />
      </main>
    </>
  );
}
