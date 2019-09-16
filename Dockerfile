FROM node:10

WORKDIR /app
COPY package.json /app
RUN npm install

COPY /src /app/src
COPY /public-static /app/public-static

CMD node app.js
EXPOSE 3000

# make image : docker build -t dosi.v1 .
# run container : docker run --network="host" --name dosi.v1.c -e PORT=3000 -p 3000:3000 dosi.v1 
# run container : docker run --name dosi.v1.c -e PORT=3000 -p 3000:3000 dosi.v1 
# show logs : docker logs dosi.v1.c