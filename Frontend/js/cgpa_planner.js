
const API_URL = "http://127.0.0.1:8000/cgpa-plan";

// Get HTML elements.
const form = document.getElementById("cgpa-planner-form");
const calculateButton = document.getElementById("calculate-plan-btn");
const resultSection = document.getElementById("cgpa-result-section");
const targetLabel = document.getElementById("plan-target-cgpa");
const horizonList = document.getElementById("horizon-list");
const aiExplanation = document.getElementById("ai-plan-explanation");
const saveReportButton = document.getElementById("save-cgpa-report-btn");
const saveReportStatus = document.getElementById("cgpa-report-save-status");
const publishDashboardButton = document.getElementById("publish-plan-dashboard-btn");
const dashboardPublishStatus = document.getElementById("dashboard-publish-status");

let latestPlan = null;

let isCalculating = false;

// Display an error message.
function showPlanError(message) {
    let errorElement = document.getElementById("cgpa-plan-error");

    if (!errorElement) {
        errorElement = document.createElement("p");
        errorElement.id = "cgpa-plan-error";
        errorElement.className = "form-error";
        errorElement.setAttribute("role", "alert");
        form.appendChild(errorElement);
    }

    errorElement.textContent = message;
    errorElement.style.display = "block";
}

// Clear the previous error message.
function clearPlanError() {
    const errorElement = document.getElementById("cgpa-plan-error");

    if (errorElement) {
        errorElement.textContent = "";
        errorElement.style.display = "none";
    }
}

// Render the required GPA for each semester horizon.
function renderHorizons(horizons) {
    horizonList.replaceChildren();

    if (!Array.isArray(horizons) || horizons.length === 0) {
        const message = document.createElement("p");
        message.textContent =
            "No remaining credit hours were found for the selected semester.";

        horizonList.appendChild(message);
        return;
    }

    horizons.forEach((horizon) => {
        const row = document.createElement("div");
        row.className = "horizon-row";

        if (horizon.achievable) {
            row.classList.add("is-achievable");
        }

        // Horizon label and remaining credit hours.
        const details = document.createElement("div");

        const label = document.createElement("p");
        label.className = "horizon-label";
        label.textContent = horizon.label;

        const subtitle = document.createElement("p");
        subtitle.className = "horizon-sub";
        subtitle.textContent =
            `${horizon.remaining_credit_hours} remaining credit hours`;

        details.append(label, subtitle);

        // Required GPA and achievement status.
        const value = document.createElement("div");
        value.className = "horizon-value";

        const number = document.createElement("p");
        number.className = "horizon-value-number";

        const requiredGpa = Number(horizon.required_gpa);
        number.textContent = Number.isFinite(requiredGpa)
            ? requiredGpa.toFixed(2)
            : "N/A";

        const status = document.createElement("span");
        status.className = horizon.achievable
            ? "pill pill-success"
            : "pill pill-error";

        status.textContent = horizon.achievable
            ? "Achievable"
            : "Above 4.0";

        value.append(number, status);
        row.append(details, value);
        horizonList.appendChild(row);
    });
}

