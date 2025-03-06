const COOKIE_NAME = 'meetingCultureGameData';
const ADMIN_PASSWORD = 'admin123';
let gameState = {
    currentStage: 0,
    currentQuestion: 0,
    score: 0,
    playerName: ''
};

let gameQuestions = [];
let isAdmin = false;

// אתחול משחק
function initializeGame() {
    loadGameData();
    if (!gameQuestions.length) gameQuestions = getDefaultQuestions();
    document.getElementById('admin-toggle-button').classList.add('hidden');
}

function getDefaultQuestions() {
    return [
        {
            scene: "מנהל מחלקה רוצה לכנס פגישת צוות דחופה. מה עליו לעשות תחילה?",
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978",
            options: [
                { text: "לשלוח הזמנה מיידית לכולם", correct: false, points: 0 },
                { text: "לבדוק אם ניתן לפתור במייל", correct: true, points: 20 }
            ]
        }
    ];
}

// ניהול שאלות
function addNewQuestion() {
    gameQuestions.push({
        scene: "תיאור סצינה חדשה",
        image: "https://via.placeholder.com/600x400",
        options: [
            { text: "תשובה 1", correct: true, points: 20 },
            { text: "תשובה 2", correct: false, points: 0 }
        ]
    });
    renderQuestionEditor();
}

function renderQuestionEditor() {
    const container = document.getElementById('questions-container');
    container.innerHTML = gameQuestions.map((q, index) => `
        <div class="question-editor">
            <h3>שאלה ${index + 1}</h3>
            <input type="text" value="${q.scene}" onchange="updateQuestion(${index}, 'scene', this.value)">
            <input type="text" value="${q.image}" onchange="updateQuestion(${index}, 'image', this.value)">
            ${q.options.map((opt, optIndex) => `
                <div>
                    <input type="text" value="${opt.text}" 
                           onchange="updateOption(${index}, ${optIndex}, 'text', this.value)">
                    <select onchange="updateOption(${index}, ${optIndex}, 'correct', this.value)">
                        <option value="true" ${opt.correct ? 'selected' : ''}>תשובה נכונה</option>
                        <option value="false" ${!opt.correct ? 'selected' : ''}>תשובה שגויה</option>
                    </select>
                </div>
            `).join('')}
            <button onclick="deleteQuestion(${index})">🗑️ מחק שאלה</button>
        </div>
    `).join('');
}

function updateQuestion(index, field, value) {
    gameQuestions[index][field] = value;
    renderQuestionEditor();
}

function updateOption(questionIndex, optionIndex, field, value) {
    gameQuestions[questionIndex].options[optionIndex][field] = field === 'correct' ? value === 'true' : value;
    renderQuestionEditor();
}

function deleteQuestion(index) {
    gameQuestions.splice(index, 1);
    renderQuestionEditor();
}

function saveQuestions() {
    setCookie(COOKIE_NAME, JSON.stringify(gameQuestions), 365);
    alert('השאלות נשמרו בהצלחה!');
}

function loadGameData() {
    const savedData = getCookie(COOKIE_NAME);
    gameQuestions = JSON.parse(savedData);
}

// ניהול עוגיות
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/`;
}

function getCookie(name) {
    const cookie = document.cookie.split('; ')
        .find(row => row.startsWith(`${name}=`));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : '[]';
}

// פונקציות משחק
function startGame() {
    gameState.playerName = document.getElementById('player-name').value.trim();
    if (!gameState.playerName) return alert("נא להזין שם!");
    document.getElementById('name-stage').classList.remove('active-stage');
    loadGameStage();
}

function resetGame() {
    gameState = { currentStage: 0, currentQuestion: 0, score: 0, playerName: '' };
    document.getElementById('score').textContent = '0';
    document.getElementById('name-stage').classList.add('active-stage');
}

function loadGameStage() {
    // Implement the logic to load the game stage based on gameState
    // This function should update the DOM to show the current stage and question
}

// ממשק אדמין
function toggleAdminPanel() {
    if (!isAdmin) {
        const password = prompt('הזן סיסמת אדמין:');
        if (password !== ADMIN_PASSWORD) {
            alert('סיסמה לא נכונה');
            return;
        }
        isAdmin = true;
        document.getElementById('admin-toggle-button').classList.remove('hidden');
    }

    const mainGame = document.getElementById('main-game');
    const adminPanel = document.getElementById('admin-panel');
    mainGame.classList.toggle('hidden');
    adminPanel.classList.toggle('hidden');
}

// פונקציה לטעינת שלב המשחק הנוכחי
function loadGameStage() {
    const container = document.getElementById('game-stages');
    const questionData = gameQuestions[gameState.currentQuestion];

    const html = `
        <div class="stage active-stage">
            <div class="scene-container">
                <div class="scene-image" style="background-image: url('${questionData.image}')"></div>
                <div class="question-panel">
                    <div class="question-text">${questionData.scene}</div>
                    <div class="options-container">
                        ${questionData.options.map((opt, i) => `
                            <button onclick="handleAnswer(this, ${opt.correct}, ${opt.points})">
                                ${opt.text}
                            </button>
                        `).join('')}
                    </div>
                    <div class="feedback"></div>
                </div>
            </div>
            <button onclick="nextQuestion()">לשאלה הבאה</button>
        </div>
    `;

    container.innerHTML = html;
}

// פונקציה לטיפול בתשובות
function handleAnswer(btn, isCorrect, points) {
    const feedback = btn.closest('.question-panel').querySelector('.feedback');
    const buttons = btn.closest('.question-panel').querySelectorAll('button');

    buttons.forEach(b => b.disabled = true);

    if (isCorrect) {
        gameState.score += points;
        document.getElementById('score').textContent = gameState.score;
        btn.style.backgroundColor = 'var(--success-color)';
        feedback.textContent = "תשובה נכונה! +" + points + " נקודות";
        feedback.classList.add('correct');
    } else {
        btn.style.backgroundColor = 'var(--error-color)';
        feedback.textContent = "נסה שוב בפעם הבאה!";
        feedback.classList.add('incorrect');
    }

    feedback.style.display = 'block';
}

// מעבר לשאלה הבאה
function nextQuestion() {
    gameState.currentQuestion++;
    if (gameState.currentQuestion < gameQuestions.length) {
        loadGameStage();
    } else {
        endGame();
    }
}

// הוספת מאזין לאירועי מקלדת
document.addEventListener('keydown', (event) => {
    // Ctrl + Shift + Alt + A
    if (event.ctrlKey && event.shiftKey && event.altKey && event.key === 'A') {
        const adminButton = document.getElementById('admin-toggle-button');
        adminButton.classList.remove('hidden');
        alert('כפתור הניהול הופעל. לחץ עליו כדי לגשת לממשק.');
    }
});

// עדכון פונקציית endGame
function endGame() {
    document.getElementById('game-stages').innerHTML = '';
    document.getElementById('end-stage').classList.add('active-stage');
    document.getElementById('final-score').textContent = 
        `${gameState.playerName}, סיימת את המשחק עם ${gameState.score} נקודות!`;
}
// טעינת המשחק
window.onload = initializeGame;