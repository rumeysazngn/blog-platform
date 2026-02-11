# Node backend için
FROM node:20

# Çalışma dizini
WORKDIR /app

# Paketleri yükle
COPY package*.json ./
RUN npm install

# Kaynak dosyaları kopyala
COPY . .

# Prisma client dosyalarını build aşamasında oluştur
RUN npx prisma generate


# Port ve çalıştırma komutu
EXPOSE 5000
CMD ["npm", "run", "dev"]


