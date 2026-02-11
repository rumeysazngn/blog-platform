"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const slugify_1 = __importDefault(require("slugify"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const isAdmin = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Yetkiniz yok",
        });
    }
    next();
};
/* 📌 Yeni kategori ekle */
router.post("/", auth_1.authenticate, isAdmin, async (req, res) => {
    try {
        const { ad, aciklama } = req.body;
        const slug = (0, slugify_1.default)(ad, { lower: true, strict: true });
        const category = await prisma_1.default.kategori.create({
            data: { ad, slug, aciklama },
        });
        res.json({ success: true, category });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Kategori eklenemedi" });
    }
});
/* 📌 Kategori güncelle */
router.put("/:id", auth_1.authenticate, isAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { ad, aciklama } = req.body;
        const slug = (0, slugify_1.default)(ad, { lower: true, strict: true });
        const updated = await prisma_1.default.kategori.update({
            where: { kategori_id: id },
            data: { ad, slug, aciklama },
        });
        res.json({ success: true, category: updated });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Kategori güncellenemedi" });
    }
});
/* 📌 Kategori sil */
router.delete("/:id", auth_1.authenticate, isAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma_1.default.kategori.delete({
            where: { kategori_id: id },
        });
        res.json({ success: true, message: "Kategori silindi" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Silinemedi" });
    }
});
exports.default = router;
