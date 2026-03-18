document.addEventListener('DOMContentLoaded', function () {
    const slider = document.querySelector('.slider');
    if (!slider) return;

    const slides = slider.querySelectorAll('.slider__slide');
    const wrapper = slider.querySelector('.slider__wrapper');
    const prevBtn = slider.querySelector('.slider__btn_prev');
    const nextBtn = slider.querySelector('.slider__btn_next');
    const dotsContainer = slider.querySelector('.slider__dots');

    let currentIndex = 0;
    const totalSlides = slides.length;

    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.classList.add('slider__dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
    const dots = slider.querySelectorAll('.slider__dot');

    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        wrapper.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((dot, i) => {
            if (i === index) dot.classList.add('active');
            else dot.classList.remove('active');
        });
        currentIndex = index;
    }

    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
    goToSlide(0);
});