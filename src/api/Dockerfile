FROM node:20-alpine

WORKDIR /app

RUN corepack enable

# Copy build folder (contains package.json + compiled code)
COPY build .

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

ENV PORT=8000
EXPOSE 8000

CMD ["node", "bin/server.js"]
