-- AlterTable
ALTER TABLE "raporlar" ALTER COLUMN "hedef_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "yazi_kategorileri" (
    "id" SERIAL NOT NULL,
    "yazi_id" INTEGER NOT NULL,
    "kategori_id" INTEGER NOT NULL,
    "olusturma_tarihi" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yazi_kategorileri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SifreReset" (
    "id" SERIAL NOT NULL,
    "kullanici_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "son_tarih" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SifreReset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "yazi_kategorileri_yazi_id_kategori_id_key" ON "yazi_kategorileri"("yazi_id", "kategori_id");

-- AddForeignKey
ALTER TABLE "yazi_kategorileri" ADD CONSTRAINT "yazi_kategorileri_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "kategoriler"("kategori_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yazi_kategorileri" ADD CONSTRAINT "yazi_kategorileri_yazi_id_fkey" FOREIGN KEY ("yazi_id") REFERENCES "yazilar"("yazi_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SifreReset" ADD CONSTRAINT "SifreReset_kullanici_id_fkey" FOREIGN KEY ("kullanici_id") REFERENCES "kullanicilar"("kullanici_id") ON DELETE RESTRICT ON UPDATE CASCADE;
