let languages = [];
let sourceLang = "auto";   // DEFAULT
let targetLang = "hi";     // DEFAULT HINDI

window.onload = loadLanguages;

async function loadLanguages() {
    const res = await fetch("/languages");
    const data = await res.json();
    languages = data.languages;

    createDropdown("sourceDropdown", true);
    createDropdown("targetDropdown", false);
}

function createDropdown(containerId, isSource) {
    const container = document.getElementById(containerId);

    container.innerHTML = `
        <div class="dropdown-wrapper">
            <input type="text" readonly class="search-input">
            <div class="dropdown-list hidden"></div>
        </div>
    `;

    const input = container.querySelector(".search-input");
    const list = container.querySelector(".dropdown-list");

    const selectedCode = isSource ? sourceLang : targetLang;
    const selectedLang = languages.find(l => l.code === selectedCode);
    if (selectedLang) input.value = selectedLang.name;

    function renderList() {
        list.innerHTML = "";

        languages.forEach(lang => {
            const item = document.createElement("div");
            item.className = "dropdown-item";
            item.textContent = lang.name;

            item.onclick = () => {
                if (isSource) sourceLang = lang.code;
                else targetLang = lang.code;

                input.value = lang.name;
                list.classList.add("hidden");
            };

            list.appendChild(item);
        });
    }

    renderList();

    // Open on click
    input.onclick = () => {
        list.classList.toggle("hidden");
    };

    // Close when clicking outside
    document.addEventListener("click", function (e) {
        if (!container.contains(e.target)) {
            list.classList.add("hidden");
        }
    });
}

function swapLanguages() {
    const temp = sourceLang;
    sourceLang = targetLang;
    targetLang = temp;

    createDropdown("sourceDropdown", true);
    createDropdown("targetDropdown", false);
}

/* AUTO TRANSLATE */
let debounce;
document.getElementById("input_text").addEventListener("input", function() {
    clearTimeout(debounce);
    debounce = setTimeout(() => translateText(), 600);
});

function translateText() {
    const text = document.getElementById("input_text").value;
    if (!text.trim()) return;

    document.getElementById("loading").style.display = "flex";

    fetch("/translate", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            text: text,
            source: sourceLang,
            target: targetLang
        })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("loading").style.display = "none";
        document.getElementById("output_text").innerText = data.translated_text;
        saveHistory(text, data.translated_text);
    });
}

/* SPEAK + HIGHLIGHT */
function speakText() {
    const output = document.getElementById("output_text");
    const text = output.innerText;
    if (!text) return;

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onboundary = function(event) {
        if (event.name === "word") {
            const before = text.substring(0, event.charIndex);
            const after = text.substring(event.charIndex);
            const word = after.split(" ")[0];

            output.innerHTML =
                before +
                `<span class="highlight">${word}</span>` +
                after.substring(word.length);
        }
    };

    utterance.onend = () => output.innerHTML = text;

    speechSynthesis.speak(utterance);
}

/* MIC */
function startSpeech() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.onresult = function(event) {
        document.getElementById("input_text").value =
            event.results[0][0].transcript;
        translateText();
    };
    recognition.start();
}

/* HISTORY */
function saveHistory(input, output) {
    let history = JSON.parse(localStorage.getItem("history")) || [];
    history.unshift({input, output});
    localStorage.setItem("history", JSON.stringify(history));
}

function showHistory() {
    document.getElementById("translator").style.display = "none";
    document.getElementById("history").style.display = "block";

    let history = JSON.parse(localStorage.getItem("history")) || [];
    let container = document.getElementById("history_list");
    container.innerHTML = "";

    history.forEach(item => {
        container.innerHTML += `
            <div style="margin-bottom:10px;">
                <strong>${item.input}</strong><br/>
                ${item.output}
                <hr/>
            </div>
        `;
    });
}

function showTranslator() {
    document.getElementById("history").style.display = "none";
    document.getElementById("translator").style.display = "block";
}

function toggleDark() {
    document.body.classList.toggle("dark");
}