import { Conections, Header } from "@/components/layout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className="flex min-h-screen flex-col items-center w-full ">
      <Header />
      <Conections />
      <Component {...pageProps} />
    </main>
  );
}
