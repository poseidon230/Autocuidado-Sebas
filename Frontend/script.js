/**
 * Main application script for Spiritual Self-Care Platform
 * Handles authentication, questionnaire, and user interactions
 */

// Application state
let currentUser = null;
let userResponses = {};
let isAdmin = false;
const Backend_url="https://backend-4tgw.onrender.com"

// Questions data
const questions = [
    "Duermo al menos 7 horas por noche.",
    "Mantengo una alimentación equilibrada y tomo suficiente agua.",
    "Realizo actividad física al menos tres veces por semana.",
    "Evito el consumo excesivo de cafeína, alcohol o tabaco.",
    "Identifico y gestiono mis emociones de forma saludable.",
    "Busco apoyo emocional cuando lo necesito.",
    "Practico la autocompasión y evito ser demasiado crítico conmigo.",
    "Dedico tiempo a actividades que me generan alegría y satisfacción.",
    "Tomo descansos cuando me siento saturado o estresado.",
    "Mantengo pensamientos positivos sobre mí y mis capacidades.",
    "Administro bien mi tiempo y evito la procrastinación.",
    "Tengo estrategias para manejar el estrés o la ansiedad.",
    "Mantengo relaciones positivas con familiares y amigos.",
    "Me comunico de forma asertiva con las personas a mi alrededor.",
    "Participo en actividades o grupos donde me siento valorado/a.",
    "Ofrezco apoyo y escucha a las personas cercanas cuando lo necesitan.",
    "Dedico tiempo a la reflexión, meditación o silencio interior.",
    "Practico la gratitud de manera frecuente.",
    "Me siento conectado con mis valores y propósito de vida.",
    "Encuentro serenidad en momentos difíciles."
];

const responseOptions = ["Nunca", "Rara vez", "A veces", "Frecuentemente", "Siempre"];
const responseValues = { "Nunca": 1, "Rara vez": 2, "A veces": 3, "Frecuentemente": 4, "Siempre": 5 };

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkExistingSession();
});

/**
 * Initialize application
 */
function initializeApp() {
    // Initialize hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Close modal when clicking outside
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeLoginModal();
            }
        });
    }
}

/**
 * Check for existing user session
 */
function checkExistingSession() {
    const savedUser = localStorage.getItem('currentUser');
    const savedAdmin = localStorage.getItem('isAdmin');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isAdmin = savedAdmin === 'true';
        updateUIAfterLogin();
    }
}

