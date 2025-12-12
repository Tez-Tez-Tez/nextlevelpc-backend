FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm ci --only=production

# Copia el resto del código
COPY . .

# Expone el puerto (ajusta si usas otro puerto)
EXPOSE 8080

# Comando para iniciar la aplicación
CMD ["node", "index.js"]