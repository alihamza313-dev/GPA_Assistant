
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
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "report-delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            const confirmed = window.confirm(
                `Delete "${report.title || "this report"}"?`
            );

            if (!confirmed) return;

            const remainingReports = getSavedReports().filter(
                (item) => item.id !== report.id
            );

            localStorage.setItem(
                REPORTS_STORAGE_KEY,
                JSON.stringify(remainingReports)
            );

            renderReports();
        });

        actions.append(downloadButton, deleteButton);
        card.append(header, content, actions);
        reportList.appendChild(card);
    });
}


renderReports();
