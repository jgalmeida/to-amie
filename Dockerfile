# Builder
FROM node:20-alpine as builder

# Exposed http port
EXPOSE 3000

# Install build deps
RUN apk --no-cache add --virtual build-deps python3 make g++

RUN mkdir -p /opt/amie-api && chown node:node /opt/amie-api
WORKDIR /opt/amie-api

# Don't run as root
USER node

# Install deps and clean npm cache
COPY --chown=node:node package.json package-lock.json /opt/amie-api/
RUN npm i

# Copy all other files
COPY --chown=node:node . /opt/amie-api
# Build .js files
RUN npm run build

# Production
ENV NODE_ENV=live

# Production
CMD ["node", "dist/src/bin/index.js"]