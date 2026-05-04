// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser')
require('dotenv').config();
const helmet = require('helmet');
const removeUnverifiedAccount = require('./Automation/unverifiedaccounts')
const app = express();
const server = http.createServer(app);
// app.use(cors());
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] , credentials: true}
});

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(helmet())

const mongo = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
  })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.log('MongoDB Connection Error', error));
}
mongo();
removeUnverifiedAccount();
app.get('/', (req, res) => {
  res.status(200).send({ message: "Server running.." })
})

app.use('/api/auth', require('./routes/auth'));

app.use('/api/boards', require('./routes/boards'));

require('./socket/canvas')(io);

server.listen(process.env.PORT, () =>
  console.log('Server running on port', process.env.PORT));