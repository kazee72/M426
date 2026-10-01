FROM node:22-alpine

WORKDIR /app

COPY . .

RUN corepack enable
RUN pnpm install

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]