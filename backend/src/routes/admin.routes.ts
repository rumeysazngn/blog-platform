import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticate } from "../middlewares/auth";
import { isAdmin } from "../middlewares/admin";

const router = Router();

/* ----------------------------------------
   👑 TÜM KULLANICILAR
----------------------------------------- */
router.get("/users", authenticate, isAdmin, async (_req, res) => {
  try {
    const users = await prisma.kullanici.findMany({
      orderBy: { olusturma_tarihi: "desc" },
      select: {
        kullanici_id: true,
        kullanici_adi: true,
        email: true,
        rol: true,
        aktif_mi: true,
        olusturma_tarihi: true,
      },
    });

    res.json({ success: true, users });
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({
      success: false,
      message: "Kullanıcılar alınamadı",
    });
  }
});

/* ----------------------------------------
   📊 Basit Stats
----------------------------------------- */
router.get("/stats", authenticate, async (req, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Yetkisiz" });
  }

  const users = await prisma.kullanici.count();
  const posts = await prisma.yazi.count();
  const comments = await prisma.yorum.count();
  const likes = await prisma.begeni.count();

  return res.json({
    success: true,
    stats: { users, posts, comments, likes },
  });
});

/* ----------------------------------------
   🔥 ROL GÜNCELLE
----------------------------------------- */
router.put("/users/:id/role", authenticate, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const userId = Number(req.params.id);

    const allowedRoles = ["okuyucu", "yazar", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz rol türü",
      });
    }

    const updatedUser = await prisma.kullanici.update({
      where: { kullanici_id: userId },
      data: { rol: role },
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Admin update role error:", error);
    res.status(500).json({
      success: false,
      message: "Rol güncellenemedi",
    });
  }
});

/* ----------------------------------------
   ❌ KULLANICI SİL
----------------------------------------- */
router.delete("/users/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const existing = await prisma.kullanici.findUnique({
      where: { kullanici_id: userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    await prisma.kullanici.delete({
      where: { kullanici_id: userId },
    });

    res.json({
      success: true,
      message: "Kullanıcı silindi",
    });
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Kullanıcı silinemedi",
    });
  }
});

/* ----------------------------------------
   📌 TÜM YAZILAR (Admin) — Kategorileriyle Birlikte
----------------------------------------- */
router.get("/posts", authenticate, isAdmin, async (_req, res) => {
  try {
    const posts = await prisma.yazi.findMany({
      orderBy: { olusturma_tarihi: "desc" },
      include: {
        kullanicilar: { select: { kullanici_adi: true } },

        // ✔ DOĞRU KATEGORİ İLİŞKİSİ BURADA
        yazi_kategorileri: {
          include: {
            kategoriler: {
              select: { ad: true }
            }
          }
        }
      },
    });

    res.json({ success: true, posts });
  } catch (err) {
    console.error("Admin posts error:", err);
    res.status(500).json({ success: false, message: "Yazılar alınamadı" });
  }
});


/* ----------------------------------------
   ❌ YAZI SİL (Admin)
----------------------------------------- */
router.delete("/posts/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.yazi.delete({
      where: { yazi_id: id },
    });

    res.json({ success: true, message: "Yazı silindi" });
  } catch (err) {
    console.error("Admin delete post error:", err);
    res.status(500).json({ success: false, message: "Silinemedi" });
  }
});

/* ----------------------------------------
   🔄 DURUM GÜNCELLE (yayinda / taslak)
----------------------------------------- */
router.put("/posts/:id/status", authenticate, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { durum } = req.body;

    const updated = await prisma.yazi.update({
      where: { yazi_id: id },
      data: { durum },
    });

    res.json({ success: true, post: updated });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ success: false, message: "Durum güncellenemedi" });
  }
});

/* ----------------------------------------
   ⭐ Admin Dashboard (ürün verisi)
----------------------------------------- */
router.get("/dashboard", authenticate, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Yetkiniz yok" });
    }

    const totalUsers = await prisma.kullanici.count();
    const totalPosts = await prisma.yazi.count();
    const totalComments = await prisma.yorum.count();
    const totalCategories = await prisma.kategori.count();

    const topViewedPosts = await prisma.yazi.findMany({
      orderBy: { goruntulenme_sayisi: "desc" },
      take: 5,
      select: {
        yazi_id: true,
        baslik: true,
        goruntulenme_sayisi: true,
      },
    });

    const topLikedPosts = await prisma.yazi.findMany({
      orderBy: {
        begeniler: { _count: "desc" }
      },
      take: 5,
      select: {
        yazi_id: true,
        baslik: true,
        _count: {
          select: { begeniler: true }
        }
      }
    });


    const lastUsers = await prisma.kullanici.findMany({
      orderBy: { olusturma_tarihi: "desc" },
      take: 5,
      select: {
        kullanici_id: true,
        kullanici_adi: true,
        email: true,
        olusturma_tarihi: true,
      }
    });

    const last7days = await prisma.$queryRaw`
      SELECT 
        to_char(yayinlanma_tarihi, 'YYYY-MM-DD') AS tarih,
        COUNT(*) AS toplam
      FROM yazilar
      WHERE yayinlanma_tarihi >= NOW() - INTERVAL '7 days'
      GROUP BY 1
      ORDER BY 1 ASC;
    `;

    const postsByCategory = await prisma.$queryRaw`
      SELECT 
        k.ad AS kategori,
        COUNT(yk.yazi_id) AS toplam
      FROM kategoriler k
      LEFT JOIN yazi_kategorileri yk 
        ON yk.kategori_id = k.kategori_id
      GROUP BY k.ad
      ORDER BY toplam DESC;
    `;


    const announcements = [
      { id: 1, text: "Sistem güncellemesi 02.12.2025'te yapılacaktır." },
      { id: 2, text: "Yeni moderasyon kuralları yayınlandı." },
      { id: 3, text: "AI öneri sistemi geliştirildi." },
    ];

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalPosts,
        totalComments,
        totalCategories,
        topViewedPosts,
        topLikedPosts,
        lastUsers,
        last7days,
        postsByCategory,
        announcements,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Dashboard verisi alınamadı",
    });
  }
});

export default router;
