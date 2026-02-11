import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

// TipTap imports
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// Icons
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  Quote,
  Code,
} from "lucide-react";

export default function CreatePost() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    baslik: "",
    alt_baslik: "",
  });

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // ⭐ Kategori sistemimiz
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(""); // TEK kategori ID
  const [isOpen, setIsOpen] = useState(false); // Dropdown kontrolü

  // ⭐ KATEGORİLERİ YÜKLE
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        if (res.data.success) setCategories(res.data.kategoriler);
      } catch (err) {
        console.error("Kategori yüklenemedi:", err);
      }
    };

    fetchCategories();
  }, []);

  // ⭐ TipTap Editör
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
  });

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // ⭐ FORM SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editor) return;

    // ❗ Kategori seçimi kontrolü
    if (!selectedCategory || isNaN(Number(selectedCategory))) {
      alert("Lütfen bir kategori seçin!");
      return;
    }

    const kategoriArray = [Number(selectedCategory)];

    console.log("SEÇİLEN KATEGORİ:", selectedCategory);
    console.log("GÖNDERİLEN KATEGORİ ARRAY:", kategoriArray);

    const formData = new FormData();
    formData.append("baslik", form.baslik);
    formData.append("alt_baslik", form.alt_baslik || "");
    formData.append("icerik", editor.getHTML());
    formData.append("kategori_ids", JSON.stringify(kategoriArray));

    if (coverFile) {
      formData.append("kapak_resmi", coverFile);
    }

    try {
      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Yazı başarıyla oluşturuldu!");
      navigate("/");
    } catch (err) {
      console.error("Create error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Bir hata oluştu.");
    }
  };

  if (!editor) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-16 px-4">
      <div className="max-w-4xl mx-auto backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl shadow-xl">

        <h1 className="text-3xl font-bold text-center mb-8">✍️ Yeni Yazı Oluştur</h1>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Kapak Resmi */}
          <div className="space-y-3">
            <label className="text-lg font-medium">Kapak Resmi</label>

            <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Kapak"
                  className="mx-auto max-h-64 rounded-xl object-cover"
                />
              ) : (
                <p className="text-white/70">Resim seçilmedi</p>
              )}

              <label className="mt-4 inline-block cursor-pointer bg-cyan-600 px-5 py-2 rounded-lg font-semibold hover:bg-cyan-700 transition">
                Resim Seç
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              </label>
            </div>
          </div>

          {/* Başlık */}
          <div>
            <label className="block text-lg mb-1">Başlık</label>
            <input
              type="text"
              value={form.baslik}
              onChange={(e) => setForm({ ...form, baslik: e.target.value })}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
              required
            />
          </div>

          {/* Alt Başlık */}
          <div>
            <label className="block text-lg mb-1">Alt Başlık</label>
            <input
              type="text"
              value={form.alt_baslik}
              onChange={(e) => setForm({ ...form, alt_baslik: e.target.value })}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
            />
          </div>

          {/* ⭐ CUSTOM KATEGORİ DROPDOWN */}
          <div className="relative">
            <label className="block text-lg mb-1">Kategori</label>

            <div
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 cursor-pointer flex justify-between items-center"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span>
                {selectedCategory
                  ? categories.find((c) => c.kategori_id == selectedCategory)?.ad
                  : "Kategori seçin"}
              </span>
              <span className="text-white text-sm">▼</span>
            </div>

            {isOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-[#1b1a2e] border border-white/20 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 animate-fadeIn">

                {categories.length === 0 ? (
                  <p className="p-3 text-gray-400 text-sm">Yükleniyor...</p>
                ) : (
                  categories.map((cat) => (
                    <div
                      key={cat.kategori_id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory(String(cat.kategori_id));
                        setIsOpen(false);
                      }}
                      className="px-4 py-3 text-white hover:bg-purple-600/40 cursor-pointer transition"
                    >
                      {cat.ad}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ⭐ TipTap Toolbar */}
          <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-black/20 border border-white/10">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`toolbar-btn ${editor.isActive("bold") ? "active" : ""}`}>
              <Bold size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`toolbar-btn ${editor.isActive("italic") ? "active" : ""}`}>
              <Italic size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`toolbar-btn ${editor.isActive("heading", { level: 1 }) ? "active" : ""}`}>
              <Heading1 size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`toolbar-btn ${editor.isActive("heading", { level: 2 }) ? "active" : ""}`}>
              <Heading2 size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`toolbar-btn ${editor.isActive("bulletList") ? "active" : ""}`}>
              <List size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`toolbar-btn ${editor.isActive("blockquote") ? "active" : ""}`}>
              <Quote size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`toolbar-btn ${editor.isActive("codeBlock") ? "active" : ""}`}>
              <Code size={18} />
            </button>
          </div>

          {/* ⭐ Editör */}
          <div className="rounded-xl bg-white/10 border border-white/20 p-4">
            <EditorContent editor={editor} />
          </div>

          {/* Gönder Butonu */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold hover:opacity-90 transition"
          >
            Kaydet
          </button>
        </form>
      </div>

      {/* Animasyon */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }

        .toolbar-btn {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 6px 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          color: white;
          transition: 0.2s;
        }
        .toolbar-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        .toolbar-btn.active {
          background: #06b6d4;
          border-color: #0891b2;
        }
      `}</style>
    </div>
  );
}
