-- CreateTable
CREATE TABLE "kullanicilar" (
    "kullanici_id" SERIAL NOT NULL,
    "kullanici_adi" VARCHAR(50) NOT NULL,
    "tam_ad" VARCHAR(100),
    "email" VARCHAR(100) NOT NULL,
    "biyografi" TEXT,
    "profil_pic" VARCHAR(255),
    "sifre" VARCHAR(255) NOT NULL,
    "rol" VARCHAR(20) DEFAULT 'okuyucu',
    "aktif_mi" BOOLEAN DEFAULT true,
    "son_giris_tarihi" TIMESTAMP(6),
    "dogrulanmis_mi" BOOLEAN DEFAULT false,
    "olusturma_tarihi" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "guncellenme_tarihi" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kullanicilar_pkey" PRIMARY KEY ("kullanici_id")
);

-- CreateTable
CREATE TABLE "yazilar" (
    "yazi_id" SERIAL NOT NULL,
    "yazar_id" INTEGER NOT NULL,
    "kategori_id" INTEGER,
    "baslik" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(250) NOT NULL,
    "alt_baslik" VARCHAR(300),
    "icerik" TEXT NOT NULL,
    "kapak_resmi" VARCHAR(500),
    "durum" VARCHAR(20) DEFAULT 'taslak',
    "okuma_suresi" INTEGER,
    "goruntulenme_sayisi" INTEGER DEFAULT 0,
    "begeni_sayisi" INTEGER DEFAULT 0,
    "yorum_sayisi" INTEGER DEFAULT 0,
    "onecikartilmis_mi" BOOLEAN DEFAULT false,
    "yayinlanma_tarihi" TIMESTAMP(6),
    "olusturma_tarihi" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "guncelleme_tarihi" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yazilar_pkey" PRIMARY KEY ("yazi_id")
);

-- CreateTable
CREATE TABLE "yorumlar" (
    "yorum_id" SERIAL NOT NULL,
    "yazi_id" INTEGER NOT NULL,
    "yazar_id" INTEGER NOT NULL,
    "ust_yorum_id" INTEGER,
    "yorum_icerigi" TEXT NOT NULL,
    "begeni_sayisi" INTEGER DEFAULT 0,
    "duzenlendi_mi" BOOLEAN DEFAULT false,
    "silindi_mi" BOOLEAN DEFAULT false,
    "olusturma_tarihi" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "guncelleme_tarihi" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yorumlar_pkey" PRIMARY KEY ("yorum_id")
);

-- CreateTable
CREATE TABLE "kategoriler" (
    "kategori_id" SERIAL NOT NULL,
    "ad" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "aciklama" TEXT,
    "ikon" VARCHAR(100),
    "siralama" INTEGER DEFAULT 0,
    "olusturma_tarihi" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kategoriler_pkey" PRIMARY KEY ("kategori_id")
);

-- CreateTable
CREATE TABLE "etiketler" (
    "etiket_id" SERIAL NOT NULL,
    "etiket_adi" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "kullanim_sayisi" INTEGER DEFAULT 0,
    "olusturma_tarihi" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etiketler_pkey" PRIMARY KEY ("etiket_id")
);

-- CreateTable
CREATE TABLE "begeniler" (
    "begeni_id" SERIAL NOT NULL,
    "kullanici_id" INTEGER NOT NULL,
    "yazi_id" INTEGER,
    "yorum_id" INTEGER,
    "olusturma_tarihi" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "begeniler_pkey" PRIMARY KEY ("begeni_id")
);

-- CreateTable
CREATE TABLE "takipler" (
    "takip_id" SERIAL NOT NULL,
    "takipci_id" INTEGER NOT NULL,
    "takip_edilen_id" INTEGER NOT NULL,
    "olusturma_tarihi" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "takipler_pkey" PRIMARY KEY ("takip_id")
);

-- CreateTable
CREATE TABLE "bildirimler" (
    "bildirim_id" SERIAL NOT NULL,
    "kullanici_id" INTEGER NOT NULL,
    "tetikleyen_kullanici_id" INTEGER,
    "bildirim_turu" VARCHAR(50) NOT NULL,
    "yazi_id" INTEGER,
    "yorum_id" INTEGER,
    "okundu_mu" BOOLEAN DEFAULT false,
    "olusturma_tarihi" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bildirimler_pkey" PRIMARY KEY ("bildirim_id")
);

