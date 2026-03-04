let languages = [];
let sourceLang = "auto";
let targetLang = "hi";

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
    input.onclick = () => list.classList.toggle("hidden");
    document.addEventListener("click", function(e) {
        if (!container.contains(e.target)) list.classList.add("hidden");
    });
}

function swapLanguages() {
    if (sourceLang === "auto") return;
    [sourceLang, targetLang] = [targetLang, sourceLang];
    const inputEl = document.getElementById("input_text");
    const outputEl = document.getElementById("output_text");
    const outputText = outputEl.innerText;
    if (outputText) inputEl.value = outputText;
    outputEl.innerText = "";
    createDropdown("sourceDropdown", true);
    createDropdown("targetDropdown", false);
}

/* CHARACTER COUNT + AUTO TRANSLATE */
let debounce;
document.getElementById("input_text").addEventListener("input", function() {
    document.getElementById("charCount").textContent = this.value.length;
    clearTimeout(debounce);
    debounce = setTimeout(() => translateText(), 700);
});

function translateText() {
    const text = document.getElementById("input_text").value;
    if (!text.trim()) {
        document.getElementById("output_text").innerText = "";
        return;
    }

    document.getElementById("loading").style.display = "block";
    document.getElementById("output_text").innerText = "";

    fetch("/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, source: sourceLang, target: targetLang })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("loading").style.display = "none";
        document.getElementById("output_text").innerText = data.translated_text;
        saveHistory(text, data.translated_text);
    })
    .catch(() => {
        document.getElementById("loading").style.display = "none";
        document.getElementById("output_text").innerText = "Translation unavailable.";
    });
}

/* COPY */
function copyText(id, btn) {
    const el = document.getElementById(id);
    const text = el.value !== undefined ? el.value : el.innerText;
    if (!text.trim()) return;
    navigator.clipboard.writeText(text).then(() => {
        btn.classList.add("copied");
        btn.innerHTML = `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
        setTimeout(() => {
            btn.classList.remove("copied");
            btn.innerHTML = `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`;
        }, 1800);
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
            output.innerHTML = before + `<span class="highlight">${word}</span>` + after.substring(word.length);
        }
    };
    utterance.onend = () => { output.innerHTML = text; };
    speechSynthesis.speak(utterance);
}

/* MIC */
function startSpeech() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Speech recognition not supported in this browser."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = function(event) {
        document.getElementById("input_text").value = event.results[0][0].transcript;
        document.getElementById("charCount").textContent = document.getElementById("input_text").value.length;
        translateText();
    };
    recognition.start();
}

/* HISTORY */
function saveHistory(input, output) {
    if (!output || output === "Translation unavailable.") return;
    let history = JSON.parse(localStorage.getItem("nlHistory")) || [];
    history.unshift({ input, output, time: Date.now() });
    if (history.length > 50) history = history.slice(0, 50);
    localStorage.setItem("nlHistory", JSON.stringify(history));
}

function showHistory(el) {
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    el.classList.add("active");
    document.getElementById("translator").style.display = "none";
    document.getElementById("history").style.display = "block";

    const history = JSON.parse(localStorage.getItem("nlHistory")) || [];
    const container = document.getElementById("history_list");

    if (history.length === 0) {
        container.innerHTML = `<div class="history-empty">No translations yet</div>`;
        return;
    }

    container.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="history-source">${escapeHtml(item.input)}</div>
            <div class="history-divider"></div>
            <div class="history-target">${escapeHtml(item.output)}</div>
        </div>
    `).join("");
}

function showTranslator(el) {
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    el.classList.add("active");
    document.getElementById("history").style.display = "none";
    document.getElementById("translator").style.display = "block";
}

function escapeHtml(text) {
    return text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

/* DARK MODE */
function toggleDark() {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    document.getElementById("themeLabel").textContent = isDark ? "Dark" : "Light";
    localStorage.setItem("nlTheme", isDark ? "dark" : "light");
}

if (localStorage.getItem("nlTheme") === "dark") {
    document.body.classList.add("dark");
    window.addEventListener("DOMContentLoaded", () => {
        const label = document.getElementById("themeLabel");
        if (label) label.textContent = "Dark";
    });



}