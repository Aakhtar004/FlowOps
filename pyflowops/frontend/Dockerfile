# Configuración multi-stage para desarrollo y producción
FROM node:18-alpine as base

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY vite.config.js ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Etapa de desarrollo
FROM base as development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Etapa de construcción
FROM base as build
RUN npm run build

# Etapa de producción
FROM nginx:alpine as production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
