import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

// TipTap
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

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    baslik: "",
    alt_baslik: "",
    durum: "taslak",
  });

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [oldCover, setOldCover] = useState(null);

  const [loading, setLoading] = useState(true);

  // TipTap Editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[300px] py-4 px-3 focus:outline-none",
      },
    },
  });

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      if (!editor) return;

      try {
        const res = await api.get(`/posts/${id}`);
        const post = res.data.post;

        setForm({
          baslik: post.baslik,
          alt_baslik: post.alt_baslik || "",
          durum: post.durum,
        });

        editor.commands.setContent(post.icerik);

        if (post.kapak_resmi) {
          const fullUrl = `http://localhost:5000${post.kapak_resmi}`;
          setOldCover(fullUrl);
          setCoverPreview(fullUrl);
        }

      } catch (err) {
        console.error("Yazı yüklenemedi:", err);
        alert("Yazı yüklenemedi!");

        const localUser = JSON.parse(localStorage.getItem("user") || "{}");
        navigate(`/profile/${localUser.kullanici_id || 1}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, editor, navigate]);

  // New cover handler
  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Toggle durum
  const toggleDurum = () => {
    setForm((prev) => ({
      ...prev,
      durum: prev.durum === "yayinlandi" ? "taslak" : "yayinlandi",
    }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editor) return;

    const htmlContent = editor.getHTML();

    const formData = new FormData();
    formData.append("baslik", form.baslik);
    formData.append("alt_baslik", form.alt_baslik);
    formData.append("icerik", htmlContent);
    formData.append("durum", form.durum);

    if (coverFile) {
      formData.append("kapak_resmi", coverFile);
    }

    try {
      await api.put(`/posts/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✔ Yazı başarıyla güncellendi!");

      const localUser = JSON.parse(localStorage.getItem("user"));
      navigate(`/profile/${localUser.kullanici_id}`);

    } catch (err) {
      console.error("Güncelleme hatası:", err);
      alert("⚠ Güncelleme başarısız!");
    }
  };

  if (loading || !editor) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white py-16 px-4">

      <div className="max-w-4xl mx-auto backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-8">✏️ Yazıyı Düzenle</h1>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Cover Image */}
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
                Yeni Resim Seç
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              </label>
            </div>
          </div>

          {/* Başlık */}
          <div>
            <label className="block text-lg mb-1">Başlık</label>
            <input
              type="text"
              name="baslik"
              value={form.baslik}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
              required
            />
          </div>

          {/* Alt Başlık */}
          <div>
            <label className="block text-lg mb-1">Alt Başlık</label>
            <input
              type="text"
              name="alt_baslik"
              value={form.alt_baslik}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
            />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-black/20 border border-white/10">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className="toolbar-btn">
              <Bold size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className="toolbar-btn">
              <Italic size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="toolbar-btn">
              <Heading1 size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="toolbar-btn">
              <Heading2 size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className="toolbar-btn">
              <List size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className="toolbar-btn">
              <Quote size={18} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="toolbar-btn">
              <Code size={18} />
            </button>
          </div>

          {/* Editor */}
          <div className="rounded-xl bg-white/10 border border-white/20 p-4">
            <EditorContent editor={editor} />
          </div>

          {/* Publish status */}
          <div className="flex items-center justify-between mt-6">
            <span className="text-white/80 font-medium">Yayın Durumu:</span>
            <button
              type="button"
              onClick={toggleDurum}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                form.durum === "yayinlandi"
                  ? "bg-green-500/80 hover:bg-green-600"
                  : "bg-gray-500/60 hover:bg-gray-600"
              }`}
            >
              {form.durum === "yayinlandi" ? "✅ Yayında" : "🕓 Taslak"}
            </button>
          </div>

          {/* Save */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold hover:opacity-90 transition"
          >
            💾 Kaydet
          </button>
        </form>
      </div>

      {/* Toolbar CSS */}
      <style>{`
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
        .toolbar-btn.active {
          background: #06b6d4;
          border-color: #0891b2;
        }
      `}</style>
    </div>
  );
}
