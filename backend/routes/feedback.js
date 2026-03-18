const express = require('express');
const router = express.Router();
const pool = require('../db');
const { body, validationResult } = require('express-validator');

// Сохранить новую заявку с валидацией
router.post('/',
    [
        body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Имя должно содержать от 2 до 100 символов'),
        body('location').trim().isLength({ min: 2, max: 100 }).withMessage('Местоположение должно содержать от 2 до 100 символов'),
        body('phone').isMobilePhone('ru-RU').withMessage('Введите корректный российский номер телефона')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, location, phone } = req.body;
        try {
            const result = await pool.query(
                'INSERT INTO feedback (name, location, phone) VALUES ($1, $2, $3) RETURNING *',
                [name, location, phone]
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
);

module.exports = router;