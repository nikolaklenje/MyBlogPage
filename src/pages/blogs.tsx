import { Card } from '@/components/layout/card';
import { getAllBlogs } from '@/library/blogs';

export async function getStaticProps() {
  const blogs: any = getAllBlogs();
  return {
    props: {
      blogs,
    },
  };
}

export default function BlogsPage({ blogs }: { blogs: any }) {
  return (
    <div className="flex flex-col lg:flex-row">
      {blogs.map((blog: { id: string; title: string; description: string; image: string }) => (
        <Card
          key={blog.id}
          src={blog.image}
          title={blog.title}
          description={blog.description}
          path={`/blogs/${blog.id}`}
        />
      ))}
    </div>
  );
}
