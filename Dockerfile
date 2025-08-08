# Gunakan image Node.js resmi
FROM node:18-alpine

# Set direktori kerja
WORKDIR /app

# Salin semua file
COPY . .

# Install dependensi
RUN npm install

# Buka port (opsional untuk dev)
EXPOSE 3000

# Jalankan React App
CMD ["npm", "start", "--", "--host", "0.0.0.0"]