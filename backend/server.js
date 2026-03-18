const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const feedbackRoutes = require('./routes/feedback');
const reviewsRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());                  // разрешаем кросс-доменные запросы
app.use(express.json());          // парсим JSON тела запросов
app.use(express.urlencoded({ extended: true }));

// Статические файлы для админки (будут доступны по /admin)
app.use('/admin', express.static(path.join(__dirname, 'public')));

// Подключаем маршруты API
app.use('/api/feedback', feedbackRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/admin', adminRoutes);

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});