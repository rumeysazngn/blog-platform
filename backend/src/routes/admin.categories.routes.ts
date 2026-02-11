import { Router } from "express";
import prisma from "../lib/prisma";
import slugify from "slugify";
import { authenticate } from "../middlewares/auth";

const router = Router();

// Admin kontrolü
import { Request, Response, NextFunction } from "express";

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Yetkiniz yok",
    });
  }

  next();
};


/* 📌 Yeni kategori ekle */
router.post("/", authenticate, isAdmin, async (req, res) => {
  try {
    const { ad, aciklama } = req.body;

    const slug = slugify(ad, { lower: true, strict: true });

    const category = await prisma.kategori.create({
      data: { ad, slug, aciklama },
    });

    res.json({ success: true, category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Kategori eklenemedi" });
  }
});

/* 📌 Kategori güncelle */
router.put("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { ad, aciklama } = req.body;

    const slug = slugify(ad, { lower: true, strict: true });

    const updated = await prisma.kategori.update({
      where: { kategori_id: id },
      data: { ad, slug, aciklama },
    });

    res.json({ success: true, category: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Kategori güncellenemedi" });
  }
});

/* 📌 Kategori sil */
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.kategori.delete({
      where: { kategori_id: id },
    });

    res.json({ success: true, message: "Kategori silindi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Silinemedi" });
  }
});

export default router;
