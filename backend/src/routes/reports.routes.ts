import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticate } from "../middlewares/auth";

const router = Router();

/* ----------------------------------------
   📌 Tüm raporları listele (Admin)
------------------------------------------*/
router.get("/", authenticate, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Yetkiniz yok" });
    }

    const reports = await prisma.raporlar.findMany({
      orderBy: { olusturma_tarihi: "desc" },
      include: {
        kullanicilar_raporlar_raporlayan_idTokullanicilar: {
          select: { kullanici_adi: true, email: true },
        },
        yazilar: true,
        yorumlar: true,
      },
    });

    res.json({ success: true, reports });
  } catch (error) {
    console.error("Reports fetch error:", error);
    res.status(500).json({ success: false, message: "Raporlar alınamadı" });
  }
});

/* ----------------------------------------
   📌 Rapor durumunu güncelle
------------------------------------------*/
router.put("/:id", authenticate, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Yetkiniz yok" });
    }

    const reportId = Number(req.params.id);
    const { durum } = req.body;

    const updated = await prisma.raporlar.update({
      where: { rapor_id: reportId },
      data: {
        durum,
        inceleyen_id: req.user.userId,
        cozum_tarihi: new Date(),
      },
    });

    res.json({ success: true, report: updated });
  } catch (error) {
    console.error("Update report error:", error);
    res.status(500).json({ success: false, message: "Rapor güncellenemedi" });
  }
});

/* ----------------------------------------
   📌 Hedef içeriği sil (Yazı/Yorum)
------------------------------------------*/
router.delete("/delete-target/:reportId", authenticate, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Yetkiniz yok" });
    }

    const reportId = Number(req.params.reportId);

    const report = await prisma.raporlar.findUnique({
      where: { rapor_id: reportId },
    });

    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Rapor bulunamadı" });
    }

    if (report.hedef_id == null) {
      return res.status(400).json({
        success: false,
        message: "Raporun bağlı olduğu hedef_id bulunamadı",
      });
    }

    // ⭐ 1) Önce raporu incelendi olarak işaretle
    await prisma.raporlar.update({
      where: { rapor_id: report.rapor_id },
      data: {
        durum: "incelendi",
        inceleyen_id: req.user.userId,
        cozum_tarihi: new Date(),
      },
    });

    // ⭐ 2) Sonra hedef içeriği sil
    if (report.hedef_tur === "yazi") {
      await prisma.yazi.delete({
        where: { yazi_id: report.hedef_id },
      });
    } else if (report.hedef_tur === "yorum") {
      await prisma.yorum.delete({
        where: { yorum_id: report.hedef_id },
      });
    }

    // not: Cascade nedeniyle rapor DB’den uçabilir, bu normal.

    return res.json({
      success: true,
      message: "Hedef içerik silindi ve rapor incelendi olarak işaretlendi",
    });
  } catch (error) {
    console.error("Delete target error:", error);
    res
      .status(500)
      .json({ success: false, message: "Silme işlemi başarısız" });
  }
});

/* ----------------------------------------
   📌 Bir yazıyı şikayet et
------------------------------------------*/
router.post("/post/:postId", authenticate, async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    const userId = req.user!.userId;
    const { neden, aciklama } = req.body;

    const allowed = ["spam", "uygunsuz", "nefret_soylemi", "diger"];
    const cleanReason = allowed.includes(neden) ? neden : "diger";

    const exists = await prisma.yazi.findUnique({ where: { yazi_id: postId } });
    if (!exists) return res.status(404).json({ success: false, message: "Yazı bulunamadı" });

    const rapor = await prisma.raporlar.create({
      data: {
        raporlayan_id: userId,
        hedef_tur: "yazi",
        hedef_id: postId,
        yazi_id: postId,
        rapor_neden: cleanReason,
        aciklama: aciklama || null,
        durum: "beklemede",
      },
    });

    res.json({ success: true, message: "Rapor gönderildi", rapor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Rapor gönderilemedi" });
  }
});


/* ----------------------------------------
   📌 Bir yorumu şikayet et
------------------------------------------*/
router.post("/comment/:commentId", authenticate, async (req, res) => {
  try {
    const commentId = Number(req.params.commentId);
    const userId = req.user!.userId;
    const { neden, aciklama } = req.body;

    // ✔ Allowed values normalize
    const allowed = ["spam", "uygunsuz", "nefret_soylemi", "diger"];
    const cleanReason = allowed.includes(neden) ? neden : "diger";

    // ✔ Yorum var mı?
    const yorum = await prisma.yorum.findUnique({
      where: { yorum_id: commentId },
    });

    if (!yorum) {
      return res.status(404).json({ success: false, message: "Yorum bulunamadı" });
    }

    // ❗❗ EN ÖNEMLİ KISIM ❗❗
    // YORUM RAPORUNDA:
    // yazi_id = NULL
    // yorum_id = commentId
    // CHECK constraint bunu istiyor.
    const rapor = await prisma.raporlar.create({
      data: {
        raporlayan_id: userId,
        hedef_tur: "yorum",
        hedef_id: commentId,
        yorum_id: commentId,  // ✔ Yorum için gerekli
        yazi_id: null,        // ❗ Kesinlikle NULL olmalı
        rapor_neden: cleanReason,
        aciklama: aciklama || null,
        durum: "beklemede",
      },
    });

    return res.json({ success: true, message: "Rapor gönderildi", rapor });
  } catch (err) {
    console.error("Report comment error:", err);
    res.status(500).json({ success: false, message: "Rapor gönderilemedi" });
  }
});


export default router;