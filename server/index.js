// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser')
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET','POST'] }
});

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'));


app.get('/',(req,res)=>{
  res.status(200).send({message:"Server running.."})
})

app.use('/api/auth', require('./routes/auth'));

app.use('/api/boards', require('./routes/boards'));

require('./socket/canvas')(io);

server.listen(process.env.PORT, () =>
  console.log('Server running on port', process.env.PORT));