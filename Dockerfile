FROM node:16.13.0
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --production
COPY src src
RUN yarn build
EXPOSE 6379
CMD ["node", "dist/src/index.js"]