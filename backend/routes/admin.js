const express = require('express');
const router = express.Router();
const pool = require('../db');
const { logAction } = require('../logger');

// Логин администратора
router.post('/login', (req, res) => {
    const { login, password } = req.body;
    if (login === process.env.ADMIN_LOGIN && password === process.env.ADMIN_PASSWORD) {
        logAction('admin_login', null, login);
        res.json({ success: true });
    } else {
        logAction('admin_login_failed', { attempt: login }, null);
        res.status(401).json({ error: 'Неверный логин или пароль' });
    }
});

// Получить все заявки
router.get('/feedback', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM feedback ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обновить статус заявки
router.patch('/feedback/:id', async (req, res) => {
    const { id } = req.params;
    const { status, admin } = req.body;
    try {
        await pool.query('UPDATE feedback SET status = $1 WHERE id = $2', [status, id]);
        logAction('feedback_status_updated', { id, status }, admin);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удалить заявку
router.delete('/feedback/:id', async (req, res) => {
    const { id } = req.params;
    const { admin } = req.body;
    try {
        await pool.query('DELETE FROM feedback WHERE id = $1', [id]);
        logAction('feedback_deleted', { id }, admin);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить все отзывы (включая pending)
router.get('/reviews', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обновить статус отзыва (опубликовать/скрыть)
router.patch('/reviews/:id', async (req, res) => {
    const { id } = req.params;
    const { status, admin } = req.body;
    try {
        await pool.query('UPDATE reviews SET status = $1 WHERE id = $2', [status, id]);
        logAction('review_status_updated', { id, status }, admin);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удалить отзыв
router.delete('/reviews/:id', async (req, res) => {
    const { id } = req.params;
    const { admin } = req.body;
    try {
        await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
        logAction('review_deleted', { id }, admin);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;