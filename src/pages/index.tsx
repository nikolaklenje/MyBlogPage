import { Baner, Header, Conections, About } from "@/components/layout";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center  ">
      <Header />
      <Conections />
      <Baner />
      <About />
    </main>
  );
}
