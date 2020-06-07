FROM node:12
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD node login.js
EXPOSE 3001