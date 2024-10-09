require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const customerRoutes = require('./routes/customerRoutes'); // Bu satırı ekleyin

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/customers', customerRoutes); // Bu satırı ekleyin

const PORT = process.env.PORT || 3001;
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Bir şeyler ters gitti!', 
    error: process.env.NODE_ENV === 'production' ? {} : err 
  });
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));