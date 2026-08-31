# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS build

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN apt-get update \
  && apt-get install --yes --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

RUN npm install --global pnpm@11.10.0

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/runable/package.json packages/runable/package.json
COPY website/package.json website/package.json

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm config set store-dir /pnpm/store \
  && pnpm install --filter runable-website... --frozen-lockfile

COPY packages/runable packages/runable
COPY website website

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm --filter runable build \
  && pnpm --filter runable-website run website:app:build \
  && pnpm --filter runable-website run website:build \
  && pnpm --filter runable-website deploy --prod --legacy /runtime \
  && pnpm --filter runable deploy --prod --legacy /runable-runtime \
  && rm -f /runtime/.env /runtime/.env.* \
  && rm -f /runtime/node_modules/runable \
  && mv /runable-runtime /runtime/node_modules/runable

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV RUNABLE_MODE=production
ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app/website

COPY --from=build --chown=node:node /runtime ./

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/api/health').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

CMD ["node", ".output/runtime/start.mjs"]
