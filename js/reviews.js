// ===== ОТЗЫВЫ: ЗАГРУЗКА, ПАГИНАЦИЯ, ФИЛЬТРЫ, ОТПРАВКА =====

let currentPage = 1;
const limit = 5; // сколько отзывов загружать за раз
let currentRating = 'all'; // текущий фильтр по рейтингу

document.addEventListener('DOMContentLoaded', () => {
    // Устанавливаем сегодняшнюю дату в поле даты
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
    }

    // Загружаем первую страницу отзывов
    loadReviews();

    // Обработчик отправки формы
    const form = document.getElementById('review-form');
    if (form) {
        form.addEventListener('submit', submitReview);
    }

    // Обработчики кнопок фильтра по рейтингу
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                // Убираем активный класс у всех кнопок
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                // Устанавливаем текущий фильтр
                currentRating = this.dataset.rating;
                currentPage = 1; // сбрасываем на первую страницу
                loadReviews(); // загружаем заново
            });
        });
    }

    // Обработчик кнопки "Загрузить ещё"
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            loadReviews(true); // true = добавляем отзывы, а не заменяем
        });
    }
});

// Функция загрузки отзывов с сервера
async function loadReviews(append = false) {
    const container = document.getElementById('reviews-container');
    if (!container) return;

    // Показываем индикатор загрузки (по желанию)
    // container.innerHTML = '<p>Загрузка...</p>';

    try {
        // Формируем URL с параметрами
        const url = new URL('https://diplom-production-d7d0.up.railway.app/api/reviews');
        url.searchParams.append('page', currentPage);
        url.searchParams.append('limit', limit);
        if (currentRating !== 'all') {
            url.searchParams.append('rating', currentRating);
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data = await response.json();

        // Если нет отзывов и это первая страница
        if (data.reviews.length === 0 && currentPage === 1) {
            container.innerHTML = '<p>Пока нет отзывов. Будьте первым!</p>';
            document.getElementById('load-more').style.display = 'none';
            return;
        }

        // Генерируем HTML для новых отзывов
        const reviewsHTML = data.reviews.map(createReviewCard).join('');

        if (append) {
            container.insertAdjacentHTML('beforeend', reviewsHTML);
        } else {
            container.innerHTML = reviewsHTML;
        }

        // Управление кнопкой "Загрузить ещё"
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
            if (data.hasMore) {
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
        container.innerHTML = '<p>Не удалось загрузить отзывы. Попробуйте позже.</p>';
    }
}

// Функция создания HTML-карточки отзыва
function createReviewCard(review) {
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    const date = new Date(review.date).toLocaleDateString('ru-RU');
    return `
        <div class="review-card">
            <div class="review-card__avatar">
                <img src="Image/avatar-placeholder.svg" alt="аватар">
            </div>
            <div class="review-card__content">
                <h3>${escapeHtml(review.author)}</h3>
                <p class="review-card__date">${date}</p>
                <div class="review-card__rating">${stars}</div>
                <p class="review-card__text">${escapeHtml(review.text)}</p>
                ${review.yandex_link ? `<a href="${escapeHtml(review.yandex_link)}" target="_blank" class="review-card__link">Этот отзыв на Яндекс.Отзывы</a>` : ''}
            </div>
        </div>
    `;
}

// Защита от XSS
function escapeHtml(unsafe) {
    return unsafe.replace(/[&<>"']/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        if (m === '"') return '&quot;';
        return '&#039;';
    });
}

// Обработка отправки нового отзыва
async function submitReview(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    // Собираем данные
    const data = {
        author: formData.get('author'),
        date: formData.get('date'),
        text: formData.get('text'),
        rating: parseInt(formData.get('rating')),
        yandex_link: formData.get('yandex_link') || null
    };

    // Валидация на клиенте (можно добавить, но сервер всё равно проверит)
    if (!data.author || data.author.length < 2) {
        notify('Имя должно содержать минимум 2 символа');
        return;
    }
    if (!data.text || data.text.length < 5) {
        notify('Текст отзыва должен содержать минимум 5 символов');
        return;
    }

    try {
        const response = await fetch('https://diplom-production-d7d0.up.railway.app/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            notify('Спасибо! Ваш отзыв отправлен на модерацию.');
            form.reset();

            // Восстанавливаем сегодняшнюю дату (после сброса формы)
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            document.getElementById('date').value = `${year}-${month}-${day}`;

            // Если нужно сбросить рейтинг до 5 (по умолчанию)
            document.querySelector('input[name="rating"][value="5"]').checked = true;
        } else if (response.status === 400) {
            const errorData = await response.json();
            if (errorData.errors) {
                // Показываем все ошибки валидации
                notify('Ошибка: ' + errorData.errors.map(e => e.msg).join(', '));
            } else if (errorData.error) {
                notify('Ошибка: ' + errorData.error);
            } else {
                notify('Ошибка при отправке. Проверьте правильность заполнения полей.');
            }
        } else {
            notify('Ошибка сервера. Попробуйте позже.');
        }
    } catch (error) {
        console.error('Ошибка отправки:', error);
        notify('Не удалось отправить отзыв. Проверьте соединение с сервером.');
    }
}
