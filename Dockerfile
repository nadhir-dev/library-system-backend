FROM oven/bun:alpine

WORKDIR /app

COPY package*.json ./
RUN bun install

COPY . .

EXPOSE 8000

CMD ["bun", "run", "src/server.ts"]
