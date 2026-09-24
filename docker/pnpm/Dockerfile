FROM node:22-alpine

WORKDIR /app

COPY . .

RUN corepack enable

RUN pnpm install

COPY . .

CMD ["pnpm", "exec", "wxt", "dev", "-b", "firefox", "--host", "0.0.0.0"]