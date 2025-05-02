FROM node:22.13.1-alpine

RUN apk add --no-cache openssl

COPY package*.json ./

COPY . .

RUN npm install

ENTRYPOINT ["sh", "-c", "npm run build && npm run start"]