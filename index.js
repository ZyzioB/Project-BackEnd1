import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UsersRouter from './routes/users.js';
import ItemsRouter from './routes/items.js';
import OrdersRouter from './routes/orders.js';
import { logger } from './middleware/logger.js';

dotenv.config();

const databaseUrl = process.env.MONGO_URI;
const port = process.env.PORT;
const PORT = 3000;
const DATABASE_URL = 'mongodb://localhost:27017/projekt1'; 

const server = express();

server.use(logger);
server.use('/users/singleEndpointMiddleware', (req, res, next) => {
  console.log('single endpoint');
  next();
});

server.get('/', (req, res) => {
  res.send('Hello world!');
});

server.use(express.json());
server.use('/users', UsersRouter);
server.use('/items', ItemsRouter);
server.use('/orders', OrdersRouter);

server.listen(PORT, async () => {
  console.log(`Server listens on port ${PORT}`);
  try {
    await mongoose.connect(DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log(`Database connected at URL ${DATABASE_URL}`);
  } catch (error) {
    console.log('Database connection error:', error);
  }
});
