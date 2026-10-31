
const REPORTS_STORAGE_KEY = "gpaAssistantReports";

const emptyState = document.getElementById("reports-empty-state");
const reportList = document.getElementById("report-list");

function getSavedReports() {
    try {
        const reports = JSON.parse(
            localStorage.getItem(REPORTS_STORAGE_KEY) || "[]"
        );

        return Array.isArray(reports) ? reports : [];
    } catch (error) {
        console.error("Could not read saved reports:", error);
        return [];
    }
}


const toastContainer = document.getElementById("toast-container");

// Writes the reports array back to localStorage.
// Returns true if it worked, false if the browser refused (storage full/blocked).
function saveReports(reports) {
    try {
        localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
        return true;
    } catch (error) {
        console.error("Could not save reports:", error);
        return false;
    }
}

// Shows a toast in the bottom-right corner.
// options (all optional):
//   type        -> "success" or "error" (changes the colored left edge)
//   actionLabel -> text of a button inside the toast, e.g. "Undo"
//   onAction    -> function that runs when that button is clicked
//   duration    -> milliseconds before it disappears (default 4000)
function showToast(message, options = {}) {
    const { type, actionLabel, onAction, duration = 4000 } = options;

    // Keep at most 3 toasts on screen
    while (toastContainer.children.length >= 3) {
        toastContainer.firstElementChild.remove();
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    if (type) toast.classList.add(`is-${type}`);
    toast.setAttribute("role", type === "error" ? "alert" : "status");

    // textContent (not innerHTML) because report titles can contain any text
    const text = document.createElement("p");
    text.className = "toast-message";
    text.textContent = message;
    toast.appendChild(text);

    let timerId;

    function closeToast() {
        clearTimeout(timerId);
        toast.classList.add("is-leaving");
        // Wait for the fade-out, then remove from the page
        setTimeout(() => toast.remove(), 180);
    }

    if (actionLabel && onAction) {
        const actionButton = document.createElement("button");
        actionButton.type = "button";
        actionButton.className = "toast-action";
        actionButton.textContent = actionLabel;
        actionButton.addEventListener("click", () => {
            onAction();
            closeToast();
        });
        toast.appendChild(actionButton);
    }

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "toast-close";
    closeButton.setAttribute("aria-label", "Dismiss notification");
    closeButton.textContent = "×";
    closeButton.addEventListener("click", closeToast);
    toast.appendChild(closeButton);

    // Pause the countdown while the mouse is over the toast,
    // so the user doesn't lose the Undo button while moving toward it
    function startTimer(ms) {
        timerId = setTimeout(closeToast, ms);
    }
    toast.addEventListener("mouseenter", () => clearTimeout(timerId));
    toast.addEventListener("mouseleave", () => startTimer(2000));

    toastContainer.appendChild(toast);
    startTimer(duration);
}

// Removes one report and offers Undo.
function deleteReport(reportId) {
    const reports = getSavedReports();
    const index = reports.findIndex((item) => item.id === reportId);

    if (index === -1) return;

    // splice removes the report and returns it, so we can restore it later
    const [removedReport] = reports.splice(index, 1);

    if (!saveReports(reports)) {
        showToast("Could not delete the report. Check browser storage.", {
            type: "error"
        });
        return;
    }

    renderReports();

    showToast(`"${removedReport.title || "Report"}" deleted`, {
        actionLabel: "Undo",
        duration: 6000,
        onAction: () => restoreReport(removedReport, index)
    });
}

// Puts a deleted report back at the position it had before.
function restoreReport(report, index) {
    const reports = getSavedReports();

    // If other reports were removed meanwhile, don't insert past the end
    reports.splice(Math.min(index, reports.length), 0, report);

    if (saveReports(reports)) {
        renderReports();
        showToast("Report restored", { type: "success" });
    } else {
        showToast("Could not restore the report.", { type: "error" });
    }
}

function downloadReport(report) {
    const blob = new Blob(
        [report.content],
        { type: "text/plain;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${report.title || "GPA Report"}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

// function renderReports() {
//     const reports = getSavedReports();

//     reportList.replaceChildren();
//     emptyState.hidden = reports.length > 0;
//     reportList.hidden = reports.length === 0;

//     reports.forEach((report) => {
//         const card = document.createElement("article");
//         card.className = "report-card";

//         const title = document.createElement("h3");
//         title.textContent = report.title || "GPA Report";

//         const date = document.createElement("p");
//         date.textContent = report.createdAt
//             ? new Date(report.createdAt).toLocaleString()
//             : "Date unavailable";

//         const content = document.createElement("pre");
//         content.className = "report-content";
//         content.textContent = report.content || "";

//         const actions = document.createElement("div");
//         actions.className = "report-actions";

//         const downloadButton = document.createElement("button");
//         downloadButton.type = "button";
//         downloadButton.textContent = "Download";
//         downloadButton.addEventListener("click", () => {
//             downloadReport(report);
//         });

//         const deleteButton = document.createElement("button");
//         deleteButton.type = "button";
//         deleteButton.textContent = "Delete";
//         deleteButton.addEventListener("click", () => {
//             const remainingReports = getSavedReports().filter(
//                 (item) => item.id !== report.id
//             );

//             localStorage.setItem(
//                 REPORTS_STORAGE_KEY,
//                 JSON.stringify(remainingReports)
//             );

//             renderReports();
//         });

//         actions.append(downloadButton, deleteButton);
//         card.append(title, date, content, actions);
//         reportList.appendChild(card);
//     });
// }


function renderReports() {
    const reports = getSavedReports();

    reportList.replaceChildren();
    emptyState.hidden = reports.length > 0;
    reportList.hidden = reports.length === 0;

    reports.forEach((report) => {
        const card = document.createElement("article");
        card.className = "report-card";

        const header = document.createElement("div");
        header.className = "report-card-header";

        const headingGroup = document.createElement("div");
        headingGroup.className = "report-heading-group";

        const title = document.createElement("h3");
        title.className = "report-title";
        title.textContent = report.title || "Academic Report";

        const type = document.createElement("span");
        type.className = "report-type";

        const titleText = title.textContent.toLowerCase();
        type.textContent = titleText.includes("cgpa")
            ? "CGPA Plan"
            : titleText.includes("target")
                ? "Target GPA Plan"
                : "GPA Report";

        headingGroup.append(title, type);

        const date = document.createElement("p");
        date.className = "report-date";

        const parsedDate = report.createdAt
            ? new Date(report.createdAt)
            : null;

        date.textContent = parsedDate && !Number.isNaN(parsedDate.getTime())
            ? `Saved ${parsedDate.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric"
            })}`
            : "Saved date unavailable";

        const dateContainer = document.createElement("div");
        dateContainer.className = "report-date-container";

        dateContainer.appendChild(date);

        header.append(headingGroup, dateContainer);

        const content = document.createElement("pre");
        content.className = "report-content";
        content.textContent = report.content || "No report content available.";

        const actions = document.createElement("div");
        actions.className = "report-actions";

        const downloadButton = document.createElement("button");
        downloadButton.type = "button";
        downloadButton.className = "report-download-btn";
        downloadButton.textContent = "Download";
        downloadButton.addEventListener("click", () => {
            downloadReport(report);
            showToast("Download started", { type: "success" });
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "report-delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            deleteReport(report.id);
        });

        actions.append(downloadButton, deleteButton);
        card.append(header, content, actions);
        reportList.appendChild(card);
    });
}


renderReports();