/**
 * Handle user login
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        // Check if super admin
        if (email === 'seb@gmail.com' && password === 'seb123') {
            currentUser = { email, name: 'Super Admin', age: 0 };
            isAdmin = true;
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('isAdmin', 'true');
            
            updateUIAfterLogin();
            closeLoginModal();
            showNotification('Bienvenido Super Admin!', 'success');
            return;
        }

        // Regular user login via API
        const response = await fetch(` ${Backend-url}/api/auth/login` , {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            isAdmin = false;
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('isAdmin', 'false');
            
            updateUIAfterLogin();
            closeLoginModal();
            showNotification('¡Bienvenido de vuelta!', 'success');
        } else {
            showNotification(data.message || 'Error en el login', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Error de conexión', 'error');
    }
}

/**
 * Handle user registration
 */
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const age = parseInt(document.getElementById('registerAge').value);

    try {
        const response = await fetch(const response = await fetch( `${Backend-url}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, age })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('¡Cuenta creada exitosamente!', 'success');
            switchTab('login');
            // Clear register form
            document.getElementById('registerForm').reset();
        } else {
            showNotification(data.message || 'Error en el registro', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Error de conexión', 'error');
    }
}

/**
 * Update UI after user login
 */
function updateUIAfterLogin() {
    // Update navbar
    const navMenu = document.querySelector('.nav-menu');
    const loginBtn = document.querySelector('.login-btn');
    
    if (loginBtn) {
        // Remove existing login button
        loginBtn.remove();
        
        // Create user info and logout button
        const userItem = document.createElement('li');
        userItem.className = 'nav-item';
        userItem.innerHTML = `
            <div class="user-menu">
                <span class="user-name">${currentUser.name}</span>
                <button class="logout-btn" onclick="logout()">Cerrar Sesión</button>
            </div>
        `;
        
        navMenu.appendChild(userItem);
    }

    // Update questionnaire section
    const questionnaireContainer = document.getElementById('questionnaire-container');
    if (questionnaireContainer && !isAdmin) {
        if (!userHasCompletedQuestionnaire()) {
            renderQuestionnaire();
        } else {
            showCompletedMessage();
        }
    }

    // Show/hide sections based on user type
    if (isAdmin) {
        document.getElementById('cuestionario').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        loadAdminStatistics();
    } else {
        document.getElementById('admin-dashboard').classList.add('hidden');
        document.getElementById('cuestionario').classList.remove('hidden');
    }
}

/**
 * Render questionnaire form
 */
function renderQuestionnaire() {
    const container = document.getElementById('questionnaire-container');
    
    let html = `
        <div class="questionnaire-header">
            <h3>Evaluación de Autocuidado</h3>
            <p>Responde honestamente a cada pregunta según tu experiencia</p>
        </div>
        <form id="assessmentForm">
    `;

    questions.forEach((question, index) => {
        html += `
            <div class="question-item" data-question="${index + 1}">
                <div class="question-text">${index + 1}. ${question}</div>
                <div class="options-container">
        `;
        
        responseOptions.forEach(option => {
            html += `
                <button type="button" class="option-btn" 
                        data-question="${index + 1}" 
                        data-value="${option}"
                        onclick="selectOption(this)">
                    ${option}
                </button>
            `;
        });
        
        html += `</div></div>`;
    });

    html += `
            <div class="form-actions">
                <button type="submit" class="submit-btn">Enviar Evaluación</button>
            </div>
        </form>
    `;

    container.innerHTML = html;

    // Add form submission handler
    document.getElementById('assessmentForm').addEventListener('submit', handleAssessmentSubmit);
}

/**
 * Select option for a question
 */
function selectOption(button) {
    const question = button.dataset.question;
    const value = button.dataset.value;
    
    // Remove selected class from all options in this question
    const questionElement = button.closest('.question-item');
    questionElement.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    button.classList.add('selected');
    
    // Store response
    userResponses[question] = value;
}

/**
 * Handle assessment form submission
 */
function handleAssessmentSubmit(e) {
    e.preventDefault();
    
    // Validate all questions are answered
    const unansweredQuestions = questions.filter((_, index) => !userResponses[index + 1]);
    
    if (unansweredQuestions.length > 0) {
        showNotification('Por favor responde todas las preguntas', 'error');
        return;
    }

    // Calculate score
    const score = calculateScore();
    const { level, message } = calculateLevel(score);
    
    // Save results
    saveAssessmentResults(score, level, message);
    
    // Show results
    showResults(score, level, message);
    
    // Scroll to results
    document.getElementById('resultados').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Calculate total score from responses
 */
function calculateScore() {
    let totalScore = 0;
    
    Object.values(userResponses).forEach(response => {
        totalScore += responseValues[response];
    });
    
    return totalScore;
}

/**
 * Calculate level and message based on score
 */
function calculateLevel(score) {
    let level, message;
    
    if (score <= 50) {
        level = "Bajo";
        message = "Necesitas mejorar tu autocuidado.";
    } else if (score <= 80) {
        level = "Medio";
        message = "Tienes un buen nivel de autocuidado. Sigue así.";
    } else {
        level = "Alto";
        message = "¡Excelente autocuidado!";
    }
    
    return { level, message };
}

/**
 * Save assessment results to backend
 */
async function saveAssessmentResults(score, level, message) {
    try {
        const response = await fetch(`${Backend-url}/api/assessments/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUser.email,
                userName: currentUser.name,
                userAge: currentUser.age,
                responses: userResponses,
                score: score,
                level: level,
                message: message,
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            console.error('Error saving assessment results');
        }
    } catch (error) {
        console.error('Error saving assessment:', error);
    }
}

