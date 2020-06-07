FROM node:12
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
Export ACCESS_TOKEN_SECRET=b3276aa57f0d539defc9f330f5ac3c251e48841bc68990c7ec9cca1d4014e3cd772e4368ab9cfcd3b81656dd5bea6296574af586e6ecf3681da87809cddbc1a1
CMD node login.js
EXPOSE 3001
