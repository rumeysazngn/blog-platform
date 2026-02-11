import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", data);
      console.log("LOGIN RESPONSE:", res.data);


      localStorage.setItem("token", res.data.token);
      console.log("TOKEN SAVE TEST:", localStorage.getItem("token"));
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/");
    } catch (err) {
      alert("Giriş başarısız. Bilgileri kontrol edin.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 px-4 relative">

      {/* 🔹 Sol Üst Logo */}
      <img
        src="/logo.png"
        alt="Logo"
        className="absolute top-6 left-6 w-16 h-16 opacity-90"
      />

      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-10 animate-fadeIn">

        {/* 🔹 Form Üstü Orta Logo (opsiyonel) */}
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Logo" className="w-20 h-20 drop-shadow-lg" />
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Giriş Yap
        </h1>
        <p className="text-center text-white/70 mb-6">
          Hesabına giriş yap ve devam et.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* E-posta */}
          <div>
            <label className="text-white text-sm">E-posta</label>
            <input
              type="email"
              {...register("email", { required: "E-posta zorunludur" })}
              className="w-full mt-1 px-4 py-2 bg-white/15 text-white rounded-xl border border-white/30 focus:ring-2 focus:ring-white/70"
              placeholder="ornek@example.com"
            />
            {errors.email && (
              <p className="text-red-300 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Şifre */}
          <div>
            <label className="text-white text-sm">Şifre</label>
            <input
              type="password"
              {...register("sifre", { required: "Şifre zorunludur" })}
              className="w-full mt-1 px-4 py-2 bg-white/15 text-white rounded-xl border border-white/30 focus:ring-2 focus:ring-white/70"
              placeholder="••••••••"
            />
          </div>

          {/* Buton */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-white text-purple-700 font-semibold rounded-xl shadow hover:bg-gray-100 transition disabled:opacity-50"
          >
            {isSubmitting ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p className="text-center text-sm text-white/80 mt-6">
          Henüz hesabın yok mu?{" "}
          <a href="/register" className="underline font-semibold">
            Kayıt Ol
          </a>
        </p>
      </div>
    </div>
  );
}
