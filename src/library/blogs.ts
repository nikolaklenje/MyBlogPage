import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const blogsDirectory = path.join(process.cwd(), 'src/listOfBlogs');
const fileNames = fs.readdirSync(blogsDirectory);
export function getAllBlogs() {
  const allBlogs = fileNames.map((fileName) => {
    const filePath = path.join(blogsDirectory, fileName);
    const fileContents = fs.readFileSync(filePath, 'utf8');

    const { data, content } = matter(fileContents);
    return {
      id: data.id,
      title: data.title,
      category: data.category,
      date: data.date,
      image: data.image,
      description: data.description,
      creator: data.creator,
      content: content,
    };
  });
  return allBlogs;
}

export function getBlogById(id: string) {
  const fileName = fileNames.find((name) => name.includes(id));
  if (!fileName) {
    throw new Error('Blog not found');
  }
  const filePath = path.join(blogsDirectory, fileName);
  const fileContents = fs.readFileSync(filePath, 'utf8');

  const { data, content } = matter(fileContents);
  return {
    id: data.id,
    title: data.title,
    category: data.category,
    date: data.date,
    image: data.image,
    description: data.description,
    creator: data.creator,
    content: content,
  };
}
