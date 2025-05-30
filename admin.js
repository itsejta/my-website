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

    // Переключение между URL и загрузкой файла
    const imageSourceRadios = document.querySelectorAll('input[name="image-source"]');
    const urlField = document.querySelector('.image-url-field');
    const uploadField = document.querySelector('.image-upload-field');
    const fileInput = document.getElementById('project-image-file');
    const fileName = document.getElementById('file-name');
    const imagePreview = document.getElementById('image-preview');
    
    // Обработка переключения
    imageSourceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'url') {
                urlField.style.display = 'block';
                uploadField.style.display = 'none';
            } else {
                urlField.style.display = 'none';
                uploadField.style.display = 'block';
            }
        });
    });
    
    // Обработка выбора файла
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            fileName.textContent = this.files[0].name;
            
            // Показ превью
            const reader = new FileReader();
            reader.onload = function(e) {
                const previewImg = imagePreview.querySelector('img') || document.createElement('img');
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
                imagePreview.appendChild(previewImg);
            }
            reader.readAsDataURL(this.files[0]);
        } else {
            fileName.textContent = 'Файл не выбран';
            const previewImg = imagePreview.querySelector('img');
            if (previewImg) previewImg.style.display = 'none';
        }
    });
    
    // Добавление проекта
    document.getElementById('add-project').addEventListener('click', function() {
        const title = document.getElementById('project-title').value;
        const desc = document.getElementById('project-desc').value;
        const link = document.getElementById('project-link').value;
        
        if (!title || !desc) {
            showNotification('Заполните название и описание проекта', true);
            return;
        }
        
        let image = '';
        const imageSource = document.querySelector('input[name="image-source"]:checked').value;
        
        if (imageSource === 'url') {
            image = document.getElementById('project-image-url').value || 'placeholder.jpg';
            addProjectToStorage(title, desc, link, image);
        } else {
            if (fileInput.files.length > 0) {
                // Конвертация файла в Data URL
                const reader = new FileReader();
                reader.onload = function(e) {
                    addProjectToStorage(title, desc, link, e.target.result);
                };
                reader.readAsDataURL(fileInput.files[0]);
            } else {
                showNotification('Выберите файл изображения', true);
                return;
            }
        }
    });
    
    // Функция для добавления проекта в хранилище
    function addProjectToStorage(title, desc, link, image) {
        const projects = JSON.parse(localStorage.getItem('projects')) || [];
        
        projects.push({
            id: Date.now(),
            title: title,
            desc: desc,
            link: link,
            image: image
        });
        
        localStorage.setItem('projects', JSON.stringify(projects));
        renderProjects(projects);
        
        // Очистка формы
        document.getElementById('project-title').value = '';
        document.getElementById('project-desc').value = '';
        document.getElementById('project-link').value = '';
        document.getElementById('project-image-url').value = '';
        fileInput.value = '';
        fileName.textContent = 'Файл не выбран';
        
        const previewImg = imagePreview.querySelector('img');
        if (previewImg) previewImg.style.display = 'none';
        
        showNotification('Проект добавлен!');
    }

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
                    ${project.link ? `<p class="project-item__link"><small>Ссылка: <a href="${project.link}" target="_blank">${project.link}</a></small></p>` : ''}
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