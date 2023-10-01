FROM node:18 as build

WORKDIR /app
COPY package.json ./

RUN yarn install

COPY . /app

EXPOSE 5173

CMD ["npm", "run", "dev"]
