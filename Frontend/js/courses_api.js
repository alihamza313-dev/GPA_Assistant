export async function load_courses(semester , render_function) {
    try {
        const response = await fetch("http://127.0.0.1:8000/courses");

        if (!response.ok) {
            throw new Error("Failed to load courses")
        }

        const courses = await response.json()

        render_function(courses[semester])
    }
    catch (error) {
        console.error("Error loading courses:", error);
    }
}