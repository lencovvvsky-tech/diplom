// Обработка формы обратной связи на странице контактов
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('feedback-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Собираем данные формы
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            location: formData.get('location'),
            phone: formData.get('phone')
        };

        // Если используется капча, добавить её
        // const recaptcha = grecaptcha.getResponse();
        // if (!recaptcha) {
        //     notify('Пожалуйста, подтвердите, что вы не робот');
        //     return;
        // }
        // data['g-recaptcha-response'] = recaptcha;

        try {
            const response = await fetch('http://localhost:3000/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                notify('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
                form.reset();
                // Если используется капча, сбросить её
                // if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
            } else if (response.status === 400) {
                const errorData = await response.json();
                if (errorData.errors) {
                    // Валидационные ошибки от express-validator
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
            console.error('Ошибка соединения:', error);
            notify('Не удалось отправить заявку. Проверьте подключение к интернету или повторите позже.');
        }
    });
});