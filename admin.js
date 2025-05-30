document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации
    if (!localStorage.getItem('admin-authenticated')) {
        window.location.href = 'index.html';
    }

    // Выход из системы
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('admin-authenticated');
        window.location.href = 'index.html';
    });

    // Загрузка данных
    function loadContent() {
        // Загрузка основной информации
        document.getElementById('admin-hero-name').value = 
            localStorage.getItem('hero-name') || 'Алексей';
            
        document.getElementById('admin-about-text').value = 
            localStorage.getItem('about-text') || 'Я профессиональный веб-разработчик с 5-летним опытом. Специализируюсь на создании современных адаптивных интерфейсов.';
            
        document.getElementById('admin-contact-email').value = 
            localStorage.getItem('contact-email') || 'example@mail.com';
            
        document.getElementById('admin-contact-phone').value = 
            localStorage.getItem('contact-phone') || '+1 (234) 567-890';

        // Загрузка проектов
        const projects = JSON.parse(localStorage.getItem('projects')) || [];
        renderProjects(projects);
    }

    // Сохранение основной информации
    document.getElementById('save-general').addEventListener('click', function() {
        const fields = [
            { id: 'hero-name', element: 'admin-hero-name' },
            { id: 'about-text', element: 'admin-about-text' },
            { id: 'contact-email', element: 'admin-contact-email' },
            { id: 'contact-phone', element: 'admin-contact-phone' }
        ];
        
        fields.forEach(field => {
            const value = document.getElementById(field.element).value;
            localStorage.setItem(field.id, value);
        });
        
        showNotification('Общая информация сохранена!');
    });

    // Добавление проекта
    document.getElementById('add-project').addEventListener('click', function() {
        const title = document.getElementById('project-title').value;
        const desc = document.getElementById('project-desc').value;
        const image = document.getElementById('project-image').value || 'placeholder.jpg';
        
        if (!title || !desc) {
            showNotification('Заполните название и описание проекта', true);
            return;
        }
        
        const projects = JSON.parse(localStorage.getItem('projects')) || [];
        
        projects.push({
            id: Date.now(),
            title: title,
            desc: desc,
            image: image
        });
        
        localStorage.setItem('projects', JSON.stringify(projects));
        renderProjects(projects);
        
        // Очистка формы
        document.getElementById('project-title').value = '';
        document.getElementById('project-desc').value = '';
        document.getElementById('project-image').value = '';
        
        showNotification('Проект добавлен!');
    });

    // Рендер проектов
    function renderProjects(projects) {
        const container = document.getElementById('projects-list');
        container.innerHTML = '';
        
        if (projects.length === 0) {
            container.innerHTML = '<p class="empty-list">Нет добавленных проектов</p>';
            return;
        }
        
        projects.forEach(project => {
            const projectEl = document.createElement('div');
            projectEl.className = 'project-item';
            projectEl.innerHTML = `
                <div class="project-item__info">
                    <h4 class="project-item__title">${project.title}</h4>
                    <p class="project-item__desc">${project.desc}</p>
                </div>
                <div class="project-item__actions">
                    <button class="btn btn--delete delete-project" data-id="${project.id}">Удалить</button>
                </div>
            `;
            container.appendChild(projectEl);
        });

        // Удаление проекта
        document.querySelectorAll('.delete-project').forEach(btn => {
            btn.addEventListener('click', function() {
                const projectId = parseInt(this.dataset.id);
                const projects = JSON.parse(localStorage.getItem('projects'));
                const updatedProjects = projects.filter(p => p.id !== projectId);
                
                localStorage.setItem('projects', JSON.stringify(updatedProjects));
                renderProjects(updatedProjects);
                showNotification('Проект удален');
            });
        });
    }

    // Показ уведомлений
    function showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.className = `notification ${isError ? 'error' : 'success'}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Запуск загрузки данных
    loadContent();
});