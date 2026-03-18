const pool = require('./db');

async function logAction(action, details = null, admin = null) {
    try {
        const query = 'INSERT INTO admin_logs (action, details, admin) VALUES ($1, $2, $3)';
        await pool.query(query, [action, details ? JSON.stringify(details) : null, admin]);
    } catch (err) {
        console.error('Ошибка записи лога:', err);
    }
}

module.exports = { logAction };