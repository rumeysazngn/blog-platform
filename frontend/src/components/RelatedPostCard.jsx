import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function RelatedPostCard({ postId }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API çağrısı başladığında loading true olsun
    setLoading(true);
    fetch(`http://localhost:5000/api/posts/${postId}`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data.post);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [postId]);

  // 1. SKELETON LOADING (Veri gelene kadar gri kutular göster)
  if (loading || !post) {
    return (
      <div className="bg-white/5 border border-white/5 rounded-xl p-3 animate-pulse h-[280px]">
        <div className="h-32 bg-white/10 rounded-lg mb-4"></div>
        <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-white/10 rounded w-1/2"></div>
      </div>
    );
  }

  // Resim yoksa gösterilecek kaliteli varsayılan görsel (Unsplash)
  const imageUrl = post.kapak_resmi
    ? `http://localhost:5000${post.kapak_resmi}`
    : "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600"; 

  // Tarih formatı (Örn: 14 Ara 2025)
  const formattedDate = new Date(post.olusturulma_tarihi).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  return (
    <Link
      to={`/post/${post.slug}`}
      // 2. KART TASARIMI: Glassmorphism + Border Glow
      className="group flex flex-col h-full bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
    >
      {/* RESİM ALANI */}
      <div className="relative h-40 overflow-hidden">
        {/* Resim üstü hafif karanlık (yazı okunurluğu için) */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
        
        <img
          src={imageUrl}
          alt={post.baslik}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        
        {/* Sol üstte tarih badge'i */}
        <div className="absolute top-2 left-2 z-20 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-gray-200 border border-white/10">
            {formattedDate}
        </div>
      </div>

      {/* İÇERİK ALANI */}
      <div className="p-4 flex flex-col flex-grow">
        <h4 className="text-base font-bold text-white line-clamp-2 leading-snug mb-2 group-hover:text-cyan-400 transition-colors">
          {post.baslik}
        </h4>
        
        <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-3">
          {post.alt_baslik || post.icerik?.slice(0, 100).replace(/<[^>]*>?/gm, '') + "..."}
        </p>

        {/* Alt kısım: Yazar veya 'Devamını Oku' */}
        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
           <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
             @{post.kullanicilar?.kullanici_adi}
           </span>
           <span className="text-xs text-cyan-500 font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
             Oku →
           </span>
        </div>
      </div>
    </Link>
  );
}