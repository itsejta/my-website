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
                previewImg.style.maxWidth = '100%';
                previewImg.style.maxHeight = '200px';
                imagePreview.appendChild(previewImg);
            }
            reader.readAsDataURL(this.files[0]);
        } else {
            fileName.textContent = 'Файл не выбран';
            const previewImg = imagePreview.querySelector('img');
            if (previewImg) previewImg.style.display = 'none';
        }
    });
    
    // Добавление/редактирование проекта
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
        
        const editingId = this.dataset.editingId;
        
        if (imageSource === 'url') {
            image = document.getElementById('project-image-url').value || 'placeholder.jpg';
            
            // Валидация URL
            if (image && !isValidUrl(image)) {
                showNotification('Введите корректный URL изображения', true);
                return;
            }
            
            if (editingId) {
                updateProject(editingId, title, desc, link, image);
            } else {
                addProjectToStorage(title, desc, link, image);
            }
        } else {
            if (fileInput.files.length > 0) {
                // Конвертация файла в Data URL
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (editingId) {
                        updateProject(editingId, title, desc, link, e.target.result);
                    } else {
                        addProjectToStorage(title, desc, link, e.target.result);
                    }
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
        resetProjectForm();
        
        showNotification('Проект добавлен!');
    }
    
    // Функция для обновления проекта
    function updateProject(id, title, desc, link, image) {
        const projects = JSON.parse(localStorage.getItem('projects'));
        const projectIndex = projects.findIndex(p => p.id === parseInt(id));
        
        if (projectIndex !== -1) {
            projects[projectIndex] = {
                ...projects[projectIndex],
                title: title,
                desc: desc,
                link: link,
                image: image
            };
            
            localStorage.setItem('projects', JSON.stringify(projects));
            renderProjects(projects);
            resetProjectForm();
            
            showNotification('Проект обновлен!');
        }
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
            projectEl.dataset.id = project.id;
            projectEl.innerHTML = `
                <div class="project-item__info">
                    <h4 class="project-item__title">${project.title}</h4>
                    <p class="project-item__desc">${project.desc}</p>
                    ${project.link ? `<p class="project-item__link"><small>Ссылка: <a href="${project.link}" target="_blank">${project.link}</a></small></p>` : ''}
                </div>
                <div class="project-item__actions">
                    <button class="btn btn--edit edit-project" data-id="${project.id}">✎</button>
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
        
        // Редактирование проекта
        document.querySelectorAll('.edit-project').forEach(btn => {
            btn.addEventListener('click', function() {
                const projectId = parseInt(this.dataset.id);
                const projects = JSON.parse(localStorage.getItem('projects'));
                const project = projects.find(p => p.id === projectId);
                
                if (project) {
                    populateProjectForm(project);
                }
            });
        });
        
        // Инициализация сортировки
        initSortable();
    }
    
    // Заполнение формы для редактирования
    function populateProjectForm(project) {
        document.getElementById('project-title').value = project.title;
        document.getElementById('project-desc').value = project.desc;
        document.getElementById('project-link').value = project.link || '';
        
        // Определение типа изображения
        if (project.image.startsWith('data:image')) {
            // Это загруженное изображение
            document.querySelector('input[name="image-source"][value="upload"]').checked = true;
            document.querySelector('.image-url-field').style.display = 'none';
            document.querySelector('.image-upload-field').style.display = 'block';
            
            // Показ превью
            const previewImg = imagePreview.querySelector('img') || document.createElement('img');
            previewImg.src = project.image;
            previewImg.style.display = 'block';
            previewImg.style.maxWidth = '100%';
            previewImg.style.maxHeight = '200px';
            imagePreview.innerHTML = '';
            imagePreview.appendChild(previewImg);
            fileName.textContent = 'Изображение загружено';
        } else {
            // Это URL
            document.querySelector('input[name="image-source"][value="url"]').checked = true;
            document.querySelector('.image-url-field').style.display = 'block';
            document.querySelector('.image-upload-field').style.display = 'none';
            document.getElementById('project-image-url').value = project.image;
        }
        
        // Изменение кнопки на "Сохранить изменения"
        const addButton = document.getElementById('add-project');
        addButton.textContent = 'Сохранить изменения';
        addButton.dataset.editingId = project.id;
    }
    
    // Сброс формы проекта
    function resetProjectForm() {
        document.getElementById('project-title').value = '';
        document.getElementById('project-desc').value = '';
        document.getElementById('project-link').value = '';
        document.getElementById('project-image-url').value = '';
        fileInput.value = '';
        fileName.textContent = 'Файл не выбран';
        
        const previewImg = imagePreview.querySelector('img');
        if (previewImg) previewImg.style.display = 'none';
        
        // Возврат кнопки в исходное состояние
        const addButton = document.getElementById('add-project');
        addButton.textContent = 'Добавить проект';
        if (addButton.dataset.editingId) {
            delete addButton.dataset.editingId;
        }
    }
    
    // Валидация URL
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    // Инициализация сортировки
    function initSortable() {
        // Используем библиотеку SortableJS (убедитесь, что подключили её в HTML)
        if (typeof Sortable !== 'undefined') {
            new Sortable(document.getElementById('projects-list'), {
                animation: 150,
                ghostClass: 'sortable-ghost',
                onEnd: function(evt) {
                    const projects = JSON.parse(localStorage.getItem('projects')) || [];
                    const projectElements = Array.from(evt.to.children);
                    
                    // Создаем новый порядок проектов
                    const reorderedProjects = projectElements.map(el => {
                        return projects.find(p => p.id === parseInt(el.dataset.id));
                    });
                    
                    localStorage.setItem('projects', JSON.stringify(reorderedProjects));
                }
            });
        }
    }
    
    // Сжатие изображения
    function compressImage(file, maxWidth = 800, quality = 0.7) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const scale = Math.min(maxWidth / img.width, 1);
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
            };
            reader.readAsDataURL(file);
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