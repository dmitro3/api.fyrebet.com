const express = require('express');
const app = express();
const port = 8443;
const fs = require('fs');
const https = require('https');
const router = require('./router');


const cookieParser = require('cookie-parser');

const { initializeSocket } = require("./socket");
var serverOptions = {
  key: fs.readFileSync('/etc/cloudflare/teocns.com.key'),
  cert: fs.readFileSync('/etc/cloudflare/teocns.com.pem'),
};

const server = https.createServer(
  serverOptions,
  app,
);



app.use(express.urlencoded({ limit: 10485760 }))
app.use(express.json({ limit: 10485760 }))
const cors = require('cors');



const nodeMyAdmin = require('node-mysql-admin');


const configuration = [
  cookieParser(),
  // express.static('static'),
  cors({
    origin: true,
    credentials: true,
  }),
  nodeMyAdmin(app),
  ('/', router),
];

configuration.map((config) => {
  app.use(config);
});


initializeSocket(server).then(() => {
  server.listen(port);
});


