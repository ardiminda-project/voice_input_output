const API_KEY = 'AIzaSyDbs9VXqEVHK8i4o2Ns77-lEC7ucK9Ekok';

async function sendMessage() {
    const inputText = document.getElementById('inputText').value;
    const responseText = document.getElementById('responseText');

    // custom prompt untuk kombinatorik & etnomatematika budaya Malang
    const prompt = `
Kamu adalah guru matematika yang sangat pintar dan sabar. 
Jawablah pertanyaan berikut dengan bahasa yang singkat, jelas, padat, namun tetap lengkap.

Pertanyaan: ${inputText}

Syarat jawabanmu:
1. Penjelasan harus berada dalam ranah kombinatorik dan permutasi.
2. Kaitkan jawaban dengan etnomatematika budaya Malang, misalnya Topeng Malangan, batik, tarian, atau tradisi lokal.
3. Jangan gunakan simbol aneh atau karakter tambahan seperti *, #, ~.
4. Jawaban harus enak dibaca, runtut, dan mudah dipahami oleh siswa SMA.
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
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        console.log('API Response:', result);

        if (result && result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            responseText.innerText = text;
        } else {
            responseText.innerText = 'No valid response from API';
        }
    } catch (error) {
        responseText.innerText = 'Error: ' + error.message;
    }
}


// Tambahkan event listener ke tombol
document.getElementById('sendButton').addEventListener('click', sendMessage);