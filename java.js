const questionInput = document.querySelector("#questionInput");
const chatBody = document.querySelector("#chatBody");
const chatHistoryDiv = document.getElementById("chatHistoryDisplay");
let conversation = [];

// Load conversation from localStorage on page load
window.onload = () => {
  const saved = localStorage.getItem("chatConversation");
  if (saved) {
    conversation = JSON.parse(saved);
    conversation.forEach(msg => {
      appendMessage(msg.text, msg.role === "user" ? "user-message" : "bot-message");
    });
  }
};

// Append message to chat UI
function appendMessage(text, className) {
  const msg = document.createElement("div");
  msg.className = `message ${className}`;
  msg.innerText = text;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Save conversation to localStorage
function saveConversation() {
  localStorage.setItem("chatConversation", JSON.stringify(conversation));
}

// Send question to API
function askGemini() {
  const query = questionInput.value.trim();
  if (!query) return;

  appendMessage(query, "user-message");
  conversation.push({ role: "user", text: query });
  saveConversation();
  questionInput.value = "";

  const contents = conversation.map(msg => ({
    parts: [{ text: msg.text }]
  }));

  fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDBbiVqux_bAyxhiqI47fNrL9ttRxS_AKY", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents })
  })
    .then(response => response.json())
    .then(data => {
      const finalAnswer = data.candidates[0]?.content?.parts[0]?.text || "No response";
      appendMessage(finalAnswer, "bot-message");
      conversation.push({ role: "bot", text: finalAnswer });
      saveConversation();
    })
    .catch(error => {
      console.error("Error:", error);
      appendMessage("Error fetching response.", "bot-message");
    });
}

// Clear conversation and UI
function newChat() {
  conversation = [];
  chatBody.innerHTML = "";
  chatHistoryDiv.style.display = "none";
  chatHistoryDiv.innerText = "";
  saveConversation();
}

// Show chat history text in side panel
function showChatHistory() {
  if (conversation.length === 0) {
    chatHistoryDiv.innerText = "No chat history yet.";
  } else {
    chatHistoryDiv.innerText = conversation.map(msg => {
      return (msg.role === "user" ? "You: " : "Bot: ") + msg.text;
    }).join("\n\n");
  }
  chatHistoryDiv.style.display = "block";
}

// Toggle dark mode
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

// Allow Enter key to send message
questionInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    askGemini();
  }
});
