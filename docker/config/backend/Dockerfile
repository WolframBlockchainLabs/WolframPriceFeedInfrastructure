FROM --platform=linux/amd64 node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the source code
COPY . .

ARG PORT=8000
ENV PORT=${PORT}

EXPOSE ${PORT}

CMD [ "npm", "start" ]
