import { getAllBlogs, getBlogById } from "@/library/blogs";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import styles from "./blog.module.css";

interface BlogDetailsType {
  params: {
    id: string;
  };
  blog: {
    title: string;
    description: string;
    date: string;
    content: string;
    creator: string;
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
    <div className="text-white flex flex-col animate__animated animate__fadeIn animate__delay-.5s sm: p-12 lg:p-36 items-left">
      <h1 className="text-6xl font-semibold my-12 flex justify-center ">
        {blog.title}
      </h1>
      <div className="flex justify-between flex-row mt-6 mb-48">
        <p className="text-xl">{blog.creator}</p>
        <p className="text-xl">{blog.date}</p>
      </div>
      <ReactMarkdown
        className={`font-medium text-xl ${styles.blog}`}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code>{children}</code>
            );
          },
        }}
      >
        {blog.content}
      </ReactMarkdown>
    </div>
  );
};

export default BlogDetails;
