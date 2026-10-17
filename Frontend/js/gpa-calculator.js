import { load_courses } from "./courses_api.js";

const sem_field = document.getElementById("semester-select")
const course_list = document.getElementById("course-list");
const empty_tag = document.getElementById("course-empty-state");
const cal_gpa_btn = document.getElementById("calculate-gpa-btn");
const reset_btn = document.getElementById("reset-gpa-form-btn");
const gpa_result_sec = document.getElementById("gpa-result-section")
const gpaValueElement = document.getElementById("gpa-result-value");
const gpaResultStatus = document.getElementById("gpa-result-status");

sem_field.addEventListener("change", (e) => {
    const sem = e.target.value;
    localStorage.setItem("semester", sem);
    load_courses(sem, render_courses)
})

reset_btn.addEventListener("click", () => reset_form())

cal_gpa_btn.addEventListener("click", () => calculate_gpa());



export function render_courses(courses_detail) {

    clean_all_rows()

    course_list.hidden = false;
    empty_tag.hidden = true;
    gpa_result_sec.hidden = true;

    courses_detail.forEach(course => {
        const [code, name, credits] = course

        const row = document.createElement("div")
        row.className = "course-row"

        row.innerHTML =
            `<span class="course-code">${code}</span>
          <span class="course-name">${name}</span>
          <span class="course-credits">${credits}</span>
        
            <div>
                <label
                    class="form-label"
                    for="marks-${code}"
                    style="position:absolute; left:-9999px;"
                >
                    Marks for ${name}
                </label>

                <input
                    type="number"
                    class = "marks"
                    id="marks-${code}"
                    name="marks-${code}"
                    min="0"
                    max="100"
                    placeholder="0-100"
                >

                <p class="form-error">
                    Enter a value between 0 and 100.
                </p>
            </div>`

        course_list.appendChild(row);

    });

    cal_gpa_btn.disabled = false;
}


function clean_all_rows() {
    const Course_rows = document.querySelectorAll(".course-row:not(.course-row-head)")
    Course_rows.forEach(row => {
        row.remove()
    })
}


function reset_form() {
    clean_all_rows()
    course_list.hidden = true;
    empty_tag.hidden = false;
    gpa_result_sec.hidden = true;
    cal_gpa_btn.disabled = true;
    sem_field.value = ""

}


function calculate_gpa() {
    if (!validate_marks())
        return;
    cal_gpa_btn.disabled = true;

    load_gpa();
}



async function load_gpa() {

    const marks_inp = document.querySelectorAll(".marks");

    const marks = Array.from(marks_inp).map((input) => {
        return input.value;
    })


    try {
        const sem = Number(localStorage.getItem("semester"));
        const result = await fetch(`http://127.0.0.1:8000/GPA`,
            {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    sem: Number(sem),
                    marks: marks
                })
            }
        );

        if (!result.ok) {
            const errorData = await result.json();

            console.error("Status:", result.status);
            console.error("Server response:", errorData);

            throw new Error(
                errorData.detail || "Failed to calculate GPA"
            );
        }

        const response = await result.json();

        render_gpa(response, sem);
        displayGpaResult(response.gpa);
        localStorage.setItem('GPA' , response.gpa);

    } catch (error) {
        console.error("GPA calculation error:", error);
        alert(error.message);

    } finally {
        cal_gpa_btn.disabled = false;
    }
}


function validate_marks() {
    const inputs = document.querySelectorAll(".marks");
    let isValid = true;
    let firstInvalid = null;

    inputs.forEach(input => {
        const error = input.parentElement.querySelector(".form-error");
        const value = input.value.trim();
        const mark = Number(value);

        let message = "";
        if (value === "") {
            message = "Enter marks for this course.";
        } else if (!Number.isFinite(mark) || mark < 0 || mark > 100) {
            message = "Enter a value between 0 and 100.";
        } else if (!Number.isInteger(mark)) {
            message = "Enter whole marks, without decimals.";
        }

        const valid = message === "";

        error.textContent = message;
        error.classList.toggle("is-visible", !valid);
        input.classList.toggle("is-invalid", !valid);

        if (!valid) {
            isValid = false;
            if (firstInvalid === null) firstInvalid = input;
        }
    });

    // Move the cursor to the first problem so the user can fix it right away
    if (firstInvalid) firstInvalid.focus();

    return isValid;
}



function render_gpa(result, semester) {
    document.getElementById("gpa-result-value").textContent =
        Number(result.gpa).toFixed(2);

    document.getElementById("gpa-result-semester").textContent =
        semester;

    document.getElementById("gpa-result-credits").textContent =
        Number(result.total_chs).toFixed(1);

    document.getElementById("gpa-grade-points").textContent =
        Number(result.grade_points).toFixed(1);

    document.getElementById("gpa-result-count").textContent =
        result.course_count;

    gpa_result_sec.hidden = false;
    cal_gpa_btn.disabled = true;
}

function displayGpaResult(gpaValue) {
    const gpa = Number(gpaValue);

    gpaValueElement.classList.remove("is-failed", "is-success");

    gpaResultStatus.classList.remove(
        "is-failed",
        "is-success",
        "is-warning"
    );

    if (gpaValue === null || gpaValue === undefined ||
        gpaValue === "" || !Number.isFinite(gpa)) {

        gpaValueElement.textContent = "--";
        gpaResultStatus.textContent = "Unable to calculate GPA.";
        gpaResultStatus.classList.add("is-warning");

    } else if (gpa === 0) {
        gpaValueElement.textContent = "Failed";
        gpaValueElement.classList.add("is-failed");

        gpaResultStatus.textContent =
            "Your calculated semester GPA is 0.00. Review your marks.";
        gpaResultStatus.classList.add("is-failed");

    } else {
        gpaValueElement.textContent = gpa.toFixed(2);
        gpaValueElement.classList.add("is-success");

        gpaResultStatus.textContent =
            "GPA calculated successfully.";
        gpaResultStatus.classList.add("is-success");
    }

    gpaResultStatus.hidden = false;
}
