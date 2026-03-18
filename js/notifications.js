// Система уведомлений (тосты)
(function() {
    // Создаём контейнер для уведомлений, если его нет
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    // Функция показа уведомления
    window.notify = function(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        `;

        container.appendChild(notification);

        // Кнопка закрытия
        notification.querySelector('.notification-close').addEventListener('click', () => {
            closeNotification(notification);
        });

        // Автоматическое закрытие
        let timeout = setTimeout(() => closeNotification(notification), duration);

        // Останавливаем таймер при наведении мыши
        notification.addEventListener('mouseenter', () => clearTimeout(timeout));
        notification.addEventListener('mouseleave', () => {
            timeout = setTimeout(() => closeNotification(notification), duration);
        });
    };

    function closeNotification(notification) {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }
})();