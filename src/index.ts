import express, { json, urlencoded } from 'express';
import http from 'http';
import mongoose from 'mongoose';
import 'dotenv/config';
import router from './router';
import cors from 'cors';

const app = express();

app.use(cors({
  credentials: true,
}));

// app.use(compression());
// app.use(bodyParser.json());
app.use(json());
app.use(urlencoded({ extended: true }));

const server = http.createServer(app);

const port = process.env.PORT;

server.listen(port, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${port}`);
});

const MONGO_URL = process.env.MONGO_URI;

mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on('error', (error: Error) => console.log(error));

app.use('/', router());