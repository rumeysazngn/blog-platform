"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
/** ----------------------------------------------
 *   📝 1) Yorum Oluştur (Auth Required)
 * ---------------------------------------------- */
router.post("/post/:key", auth_1.authenticate, async (req, res) => {
    try {
        const { key } = req.params;
        const { yorum_icerigi, ust_yorum_id } = req.body;
        const userId = req.user?.userId;
        if (!yorum_icerigi?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Yorum boş olamaz"
            });
        }
        // slug veya id ile yazıyı bul
        const post = await prisma_1.default.yazi.findFirst({
            where: isNaN(Number(key)) ? { slug: key } : { yazi_id: Number(key) },
            select: { yazi_id: true }
        });
        if (!post)
            return res.status(404).json({
                success: false,
                message: "Yazı bulunamadı"
            });
        const yorum = await prisma_1.default.yorum.create({
            data: {
                yazi_id: post.yazi_id,
                yazar_id: userId,
                ust_yorum_id: ust_yorum_id ?? null,
                yorum_icerigi
            },
            include: {
                kullanicilar: {
                    select: {
                        kullanici_id: true,
                        kullanici_adi: true,
                        tam_ad: true,
                        profil_pic: true
                    }
                }
            }
        });
        return res.status(201).json({ success: true, yorum });
    }
    catch (err) {
        console.error("Yorum oluşturma hatası:", err);
        return res.status(500).json({
            success: false,
            message: "Yorum eklenemedi"
        });
    }
});
/** ----------------------------------------------
 *   📚 2) Yorumları Getir (Public)
 * ---------------------------------------------- */
router.get("/post/:key", async (req, res) => {
    try {
        const { key } = req.params;
        const post = await prisma_1.default.yazi.findFirst({
            where: isNaN(Number(key)) ? { slug: key } : { yazi_id: Number(key) },
            select: { yazi_id: true }
        });
        if (!post)
            return res.status(404).json({
                success: false,
                message: "Yazı bulunamadı"
            });
        const comments = await prisma_1.default.yorum.findMany({
            where: { yazi_id: post.yazi_id },
            orderBy: { olusturma_tarihi: "desc" },
            include: {
                kullanicilar: {
                    select: {
                        kullanici_id: true,
                        kullanici_adi: true,
                        tam_ad: true,
                        profil_pic: true
                    }
                }
            }
        });
        return res.json({ success: true, comments });
    }
    catch (err) {
        console.error("Yorumlar alınamadı:", err);
        return res.status(500).json({
            success: false,
            message: "Yorumlar getirilemedi"
        });
    }
});
/** ----------------------------------------------
 *   🗑️ 3) Yorum Sil (Sadece kendi yorumunu)
 * ---------------------------------------------- */
router.delete("/:id", auth_1.authenticate, async (req, res) => {
    try {
        const yorumId = Number(req.params.id);
        const userId = req.user?.userId;
        const yorum = await prisma_1.default.yorum.findUnique({
            where: { yorum_id: yorumId }
        });
        if (!yorum)
            return res.status(404).json({
                success: false,
                message: "Yorum bulunamadı"
            });
        if (yorum.yazar_id !== userId)
            return res.status(403).json({
                success: false,
                message: "Bu yorumu silmeye yetkiniz yok"
            });
        await prisma_1.default.yorum.delete({ where: { yorum_id: yorumId } });
        return res.json({
            success: true,
            message: "Yorum silindi"
        });
    }
    catch (err) {
        console.error("Yorum silme hatası:", err);
        return res.status(500).json({
            success: false,
            message: "Silme işlemi başarısız"
        });
    }
});
exports.default = router;
