const express = require('express');
const router = express.Router();
const pool = require('../db');
const { body, validationResult } = require('express-validator');

// ===== ПОЛУЧИТЬ ОПУБЛИКОВАННЫЕ ОТЗЫВЫ (С ПАГИНАЦИЕЙ И ФИЛЬТРОМ) =====
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const rating = req.query.rating; // "all" или число

    let ratingFilter = '';
    let values = [limit, offset];
    let countValues = [];

    if (rating && rating !== 'all') {
        ratingFilter = 'AND rating = $3';
        values.push(parseInt(rating));
        countValues.push(parseInt(rating));
    }

    try {
        // Общее количество опубликованных отзывов (с учётом фильтра)
        let countQuery = "SELECT COUNT(*) FROM reviews WHERE status = 'published'";
        if (rating && rating !== 'all') {
            countQuery += ' AND rating = $1';
        }
        const countResult = await pool.query(countQuery, countValues);
        const total = parseInt(countResult.rows[0].count);

        // Запрос отзывов с пагинацией и фильтром
        const query = `
            SELECT * FROM reviews 
            WHERE status = 'published' ${ratingFilter}
            ORDER BY date DESC 
            LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(query, values);

        res.json({
            reviews: result.rows,
            total,
            page,
            limit,
            hasMore: offset + result.rows.length < total
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ===== ДОБАВИТЬ НОВЫЙ ОТЗЫВ (С ВАЛИДАЦИЕЙ) =====
router.post('/',
    [
        body('author')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Имя должно содержать от 2 до 100 символов'),
        body('date')
            .isISO8601()
            .toDate()
            .withMessage('Некорректная дата'),
        body('text')
            .trim()
            .isLength({ min: 5, max: 1000 })
            .withMessage('Текст отзыва должен быть от 5 до 1000 символов'),
        body('rating')
            .isInt({ min: 1, max: 5 })
            .withMessage('Рейтинг должен быть от 1 до 5'),
        body('yandex_link')
            .optional({ nullable: true, checkFalsy: true })
            .isURL()
            .withMessage('Ссылка должна быть валидным URL')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { author, date, text, rating, yandex_link } = req.body;
        try {
            const result = await pool.query(
                'INSERT INTO reviews (author, date, text, rating, yandex_link, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [author, date, text, rating, yandex_link || null, 'pending']
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
);

module.exports = router;