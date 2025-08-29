
const API_KEY = 'AIzaSyBUhiDrEk7Wo4O2L-IZzRzpVZTtH_X-Nes';

// ambil pertanyaan statis dari HTML
const QUESTION = document.getElementById("questionText").innerText;
const loadingEl = document.getElementById("loading");

let currentUtterance = null; // simpan object suara agar bisa di-pause/resume

async function sendMessage() {
    const userAnswer = document.getElementById("inputText").value;
    const responseText = document.getElementById("responseText");

    // tampilkan loading
    loadingEl.style.display = "block";
    responseText.innerText = "";

    const prompt = `
Kamu adalah evaluator jawaban kuis.
Pertanyaan: "${QUESTION}"
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

        loadingEl.style.display = "none"; // sembunyikan loading

        if (
            result &&
            result.candidates &&
            result.candidates.length > 0 &&
            result.candidates[0].content &&
            result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0
        ) {
            const text = result.candidates[0].content.parts[0].text;
            responseText.innerText = text;

            speakText(text);
        } else {
            responseText.innerText = "No valid response from API";
        }
    } catch (error) {
        loadingEl.style.display = "none";
        responseText.innerText = "Error: " + error.message;
    }
}

// fungsi text-to-speech
function speakText(text) {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel(); // stop dulu kalau ada suara sebelumnya
    }

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = "id-ID";
    speechSynthesis.speak(currentUtterance);
}

// fungsi input suara
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

document.getElementById("resumeButton").addEventListener("click", () => {
    if (speechSynthesis.paused) {
        speechSynthesis.resume();
    }
});

document.getElementById("sendButton").addEventListener("click", sendMessage);
document.getElementById("voiceButton").addEventListener("click", startVoiceRecognition);