
const API_KEY = 'AIzaSyBUhiDrEk7Wo4O2L-IZzRzpVZTtH_X-Nes';

// ambil pertanyaan dari HTML <ul id="questions">
const QUESTIONS = Array.from(document.querySelectorAll("#questions li")).map(li => li.innerText);

let currentIndex = 0;
const questionEl = document.getElementById("questionText");
const responseText = document.getElementById("responseText");
const loadingEl = document.getElementById("loading");

let currentUtterance = null;
if (questionEl) {
    questionEl.innerText = `Pertanyaan ${currentIndex + 1}: ` + QUESTIONS[currentIndex];
}


async function sendMessage() {
    const userAnswer = document.getElementById("inputText").value;

    loadingEl.style.display = "block";
    responseText.innerText = "";

    const prompt = `
Kamu adalah evaluator jawaban kuis permutasi.
Pertanyaan: "${QUESTIONS[currentIndex]}"
Jawaban user: "${userAnswer}"

Tugasmu: berikan penilaian apakah jawaban user benar atau salah,
lalu berikan jawaban yang singkat, padat, jelas serta memiliki penjelasan yang lengkap. 
Jangan gunakan karakter tambahan seperti *, #, dll.
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
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("API Response:", result);

        loadingEl.style.display = "none";

        if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
            const text = result.candidates[0].content.parts[0].text;
            responseText.innerText = text;
            speakText(text);

            // setelah jawaban keluar, lanjut pertanyaan berikutnya
            if (currentIndex < QUESTIONS.length - 1) {
                currentIndex++;
                setTimeout(() => {
                    document.getElementById("inputText").value = "";
                    questionEl.innerText = `Pertanyaan ${currentIndex + 1}: ` + QUESTIONS[currentIndex];
                }, 3000); // tunggu 3 detik baru ganti soal
            } else {
                setTimeout(() => {
                    questionEl.innerText = "✅ Semua pertanyaan selesai!";
                }, 3000);
            }

        } else {
            responseText.innerText = "No valid response from API";
        }
    } catch (error) {
        loadingEl.style.display = "none";
        responseText.innerText = "Error: " + error.message;
    }
}

// text-to-speech
function speakText(text) {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = "id-ID";
    speechSynthesis.speak(currentUtterance);
}

// voice input
function startVoiceRecognition() {
    if (!("webkitSpeechRecognition" in window)) {
        alert("Browser Anda tidak mendukung Speech Recognition");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = "id-ID";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.start();

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById("inputText").value = transcript;
        sendMessage();
    };

    recognition.onerror = function (event) {
        console.error("Speech recognition error", event.error);
    };
}

// kontrol suara
document.getElementById("pauseButton").addEventListener("click", () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause();
    }
});

document.getElementById("repeatButton").addEventListener("click", () => {
    if (currentUtterance?.text) {
        speechSynthesis.cancel();
        speakText(currentUtterance.text);
    }
});

document.getElementById("sendButton").addEventListener("click", sendMessage);
document.getElementById("voiceButton").addEventListener("click", startVoiceRecognition);
