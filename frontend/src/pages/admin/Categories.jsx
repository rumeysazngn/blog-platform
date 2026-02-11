import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Plus, Pencil, Trash2, FolderPlus, Search } from "lucide-react";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [search, setSearch] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      if (res.data.success) setCategories(res.data.kategoriler);
    } catch (err) {
      console.error("Kategoriler alınamadı:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const createCategory = async () => {
    if (!newName.trim()) return alert("Kategori adı zorunludur");

    try {
      await api.post("/admin/categories", {
        ad: newName,
        aciklama: newDesc,
      });

      setNewName("");
      setNewDesc("");
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Kategori eklenemedi!");
    }
  };

  const openEdit = (cat) => {
    setEditMode(true);
    setEditingCategory(cat);
  };

  const saveEdit = async () => {
    try {
      await api.put(`/admin/categories/${editingCategory.kategori_id}`, {
        ad: editingCategory.ad,
        aciklama: editingCategory.aciklama,
      });

      setEditMode(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Kategori güncellenemedi!");
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm("Bu kategori silinecek, emin misiniz?")) return;

    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Silme işlemi başarısız");
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.ad.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center bg-white shadow-lg p-6 rounded-2xl">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            📚 Kategori Yönetimi
          </h1>
          <p className="text-gray-500 mt-1">
            Kategorileri yönetin, düzenleyin ve yenilerini ekleyin.
          </p>
        </div>

        <div className="px-4 py-2 bg-indigo-600 text-white rounded-full shadow flex items-center gap-2">
          <FolderPlus size={18} /> Toplam: {categories.length}
        </div>
      </div>

      {/* ADD CATEGORY FORM */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus size={22} className="text-indigo-600" /> Yeni Kategori Ekle
        </h2>

        <input
          type="text"
          placeholder="Kategori adı..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full p-3 border rounded-lg mb-3 focus:outline-indigo-500"
        />

        <textarea
          placeholder="Açıklama (opsiyonel)"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          className="w-full p-3 border rounded-lg mb-3 focus:outline-indigo-500"
        />

        <button
          onClick={createCategory}
          className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow flex items-center gap-2"
        >
          <Plus size={18} /> Ekle
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-md">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Kategori ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 outline-none"
        />
      </div>

      {/* CATEGORY LIST */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Ad</th>
              <th className="p-3 text-left">Slug</th>
              <th className="p-3 text-left">Açıklama</th>
              <th className="p-3 text-left">İşlemler</th>
            </tr>
          </thead>

          <tbody>
            {filteredCategories.map((cat) => (
              <tr key={cat.kategori_id} className="border-b hover:bg-gray-50 transition">
                <td className="p-3">{cat.kategori_id}</td>
                <td className="p-3 font-medium">{cat.ad}</td>
                <td className="p-3 text-gray-600">{cat.slug}</td>
                <td className="p-3 text-gray-600">{cat.aciklama || "—"}</td>

                <td className="p-3 space-x-3 flex">
                  <button
                    onClick={() => openEdit(cat)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-1 hover:bg-blue-700 transition"
                  >
                    <Pencil size={16} /> Düzenle
                  </button>

                  <button
                    onClick={() => deleteCategory(cat.kategori_id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg flex items-center gap-1 hover:bg-red-700 transition"
                  >
                    <Trash2 size={16} /> Sil
                  </button>
                </td>
              </tr>
            ))}

            {filteredCategories.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-500">
                  Kategori bulunamadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editMode && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96 animate-fadeIn">
            <h2 className="text-2xl font-semibold mb-4">Kategori Düzenle</h2>

            <input
              type="text"
              value={editingCategory.ad}
              onChange={(e) =>
                setEditingCategory({ ...editingCategory, ad: e.target.value })
              }
              className="w-full p-3 border rounded-lg mb-3 focus:outline-indigo-500"
            />

            <textarea
              value={editingCategory.aciklama || ""}
              onChange={(e) =>
                setEditingCategory({
                  ...editingCategory,
                  aciklama: e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mb-3 focus:outline-indigo-500"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                İptal
              </button>

              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
