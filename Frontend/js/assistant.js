
const API_URL = "http://127.0.0.1:8000/assistant/chat";

const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-message-btn");
const newConversationButton = document.getElementById(
    "new-conversation-btn"
);
const emptyState = document.getElementById("chat-empty-state");
const chatMessages = document.getElementById("chat-messages");
const quickQuestions = document.getElementById("quick-questions");

let conversationId = sessionStorage.getItem("gpaConversationId");
let isSending = false;

function showChat() {
    emptyState.hidden = true;
    chatMessages.hidden = false;
}

function addMessage(text, sender) {
    const row = document.createElement("div");
    row.className = `message-row ${sender === "user" ? "is-user" : "is-assistant"
        }`;

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = text;

    row.appendChild(bubble);
    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return bubble;
}

async function sendMessage(text) {
    const message = text.trim();

    if (!message || isSending) return;

    isSending = true;
    sendButton.disabled = true;
    chatInput.disabled = true;

    showChat();
    addMessage(message, "user");
    chatInput.value = "";

    const loadingBubble = addMessage("Thinking...", "assistant");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message,
                conversation_id: conversationId,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Assistant request failed.");
        }

        conversationId = data.conversation_id;
        sessionStorage.setItem("gpaConversationId", conversationId);

        loadingBubble.textContent = data.reply;

        if (data.saved_report) {
            try {
                const savedReport = saveReportLocally(data.saved_report);

                loadingBubble.textContent +=
                    "\n\nReport saved in this browser: " + savedReport.title;
            } catch (error) {
                loadingBubble.textContent +=
                    "\n\nThe report could not be saved in browser storage.";
                console.error("Failed to save report:", error);
            }
        }
    } catch (error) {
        loadingBubble.textContent =
            `Error: ${error.message}. Check that the backend is running.`;
    } finally {
        isSending = false;
        sendButton.disabled = false;
        chatInput.disabled = false;
        chatInput.focus();
    }
}

sendButton.addEventListener("click", () => {
    sendMessage(chatInput.value);
});

chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage(chatInput.value);
    }
});

quickQuestions.addEventListener("click", (event) => {
    const button = event.target.closest(".quick-question-chip");

    if (button) {
        sendMessage(button.textContent);
    }
});

newConversationButton.addEventListener("click", () => {
    if (isSending) return;

    conversationId = null;
    sessionStorage.removeItem("gpaConversationId");

    chatMessages.replaceChildren();
    chatMessages.hidden = true;
    emptyState.hidden = false;
    chatInput.value = "";
    chatInput.focus();
});




const REPORTS_STORAGE_KEY = "gpaAssistantReports";

function saveReportLocally(report) {
    const reports = JSON.parse(
        localStorage.getItem(REPORTS_STORAGE_KEY) || "[]"
    );

    const savedReport = {
        id: crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
        title: report.filename || "GPA Report",
        content: report.content,
        createdAt: new Date().toISOString()
    };

    reports.unshift(savedReport);
    localStorage.setItem(
        REPORTS_STORAGE_KEY,
        JSON.stringify(reports)
    );

    return savedReport;
}
