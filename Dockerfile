FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia TODO el código (incluyendo tests)
COPY . .

# Instala TODAS las dependencias (incluyendo devDependencies para tests)
RUN npm ci

# Expone el puerto
EXPOSE 8080

# Comando para iniciar la aplicación
CMD ["node", "index.js"]