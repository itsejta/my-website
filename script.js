document.addEventListener('DOMContentLoaded', function() {
    // Установка текущего года в футере
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Переключение темы
    const themeToggle = document.querySelector('.theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Применяем текущую тему при загрузке
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Анимация переключения
        themeToggle.style.transform = 'scale(0.8)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 200);
    });
    
    // Ленивая загрузка изображений
    const lazyImages = [].slice.call(document.querySelectorAll('.lazyload'));
    
    if ('IntersectionObserver' in window) {
        const lazyImageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.classList.add('loaded');
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });
        
        lazyImages.forEach(function(lazyImage) {
            lazyImageObserver.observe(lazyImage);
        });
    }
    
    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Анимация при скролле
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
    
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);
    
    // ===== АДМИНСКИЙ ФУНКЦИОНАЛ =====
    
    // Элементы админки
    const adminBtn = document.getElementById('admin-btn');
    const modal = document.getElementById('admin-modal');
    const closeModal = document.querySelector('.close-modal');
    const loginForm = document.getElementById('login-form');
    
    // Конфигурация доступа
    const ADMIN_CREDENTIALS = {
        login: 'admin',
        password: 'admin123'
    };
    
    // Проверка авторизации
    if (localStorage.getItem('admin-authenticated')) {
        adminBtn.textContent = '✎ Админ';
    }
    
    // Показать/скрыть модальное окно
    if (adminBtn && modal) {
        adminBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    
        // Авторизация
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (username === ADMIN_CREDENTIALS.login && password === ADMIN_CREDENTIALS.password) {
                localStorage.setItem('admin-authenticated', 'true');
                modal.style.display = 'none';
                window.location.href = 'admin.html';
            } else {
                alert('Неверные данные!');
            }
        });
    }
    
    // Загрузка сохранённого контента
    function loadSavedContent() {
        // Имя
        const savedName = localStorage.getItem('hero-name');
        if (savedName) {
            document.getElementById('hero-name').textContent = savedName;
        }
        
        // Обо мне
        const savedAbout = localStorage.getItem('about-text');
        if (savedAbout) {
            document.getElementById('about-text').textContent = savedAbout;
        }
        
        // Контакты
        const savedEmail = localStorage.getItem('contact-email');
        if (savedEmail) {
            document.getElementById('contact-email').textContent = savedEmail;
        }
        
        const savedPhone = localStorage.getItem('contact-phone');
        if (savedPhone) {
            document.getElementById('contact-phone').textContent = savedPhone;
        }
        
        // Проекты
        const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        if (savedProjects.length > 0) {
            renderProjects(savedProjects);
        }
    }
    
    // Рендер проектов
    function renderProjects(projects) {
        const container = document.getElementById('projects-container');
        container.innerHTML = '';
        
        projects.forEach(project => {
            const projectEl = document.createElement('div');
            projectEl.className = 'project-card';
            projectEl.innerHTML = `
                <div class="project-card__image">
                    <img src="${project.image}" data-src="${project.image}" alt="${project.title}" loading="lazy" class="lazyload">
                    <div class="project-card__overlay">
                        <a href="#" class="btn">Подробнее</a>
                    </div>
                </div>
                <div class="project-card__content">
                    <h3>${project.title}</h3>
                    <p>${project.desc}</p>
                </div>
            `;
            container.appendChild(projectEl);
        });
    }
    
    // Загружаем сохранённый контент при загрузке страницы
    window.addEventListener('load', loadSavedContent);
});