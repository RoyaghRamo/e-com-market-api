FROM node:18.16.0-bullseye-slim as builder

WORKDIR /app

COPY package*.json ./
COPY . .

RUN npm install -g npm@^9.6.5
RUN npm install -g @nestjs/cli@^9.4.2
RUN npm cache clean --force

RUN npm install

RUN npm run build

FROM node:18.16.0-bullseye-slim as production

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
