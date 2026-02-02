# FROM oven/bun:latest

# COPY package.json ./
# COPY bun.lock ./

# RUN bun install

# COPY . .

# EXPOSE 3000

# RUN ["bun", "run", "build"]
# CMD ["bun", "run", "start:prod"]

FROM oven/bun:latest

WORKDIR /app

COPY package.json ./
COPY bun.lock ./

RUN bun install

COPY dist ./dist

EXPOSE 3000

CMD ["bun", "dist/src/main"]