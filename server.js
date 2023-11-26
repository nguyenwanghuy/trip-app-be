import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes/index.js';
import { Server } from 'socket.io';
import http from 'http';
import { connectToDatabase } from './configs/db.js';
import { errorHandlerMiddleware } from './middlewares/error.middleware.js';

const app = express();
const PORT = 8001;

const whitelist = ['http://localhost:3000'];

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
//http server
const server = http.createServer(app);
//socket
const io = new Server(server, {
  cors: corsOptions,
});
io.on('connection', (socket) => {
  // console.log('client connected', socket.id)
  //handle like
  socket.on('like', (data) => {
    // console.log(data);
    io.emit('like', data);
  });
  
  //disconnect
  socket.on('disconnect', () => {
    // console.log('client disconnected')
  });
});
// connect to database
connectToDatabase();
//middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
//routing
app.use('/trip', router);
//Error handler
app.use(errorHandlerMiddleware);

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
