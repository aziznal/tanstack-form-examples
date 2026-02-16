# syntax=docker/dockerfile:1.6
FROM node:22.12.0-slim AS base
WORKDIR /app

# corepack for pnpm (version on package.json)
RUN apt-get update && apt-get install -y git curl ca-certificates bash && \
    npm install -g corepack@0.34.5 && \
    corepack enable

FROM base AS build

COPY package.json pnpm-lock.yaml ./
RUN corepack install
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM base AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./

# short interval because traefik proxy downs server until healthy check ...
HEALTHCHECK --interval=10s --timeout=3s \
  CMD curl -f http://localhost:3000/ping || exit 1

EXPOSE 3000

CMD ["pnpm", "run", "start"]


