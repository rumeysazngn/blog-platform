"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
// Tüm kategoriler
router.get("/", async (req, res) => {
    try {
        const kategoriler = await prisma_1.default.kategori.findMany();
        return res.json({ success: true, kategoriler });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: "Kategori alınamadı" });
    }
});
// ⭐ Tek kategori (ID ile)
router.get("/:id", async (req, res) => {
    try {
        const kategori_id = Number(req.params.id);
        // Kategoriyi getir
        const kategori = await prisma_1.default.kategori.findUnique({
            where: { kategori_id },
        });
        if (!kategori) {
            return res.json({ success: false, message: "Kategori bulunamadı" });
        }
        // BU ÖNEMLİ: Çoklu kategori tablosundan yazıları çekiyoruz
        const yazilar = await prisma_1.default.yazi.findMany({
            where: {
                yazi_kategorileri: {
                    some: { kategori_id }
                },
                durum: "yayinda",
            },
            include: {
                kullanicilar: { select: { kullanici_adi: true } },
                yazi_kategorileri: {
                    include: { kategoriler: true },
                },
            },
            orderBy: { yayinlanma_tarihi: "desc" },
        });
        return res.json({
            success: true,
            kategori,
            yazilar,
        });
    }
    catch (err) {
        console.error("Kategori yüklenemedi:", err);
        return res.status(500).json({
            success: false,
            message: "Kategori getirilemedi",
        });
    }
});
exports.default = router;
