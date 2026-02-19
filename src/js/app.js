// Основна логіка додатку для управління темою, навігацією та прогресом

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSidebar();
    initProgress();
    initLessonComplete();
    highlightCurrentLesson();
});

// ===== Управління темою =====

function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Встановлюємо збережену тему
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Обробник перемикання теми
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
    }
}

// ===== Управління сайдбаром =====

function initSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            if (overlay) {
                overlay.classList.toggle('active');
            }
        });
        
        // Закриття сайдбару при кліку на overlay
        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            });
        }
        
        // Закриття сайдбару при виборі уроку на мобільних
        const lessonLinks = sidebar.querySelectorAll('.lesson-link');
        lessonLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                    if (overlay) {
                        overlay.classList.remove('active');
                    }
                }
            });
        });
    }
}

// ===== Управління прогресом =====

function initProgress() {
    updateProgressBar();
    updateLessonStatus();
}

function updateProgressBar() {
    const progressFill = document.getElementById('progress-fill');
    if (!progressFill) return;
    
    const completedLessons = getCompletedLessons();
    const totalLessons = 20;
    const percentage = (completedLessons.length / totalLessons) * 100;
    
    progressFill.style.width = `${percentage}%`;
}

function updateLessonStatus() {
    const completedLessons = getCompletedLessons();
    const lessonLinks = document.querySelectorAll('.lesson-link');
    
    lessonLinks.forEach(link => {
        const lessonId = link.getAttribute('data-lesson');
        if (lessonId && completedLessons.includes(lessonId)) {
            link.classList.add('completed');
        }
    });
}

function getCompletedLessons() {
    const completed = localStorage.getItem('completedLessons');
    return completed ? JSON.parse(completed) : [];
}

function saveCompletedLesson(lessonId) {
    const completed = getCompletedLessons();
    if (!completed.includes(lessonId)) {
        completed.push(lessonId);
        localStorage.setItem('completedLessons', JSON.stringify(completed));
        updateProgressBar();
        updateLessonStatus();
    }
}

// ===== Управління кнопкою "Позначити як пройдений" =====

function initLessonComplete() {
    const completeButton = document.getElementById('complete-lesson');
    if (!completeButton) return;
    
    const lessonId = completeButton.getAttribute('data-lesson');
    const completedLessons = getCompletedLessons();
    
    // Встановлюємо початковий стан кнопки
    if (completedLessons.includes(lessonId)) {
        completeButton.textContent = 'Урок пройдено';
        completeButton.classList.add('completed');
        completeButton.disabled = true;
    }
    
    // Обробник кліку
    completeButton.addEventListener('click', () => {
        saveCompletedLesson(lessonId);
        completeButton.textContent = 'Урок пройдено';
        completeButton.classList.add('completed');
        completeButton.disabled = true;
    });
}

// ===== Підсвітка поточного уроку в навігації =====

function highlightCurrentLesson() {
    const currentPath = window.location.pathname;
    const lessonLinks = document.querySelectorAll('.lesson-link');
    
    lessonLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (currentPath === linkPath || currentPath.endsWith(linkPath)) {
            link.classList.add('active');
        }
    });
}

// ===== Інтерактивні функції для уроків =====

// Функція для виконання JavaScript коду з textarea
function runCode(textareaId, outputId) {
    const code = document.getElementById(textareaId).value;
    const output = document.getElementById(outputId);
    
    try {
        // Перехоплюємо console.log
        let logs = [];
        const originalLog = console.log;
        console.log = (...args) => {
            logs.push(args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '));
        };
        
        // Виконуємо код
        const result = eval(code);
        
        // Відновлюємо console.log
        console.log = originalLog;
        
        // Виводимо результат
        output.innerHTML = '';
        if (logs.length > 0) {
            output.innerHTML += '<strong>Вивід console.log:</strong><br>' + logs.join('<br>');
        }
        if (result !== undefined) {
            output.innerHTML += (logs.length > 0 ? '<br><br>' : '') + '<strong>Результат:</strong><br>' + result;
        }
        if (logs.length === 0 && result === undefined) {
            output.innerHTML = '<em>Код виконано успішно (без виводу)</em>';
        }
    } catch (error) {
        output.innerHTML = `<strong style="color: #e74c3c;">Помилка:</strong><br>${error.message}`;
    }
}

// Функція для виконання HTML коду
function runHTML(textareaId, outputId) {
    const code = document.getElementById(textareaId).value;
    const output = document.getElementById(outputId);
    
    // Виводимо HTML в iframe для безпеки
    output.innerHTML = `<iframe style="width: 100%; min-height: 200px; border: 1px solid var(--border-color); border-radius: 5px;" srcdoc="${code.replace(/"/g, '&quot;')}"></iframe>`;
}

// Експорт функцій для використання в HTML
window.runCode = runCode;
window.runHTML = runHTML;
