// Переключение тёмной и светлой темы
(function() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return; // если кнопки нет, выходим

    // Функция установки темы
    function setTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            themeToggle.textContent = '☀️';
        } else {
            document.body.classList.remove('light-theme');
            themeToggle.textContent = '🌙';
        }
        localStorage.setItem('theme', theme);
    }

    // Определяем сохранённую тему
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    // Обработчик клика по кнопке
    themeToggle.addEventListener('click', function() {
        const isLight = document.body.classList.contains('light-theme');
        setTheme(isLight ? 'dark' : 'light');
    });
})();