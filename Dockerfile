FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN rm -rf node_modules/multer/node_modules/busboy
COPY . .
