#
# SPDX-License-Identifier: Apache-2.0
#
FROM node:16 AS builder

WORKDIR /usr/src/app

# Copy node.js source and build, changing owner as well
COPY --chown=node:node . /usr/src/app
RUN npm ci && npm run build

# Bundle app source


FROM node:16 AS production

# Setup tini to work better handle signals
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini


WORKDIR /usr/src/app
COPY --chown=node:node --from=builder /usr/src/app/dist    ./dist
COPY --chown=node:node --from=builder /usr/src/app/static  ./static
COPY --chown=node:node --from=builder /usr/src/app/views   ./views
COPY --chown=node:node --from=builder /usr/src/app/package.json ./
COPY --chown=node:node --from=builder /usr/src/app/npm-shrinkwrap.json ./
COPY --chown=node:node docker/docker-entrypoint.sh /usr/src/app/docker-entrypoint.sh
RUN npm install
RUN chown node:node /usr/src/app

COPY --chown=node:node hyperledgendary-runhfsc-0.0.5.tgz .
RUN npm i -g hyperledgendary-runhfsc-0.0.5.tgz

ENV PORT 4000
EXPOSE 4000
ENV NODE_ENV=production

USER node
ENTRYPOINT [ "/tini", "--", "/usr/src/app/docker-entrypoint.sh" ]
