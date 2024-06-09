import fs from "fs";
import path from "path";
import matter from "gray-matter";

const blogsDirectory = path.join(process.cwd(), "src/listOfBlogs");

export function getAllBlogs() {
  const fileNames = fs.readdirSync(blogsDirectory);
  const allBlogs = fileNames.map((fileName) => {
    const filePath = path.join(blogsDirectory, fileName);
    const fileContents = fs.readFileSync(filePath, "utf8");

    const { data, content } = matter(fileContents);
    return {
      id: data.id,
      title: data.title,
      category: data.category,
      date: data.date,
      image: data.image,
      content: content,
    };
  });
  return allBlogs;
}

export function getBlogById(id: string) {
  const fileNames = fs.readdirSync(blogsDirectory);
  const fileName = fileNames.find((name) => name.includes(id));
  if (!fileName) {
    throw new Error("Blog not foiund");
  }
  const filePath = path.join(blogsDirectory, fileName);
  const fileContents = fs.readFileSync(filePath, "utf8");

  const { data, content } = matter(fileContents);
  return {
    id: data.id,
    title: data.title,
    category: data.category,
    date: data.date,
    image: data.image,
    content: content,
  };
}
