
const API_KEY = 'AIzaSyBUhiDrEk7Wo4O2L-IZzRzpVZTtH_X-Nes';

const QUESTION = document.getElementById("questionText").innerText;


async function sendMessage() {
    const userAnswer = document.getElementById("inputText").value;
    const responseText = document.getElementById("responseText");

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
        responseText.innerText = "Error: " + error.message;
    }
}

function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    speechSynthesis.speak(utterance);
}


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


document.getElementById("sendButton").addEventListener("click", sendMessage);
document.getElementById("voiceButton").addEventListener("click", startVoiceRecognition);
