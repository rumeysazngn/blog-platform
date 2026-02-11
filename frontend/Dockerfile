# React frontend için
FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Nginx ile serve et
FROM nginx:latest
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
