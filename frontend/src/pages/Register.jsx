import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const payload = {
        email: data.email,
        sifre: data.password,
        kullanici_adi: data.username,
        tam_ad: data.fullname || "",
      };

      await axios.post("http://localhost:5000/api/auth/register", payload);

      // ✅ Kayıt başarılı → Login ekranına yönlendir
      alert("Kayıt başarılı! Giriş yapabilirsiniz.");
      navigate("/login");

    } catch (err) {
      alert(err.response?.data?.message || "Kayıt başarısız.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-600 via-purple-700 to-indigo-800 flex items-center justify-center px-4 relative">

      {/* 🔹 Sol Üst Logo */}
      <img
        src="/logo.png"
        alt="Logo"
        className="absolute top-6 left-6 w-20 h-20 opacity-90"
      />

      {/* 🔹 Orta Kart */}
      <div className="w-full max-w-5xl flex bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">

        {/* 🔹 Sol İllüstrasyon */}
        <div className="hidden md:flex w-1/2 items-center justify-center bg-white/5 border-r border-white/20 p-10">
          <img
            src="/illustration.svg"
            alt="Illustration"
            className="w-96 h-96 drop-shadow-2xl"
          />
        </div>

        {/* 🔹 Sağ Form Alanı */}
        <div className="w-full md:w-1/2 p-10">

          <h1 className="text-3xl font-bold text-white text-center mb-2">
            📝 Kayıt Ol
          </h1>
          <p className="text-center text-white/70 mb-6">
            Hesap oluştur ve blog platformuna katıl.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Kullanıcı Adı */}
            <div>
              <label className="text-white text-sm">Kullanıcı Adı</label>
              <input
                {...register("username", { required: "Kullanıcı adı zorunludur" })}
                className="w-full mt-1 px-4 py-2 bg-white/15 text-white rounded-xl border border-white/30 focus:ring-2 focus:ring-white/70"
                placeholder="rumeysazngn"
              />
              {errors.username && (
                <p className="text-red-300 text-xs mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Tam Ad */}
            <div>
              <label className="text-white text-sm">Tam Ad (Opsiyonel)</label>
              <input
                {...register("fullname")}
                className="w-full mt-1 px-4 py-2 bg-white/15 text-white rounded-xl border border-white/30"
                placeholder="Rümeysa Zengin"
              />
            </div>

            {/* E-posta */}
            <div>
              <label className="text-white text-sm">E-posta</label>
              <input
                type="email"
                {...register("email", { required: "E-posta zorunludur" })}
                className="w-full mt-1 px-4 py-2 bg-white/15 text-white rounded-xl border border-white/30"
                placeholder="ornek@example.com"
              />
              {errors.email && (
                <p className="text-red-300 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Şifre */}
            <div>
              <label className="text-white text-sm">Şifre</label>
              <input
                type="password"
                {...register("password", {
                  required: "Şifre zorunludur",
                  minLength: {
                    value: 6,
                    message: "En az 6 karakter olmalı",
                  },
                })}
                className="w-full mt-1 px-4 py-2 bg-white/15 text-white rounded-xl border border-white/30"
                placeholder="•••••••"
              />
              {errors.password && (
                <p className="text-red-300 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Kayıt Butonu */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-white text-purple-700 font-semibold rounded-xl shadow hover:bg-gray-100 transition disabled:opacity-50"
            >
              {isSubmitting ? "Kaydediliyor..." : "Kayıt Ol"}
            </button>
          </form>

          {/* Giriş Linki */}
          <p className="text-center text-sm text-white/80 mt-6">
            Zaten hesabın var mı?{" "}
            <a href="/login" className="underline font-semibold">
              Giriş Yap
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}
