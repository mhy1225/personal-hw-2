document.addEventListener("DOMContentLoaded", () => {

    // --- 遊戲測驗區塊邏輯 ---
    // 注意：speakText 是「中文語音朗讀」拼出的詞，是暫時頂用的方案，
    // 瀏覽器內建語音引擎不懂台語白話字，發音不會是正確台語。
    // 等你有真人錄音的 mp3 檔案後，請改回 <audio> 播放方式（檔案在最下面已保留註解）。
    const quizData = [
        {
            word: "早起",
            speakText: "早起",
            correct: "tsá-khí",
            options: ["tsá-kng", "tsá-khí", "tsá-tǹg"]
        },
        {
            word: "可以",
            speakText: "會當",
            correct: "ē-tàng",
            options: ["ē-tàng", "ē-sái", "ē-hiáu"]
        },
        {
            word: "美麗",
            speakText: "媠",
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
                <button class="play-btn" onclick="playAudio('${q.speakText}')">
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

    // ===== 暫用方案：用瀏覽器內建 Web Speech API 唸出文字 =====
    // 完全免費、不需要任何 API key、不需要上傳音檔，
    // 但發音引擎不支援台語，只會用中文唸法念出對應的中文詞。
    // 等有真人錄音的 mp3 後，建議改回下方註解掉的版本。
    window.playAudio = function(text) {
        if (!('speechSynthesis' in window)) {
            alert("此瀏覽器不支援語音播放功能，請更換瀏覽器（建議使用 Chrome）。");
            return;
        }
        // 避免多次點擊疊加播放
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "zh-TW";
        utterance.rate = 0.85; // 稍微放慢，聽起來清楚一點

        window.speechSynthesis.speak(utterance);
    };

    /* ===== 未來換成真人錄音 mp3 時，改用這個版本 =====
    window.playAudio = function(audioId) {
        const audio = document.getElementById(audioId);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log("音檔播放失敗:", e));
        }
    };
    // 並把 renderQuestion() 裡 onclick="playAudio('${q.speakText}')"
    // 改回 onclick="playAudio('${q.audioId}')"，
    // quizData 裡的 speakText 也要改回 audioId（對應 audio 標籤的 id）
    */

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
