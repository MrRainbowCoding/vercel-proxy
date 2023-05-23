/* eslint no-console: 0 */
const express = require('express');
const next = require('next');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');

dotenv.config();

const proxyConfig = {
  target: process.env.FIREBASE_API_DOMAIN,
  prependPath: true,
  pathRewrite: {
    '^/api': '/',
  },
};

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const server = express();
const app = next({ dev }); // Explicitly initialize next
const handle = app.getRequestHandler();

// IIFE to allow async / await syntax
(async () => {
  try {
    await app.prepare();
    // All routes starting with /api have this proxy middleware applied
    server.use(createProxyMiddleware('/api', proxyConfig));
    server.all('*', (req, res) => handle(req, res));
    server.listen(port, (err) => {
      if (err) {
        throw err;
      }
      console.log(`> Ready on http://localhost:${port}`);
    });
  } catch (err) {
    console.log('An error occurred, unable to start the server');
    console.log(err);
  }
})();
