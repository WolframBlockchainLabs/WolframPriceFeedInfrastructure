FROM node:18-alpine
# RUN npm i -g npm
WORKDIR /app
COPY package*.json ./
RUN npm install
# fix multer issue https://github.com/expressjs/multer/issues/53
RUN rm -rf node_modules/multer/node_modules/busboy
COPY . .

CMD [ "npm", "start"]
