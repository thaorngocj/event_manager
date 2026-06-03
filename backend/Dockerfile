FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

# Dùng start:prod cho production, start:dev cho development
CMD ["npm", "run", "start:prod"]