-- CreateTable
CREATE TABLE "kullanici_aktivite_loglari" (
    "log_id" SERIAL NOT NULL,
    "kullanici_id" INTEGER NOT NULL,
    "aktivite_turu" VARCHAR(50) NOT NULL,
    "yazi_id" INTEGER,
    "kategori_id" INTEGER,
    "olusturma_tarihi" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kullanici_aktivite_loglari_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "okuma_listeleri" (
    "liste_id" SERIAL NOT NULL,
    "kullanici_id" INTEGER NOT NULL,
    "yazi_id" INTEGER NOT NULL,
    "okundu_mu" BOOLEAN DEFAULT false,
    "olusturma_tarihi" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okuma_listeleri_pkey" PRIMARY KEY ("liste_id")
);

-- CreateTable
CREATE TABLE "raporlar" (
    "rapor_id" SERIAL NOT NULL,
    "raporlayan_id" INTEGER NOT NULL,
    "yazi_id" INTEGER,
    "yorum_id" INTEGER,
    "hedef_tur" VARCHAR(20) NOT NULL,
    "hedef_id" INTEGER NOT NULL,
    "rapor_neden" VARCHAR(50) NOT NULL,
    "aciklama" TEXT,
    "durum" VARCHAR(20) DEFAULT 'beklemede',
    "inceleyen_id" INTEGER,
    "olusturma_tarihi" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "cozum_tarihi" TIMESTAMP(6),

    CONSTRAINT "raporlar_pkey" PRIMARY KEY ("rapor_id")
);

-- CreateTable
CREATE TABLE "yazi_etiketleri" (
    "yazi_etiket_id" SERIAL NOT NULL,
    "yazi_id" INTEGER NOT NULL,
    "etiket_id" INTEGER NOT NULL,
    "olusturma_tarihi" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yazi_etiketleri_pkey" PRIMARY KEY ("yazi_etiket_id")
);

-- CreateTable
CREATE TABLE "yazi_onerileri" (
    "oneri_id" SERIAL NOT NULL,
    "yazi_id" INTEGER NOT NULL,
    "onerilen_yazi_id" INTEGER NOT NULL,
    "benzerlik_skoru" DECIMAL(5,4),
    "olusturma_tarihi" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yazi_onerileri_pkey" PRIMARY KEY ("oneri_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kullanicilar_kullanici_adi_key" ON "kullanicilar"("kullanici_adi");

-- CreateIndex
CREATE UNIQUE INDEX "kullanicilar_email_key" ON "kullanicilar"("email");

-- CreateIndex
CREATE INDEX "idx_kullanicilar_email" ON "kullanicilar"("email");

-- CreateIndex
CREATE INDEX "idx_kullanicilar_kullanici_adi" ON "kullanicilar"("kullanici_adi");

-- CreateIndex
CREATE INDEX "idx_kullanicilar_rol" ON "kullanicilar"("rol");

-- CreateIndex
CREATE UNIQUE INDEX "yazilar_slug_key" ON "yazilar"("slug");

-- CreateIndex
CREATE INDEX "idx_yazilar_begeni" ON "yazilar"("begeni_sayisi" DESC);

-- CreateIndex
CREATE INDEX "idx_yazilar_durum" ON "yazilar"("durum");

-- CreateIndex
CREATE INDEX "idx_yazilar_goruntulenme" ON "yazilar"("goruntulenme_sayisi" DESC);

-- CreateIndex
CREATE INDEX "idx_yazilar_kategori" ON "yazilar"("kategori_id");

-- CreateIndex
CREATE INDEX "idx_yazilar_slug" ON "yazilar"("slug");

-- CreateIndex
CREATE INDEX "idx_yazilar_yayinlanma" ON "yazilar"("yayinlanma_tarihi" DESC);

-- CreateIndex
CREATE INDEX "idx_yazilar_yazar" ON "yazilar"("yazar_id");

-- CreateIndex
CREATE INDEX "idx_yorumlar_olusturma" ON "yorumlar"("olusturma_tarihi" DESC);

-- CreateIndex
CREATE INDEX "idx_yorumlar_ust_yorum" ON "yorumlar"("ust_yorum_id");

-- CreateIndex
CREATE INDEX "idx_yorumlar_yazar" ON "yorumlar"("yazar_id");

-- CreateIndex
CREATE INDEX "idx_yorumlar_yazi" ON "yorumlar"("yazi_id");

-- CreateIndex
CREATE UNIQUE INDEX "kategoriler_ad_key" ON "kategoriler"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "kategoriler_slug_key" ON "kategoriler"("slug");

-- CreateIndex
CREATE INDEX "idx_kategoriler_slug" ON "kategoriler"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "etiketler_etiket_adi_key" ON "etiketler"("etiket_adi");

-- CreateIndex
CREATE UNIQUE INDEX "etiketler_slug_key" ON "etiketler"("slug");

-- CreateIndex
CREATE INDEX "idx_etiketler_ad" ON "etiketler"("etiket_adi");

-- CreateIndex
CREATE INDEX "idx_etiketler_kullanim" ON "etiketler"("kullanim_sayisi" DESC);

-- CreateIndex
CREATE INDEX "idx_begeniler_kullanici" ON "begeniler"("kullanici_id");

-- CreateIndex
CREATE INDEX "idx_begeniler_yazi" ON "begeniler"("yazi_id");

-- CreateIndex
CREATE INDEX "idx_begeniler_yorum" ON "begeniler"("yorum_id");

-- CreateIndex
CREATE UNIQUE INDEX "begeniler_kullanici_id_yazi_id_key" ON "begeniler"("kullanici_id", "yazi_id");

-- CreateIndex
CREATE UNIQUE INDEX "begeniler_kullanici_id_yorum_id_key" ON "begeniler"("kullanici_id", "yorum_id");

-- CreateIndex
CREATE INDEX "idx_takipler_takip_edilen" ON "takipler"("takip_edilen_id");

-- CreateIndex
CREATE INDEX "idx_takipler_takipci" ON "takipler"("takipci_id");

-- CreateIndex
CREATE UNIQUE INDEX "takipler_takipci_id_takip_edilen_id_key" ON "takipler"("takipci_id", "takip_edilen_id");

-- CreateIndex
CREATE INDEX "idx_bildirimler_kullanici" ON "bildirimler"("kullanici_id");

-- CreateIndex
CREATE INDEX "idx_bildirimler_okundu" ON "bildirimler"("okundu_mu");

-- CreateIndex
CREATE INDEX "idx_bildirimler_olusturma" ON "bildirimler"("olusturma_tarihi" DESC);

-- CreateIndex
CREATE INDEX "idx_aktivite_loglari_kullanici" ON "kullanici_aktivite_loglari"("kullanici_id");

-- CreateIndex
CREATE INDEX "idx_aktivite_loglari_olusturma" ON "kullanici_aktivite_loglari"("olusturma_tarihi" DESC);

-- CreateIndex
CREATE INDEX "idx_aktivite_loglari_tur" ON "kullanici_aktivite_loglari"("aktivite_turu");

-- CreateIndex
CREATE INDEX "idx_okuma_listeleri_kullanici" ON "okuma_listeleri"("kullanici_id");

-- CreateIndex
CREATE INDEX "idx_okuma_listeleri_yazi" ON "okuma_listeleri"("yazi_id");

-- CreateIndex
CREATE UNIQUE INDEX "okuma_listeleri_kullanici_id_yazi_id_key" ON "okuma_listeleri"("kullanici_id", "yazi_id");

-- CreateIndex
CREATE INDEX "idx_raporlar_durum" ON "raporlar"("durum");

-- CreateIndex
CREATE INDEX "idx_raporlar_yazi" ON "raporlar"("yazi_id");

-- CreateIndex
CREATE INDEX "idx_raporlar_yorum" ON "raporlar"("yorum_id");

-- CreateIndex
CREATE INDEX "idx_yazi_etiketleri_etiket" ON "yazi_etiketleri"("etiket_id");

-- CreateIndex
CREATE INDEX "idx_yazi_etiketleri_yazi" ON "yazi_etiketleri"("yazi_id");

-- CreateIndex
CREATE UNIQUE INDEX "yazi_etiketleri_yazi_id_etiket_id_key" ON "yazi_etiketleri"("yazi_id", "etiket_id");

-- CreateIndex
CREATE INDEX "idx_yazi_onerileri_skor" ON "yazi_onerileri"("benzerlik_skoru" DESC);

-- CreateIndex
CREATE INDEX "idx_yazi_onerileri_yazi" ON "yazi_onerileri"("yazi_id");

-- CreateIndex
CREATE UNIQUE INDEX "yazi_onerileri_yazi_id_onerilen_yazi_id_key" ON "yazi_onerileri"("yazi_id", "onerilen_yazi_id");

-- AddForeignKey
ALTER TABLE "yazilar" ADD CONSTRAINT "yazilar_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "kategoriler"("kategori_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yazilar" ADD CONSTRAINT "yazilar_yazar_id_fkey" FOREIGN KEY ("yazar_id") REFERENCES "kullanicilar"("kullanici_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yorumlar" ADD CONSTRAINT "yorumlar_ust_yorum_id_fkey" FOREIGN KEY ("ust_yorum_id") REFERENCES "yorumlar"("yorum_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yorumlar" ADD CONSTRAINT "yorumlar_yazar_id_fkey" FOREIGN KEY ("yazar_id") REFERENCES "kullanicilar"("kullanici_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yorumlar" ADD CONSTRAINT "yorumlar_yazi_id_fkey" FOREIGN KEY ("yazi_id") REFERENCES "yazilar"("yazi_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "begeniler" ADD CONSTRAINT "begeniler_kullanici_id_fkey" FOREIGN KEY ("kullanici_id") REFERENCES "kullanicilar"("kullanici_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "begeniler" ADD CONSTRAINT "begeniler_yazi_id_fkey" FOREIGN KEY ("yazi_id") REFERENCES "yazilar"("yazi_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "begeniler" ADD CONSTRAINT "begeniler_yorum_id_fkey" FOREIGN KEY ("yorum_id") REFERENCES "yorumlar"("yorum_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "takipler" ADD CONSTRAINT "takipler_takip_edilen_id_fkey" FOREIGN KEY ("takip_edilen_id") REFERENCES "kullanicilar"("kullanici_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "takipler" ADD CONSTRAINT "takipler_takipci_id_fkey" FOREIGN KEY ("takipci_id") REFERENCES "kullanicilar"("kullanici_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bildirimler" ADD CONSTRAINT "bildirimler_kullanici_id_fkey" FOREIGN KEY ("kullanici_id") REFERENCES "kullanicilar"("kullanici_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bildirimler" ADD CONSTRAINT "bildirimler_tetikleyen_kullanici_id_fkey" FOREIGN KEY ("tetikleyen_kullanici_id") REFERENCES "kullanicilar"("kullanici_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bildirimler" ADD CONSTRAINT "bildirimler_yazi_id_fkey" FOREIGN KEY ("yazi_id") REFERENCES "yazilar"("yazi_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bildirimler" ADD CONSTRAINT "bildirimler_yorum_id_fkey" FOREIGN KEY ("yorum_id") REFERENCES "yorumlar"("yorum_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "kullanici_aktivite_loglari" ADD CONSTRAINT "kullanici_aktivite_loglari_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "kategoriler"("kategori_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "kullanici_aktivite_loglari" ADD CONSTRAINT "kullanici_aktivite_loglari_kullanici_id_fkey" FOREIGN KEY ("kullanici_id") REFERENCES "kullanicilar"("kullanici_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "kullanici_aktivite_loglari" ADD CONSTRAINT "kullanici_aktivite_loglari_yazi_id_fkey" FOREIGN KEY ("yazi_id") REFERENCES "yazilar"("yazi_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "okuma_listeleri" ADD CONSTRAINT "okuma_listeleri_kullanici_id_fkey" FOREIGN KEY ("kullanici_id") REFERENCES "kullanicilar"("kullanici_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "okuma_listeleri" ADD CONSTRAINT "okuma_listeleri_yazi_id_fkey" FOREIGN KEY ("yazi_id") REFERENCES "yazilar"("yazi_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "raporlar" ADD CONSTRAINT "raporlar_inceleyen_id_fkey" FOREIGN KEY ("inceleyen_id") REFERENCES "kullanicilar"("kullanici_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "raporlar" ADD CONSTRAINT "raporlar_raporlayan_id_fkey" FOREIGN KEY ("raporlayan_id") REFERENCES "kullanicilar"("kullanici_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "raporlar" ADD CONSTRAINT "raporlar_yazi_id_fkey" FOREIGN KEY ("yazi_id") REFERENCES "yazilar"("yazi_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "raporlar" ADD CONSTRAINT "raporlar_yorum_id_fkey" FOREIGN KEY ("yorum_id") REFERENCES "yorumlar"("yorum_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yazi_etiketleri" ADD CONSTRAINT "yazi_etiketleri_etiket_id_fkey" FOREIGN KEY ("etiket_id") REFERENCES "etiketler"("etiket_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yazi_etiketleri" ADD CONSTRAINT "yazi_etiketleri_yazi_id_fkey" FOREIGN KEY ("yazi_id") REFERENCES "yazilar"("yazi_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yazi_onerileri" ADD CONSTRAINT "yazi_onerileri_onerilen_yazi_id_fkey" FOREIGN KEY ("onerilen_yazi_id") REFERENCES "yazilar"("yazi_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yazi_onerileri" ADD CONSTRAINT "yazi_onerileri_yazi_id_fkey" FOREIGN KEY ("yazi_id") REFERENCES "yazilar"("yazi_id") ON DELETE CASCADE ON UPDATE NO ACTION;
