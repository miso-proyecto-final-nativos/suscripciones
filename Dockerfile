FROM node:18-alpine3.16 AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

CMD ["node", "dist/main"]