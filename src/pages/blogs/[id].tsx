import { getAllBlogs, getBlogById } from "@/library/blogs";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface BlogDetailsType {
  params: {
    id: string;
  };
  blog: {
    title: string;
    description: string;
  };
}
export async function getStaticPaths() {
  const blogs = getAllBlogs();
  const paths = blogs.map((blog) => ({
    params: {
      id: blog.id.toString(),
    },
  }));
  return {
    paths,
    fallback: false,
  };
}
export async function getStaticProps({ params }: BlogDetailsType) {
  const blog = getBlogById(params.id);
  return {
    props: {
      blog,
    },
  };
}

export const BlogDetails = ({ blog }: BlogDetailsType) => {
  return (
    <div>
      <h1>{blog.title}</h1>
      <p>{blog.description}</p>
    </div>
  );
};

export default BlogDetails;
