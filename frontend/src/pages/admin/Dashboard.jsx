import { useEffect, useState } from "react";
import api from "../../api/axios";

// ChartJS
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const res = await api.get("/admin/dashboard");
      if (res.data.success) setStats(res.data.stats);
    };
    loadData();
  }, []);

  if (!stats)
    return (
      <p className="p-6 animate-pulse text-gray-500 text-lg">Yükleniyor...</p>
    );

  return (
    <div className="p-6 space-y-12">

      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            📊 Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-2">
            Sistem durumu, içerik aktiviteleri ve kullanıcı etkileşimleri.
          </p>
        </div>

        <span className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg">
          Yönetim Paneli
        </span>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Kullanıcı" value={stats.totalUsers} icon="👤" gradient="from-blue-500 to-blue-700" />
        <StatCard title="Yazı" value={stats.totalPosts} icon="📝" gradient="from-purple-500 to-indigo-600" />
        <StatCard title="Yorum" value={stats.totalComments} icon="💬" gradient="from-green-500 to-emerald-600" />
        <StatCard title="Kategori" value={stats.totalCategories} icon="🏷️" gradient="from-pink-500 to-rose-600" />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="🥧 Kategori Dağılımı">
          <CategoryPieChart data={stats.postsByCategory} />
        </ChartCard>

        <ChartCard title="📅 Haftalık Yazı Aktivitesi">
          <WeeklyPostChart data={stats.last7days} />
        </ChartCard>
      </div>

      {/* LISTS */}
      <ModernSection title="🔥 En Çok Okunan Yazılar">
        {stats.topViewedPosts.map((p) => (
          <ModernListItem
            key={p.yazi_id}
            name={p.baslik}
            value={`${p.goruntulenme_sayisi} görüntüleme`}
            icon="📈"
          />
        ))}
      </ModernSection>

      <ModernSection title="❤️ En Çok Beğenilen Yazılar">
        {stats.topLikedPosts.map((p) => (
          <ModernListItem
            key={p.yazi_id}
            name={p.baslik}
            value={`${p._count?.begeniler || 0} beğeni`}
            icon="👍"
          />
        ))}
      </ModernSection>

      <ModernSection title="🕵️ Son Kayıt Olan Kullanıcılar">
        {stats.lastUsers.map((u) => (
          <ModernListItem
            key={u.kullanici_id}
            name={u.kullanici_adi}
            value={u.email}
            icon="👤"
          />
        ))}
      </ModernSection>

      <ModernSection title="📢 Admin Duyuruları">
        {stats.announcements.map((a) => (
          <ModernListItem key={a.id} name={a.text} icon="📌" />
        ))}
      </ModernSection>
    </div>
  );
}

/* -----------------------------------------
   Modern Stat Card
------------------------------------------ */
function StatCard({ title, value, icon, gradient }) {
  return (
    <div
      className={`bg-gradient-to-r ${gradient} text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-4xl font-bold mt-3">{value}</p>
    </div>
  );
}

/* -----------------------------------------
   Chart Wrapper
------------------------------------------ */
function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}

/* -----------------------------------------
   Pie Chart
------------------------------------------ */
function CategoryPieChart({ data }) {
  console.log("Pie RAW:", data);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return <p className="text-gray-500">Veri yok</p>;
  }

  // Backend formatını normalize et
  const labels = data.map((d) =>
    typeof d.kategori === "string"
      ? d.kategori
      : d.kategori?.ad ?? "Bilinmeyen"
  );

  const values = data.map((d) => Number(d.toplam) || 0);

  console.log("Parsed labels:", labels);
  console.log("Parsed values:", values);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "#4F46E5",
          "#EC4899",
          "#06B6D4",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
          "#14B8A6",
        ],
      },
    ],
  };

  return (
    <div style={{ height: "350px" }}>
      <Pie data={chartData} />
    </div>
  );
}

/* -----------------------------------------
   Bar Chart
------------------------------------------ */
function WeeklyPostChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.tarih),
    datasets: [
      {
        label: "Günlük Yayınlanan Yazı",
        data: data.map((d) => d.toplam),
        backgroundColor: "#6366F1",
      },
    ],
  };

  return <Bar data={chartData} />;
}

/* -----------------------------------------
   Section Wrapper
------------------------------------------ */
function ModernSection({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-indigo-500">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

/* -----------------------------------------
   List Item
------------------------------------------ */
function ModernListItem({ name, value, icon }) {
  return (
    <div className="flex items-center justify-between p-3 border-b hover:bg-gray-50 rounded-lg transition">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="font-medium text-gray-800">{name}</span>
      </div>
      {value && <span className="text-gray-600 font-semibold">{value}</span>}
    </div>
  );
}
