import { load_courses } from "./courses_api.js";

const sem_field = document.getElementById("courses-semester-select");
const tableBody = document.getElementById("courses-table-body");
const totalElement = document.getElementById("courses-table-total");

function render_table_courses(courses) {
    tableBody.innerHTML = "";

    let totalCredits = 0;

    courses.forEach(course => {
        const [code, name, credits] = course;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${code}</td>
            <td>${name}</td>
            <td>${credits}</td>
        `;

        tableBody.appendChild(row);

        totalCredits += Number(credits);
    });

    totalElement.textContent = totalCredits.toFixed(1);
}

const saved_semester = localStorage.getItem("semester") || "1";

sem_field.value = saved_semester;
load_courses(saved_semester, render_table_courses);

sem_field.addEventListener("change", (e) => {
    const semester = e.target.value;

    localStorage.setItem("semester", semester);

    load_courses(semester, render_table_courses);
});
