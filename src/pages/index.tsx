import SEO from '@/components/layout/seo/SEO';
import { Baner, About, Contact } from '@/components/layout';

export default function HomePage() {
  return (
    <>
      <SEO
        title="Nicode - Your Gateway to Tech Insights and Resources"
        description="Discover the latest in technology, programming, and more with Nicode. Explore our blogs, connect with us, and stay updated on all things tech."
        url="https://www.nicode.io/"
      />
      <Baner />
      <About />
      <Contact />
    </>
  );
}
