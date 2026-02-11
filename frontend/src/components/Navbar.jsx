import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useEffect, useState } from "react";
import api from "./api/axios";

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false); // kategori menüsü

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ⭐ Kategorileri backend’den çek
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
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">

      {/* ⭐ NAVBAR */}
      <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center relative z-50">

        {/* Sol Taraf */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            📝 BlogPlatform
          </Link>

          {/* ⭐ Kategoriler Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <button className="text-gray-700 hover:text-indigo-600 transition font-medium flex items-center gap-1">
              Kategoriler ▾
            </button>

            {open && (
              <div className="absolute left-0 top-full mt-2 w-52 bg-white border border-gray-200 shadow-lg rounded-md py-2 z-50">
                {categories.length === 0 ? (
                  <p className="px-4 py-2 text-sm text-gray-500">
                    Yükleniyor...
                  </p>
                ) : (
                  categories.map((cat) => (
                    <Link
                      key={cat.kategori_id}
                      to={`/kategori/${cat.kategori_id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
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

          {/* ⭐ Admin Panel Linki (sadece admin için) */}
          {user?.rol === "admin" && (
            <Link
              to="/admin"
              className="text-red-600 font-semibold hover:text-red-800"
            >
              Admin Paneli
            </Link>
          )}

          {user ? (
            <>
              <span className="text-sm text-gray-700">
                👋 Hoş geldin,{" "}
                <Link
                  to={`/profile/${user.kullanici_id}`}
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  {user.kullanici_adi}
                </Link>
              </span>

              <Link
                to="/create"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ✏️ Yeni Yazı
              </Link>

              <button
                onClick={handleLogout}
                className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition"
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-indigo-600 font-medium"
              >
                Giriş Yap
              </Link>
              <Link
                to="/register"
                className="text-gray-700 hover:text-indigo-600 font-medium"
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* SAYFA İÇERİĞİ */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t text-center text-sm text-gray-500 py-4">
        © {new Date().getFullYear()} BlogPlatform. Tüm hakları saklıdır.
      </footer>

    </div>
  );
}