/**
 * Show assessment results
 */
function showResults(score, level, message) {
    const resultsContainer = document.getElementById('results-container');
    const resultadosSection = document.getElementById('resultados');
    
    resultadosSection.classList.remove('hidden');
    
    resultsContainer.innerHTML = `
        <div class="results-content">
            <h3>Tu Evaluación de Autocuidado</h3>
            <div class="score-display">${score}/100</div>
            <div class="level-display">Nivel: ${level}</div>
            <div class="message-display">${message}</div>
            <div class="results-breakdown">
                <h4>Desglose por Área:</h4>
                <div class="breakdown-grid">
                    <div class="breakdown-item">
                        <span>Cuidado Físico</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${calculateCategoryScore([1,2,3,4])}%"></div>
                        </div>
                    </div>
                    <div class="breakdown-item">
                        <span>Cuidado Emocional</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${calculateCategoryScore([5,6,7,8,9,10,11,12])}%"></div>
                        </div>
                    </div>
                    <div class="breakdown-item">
                        <span>Relaciones</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${calculateCategoryScore([13,14,15,16])}%"></div>
                        </div>
                    </div>
                    <div class="breakdown-item">
                        <span>Espiritualidad</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${calculateCategoryScore([17,18,19,20])}%"></div>
                        </div>
                    </div>
                </div>
            </div>
            <button class="cta-button" onclick="location.reload()">Realizar Otra Evaluación</button>
        </div>
    `;
}

/**
 * Calculate score for a specific category of questions
 */
function calculateCategoryScore(questionNumbers) {
    let categoryScore = 0;
    let maxScore = questionNumbers.length * 5;
    
    questionNumbers.forEach(qNum => {
        if (userResponses[qNum]) {
            categoryScore += responseValues[userResponses[qNum]];
        }
    });
    
    return Math.round((categoryScore / maxScore) * 100);
}

/**
 * Load admin statistics
 */