// Handle form submission.
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (isCalculating) {
        return;
    }

    clearPlanError();

    // Read the form fields.
    const currentCgpaField = document.getElementById("current-cgpa");
    const completedHoursField =
        document.getElementById("completed-credit-hours");
    const semesterField = document.getElementById("current-semester");
    const targetCgpaField = document.getElementById("target-cgpa");

    const fields = [
        currentCgpaField,
        completedHoursField,
        semesterField,
        targetCgpaField
    ];

    // Check that all fields have values.
    if (fields.some((field) => !field || !field.value.trim())) {
        showPlanError("Please complete all fields before calculating.");
        return;
    }

    // Convert input values into numbers.
    const currentCgpa = Number(currentCgpaField.value);
    const completedCreditHours = Number(completedHoursField.value);
    const currentSemester = Number(semesterField.value);
    const targetCgpa = Number(targetCgpaField.value);

    // Validate the current CGPA.
    if (
        !Number.isFinite(currentCgpa) ||
        currentCgpa < 0 ||
        currentCgpa > 4
    ) {
        showPlanError("Current CGPA must be between 0.00 and 4.00.");
        return;
    }

    // Validate completed credit hours.
    if (
        !Number.isFinite(completedCreditHours) ||
        completedCreditHours < 0 ||
        completedCreditHours > 134
    ) {
        showPlanError("Completed credit hours must be between 0 and 134.");
        return;
    }

    // Validate the selected semester.
    if (
        !Number.isInteger(currentSemester) ||
        currentSemester < 1 ||
        currentSemester > 8
    ) {
        showPlanError("Please select a valid semester from 1 to 8.");
        return;
    }

    // Validate the target CGPA.
    if (
        !Number.isFinite(targetCgpa) ||
        targetCgpa < 0 ||
        targetCgpa > 4
    ) {
        showPlanError("Target CGPA must be between 0.00 and 4.00.");
        return;
    }


    publishDashboardButton.hidden = false;
    publishDashboardButton.disabled = false;
    publishDashboardButton.textContent = "Show on Dashboard";
    dashboardPublishStatus.textContent = "";

    // Update the interface while the request is running.
    isCalculating = true;
    calculateButton.disabled = true;
    calculateButton.textContent = "Calculating...";

    try {
        // Send the input data to FastAPI.
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                current_cgpa: currentCgpa,
                completed_credit_hours: completedCreditHours,
                current_semester: currentSemester,
                target_cgpa: targetCgpa
            })
        });

        // Read the API response.

        const data = await response.json();

        // First, handle errors returned by FastAPI.
        if (!response.ok) {
            const message =
                typeof data.detail === "string"
                    ? data.detail
                    : "Unable to calculate your CGPA plan.";

            throw new Error(message);
        }

        // Validate the successful response.
        if (
            !Array.isArray(data.horizons) ||
            typeof data.target_cgpa !== "number"
        ) {
            throw new Error("The server returned an invalid CGPA plan.");
        }

        // Store the plan in memory only.
        // This does NOT update the dashboard or localStorage.
        latestPlan = {
            current_cgpa: currentCgpa,
            completed_credit_hours: completedCreditHours,
            current_semester: currentSemester,
            target_cgpa: data.target_cgpa,
            remaining_credit_hours: data.total_remaining_credit_hours,
            horizons: data.horizons,
            ai_explanation: data.ai_explanation || "",
            updated_at: new Date().toISOString()
        };

        // Enable the two independent actions.
        saveReportButton.hidden = false;
        saveReportStatus.textContent = "";

        publishDashboardButton.hidden = false;
        publishDashboardButton.disabled = false;
        publishDashboardButton.textContent = "Show on Dashboard";
        dashboardPublishStatus.textContent = "";

        // Continue displaying the calculated results.
        targetLabel.textContent = data.target_cgpa.toFixed(2);
        renderHorizons(data.horizons);

        if (aiExplanation) {
            aiExplanation.textContent =
                data.ai_explanation ||
                "Your CGPA plan was calculated, but an explanation is unavailable.";
        }

        resultSection.hidden = false;
        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


        // Check that the response contains the expected data.
        if (
            !Array.isArray(data.horizons) ||
            typeof data.target_cgpa !== "number"
        ) {
            throw new Error(
                "The server returned an invalid CGPA plan."
            );
        }

        // Display the target CGPA.
        targetLabel.textContent = data.target_cgpa.toFixed(2);

        // Display the semester-by-semester results.
        renderHorizons(data.horizons);

        // Display the AI explanation.
        if (aiExplanation) {
            aiExplanation.textContent =
                data.ai_explanation ||
                "Your CGPA plan was calculated, but an explanation is unavailable.";
        }

        // Show and scroll to the results.
        resultSection.hidden = false;

        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {
        console.error("CGPA planner error:", error);

        // Show the actual API or network error.
        showPlanError(
            error.message ||
            "Something went wrong. Please try again."
        );

    } finally {
        // Restore the button, even if the request fails.
        isCalculating = false;
        calculateButton.disabled = false;
        calculateButton.textContent = "Calculate Plan";
    }
});



saveReportButton.addEventListener("click", () => {
    if (!latestPlan) {
        saveReportStatus.textContent =
            "Calculate a CGPA plan before saving a report.";
        return;
    }

    try {
        const storageKey = "gpaAssistantReports";

        // Read reports created by the GPA Assistant or other pages.
        const storedReports = localStorage.getItem(storageKey);
        const reports = storedReports
            ? JSON.parse(storedReports)
            : [];

        if (!Array.isArray(reports)) {
            throw new Error("The saved reports data is invalid.");
        }


        const plan = latestPlan;
        const date = new Date();

        const horizonDetails = plan.horizons.map((horizon) => {
            return [
                horizon.label,
                `Remaining credit hours: ${horizon.remaining_credit_hours}`,
                `Required GPA: ${Number(horizon.required_gpa).toFixed(2)}`,
                `Status: ${horizon.achievable ? "Achievable" : "Above 4.00"}`
            ].join("\n");
        }).join("\n\n");

        const reportContent = [
            "CGPA PLANNER REPORT",
            "",
            `Generated: ${date.toLocaleString()}`,
            "",
            "STUDENT PLAN",
            `Current CGPA: ${plan.current_cgpa.toFixed(2)}`,
            `Completed credit hours: ${plan.completed_credit_hours}`,
            `Current semester: ${plan.current_semester}`,
            `Target CGPA: ${plan.target_cgpa.toFixed(2)}`,
            "",
            "REQUIRED GPA BY HORIZON",
            horizonDetails || "No remaining horizons available.",
            "",
            "PERSONALIZED GUIDANCE",
            plan.ai_explanation || "No AI explanation was returned."
        ].join("\n");

        const report = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title: `CGPA Plan - Target ${plan.target_cgpa.toFixed(2)}`,
            content: reportContent,
            createdAt: date.toISOString()
        };

        // Save using the same format as the existing Reports page.
        reports.unshift(report);
        localStorage.setItem(storageKey, JSON.stringify(reports));

        saveReportStatus.textContent =
            "Report saved successfully. Open Reports to view it.";

        saveReportButton.textContent = "Saved";
        saveReportButton.disabled = true;

    } catch (error) {
        console.error("Unable to save CGPA report:", error);

        saveReportStatus.textContent =
            "Unable to save the report. Check your browser storage and try again.";
    }
});



publishDashboardButton.addEventListener("click", () => {
    if (!latestPlan) {
        dashboardPublishStatus.textContent =
            "Calculate a plan before publishing it.";
        return;
    }

    try {
        localStorage.setItem(
            "pucitDashboardData",
            JSON.stringify(latestPlan)
        );

        publishDashboardButton.textContent = "Shown on Dashboard";
        dashboardPublishStatus.textContent =
            "Your selected plan is now displayed on the dashboard.";

    } catch (error) {
        console.error("Dashboard publishing failed:", error);

        dashboardPublishStatus.textContent =
            "Unable to save the dashboard plan. Check browser storage.";
    }
});
