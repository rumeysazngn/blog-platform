"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middlewares/auth");
const slugify_1 = __importDefault(require("slugify"));
const config_1 = require("../config");
const multer_1 = require("../config/multer");
const axios_1 = __importDefault(require("axios"));
const router = (0, express_1.Router)();
const AI_URL = config_1.config.aiServiceUrl;
function cleanHTML(text) {
    return text.replace(/<[^>]+>/g, "").trim();
}
/* ------------------------------------------------------------
   🧠 AI Metin Analizi (Spam/Uygunsuz İçerik)
------------------------------------------------------------- */
async function analyzeText(text) {
    try {
        const res = await axios_1.default.post(`${AI_URL}/analyze`, { text });
        return res.data.label; // spam | hate | adult | normal
    }
    catch (error) {
        console.error("AI analyze error:", error);
        return "normal"; // AI çökse bile kullanıcı engellenmesin
    }
}
/* ------------------------------------------------------------
   📝 YAZI OLUŞTURMA — Çoklu kategori + AI kontrolü
------------------------------------------------------------- */
router.post("/", auth_1.authenticate, multer_1.upload.single("kapak_resmi"), async (req, res) => {
    try {
        const { baslik, alt_baslik, icerik } = req.body;
        const kategori_ids = JSON.parse(req.body.kategori_ids || "[]");
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Kullanıcı oturumu bulunamadı",
            });
        }
        if (!baslik || !icerik) {
            return res.status(400).json({
                success: false,
                message: "Başlık ve içerik zorunludur",
            });
        }
        if (!Array.isArray(kategori_ids) || kategori_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "En az bir kategori seçilmelidir",
            });
        }
        /* ------------------------------------------------------------
     🧠 AI İÇERİK KONTROLÜ
  ------------------------------------------------------------- */
        const rawText = `${baslik} ${alt_baslik || ""} ${icerik}`;
        const cleanText = cleanHTML(rawText);
        console.log("AI RAW INPUT:", rawText);
        console.log("AI CLEAN INPUT:", cleanText);
        const risk = await analyzeText(cleanText);
        console.log("AI OUTPUT (risk):", risk);
        const durum = risk === "normal" ? "yayinda" : "beklemede";
        /* ------------------------------------------------------------
           📝 YAZI KAYDETME + RAPOR OLUŞTURMA
        ------------------------------------------------------------- */
        const baseSlug = (0, slugify_1.default)(baslik, { lower: true, strict: true });
        const result = await prisma_1.default.$transaction(async (tx) => {
            // Slug unique kontrolü
            let slug = baseSlug;
            let i = 1;
            while (await tx.yazi.findUnique({ where: { slug } })) {
                slug = `${baseSlug}-${i++}`;
            }
            let kapak_resmi = null;
            if (req.file)
                kapak_resmi = `/uploads/${req.file.filename}`;
            // Yazıyı oluştur
            const yeniYazi = await tx.yazi.create({
                data: {
                    yazar_id: Number(userId),
                    baslik,
                    alt_baslik,
                    icerik,
                    slug,
                    durum,
                    yayinlanma_tarihi: durum === "yayinda" ? new Date() : null,
                    kapak_resmi,
                },
            });
            console.log("GELEN VERİ:", req.body);
            console.log("KATEGORİ IDS:", req.body.kategori_ids);
            // Kategorileri ekle
            for (const kid of kategori_ids) {
                await tx.yazi_kategorileri.create({
                    data: {
                        yazi_id: yeniYazi.yazi_id,
                        kategori_id: Number(kid),
                    },
                });
            }
            // Eğer risk varsa otomatik rapor oluştur
            let raporKaydi = null;
            if (risk !== "normal") {
                raporKaydi = await tx.raporlar.create({
                    data: {
                        raporlayan_id: userId,
                        yazi_id: yeniYazi.yazi_id,
                        hedef_tur: "yazi",
                        hedef_id: yeniYazi.yazi_id,
                        rapor_neden: risk,
                        aciklama: `AI tarafından otomatik tespit edildi: ${risk}`,
                        durum: "beklemede"
                    },
                });
            }
            return { yeniYazi, raporKaydi };
        });
        res.status(201).json({
            success: true,
            message: durum === "yayinda"
                ? "Yazı başarıyla yayınlandı"
                : "İçerik AI tarafından riskli bulundu ve admin incelemesine gönderildi",
            post: result.yeniYazi,
            rapor: result.raporKaydi,
        });
    }
    catch (error) {
        console.error("Create post error:", error);
        res.status(500).json({
            success: false,
            message: "Yazı oluşturulamadı",
        });
    }
});
/* ------------------------------------------------------------
   🏠 TÜM YAYINDAKİ YAZILAR
------------------------------------------------------------- */
router.get("/", async (_req, res) => {
    try {
        const posts = await prisma_1.default.yazi.findMany({
            where: { durum: "yayinda" },
            orderBy: { yayinlanma_tarihi: "desc" },
            include: {
                kullanicilar: {
                    select: { kullanici_adi: true, tam_ad: true },
                },
                yazi_kategorileri: {
                    include: {
                        kategoriler: true,
                    },
                },
                _count: {
                    select: { begeniler: true, yorumlar: true },
                },
            },
        });
        res.json({ success: true, posts });
    }
    catch (error) {
        console.error("Fetch posts error:", error);
        res.status(500).json({
            success: false,
            message: "Yazılar alınamadı",
        });
    }
});
/* ------------------------------------------------------------
   👤 KULLANICININ KENDİ YAZILARI
------------------------------------------------------------- */
router.get("/my-posts", auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const posts = await prisma_1.default.yazi.findMany({
            where: { yazar_id: userId },
            orderBy: { olusturma_tarihi: "desc" },
            include: {
                yazi_kategorileri: {
                    include: { kategoriler: true },
                },
            },
        });
        res.json({ success: true, posts });
    }
    catch (error) {
        console.error("User posts error:", error);
        res.status(500).json({
            success: false,
            message: "Kullanıcı yazıları alınamadı",
        });
    }
});
/* ------------------------------------------------------------
   ⭐ AI — Collaborative Filtering
------------------------------------------------------------- */
router.get("/recommend/user/:userId", auth_1.authenticate, async (req, res) => {
    try {
        const requestedId = Number(req.params.userId);
        const currentUserId = req.user?.userId;
        if (requestedId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: "Başka kullanıcının önerilerini göremezsiniz",
            });
        }
        const likes = await prisma_1.default.begeni.findMany({
            select: { kullanici_id: true, yazi_id: true },
        });
        const interactions = likes.map((l) => ({
            user_id: l.kullanici_id,
            post_id: l.yazi_id,
            value: 3,
        }));
        const response = await fetch(`${AI_URL}/recommend/collaborative`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: requestedId,
                interactions,
                top_k: 5,
            }),
        });
        const result = (await response.json());
        return res.json({
            success: true,
            recommendations: result.recommended_post_ids,
        });
    }
    catch (error) {
        console.error("Collaborative error:", error);
        res.status(500).json({
            success: false,
            message: "Kullanıcıya özel öneriler getirilemedi",
        });
    }
});
/* ------------------------------------------------------------
   ⭐ AI — Content-Based
------------------------------------------------------------- */
router.get("/:postId/recommend", async (req, res) => {
    try {
        const postId = Number(req.params.postId);
        const posts = await prisma_1.default.yazi.findMany({
            where: { durum: "yayinda" },
            select: { yazi_id: true, baslik: true, icerik: true },
        });
        const formatted = posts.map((p) => ({
            id: p.yazi_id,
            title: p.baslik,
            content: p.icerik,
        }));
        const response = await fetch(`${AI_URL}/recommend/content-based`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                posts: formatted,
                target_post_id: postId,
                top_k: 5,
            }),
        });
        const result = (await response.json());
        res.json({
            success: true,
            recommended: result.recommended_post_ids,
        });
    }
    catch (error) {
        console.error("Content-based error:", error);
        res.status(500).json({
            success: false,
            message: "Öneriler getirilemedi",
        });
    }
});
/* ------------------------------------------------------------
   ✏ YAZI DÜZENLE
------------------------------------------------------------- */
router.put("/:id", auth_1.authenticate, multer_1.upload.single("kapak_resmi"), async (req, res) => {
    try {
        const userId = req.user?.userId;
        const postId = Number(req.params.id);
        const existing = await prisma_1.default.yazi.findUnique({
            where: { yazi_id: postId },
        });
        if (!existing)
            return res.status(404).json({ success: false, message: "Yazı bulunamadı" });
        if (existing.yazar_id !== userId) {
            return res.status(403).json({
                success: false,
                message: "Bu yazıyı düzenleme yetkiniz yok",
            });
        }
        const { baslik, alt_baslik, icerik, durum } = req.body;
        const kategori_ids = JSON.parse(req.body.kategori_ids || "[]");
        let kapak_resmi = existing.kapak_resmi;
        if (req.file)
            kapak_resmi = `/uploads/${req.file.filename}`;
        const updated = await prisma_1.default.$transaction(async (tx) => {
            const yazi = await tx.yazi.update({
                where: { yazi_id: postId },
                data: {
                    baslik,
                    alt_baslik,
                    icerik,
                    durum,
                    kapak_resmi,
                    guncelleme_tarihi: new Date(),
                },
            });
            await tx.yazi_kategorileri.deleteMany({
                where: { yazi_id: postId },
            });
            for (const kid of kategori_ids) {
                await tx.yazi_kategorileri.create({
                    data: { yazi_id: postId, kategori_id: Number(kid) },
                });
            }
            return yazi;
        });
        res.json({ success: true, post: updated });
    }
    catch (error) {
        console.error("Update post error:", error);
        res.status(500).json({
            success: false,
            message: "Düzenleme başarısız",
        });
    }
});
/* ------------------------------------------------------------
   ❌ YAZI SİL
------------------------------------------------------------- */
router.delete("/:id", auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const postId = Number(req.params.id);
        const post = await prisma_1.default.yazi.findUnique({ where: { yazi_id: postId } });
        if (!post)
            return res.status(404).json({ success: false, message: "Yazı bulunamadı" });
        if (post.yazar_id !== userId) {
            return res.status(403).json({
                success: false,
                message: "Bu yazıyı silme yetkiniz yok",
            });
        }
        await prisma_1.default.yazi_kategorileri.deleteMany({
            where: { yazi_id: postId },
        });
        await prisma_1.default.yazi.delete({ where: { yazi_id: postId } });
        res.json({ success: true, message: "Yazı silindi" });
    }
    catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({
            success: false,
            message: "Silme işlemi başarısız",
        });
    }
});
/* ------------------------------------------------------------
   📌 TEK YAZI GETİR (slug/id)
------------------------------------------------------------- */
router.get("/:identifier", async (req, res) => {
    try {
        const { identifier } = req.params;
        const where = isNaN(Number(identifier))
            ? { slug: identifier }
            : { yazi_id: Number(identifier) };
        const post = await prisma_1.default.yazi.findUnique({
            where,
            include: {
                kullanicilar: { select: { kullanici_adi: true, tam_ad: true } },
                yazi_kategorileri: {
                    include: { kategoriler: true },
                },
                _count: { select: { begeniler: true, yorumlar: true } },
            },
        });
        if (!post)
            return res.status(404).json({ success: false, message: "Yazı bulunamadı" });
        res.json({ success: true, post });
    }
    catch (error) {
        console.error("Get single post error:", error);
        res.status(500).json({
            success: false,
            message: "Yazı getirilemedi",
        });
    }
});
exports.default = router;
