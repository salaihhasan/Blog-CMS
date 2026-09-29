import { useParams } from "react-router-dom";
import BlogForm from "./BlogForm";

export default function BlogEdit() {
  const { id } = useParams<{ id: string }>();

  // BlogForm resolves the post itself via `GET /api/blogs/:id`.
  return <BlogForm mode="edit" id={id} />;
}
