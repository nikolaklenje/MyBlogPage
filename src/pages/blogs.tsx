import { Card } from "@/components/layout/card";
import { getBlogById } from "@/library/blogs";
import { getAllBlogs } from "@/library/blogs";

export async function getStaticProps() {
  const blogs: any = getAllBlogs();
  console.log("THIS ARE BLOGs", blogs);
  console.log("This are blogs");
  return {
    props: {
      blogs,
    },
  };
}

export default function Blogs({ blogs }: { blogs: any }) {
  console.log("THIS ArE BloGs", blogs);
  return (
    <div className="flex flex-col lg:flex-row">
      {blogs.map((blog: { id: string; title: string; description: string }) => (
        <Card
          key={blog.id}
          src="https://images.unsplash.com/photo-1485846234645-a62644f84728?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1340&q=80"
          title={blog.title}
          description={blog.description}
        />
      ))}
    </div>
  );
}
