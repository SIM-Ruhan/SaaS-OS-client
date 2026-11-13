import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import shopsRouter from './routes/shops.js';

const app = express();

app.use(cors({ origin: process.env.BETTER_AUTH_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/shops', shopsRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ShopOS backend running on port ${PORT}`);
});