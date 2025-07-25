import { questions, messages } from './questions.js';

const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const questionContainer = document.getElementById('question-container');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const statsContainer = document.getElementById('stats');
const timerDisplay = document.getElementById('timer-display');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress-fill');
const anglerfish = document.getElementById('anglerfish');
const characterContainer = document.getElementById('character-container');
const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');
const gameContainer = document.getElementById('game-container');
const endMessage = document.getElementById('end-message');
const bubbleContainer = document.querySelector('.bubble-container');

let currentQuestionIndex = 0;
const totalQuestions = questions.length;
let gameStartTime = null;
let timerInterval = null;

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

function startGame() {
    console.log('게임 시작!');
    currentQuestionIndex = 0;
    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    statsContainer.classList.remove('hidden'); // 타이머 표시
    progressBar.classList.remove('hidden'); // 진행도 바 표시
    updateProgress();
    resetCharacterPosition();
    stopBubbles(); // 이전 버블들 정리
    startTimer(); // 타이머 시작

    showMessage(messages.gameStart, () => {
        console.log('메시지 후 아귀 크기 변화 시작');
        // 아귀가 커졌다가 원래 크기로
        anglerfish.style.transform = 'scale(1.5)';
        setTimeout(() => {
            anglerfish.style.transform = 'scale(1)';
            setTimeout(() => {
                console.log('아귀 애니메이션 후 질문 표시');
                displayQuestion();
                // 평상시 거품 생성 제거
            }, 500);
        }, 800);
    });
}

function displayQuestion() {
    console.log('displayQuestion 호출됨, currentQuestionIndex:', currentQuestionIndex);
    console.log('totalQuestions:', totalQuestions);
    
    if (currentQuestionIndex >= totalQuestions) {
        console.log('모든 질문 완료, 게임 종료');
        endGame();
        return;
    }

    const question = questions[currentQuestionIndex];
    console.log('현재 질문:', question);
    
    if (!question) {
        console.error('질문을 찾을 수 없습니다:', currentQuestionIndex);
        return;
    }
    
    questionText.textContent = question.question;
    optionsContainer.innerHTML = '';

    if (question.type === 'input') {
        // 인풋 타입 질문
        const inputContainer = document.createElement('div');
        inputContainer.style.cssText = `
            margin-top: 20px;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
        `;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '답을 입력하세요';
        input.style.cssText = `
            flex: 1;
            min-width: 200px;
            max-width: 300px;
            box-sizing: border-box;
            padding: 12px 15px;
            font-size: clamp(1rem, 2.5vw, 1.1rem);
            border: 2px solid #4a90e2;
            border-radius: 10px;
            background-color: rgba(255, 255, 255, 0.9);
            outline: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
        `;
        
        const submitButton = document.createElement('button');
        submitButton.textContent = '답 제출';
        submitButton.classList.add('option-button');
        submitButton.addEventListener('click', () => {
            const answer = input.value.trim();
            if (answer) {
                selectAnswer(answer);
            }
        });
        
        // 엔터키로도 제출 가능
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const answer = input.value.trim();
                if (answer) {
                    selectAnswer(answer);
                }
            }
        });
        
        inputContainer.appendChild(input);
        inputContainer.appendChild(submitButton);
        optionsContainer.appendChild(inputContainer);
        
        // 인풋에 포커스
        setTimeout(() => input.focus(), 100);
    } else {
        // 기존 선택지 타입 질문
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('option-button');
            button.addEventListener('click', () => selectAnswer(option));
            optionsContainer.appendChild(button);
        });
    }

    console.log('질문 컨테이너 표시');
    console.log('questionContainer 요소:', questionContainer);
    
    // 확실히 hidden 클래스 제거
    questionContainer.classList.remove('hidden');
    questionContainer.className = questionContainer.className.replace('hidden', '');
    questionContainer.style.display = 'block';
    questionContainer.style.visibility = 'visible';
    questionContainer.style.opacity = '1';
    
    console.log('질문 컨테이너 classList:', questionContainer.classList);
    console.log('질문 컨테이너 style.display:', questionContainer.style.display);
}

