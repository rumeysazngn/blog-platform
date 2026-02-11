import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || user.rol !== "admin") {
    return (
      <div className="text-center text-red-600 py-10 text-xl">
        ❌ Bu alana erişim izniniz yok.
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* 🔹 Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white p-5 space-y-6">
        <h1 className="text-xl font-bold mb-6">⚙️ Admin Paneli</h1>

        <nav className="flex flex-col gap-3">
          <Link to="/admin" className="hover:text-indigo-300">📊 Dashboard</Link>
          <Link to="/admin/posts" className="hover:text-indigo-300">📝 Yazılar</Link>
          <Link to="/admin/users" className="hover:text-indigo-300">👤 Kullanıcılar</Link>
          <Link to="/admin/categories" className="hover:text-indigo-300">📚 Kategoriler</Link>
          <Link to="/admin/reports" className="hover:text-indigo-300">⚠️ Raporlar</Link>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-10 w-full bg-red-600 py-2 rounded-lg hover:bg-red-700"
        >
          🚪 Çıkış Yap
        </button>
      </aside>

      {/* 🔹 İçerik Alanı */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
