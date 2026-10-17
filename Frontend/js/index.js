
document.addEventListener("DOMContentLoaded", () => {
    const currentCgpaElement = document.getElementById("current-cgpa");
    const completedHoursElement = document.getElementById(
        "completed-credit-hours"
    );
    const remainingHoursElement = document.getElementById(
        "remaining-credit-hours"
    );
    const targetCgpaElement = document.getElementById("target-cgpa");

    const currentCgpaHint = document.getElementById("current-cgpa-hint");
    const completedHoursHint = document.getElementById(
        "completed-credit-hours-hint"
    );
    const remainingHoursHint = document.getElementById(
        "remaining-credit-hours-hint"
    );
    const targetCgpaHint = document.getElementById("target-cgpa-hint");

    const emptyState = document.getElementById("dashboard-empty-state");

    function showEmptyDashboard() {
        currentCgpaElement.textContent = "--";
        completedHoursElement.textContent = "--";
        remainingHoursElement.textContent = "--";
        targetCgpaElement.textContent = "--";

        if (emptyState) {
            emptyState.hidden = false;
        }
    }

    function loadDashboardPlan() {
        let savedPlan;

        try {
            const savedData = localStorage.getItem("pucitDashboardData");

            if (!savedData) {
                showEmptyDashboard();
                return;
            }

            savedPlan = JSON.parse(savedData);
        } catch (error) {
            console.error("Unable to read dashboard plan:", error);
            showEmptyDashboard();
            return;
        }

        const isValidPlan =
            savedPlan &&
            Number.isFinite(savedPlan.current_cgpa) &&
            Number.isFinite(savedPlan.completed_credit_hours) &&
            Number.isFinite(savedPlan.remaining_credit_hours) &&
            Number.isFinite(savedPlan.target_cgpa);

        if (!isValidPlan) {
            showEmptyDashboard();
            return;
        }

        currentCgpaElement.textContent =
            savedPlan.current_cgpa.toFixed(2);

        completedHoursElement.textContent =
            savedPlan.completed_credit_hours.toFixed(2);

        remainingHoursElement.textContent =
            savedPlan.remaining_credit_hours.toFixed(2);

        targetCgpaElement.textContent =
            savedPlan.target_cgpa.toFixed(2);

        if (currentCgpaHint) {
            currentCgpaHint.textContent =
                `Current semester: ${savedPlan.current_semester}`;
        }

        if (completedHoursHint) {
            completedHoursHint.textContent = "Credit hours completed";
        }

        if (remainingHoursHint) {
            remainingHoursHint.textContent = "Credit hours remaining";
        }

        if (targetCgpaHint) {
            targetCgpaHint.textContent = "Your selected CGPA target";
        }

        if (emptyState) {
            emptyState.hidden = true;
        }
    }

    loadDashboardPlan();
});
