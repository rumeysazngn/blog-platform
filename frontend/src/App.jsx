import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useEffect, useState } from "react";
import api from "./api/axios";
import GridBackground from "./components/GridBackground";

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        if (res.data.success) setCategories(res.data.kategoriler);
      } catch (err) {
        console.error("Kategori alınamadı:", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    // ⚠️ DÜZELTME 1: "bg-slate-900" buradan silindi. "relative" eklendi.
    <div className="min-h-screen flex flex-col text-gray-100 font-sans relative overflow-x-hidden">
      
      {/* Arka plan bileşeni */}
      <GridBackground />

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/70 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        
        {/* Sol Taraf */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
            📝 BlogPlatform
          </Link>

          {/* Kategoriler Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <button className="text-gray-300 hover:text-cyan-400 transition font-medium flex items-center gap-1">
              Kategoriler ▾
            </button>

            {open && (
              <div className="absolute left-0 top-full mt-2 w-52 bg-slate-800 border border-white/10 shadow-xl shadow-purple-500/10 rounded-xl py-2 z-50 overflow-hidden">
                {categories.length === 0 ? (
                  <p className="px-4 py-2 text-sm text-gray-500">Yükleniyor...</p>
                ) : (
                  categories.map((cat) => (
                    <Link
                      key={cat.kategori_id}
                      to={`/kategori/${cat.kategori_id}`}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-cyan-400 transition"
                    >
                      {cat.ad}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sağ Taraf */}
        <div className="flex items-center gap-5">
          {user?.rol === "admin" && (
            <Link to="/admin" className="text-pink-500 font-semibold hover:text-pink-400 transition">
              Admin Paneli
            </Link>
          )}

          {user ? (
            <>
              <span className="text-sm text-gray-400 hidden sm:inline">
                👋 Hoş geldin,{" "}
                <Link to={`/profile/${user.kullanici_id}`} className="font-semibold text-cyan-400 hover:underline">
                  {user.kullanici_adi}
                </Link>
              </span>

              <Link
                to="/create"
                className="hidden sm:inline-block text-gray-300 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition"
              >
                ✏️ Yeni Yazı
              </Link>

              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:scale-105 transition shadow-lg shadow-purple-500/30"
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white font-medium transition">
                Giriş Yap
              </Link>
              <Link
                to="/register"
                className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold hover:bg-cyan-50 transition"
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ⚠️ DÜZELTME 2: "relative z-10" eklendi. Grid'in üstünde kalsın diye. */}
      <main className="flex-grow w-full pt-20 relative z-10">
        <Outlet />
      </main>

      {/* ⚠️ DÜZELTME 3: "relative z-10" ve şeffaflık ayarı */}
      <footer className="bg-slate-950/50 backdrop-blur-md border-t border-white/5 text-center text-sm text-gray-500 py-6 relative z-10">
        <p>© {new Date().getFullYear()} BlogPlatform. Tüm hakları saklıdır.</p>
      </footer>

    </div>
  );
}