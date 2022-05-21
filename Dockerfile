FROM node:16.13.0
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --production
COPY dist dist
CMD ["node", "dist/src/index.js"]