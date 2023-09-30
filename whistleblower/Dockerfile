FROM node:18 as build

WORKDIR /app
COPY . /app

RUN npm install

EXPOSE 5173

CMD ["yarn", "run", "dev"]
