import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import customerRoutes from './routes/customerRoutes';
import userRoutes from './routes/userRoutes';
import taskRoutes from './routes/taskRoutes';
import paymentRoutes from './routes/paymentRoutes';

// Environment variables
dotenv.config();

// Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/payments', paymentRoutes);

// Middleware kısmına ekleyin
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
    params: req.params,
    user: req.user
  });
  next();
});

console.log('MongoDB URI:', process.env.MONGODB_URI);
// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
    console.log('Veritabanı:', mongoose.connection.db.databaseName);
  })
  .catch((error) => {
    console.error('MongoDB bağlantı hatası:', error);
    console.error('Bağlantı URI:', process.env.MONGODB_URI);
  });

// Port
const PORT = process.env.PORT || 5001;

// Server'ı başlat
app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} adresinde çalışıyor`);
});

export default app;