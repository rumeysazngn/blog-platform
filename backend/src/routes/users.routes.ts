import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticate } from "../middlewares/auth";

const router = Router();

/**  Giriş yapmış kullanıcı kendi profilini görsün */
router.get("/me", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;

    const user = await prisma.kullanici.findUnique({
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
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
});

/** 🧩 👤 Profil düzenleme */
router.put("/me", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { tam_ad, biyografi, profil_pic } = req.body;

    const updatedUser = await prisma.kullanici.update({
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
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ success: false, message: "Profil güncellenemedi" });
  }
});

export default router;
