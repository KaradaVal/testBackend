# Dockerfile di ./backend/Dockerfile

# Gunakan image Node untuk menjalankan server Express
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Server Express Anda mungkin berjalan di port 3000 atau 5000
# Sesuaikan port ini jika perlu
EXPOSE 3000

# Ganti 'index.js' dengan nama file server utama Anda
CMD ["node", "app.js"]