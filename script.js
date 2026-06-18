document.addEventListener("DOMContentLoaded", () => {
    
    // --- 遊戲測驗區塊邏輯 ---
    const quizData = [
        {
            word: "早起",
            audioId: "audio-1",
            correct: "tsá-khí",
            options: ["tsá-kng", "tsá-khí", "tsá-tǹg"]
        },
        {
            word: "可以",
            audioId: "audio-2",
            correct: "ē-tàng",
            options: ["ē-tàng", "ē-sái", "ē-hiáu"]
        },
        {
            word: "美麗",
            audioId: "audio-3",
            correct: "suí",
            options: ["bái", "pháng", "suí"]
        }
    ];

    let currentQuestion = 0;
    let score = 0;
    const quizContainer = document.getElementById("quiz-container");
    const resultContainer = document.getElementById("quiz-result");
    const scoreText = document.getElementById("score-text");

    function renderQuestion() {
        if (currentQuestion >= quizData.length) {
            showResult();
            return;
        }

        const q = quizData[currentQuestion];
        // 打亂選項順序
        const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

        quizContainer.innerHTML = `
            <div class="question-block">
                <h2 style="font-size: 2.5rem; margin-bottom: 20px;">「${q.word}」</h2>
                <button class="play-btn" onclick="playAudio('${q.audioId}')">
                    ▶ 播放語音
                </button>
                <div class="options-grid">
                    ${shuffledOptions.map(opt => `
                        <button class="option-btn" onclick="checkAnswer(this, '${opt}', '${q.correct}')">
                            ${opt}
                        </button>
                    `).join("")}
                </div>
            </div>
        `;
    }

    // 將播放與檢查函式掛載到 window，讓 onclick 可以呼叫
    window.playAudio = function(audioId) {
        const audio = document.getElementById(audioId);
        if (audio) {
            audio.currentTime = 0;
            // 若因為沒有真實音檔報錯，會在 console 顯示，不影響介面
            audio.play().catch(e => console.log("等待替換真實音檔:", e));
        }
    };

    window.checkAnswer = function(btnElement, selected, correct) {
        // 防止重複點擊
        const allBtns = document.querySelectorAll('.option-btn');
        allBtns.forEach(btn => btn.style.pointerEvents = 'none');

        if (selected === correct) {
            btnElement.classList.add("correct");
            score++;
        } else {
            btnElement.classList.add("wrong");
            // 標示出正確答案
            allBtns.forEach(btn => {
                if (btn.innerText.trim() === correct) {
                    btn.classList.add("correct");
                }
            });
        }

        // 延遲 1.5 秒後進入下一題
        setTimeout(() => {
            currentQuestion++;
            renderQuestion();
        }, 1500);
    };

    function showResult() {
        quizContainer.classList.add("hidden");
        resultContainer.classList.remove("hidden");
        scoreText.innerText = `你總共答對了 ${score} / ${quizData.length} 題！`;
        
        // 測驗結束後，啟動滾動監聽
        initScrollytelling();
    }

    // 初始化第一題
    renderQuestion();

    // --- 滾動式報導 (Scrollytelling) 邏輯 ---
    function initScrollytelling() {
        const steps = document.querySelectorAll(".step");
        const bgImages = document.querySelectorAll(".bg-image");

        // 使用 IntersectionObserver 來偵測目前讀者滑到哪一個文字方塊
        const observerOptions = {
            root: null,
            rootMargin: "-40% 0px -40% 0px", // 螢幕中間區域觸發
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 文字方塊淡入動畫
                    entry.target.classList.add("is-active");
                    
                    // 獲取當前步驟的索引值
                    const index = entry.target.getAttribute("data-index");
                    
                    // 切換背景圖片
                    bgImages.forEach(bg => bg.classList.remove("active"));
                    const targetBg = document.getElementById(`bg-${index}`);
                    if (targetBg) {
                        targetBg.classList.add("active");
                    }
                }
            });
        }, observerOptions);

        steps.forEach(step => observer.observe(step));
    }
});