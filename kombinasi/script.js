const API_KEY = 'AIzaSyDbs9VXqEVHK8i4o2Ns77-lEC7ucK9Ekok';

const QUESTIONS = Array.from(document.querySelectorAll("#questions li")).map(li => li.innerText);
let currentIndex = 0;
let score = 0;
let answersSummary = [];

const questionEl = document.getElementById("questionText");
const responseText = document.getElementById("responseText");
const loadingEl = document.getElementById("loading");
const subtitleEl = document.getElementById("subtitle");
const retryButton = document.getElementById("retryButton");
const summaryCards = document.getElementById("summaryCards");
const finalScoreEl = document.getElementById("finalScore");
const resultSummary = document.getElementById("resultSummary");
const timerEl = document.getElementById("timer");
const nextButton = document.getElementById("nextButton");

questionEl.innerText = `Pertanyaan 1: ${QUESTIONS[0]}`;
let currentUtterance = null;
let lastAnswer = "";
let timerInterval = null;

async function sendMessage() {
    const userAnswer = document.getElementById("inputText").value;
    lastAnswer = userAnswer; // simpan
    loadingEl.style.display = "block";
    responseText.innerText = "";
    subtitleEl.innerText = "";

    // sembunyikan semua tombol saat mulai proses
    retryButton.style.display = "none";
    nextButton.style.display = "none";

    const prompt = `
Kamu adalah evaluator jawaban kuis kombinasi.
Pertanyaan: "${QUESTIONS[currentIndex]}"
Jawaban pengguna: "${userAnswer}"

Tugasmu: berikan penilaian apakah jawaban pengguna benar atau salah serta penjelasan kenapa bisa salah atau benar secara objektif,
jelaskan dengan singkat, padat, jelas tanpa karakter tambahan (*, #, dll).
Jawabanmu harus dimulai dengan "Benar" atau "Salah".
  `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
    const data = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        loadingEl.style.display = "none";

        if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
            const text = result.candidates[0].content.parts[0].text.trim();
            responseText.innerText = text;

            // Delay sebelum suara dimulai (ubah 1000 untuk mengatur delay)
            setTimeout(() => {
                speakText(text);
            }, 0);

            // simpan ke ringkasan
            answersSummary.push({
                question: QUESTIONS[currentIndex],
                answer: userAnswer,
                ai: text,
            });

            // cek benar/salah
            if (text.toLowerCase().startsWith("benar")) {
                score++;
                // tombol akan tampil setelah suara selesai
            } else if (text.toLowerCase().startsWith("salah")) {
                // tombol akan tampil setelah suara selesai
            } else {
                // tombol akan tampil setelah suara selesai
            }
        } else {
            responseText.innerText = "No valid response from API";
        }
    } catch (error) {
        loadingEl.style.display = "none";
        responseText.innerText = "Error: " + error.message;
    }
}

// fungsi TTS + subtitle
function speakText(text) {
    if (speechSynthesis.speaking) speechSynthesis.cancel();

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = "id-ID";

    const sentences = text.split(/(?<=[.?!])\s+/); // pecah jadi kalimat
    let idx = 0;

    currentUtterance.onboundary = function (event) {
        if (event.name === "sentence" || event.charIndex >= sentences.slice(0, idx + 1).join(" ").length) {
            subtitleEl.innerText = sentences[idx] || "";
            idx++;
        }
    };

    currentUtterance.onend = function () {
        subtitleEl.innerText = "";

        // Tampilkan tombol setelah suara selesai
        if (text.toLowerCase().startsWith("benar")) {
            nextButton.style.display = "block";
            retryButton.style.display = "none";
        } else if (text.toLowerCase().startsWith("salah")) {
            retryButton.style.display = "block";
            nextButton.style.display = "none";
        } else {
            retryButton.style.display = "block";
            nextButton.style.display = "none";
        }
    };

    speechSynthesis.speak(currentUtterance);
}

function nextQuestion() {
    retryButton.style.display = "none";
    nextButton.style.display = "none";
    if (currentIndex < QUESTIONS.length - 1) {
        currentIndex++;
        document.getElementById("inputText").value = "";
        questionEl.innerText = `Pertanyaan ${currentIndex + 1}: ${QUESTIONS[currentIndex]}`;
        responseText.innerText = "";
        subtitleEl.innerText = "";
    } else {
        showResult();
    }
}

function showResult() {
    resultSummary.style.display = "block";
    finalScoreEl.innerText = `Skor akhir: ${score} dari ${QUESTIONS.length}`;

    summaryCards.innerHTML = "";
    answersSummary.forEach((row, index) => {
        const card = document.createElement("div");
        card.className = "result-card";

        card.innerHTML = `
            <div class="card-header">Soal ${index + 1}</div>
            <div class="card-answer">
                <strong>� Jawabanmu:</strong><br>
                ${row.answer}
            </div>
            <div class="card-ai">
                <strong>🤖 Koreksi AI:</strong><br>
                ${row.ai}
            </div>
        `;

        summaryCards.appendChild(card);
    });
}

// voice input
function startVoiceRecognition() {
    if (!("webkitSpeechRecognition" in window)) {
        alert("Browser Anda tidak mendukung Speech Recognition");
        return;
    }
    const recognition = new webkitSpeechRecognition();
    recognition.lang = "id-ID";
    recognition.start();

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById("inputText").value = transcript;
        sendMessage();
    };
}

// tombol coba lagi
retryButton.addEventListener("click", () => {
    retryButton.style.display = "none";
    document.getElementById("inputText").value = "";
    responseText.innerText = "Silakan coba jawab lagi.";
    subtitleEl.innerText = "";
});

// tombol lanjut soal
nextButton.addEventListener("click", () => {
    nextQuestion();
});

// kontrol suara
document.getElementById("pauseButton").addEventListener("click", () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) speechSynthesis.pause();
});
document.getElementById("repeatButton").addEventListener("click", () => {
    if (currentUtterance?.text) {
        speechSynthesis.cancel();
        speakText(currentUtterance.text);
    }
});

// event listeners
document.getElementById("sendButton").addEventListener("click", sendMessage);
document.getElementById("voiceButton").addEventListener("click", startVoiceRecognition);