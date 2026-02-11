"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
/**  Giriş yapmış kullanıcı kendi profilini görsün */
router.get("/me", auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const user = await prisma_1.default.kullanici.findUnique({
            where: { kullanici_id: userId },
            select: {
                kullanici_id: true,
                email: true,
                kullanici_adi: true,
                tam_ad: true,
                rol: true,
                olusturma_tarihi: true,
                biyografi: true,
                profil_pic: true,
            },
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
        }
        res.json({ success: true, user });
    }
    catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({ success: false, message: "Sunucu hatası" });
    }
});
/** 🧩 👤 Profil düzenleme */
router.put("/me", auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { tam_ad, biyografi, profil_pic } = req.body;
        const updatedUser = await prisma_1.default.kullanici.update({
            where: { kullanici_id: userId },
            data: {
                tam_ad,
                biyografi,
                profil_pic,
                guncellenme_tarihi: new Date(),
            },
            select: {
                kullanici_id: true,
                kullanici_adi: true,
                tam_ad: true,
                email: true,
                biyografi: true,
                profil_pic: true,
            },
        });
        res.json({ success: true, user: updatedUser });
    }
    catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ success: false, message: "Profil güncellenemedi" });
    }
});
exports.default = router;
