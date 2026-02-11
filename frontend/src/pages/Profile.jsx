import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import GridBackground from "../components/GridBackground"; 

export default function Profile() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // 👤 Kullanıcı ve Yazıları Çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get("/users/me");
        setMe(userRes.data.user);
        
        const postRes = await api.get("/posts/my-posts");
        setPosts(postRes.data.posts || []);
      } catch (err) {
        console.error("Veri yüklenemedi:", err);
        if(!localStorage.getItem("token")) navigate("/login");
      } finally {
        setLoadingUser(false);
        setLoadingPosts(false);
      }
    };
    fetchData();
  }, [navigate]);

  // 🧩 Avatar Baş Harfi
  const initials = useMemo(() => {
    if (!me) return "U";
    const name = me.tam_ad || me.kullanici_adi || "U";
    return name.trim().charAt(0).toUpperCase();
  }, [me]);

  // 🗑️ Silme İşlemi
  const handleDelete = async (id) => {
    if (!window.confirm("Bu yazıyı kalıcı olarak silmek istediğine emin misin?")) return;
    try {
      await api.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p.yazi_id !== id));
    } catch (err) {
      alert("Silme işlemi başarısız.");
    }
  };

  // --- HTML RENDER ---
  return (
    <div className="min-h-screen text-gray-100 font-sans relative">
      <GridBackground />

      {/* Üst Boşluk */}
      <div className="h-20"></div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        
        {/* 1. PROFİL KARTI (HEADER) */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-800/40 backdrop-blur-xl border border-white/10 shadow-2xl p-8 mb-12">
          
          {/* Arka Plan Süsü (Glow) */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px]"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            
            {/* Avatar */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-900 bg-slate-800 flex items-center justify-center">
                {me?.profil_pic ? (
                  <img src={me.profil_pic} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                    {initials}
                  </span>
                )}
              </div>
            </div>

            {/* Kullanıcı Bilgileri */}
            <div className="flex-1">
              {loadingUser ? (
                 <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-2 mx-auto md:mx-0"></div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {me?.tam_ad || me?.kullanici_adi}
                  </h1>
                  <p className="text-gray-400 text-sm mb-6">@{me?.kullanici_adi}</p>
                </>
              )}

              {/* İstatistikler */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                 <StatBox label="Yazılar" value={posts.length} icon="📝" />
                 <StatBox label="Rol" value={me?.rol || "User"} icon="🛡️" />
                 <StatBox 
                    label="Üyelik" 
                    value={me?.olusturma_tarihi ? new Date(me.olusturma_tarihi).getFullYear() : "2024"} 
                    icon="📅" 
                 />
              </div>

              {/* BUTONLAR */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                
                {/* Yeni Yazı (Primary) */}
                <Link to="/create" className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition text-sm font-medium">
                  ✍️ Yeni Yazı Yaz
                </Link>

                {/* Profil Düzenle (Secondary) */}
                <Link to="/edit-profile" className="px-5 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium">
                  ⚙️ Düzenle
                </Link>

                {/* 🏠 ANA SAYFA BUTONU (Tertiary / Ghost) */}
                <Link 
                  to="/" 
                  className="px-5 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition text-sm font-medium flex items-center gap-2"
                >
                  <span>🏠</span> Ana Sayfa
                </Link>

              </div>
            </div>

          </div>
        </div>

        {/* 2. YAZILAR LİSTESİ */}
        <div>
           {/* Başlık */}
           <div className="flex items-center gap-6 border-b border-white/10 mb-8 pb-4">
              <h2 className="text-lg font-bold text-cyan-400 border-b-2 border-cyan-400 pb-4 -mb-4.5">
                 Yazılarım ({posts.length})
              </h2>
           </div>

           {/* Liste */}
           {loadingPosts ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1,2,3].map(i => <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse"></div>)}
              </div>
           ) : posts.length === 0 ? (
              <div className="text-center py-20 bg-white/5 border border-white/5 rounded-3xl border-dashed">
                 <div className="text-6xl mb-4">📜</div>
                 <h3 className="text-xl font-bold text-white mb-2">Henüz yazı paylaşmadın</h3>
                 <p className="text-gray-400 mb-6">Düşüncelerini dünyayla paylaşmaya başla.</p>
                 <Link to="/create" className="text-cyan-400 hover:underline">İlk yazını oluştur →</Link>
              </div>
           ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 {posts.map(post => (
                    <ProfilePostCard 
                       key={post.yazi_id} 
                       post={post} 
                       onDelete={handleDelete} 
                    />
                 ))}
              </div>
           )}
        </div>

      </div>
    </div>
  );
}

// ✨ YARDIMCI BİLEŞENLER

function StatBox({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3 bg-slate-900/50 border border-white/5 px-4 py-2 rounded-xl">
      <span className="text-xl">{icon}</span>
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">{label}</span>
        <span className="text-white font-semibold">{value}</span>
      </div>
    </div>
  )
}

function ProfilePostCard({ post, onDelete }) {
   const imageUrl = post.kapak_resmi ? `http://localhost:5000${post.kapak_resmi}` : null;
   
   return (
      <div className="group bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300 flex flex-col h-full">
         
         <div className="relative h-48 overflow-hidden bg-slate-900">
            {imageUrl ? (
               <img src={imageUrl} alt={post.baslik} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-4xl">📝</div>
            )}
            
            <div className="absolute top-3 left-3 bg-green-500/20 backdrop-blur-md border border-green-500/30 text-green-400 text-xs font-bold px-2 py-1 rounded">
               Yayında
            </div>
         </div>

         <div className="p-5 flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-gray-200 mb-2 line-clamp-2 group-hover:text-cyan-400 transition">
               <Link to={`/post/${post.slug}`}>{post.baslik}</Link>
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2 mb-4">
               {post.alt_baslik || "Özet yok..."}
            </p>
            
            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
               <span>{new Date(post.olusturma_tarihi).toLocaleDateString("tr-TR")}</span>
               <span>{post.okuma_suresi || 5} dk</span>
            </div>
         </div>

         <div className="bg-slate-900/50 p-3 flex gap-2 border-t border-white/5">
            <Link 
               to={`/edit/${post.yazi_id}`}
               className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-yellow-500/10 hover:text-yellow-400 text-gray-300 text-sm font-medium transition"
            >
               ✏️ Düzenle
            </Link>
            <button 
               onClick={() => onDelete(post.yazi_id)}
               className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-gray-300 text-sm font-medium transition"
            >
               🗑️ Sil
            </button>
         </div>
      </div>
   )
}