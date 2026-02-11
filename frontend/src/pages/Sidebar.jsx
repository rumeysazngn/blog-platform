import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const [recommendations, setRecommendations] = useState([]);
  const userId = JSON.parse(localStorage.getItem("user"))?.kullanici_id;

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/posts/recommend/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setRecommendations(data.recommendations || []));
  }, []);

  return (
    <aside className="p-4 border rounded-lg bg-white shadow-md">
      <h3 className="font-semibold text-lg mb-3">
        Kullanıcı Davranışlarına Göre Öneriler
      </h3>

      {recommendations.length === 0 ? (
        <p className="text-gray-500 text-sm">Öneriler yükleniyor...</p>
      ) : (
        <ul className="space-y-3">
          {recommendations.map((postId) => (
            <SidebarRecommendation key={postId} postId={postId} />
          ))}
        </ul>
      )}
    </aside>
  );
}

function SidebarRecommendation({ postId }) {
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/posts/${postId}`)
      .then((res) => res.json())
      .then((data) => setPost(data.post));
  }, []);

  if (!post) return null;

  return (
    <li>
      <Link to={`/post/${post.slug}`} className="block">
        <h4 className="text-sm font-medium">{post.baslik}</h4>
        <p className="text-xs text-gray-500">{post.icerik.slice(0, 80)}...</p>
      </Link>
    </li>
  );
}
