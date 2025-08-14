# Gebruik 'n slim Node-beeld om te bou
FROM node:20-alpine AS builder

WORKDIR /app

# Kopieer package files en installeer dependencies
COPY package*.json ./
RUN npm install

# Kopieer res van jou app en bou dit
COPY . .
RUN npm run build

# Gebruik 'n baie klein beeld om die geboude static site te bedien
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Verwyder default nginx statiese inhoud
RUN rm -rf ./*

# Kopieer die geboude site uit die 'builder' stage
COPY --from=builder /app/dist .

# Kopieer jou eie nginx konfig indien nodig (opsioneel)
# COPY nginx.conf /etc/nginx/nginx.conf

# Standaardpoort
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
