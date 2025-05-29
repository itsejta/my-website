// Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Анимация появления элементов
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.section, .project-card');
    
    elements.forEach(el => {
        const elTop = el.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elTop < windowHeight - 100) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }
    });
};

// Начальные стили для анимации
document.querySelectorAll('.section, .project-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s, transform 0.5s';
});

// Запуск при загрузке и скролле
window.addEventListener('load', animateOnScroll);
window.addEventListener('scroll', animateOnScroll);

// Тёмная тема
const themeToggle = document.querySelector('.theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';

document.documentElement.setAttribute('data-theme', currentTheme);

themeToggle.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Мобильное меню
const navToggle = document.querySelector('.nav__toggle');
const navMenu = document.querySelector('.nav__menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Для обычных изображений
document.addEventListener("DOMContentLoaded", () => {
  const lazyImages = [].slice.call(document.querySelectorAll("img.lazyload"));

  if ("IntersectionObserver" in window) {
    const lazyImageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.classList.remove("lazyload");
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach((lazyImage) => {
      lazyImageObserver.observe(lazyImage);
    });
  }
});

// Для фоновых изображений
const lazyBackgrounds = document.querySelectorAll('.lazy-background');
window.addEventListener('load', () => {
  lazyBackgrounds.forEach(background => {
    background.classList.add('loaded');
  });
});
