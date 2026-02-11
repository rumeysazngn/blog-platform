"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * 🧾 Kullanıcı Kayıt İşlemi
 */
const register = async (req, res) => {
    try {
        const { email, sifre, kullanici_adi, tam_ad } = req.body;
        // 1️⃣ Girdi doğrulama
        if (!email || !sifre || !kullanici_adi) {
            return res.status(400).json({
                success: false,
                message: "Email, şifre ve kullanıcı adı gereklidir",
            });
        }
        // 2️⃣ Şifreyi hashle
        const hashedPassword = await bcrypt_1.default.hash(sifre, 10);
        // 3️⃣ Yeni kullanıcı oluştur
        const user = await prisma_1.default.kullanici.create({
            data: {
                email,
                sifre: hashedPassword,
                kullanici_adi,
                tam_ad: tam_ad || null,
                rol: "okuyucu",
                aktif_mi: true,
                dogrulanmis_mi: false,
            },
            select: {
                kullanici_id: true,
                email: true,
                kullanici_adi: true,
                tam_ad: true,
                rol: true,
                olusturma_tarihi: true,
            },
        });
        return res.status(201).json({
            success: true,
            message: "Kayıt başarılı",
            user,
        });
    }
    catch (error) {
        console.error("Register error:", error);
        // 🔁 Duplicate email / username
        if (error.code === "P2002") {
            return res.status(400).json({
                success: false,
                message: "Bu email veya kullanıcı adı zaten kullanımda",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Kayıt sırasında bir hata oluştu",
        });
    }
};
exports.register = register;
/**
 * 🔐 Kullanıcı Giriş İşlemi
 */
const login = async (req, res) => {
    try {
        const { email, sifre } = req.body;
        // 1️⃣ Girdi doğrulama
        if (!email || !sifre) {
            return res.status(400).json({
                success: false,
                message: "Email ve şifre gereklidir",
            });
        }
        // 2️⃣ Kullanıcıyı bul
        const user = await prisma_1.default.kullanici.findUnique({
            where: { email },
            select: {
                kullanici_id: true,
                email: true,
                kullanici_adi: true,
                tam_ad: true,
                sifre: true,
                rol: true,
                aktif_mi: true,
                dogrulanmis_mi: true,
            },
        });
        console.log("DEBUG USER:", user);
        console.log("USER ID TYPE:", user ? typeof user.kullanici_id : "USER NULL");
        console.log("RAW USER:", JSON.stringify(user, null, 2));
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Geçersiz email veya şifre",
            });
        }
        // 3️⃣ Kullanıcı aktif mi kontrolü
        if (!user.aktif_mi) {
            return res.status(403).json({
                success: false,
                message: "Hesabınız aktif değil",
            });
        }
        // 4️⃣ Şifre doğrulaması
        const isValidPassword = await bcrypt_1.default.compare(sifre, user.sifre);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: "Geçersiz email veya şifre",
            });
        }
        // 5️⃣ Son giriş tarihini güncelle
        await prisma_1.default.kullanici.update({
            where: { kullanici_id: user.kullanici_id },
            data: { son_giris_tarihi: new Date() },
        });
        // 6️⃣ JWT oluştur (TypeScript'e tam uyumlu)
        const jwtSecret = process.env.JWT_SECRET || "super-secret-change-this";
        // expiresIn değeri sayı veya string olabilir, her iki durumda da cast ederek güvenceye alıyoruz
        const expiresInValue = process.env.JWT_EXPIRES_IN && !isNaN(Number(process.env.JWT_EXPIRES_IN))
            ? Number(process.env.JWT_EXPIRES_IN)
            : (process.env.JWT_EXPIRES_IN || "7d");
        const signOptions = {
            expiresIn: expiresInValue, // 👈 tüm TS sürümlerinde hatasız çalışır
        };
        const token = jsonwebtoken_1.default.sign({
            userId: user.kullanici_id,
            email: user.email,
            role: user.rol,
        }, jwtSecret, signOptions);
        // 7️⃣ Parolayı yanıttan çıkar
        const { sifre: _, ...userWithoutPassword } = user;
        return res.status(200).json({
            success: true,
            message: "Giriş başarılı",
            token,
            user: userWithoutPassword,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Giriş sırasında bir hata oluştu",
        });
    }
};
exports.login = login;
/**
 * 🚪 Kullanıcı Çıkış İşlemi
 */
const logout = async (_req, res) => {
    // Eğer cookie tabanlı JWT kullanıyorsan burada clearCookie() yapılabilir.
    return res.status(200).json({
        success: true,
        message: "Çıkış başarılı",
    });
};
exports.logout = logout;
