import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function RecommendationCard({ postId }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/posts/${postId}`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data.post);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [postId]);

  if (loading || !post) return null;

  return (
    <Link
      to={`/post/${post.slug}`}
      className="group block p-4 rounded-xl border bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
    >
      <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-indigo-600">
        {post.baslik}
      </h3>
      <p className="mt-2 text-sm text-gray-500 line-clamp-3">
        {post.icerik?.replace(/<[^>]+>/g, "").slice(0, 150)}...
      </p>
      <p className="mt-3 text-xs text-gray-400">
        {new Date(post.yayinlanma_tarihi).toLocaleDateString("tr-TR")}
      </p>
    </Link>
  );
}
