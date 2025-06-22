FROM node:22-alpine
RUN npm install -g @angular/cli@20.0.0
COPY . /app
WORKDIR /app
RUN npm install
RUN npm run build