function selectAnswer(selectedOption) {
    const correct = selectedOption === questions[currentQuestionIndex].answer;

    if (correct) {
        currentQuestionIndex++;
        moveCharacter(); // 메시지와 동시에 이펙트 시작
        showMessage(messages.correct, () => {
            if (currentQuestionIndex < totalQuestions) {
                displayQuestion();
            } else {
                endGame();
            }
        });
    } else {
        // 틀렸을 때 아귀가 당황하는 효과
        anglerfish.style.transform = 'scale(1.2) rotate(-5deg)';
        setTimeout(() => {
            anglerfish.style.transform = 'scale(1.2) rotate(5deg)';
            setTimeout(() => {
                anglerfish.style.transform = 'scale(1) rotate(0deg)';
            }, 200);
        }, 200);
        
        showMessage(messages.wrong, displayQuestion);
    }
}

// 목숨 시스템 제거됨

function moveCharacter() {
    // 아귀는 고정 위치에 유지하고, 대신 진행도 바로 진행 상황 표현
    updateProgress();
    
    // 정답 시 아귀가 내려가는 듯한 효과 (0.5초)
    createAnswerBubbles(); // 거품 대량 생성
    anglerfish.style.transform = 'scale(0.8) translateY(30px)'; // 아귀가 작아지며 아래로
    setTimeout(() => {
        anglerfish.style.transform = 'scale(1) translateY(0px)'; // 원래대로 복귀
    }, 500);
    
    console.log(`진행도: ${currentQuestionIndex}/${totalQuestions}`);
}

function updateProgress() {
    const progress = (currentQuestionIndex / totalQuestions) * 100;
    progressFill.style.width = `${progress}%`;
}

function startTimer() {
    gameStartTime = Date.now();
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - gameStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetCharacterPosition() {
    characterContainer.style.top = '40%';
    characterContainer.style.left = '50%';
    characterContainer.style.transform = 'translate(-50%, -50%)';
    gameContainer.style.transform = 'none'; // 줌 효과 제거
    anglerfish.style.transform = 'scale(1)'; // 아귀 크기 초기화
}

function showMessage(text, callback) {
    console.log('showMessage 호출됨:', text);
    questionContainer.classList.add('hidden');
    messageText.textContent = text;
    messageBox.classList.remove('hidden');

    setTimeout(() => {
        console.log('메시지 타이머 완료, 콜백 실행');
        messageBox.classList.add('hidden');
        if (callback) {
            callback();
        }
    }, 2000);
}

function endGame() {
    gameScreen.classList.add('hidden');
    statsContainer.classList.add('hidden'); // 타이머 숨김
    progressBar.classList.add('hidden'); // 진행도 바 숨김
    questionContainer.classList.add('hidden'); // 질문 숨김
    endScreen.classList.remove('hidden');
    stopTimer(); // 타이머 정지
    
    const elapsed = Date.now() - gameStartTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    endMessage.textContent = `${messages.gameWin} (완주 시간: ${minutes}:${seconds.toString().padStart(2, '0')})`;
    stopBubbles();
}

// 평상시 거품 생성 함수 제거 - 정답 시에만 거품 생성

function createAnswerBubbles() {
    // 정답 시 거품을 대량으로 생성 (0.5초간)
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div');
            bubble.classList.add('bubble');
            bubble.style.left = `${30 + Math.random() * 40}%`; // 중앙 부근에서 생성
            bubble.style.animationDuration = `1s`; // 0.5초 효과에 맞춰 빠르게
            bubble.style.width = `${15 + Math.random() * 25}px`; // 조금 더 큰 거품
            bubble.style.height = bubble.style.width;
            bubble.style.backgroundColor = `rgba(255, 255, 255, ${0.6 + Math.random() * 0.4})`; // 더 밝게
            bubbleContainer.appendChild(bubble);

            setTimeout(() => {
                if (bubble.parentNode) {
                    bubble.remove();
                }
            }, 1000); // 1초 후 제거
        }, i * 50); // 빠르게 순차적으로 생성
    }
}

function stopBubbles() {
    // 남은 거품들만 정리
    bubbleContainer.innerHTML = '';
}
