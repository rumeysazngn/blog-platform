"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middlewares/auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
/** Yardımcı: slug → id çevirme */
async function getPostId(postParam) {
    if (Number.isNaN(Number(postParam))) {
        const post = await prisma_1.default.yazi.findUnique({
            where: { slug: postParam },
            select: { yazi_id: true },
        });
        if (!post)
            throw new Error("NOT_FOUND");
        return post.yazi_id;
    }
    return Number(postParam);
}
/**
 * 👍 GET — Yazının beğeni sayısı (herkese açık)
 *    Eğer token varsa → liked: true/false döner
 */
router.get("/post/:postId", async (req, res) => {
    const { postId: postParam } = req.params;
    try {
        const postId = await getPostId(postParam);
        // Beğeni sayısı
        const count = await prisma_1.default.begeni.count({ where: { yazi_id: postId } });
        // Kullanıcı giriş yapmış mı?
        let liked = false;
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith("Bearer ")) {
            try {
                const token = authHeader.split(" ")[1];
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                const userId = decoded.userId;
                const existing = await prisma_1.default.begeni.findUnique({
                    where: {
                        kullanici_id_yazi_id: {
                            kullanici_id: Number(userId),
                            yazi_id: postId,
                        },
                    },
                });
                liked = !!existing;
            }
            catch (e) {
                // token geçersiz ise hata vermiyoruz → sadece liked=false kalacak
            }
        }
        return res.json({ success: true, count, liked });
    }
    catch (error) {
        if (error.message === "NOT_FOUND") {
            return res.status(404).json({ success: false, message: "Yazı bulunamadı" });
        }
        console.error("Get likes error:", error);
        return res.status(500).json({ success: false, message: "Beğeni bilgisi alınamadı" });
    }
});
/**
 * 💖 POST — Toggle Like (Sadece giriş yapmış kullanıcı)
 */
router.post("/post/:postId/toggle", auth_1.authenticate, async (req, res) => {
    const { postId: postParam } = req.params;
    const userId = req.user?.userId;
    if (!userId)
        return res.status(401).json({ success: false, message: "Kullanıcı oturumu bulunamadı" });
    try {
        const postId = await getPostId(postParam);
        const existing = await prisma_1.default.begeni.findUnique({
            where: {
                kullanici_id_yazi_id: {
                    kullanici_id: Number(userId),
                    yazi_id: postId,
                },
            },
        });
        if (existing) {
            await prisma_1.default.begeni.delete({ where: { begeni_id: existing.begeni_id } });
            return res.json({ success: true, liked: false });
        }
        await prisma_1.default.begeni.create({
            data: { kullanici_id: Number(userId), yazi_id: postId },
        });
        return res.json({ success: true, liked: true });
    }
    catch (error) {
        if (error.message === "NOT_FOUND")
            return res.status(404).json({ success: false, message: "Yazı bulunamadı" });
        console.error("Toggle like error:", error);
        return res.status(500).json({ success: false, message: "Beğeni işlemi başarısız" });
    }
});
exports.default = router;
