const express = require('express');
const app = express();
const { models: { User }} = require('./db');
const path = require('path');

require('dotenv').config();

// middleware
app.use(express.json());

// Headers to the response of the server to avoid caching
app.use((req, res, next) => {
    console.log('Middleware function called');
    console.log('Request headers:', req.headers);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

// routes
app.get('/', (req, res)=> res.sendFile(path.join(__dirname, 'index.html')));

app.post('/api/auth', async(req, res, next)=> {
  try {
    res.send({ token: await User.authenticate(req.body)});
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/auth', async (req, res, next) => {
    console.log('Request headers:', req.headers); // log the headers

    console.log('Inside /api/auth route');
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new Error('Authorization header is missing');
      }
  
      const token = authHeader.split(' ')[1];
  
      const user = await User.byToken(token);
  
      res.send(user);
    } catch (err) {
      const error = new Error(err.message || 'bad credentials');
      error.status = err.status || 401;
      next(error);
    }
  });
  

// error handling
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;