async function loadAdminStatistics() {
    try {
        const response = await fetch(`${Backend_url}/api/admin/statistics`);
        const data = await response.json();

        if (response.ok) {
            renderAdminStatistics(data);
        } else {
            showNotification('Error cargando estadísticas', 'error');
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
        // Show demo data for development
        renderAdminStatistics(getDemoStatistics());
    }
}

/**
 * Render admin statistics
 */
function renderAdminStatistics(data) {
    const container = document.getElementById('stats-container');
    
    container.innerHTML = `
        <div class="stats-overview">
            <h3>Resumen General</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Total de Evaluaciones</h4>
                    <div class="stat-number">${data.totalAssessments}</div>
                </div>
                <div class="stat-card">
                    <h4>Promedio de Puntuación</h4>
                    <div class="stat-number">${data.averageScore}/100</div>
                </div>
                <div class="stat-card">
                    <h4>Distribución por Nivel</h4>
                    <div class="level-stats">
                        <div>Alto: ${data.levelDistribution.Alto || 0}</div>
                        <div>Medio: ${data.levelDistribution.Medio || 0}</div>
                        <div>Bajo: ${data.levelDistribution.Bajo || 0}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="age-statistics">
            <h3>Estadísticas por Edad</h3>
            <div class="age-chart">
                ${renderAgeChart(data.ageStatistics)}
            </div>
        </div>
        
        <div class="recent-assessments">
            <h3>Evaluaciones Recientes</h3>
            <div class="assessments-list">
                ${renderRecentAssessments(data.recentAssessments)}
            </div>
        </div>
    `;
}

/**
 * Render age statistics chart
 */
function renderAgeChart(ageStats) {
    if (!ageStats || ageStats.length === 0) {
        return '<p>No hay datos suficientes para mostrar el gráfico</p>';
    }

    let html = '<div class="chart-container">';
    ageStats.forEach(stat => {
        const percentage = Math.round((stat.averageScore / 100) * 100);
        html += `
            <div class="chart-item">
                <div class="chart-label">${stat.ageRange}</div>
                <div class="chart-bar">
                    <div class="chart-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="chart-value">${stat.averageScore}</div>
            </div>
        `;
    });
    html += '</div>';
    
    return html;
}

/**
 * Render recent assessments list
 */
function renderRecentAssessments(assessments) {
    if (!assessments || assessments.length === 0) {
        return '<p>No hay evaluaciones recientes</p>';
    }

    let html = '';
    assessments.forEach(assessment => {
        html += `
            <div class="assessment-item">
                <div class="assessment-header">
                    <span class="user-name">${assessment.userName}</span>
                    <span class="user-age">${assessment.userAge} años</span>
                </div>
                <div class="assessment-details">
                    <span class="score">Puntuación: ${assessment.score}/100</span>
                    <span class="level ${assessment.level.toLowerCase()}">${assessment.level}</span>
                </div>
                <div class="assessment-date">${new Date(assessment.timestamp).toLocaleDateString()}</div>
            </div>
        `;
    });
    
    return html;
}

/**
 * Get demo statistics for development
 */
function getDemoStatistics() {
    return {
        totalAssessments: 15,
        averageScore: 72,
        levelDistribution: {
            Alto: 5,
            Medio: 7,
            Bajo: 3
        },
        ageStatistics: [
            { ageRange: "18-25", averageScore: 68 },
            { ageRange: "26-35", averageScore: 74 },
            { ageRange: "36-45", averageScore: 76 },
            { ageRange: "46+", averageScore: 70 }
        ],
        recentAssessments: [
            {
                userName: "Ana García",
                userAge: 28,
                score: 85,
                level: "Alto",
                timestamp: new Date().toISOString()
            },
            {
                userName: "Carlos López",
                userAge: 35,
                score: 62,
                level: "Medio",
                timestamp: new Date(Date.now() - 86400000).toISOString()
            }
        ]
    };
}

/**
 * Check if user has completed questionnaire
 */
function userHasCompletedQuestionnaire() {
    return localStorage.getItem(`assessment_${currentUser.email}`) !== null;
}

/**
 * Show completed questionnaire message
 */
function showCompletedMessage() {
    const container = document.getElementById('questionnaire-container');
    container.innerHTML = `
        <div class="completed-message">
            <h3>¡Ya completaste la evaluación!</h3>
            <p>Puedes ver tus resultados en la sección de resultados.</p>
            <button class="cta-button" onclick="resetAssessment()">Realizar Otra Evaluación</button>
        </div>
    `;
}

/**
 * Reset assessment for current user
 */
function resetAssessment() {
    localStorage.removeItem(`assessment_${currentUser.email}`);
    userResponses = {};
    renderQuestionnaire();
}

/**
 * Show admin dashboard
 */
function showAdminDashboard() {
    document.getElementById('admin-dashboard').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Show user dashboard
 */
function showUserDashboard() {
    document.getElementById('cuestionario').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Open login modal
 */
function openLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Close login modal
 */
function closeLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    // Reset forms
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

/**
 * Switch between login and register tabs
 */
function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.querySelector('.tab-btn:nth-child(1)');
    const registerTab = document.querySelector('.tab-btn:nth-child(2)');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
    }
}

/**
 * Show notification message
 */
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #10B981, #059669)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
    }
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

/**
 * Logout function
 */
function logout() {
    currentUser = null;
    isAdmin = false;
    userResponses = {};
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    
    // Reset UI
    location.reload();
    
    showNotification('Sesión cerrada', 'success');

}
