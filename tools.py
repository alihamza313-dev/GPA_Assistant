COURSES = {
    1: [
        ("MS-251", "Probability & Statistics", 3.0),
        ("GE-160", "Applications of ICT", 3.0),
        ("GE-169", "Applied Physics", 3.0),
        ("GE-167", "Discrete Structures", 3.0),
        ("HQ-001", "Quran Translation - I", 0.5),
        ("GE-190", "Functional English", 3.0),
    ],

    2: [
        ("CC-112", "Programming Fundamentals", 3.0),
        ("CC-112-L", "Programming Fundamentals Lab", 1.0),
        ("CC-110", "Digital Logic Design", 2.0),
        ("CC-110-L", "Digital Logic Design Lab", 1.0),
        ("MS-252", "Linear Algebra", 3.0),
        ("GE-191", "Expository Writing", 3.0),
        ("GE-163", "Islamic Studies", 2.0),
        ("HQ-002", "Quran Translation - II", 0.5),
    ],

    3: [
        ("CC-211", "Object Oriented Programming", 3.0),
        ("CC-211-L", "Object Oriented Programming Lab", 1.0),
        ("CC-215", "Database Systems", 3.0),
        ("CC-215-L", "Database Systems Lab", 1.0),
        ("CC-210", "Computer Organization & Assembly Language", 3.0),
        ("GE-162", "Calculus & Analytical Geometry", 3.0),
        ("GE-192", "Introduction to Management", 2.0),
        ("HQ-003", "Quran Translation - III", 0.5),
    ],

    4: [
        ("CC-213", "Data Structures", 3.0),
        ("CC-213-L", "Data Structures Lab", 1.0),
        ("CC-312", "Information Security", 3.0),
        ("CC-214", "Computer Networks", 3.0),
        ("CC-212", "Software Engineering", 3.0),
        ("DC-220", "Advanced Database Management Systems", 3.0),
        ("HQ-004", "Quran Translation - IV", 0.5),
    ],

    5: [
        ("CC-313", "Analysis of Algorithms", 3.0),
        ("CC-310", "Artificial Intelligence", 3.0),
        ("DC-320", "Theory of Automata and Formal Languages", 3.0),
        ("DC-321", "Human Computer Interaction", 3.0),
        ("DC-322", "Computer Architecture", 3.0),
        ("EC-330", "Web Technologies / Elective", 3.0),
        ("HQ-005", "Quran Translation - V", 0.5),
    ],

    6: [
        ("CC-311", "Operating Systems", 3.0),
        ("EC-333", "Mobile Application Development / Elective", 3.0),
        ("EC-324", "Software Construction & Development / Elective", 3.0),
        ("EC-335", "Machine Learning / Elective", 3.0),
        ("EC-334", "Game Design and Development / Elective", 3.0),
        ("MS-253", "Multivariable Calculus", 3.0),
        ("HQ-006", "Quran Translation - VI", 0.5),
    ],

    7: [
        ("CC-411", "Final Year Project - I", 2.0),
        ("DC-328", "Parallel & Distributed Computing", 3.0),
        ("EC-345", "Computer Vision / Elective", 3.0),
        ("EC-425", "Software Quality Engineering / Elective", 3.0),
        ("MS-254", "Technical and Business Writing", 3.0),
        ("GE-263", "Entrepreneurship", 2.0),
        ("GE-262", "Professional Practices", 2.0),
        ("HQ-007", "Quran Translation - VII", 0.5),
    ],

    8: [
        ("CC-412", "Final Year Project - II", 4.0),
        ("DC-421", "Compiler Construction", 3.0),
        ("UE-272", "Introduction to Marketing", 3.0),
        ("GE-168", "Ideology and Constitution of Pakistan", 2.0),
        ("GE-363", "Civics and Community Engagement", 2.0),
        ("HQ-008", "Quran Translation - VIII", 0.5),
    ],
}

def marks_to_grade_points(mark : int) -> float|str:
        '''Use this tool when the student provides marks and you need to convert
        those marks into PUCIT grade points before calculating GPA.'''
        if mark < 0 or mark > 100:
            return "Error: marks must be between 0 and 100"
        elif mark >= 85:
            return 4.0
        elif mark >= 80:
            return 3.7
        elif mark >= 75:
            return 3.3
        elif mark >= 70:
            return 3.0
        elif mark >= 65:
            return 2.7
        elif mark >= 61:
            return 2.3
        elif mark >= 58:
            return 2.0
        elif mark >= 55:
            return 1.7
        elif mark >= 50:
            return 1.0
        else:
            return 0.0


def calculate_semester_gpa(
    grade_points: list[float],
    credit_hours: list[float]
) -> (float|str):
    """Use this tool when calculating the GPA for one semester from grade points and credit hours."""

    if not grade_points or not credit_hours:
        return "Error: grade points and credit hours cannot be empty"

    if len(grade_points) != len(credit_hours):
        return "Error: grade points and credit hours must have the same length"

    if sum(credit_hours) <= 0:
        return "Error: total credit hours must be greater than 0"

    total_chs = sum(credit_hours)
    total_gps = 0.0

    for gp, ch in zip(grade_points, credit_hours):
        total_gps += gp * ch

    return total_gps / total_chs




def calculate_new_cgpa(
    current_cgpa: float,
    completed_credit_hours: float,
    semester_gpa: float,
    semester_credit_hours: float
) -> float|str:
    """Use this tool when calculating a new CGPA after adding one semester's GPA and credit hours."""

    if current_cgpa < 0 or current_cgpa > 4:
        return "Error: current CGPA must be between 0 and 4"

    if semester_gpa < 0 or semester_gpa > 4:
        return "Error: semester GPA must be between 0 and 4"

    if completed_credit_hours < 0:
        return "Error: completed credit hours cannot be negative"

    if semester_credit_hours <= 0:
        return "Error: semester credit hours must be greater than 0"

    total_credit_hours = completed_credit_hours + semester_credit_hours

    new_cgpa = (
        current_cgpa * completed_credit_hours
        + semester_gpa * semester_credit_hours
    ) / total_credit_hours

    return new_cgpa


def required_gpa_for_target(target_cgpa:float,
                            current_cgpa: float,
                            completed_ch: float,remaining_ch: float) -> float|str:

    """Use this tool when a student wants to know the GPA required to reach a target CGPA."""

    if target_cgpa < 0 or target_cgpa > 4:
        return "Error: target CGPA must be between 0 and 4"

    if current_cgpa < 0 or current_cgpa > 4:
        return "Error: current CGPA must be between 0 and 4"

    if completed_ch < 0:
        return "Error: completed credit hours cannot be negative"

    if remaining_ch <= 0:
        return "Error: remaining credit hours must be greater than 0"

    req_gpa = (target_cgpa * (completed_ch + remaining_ch)- current_cgpa * completed_ch) / remaining_ch

    return req_gpa
    

def get_semester_courses(semester: int) -> str:
    """Use this tool when the student asks for the courses and credit hours in a specific semester."""

    if semester < 1 or semester > 8:
        return "Error: semester must be between 1 and 8"

    courses = COURSES[semester]

    result = f"Semester {semester} courses:\n"

    for code, name, credit_hours in courses:
        result += f"{code} - {name} - {credit_hours} credit hours\n"

    return result

def get_remaining_credit_hours(current_semester: int) -> float|str:
    """Use this tool when calculating how many graded credit hours remain from the current semester onward."""

    if current_semester < 1 or current_semester > 8:
        return "Error: semester must be between 1 and 8"

    remaining_credit_hours = 0.0

    for semester in range(current_semester, 9):
        for code, name, credit_hours in COURSES[semester]:
            remaining_credit_hours += credit_hours

    return remaining_credit_hours


def save_report(filename: str, content: str) -> str:
    """Use this tool only when the student explicitly asks to save a useful GPA, CGPA, or target plan report."""

    if not filename.strip():
        return "Error: filename cannot be empty"

    if not content.strip():
        return "Error: report content cannot be empty"

    try:
        with open(filename, "w", encoding="utf-8") as file:
            file.write(content)

        return f"Report saved successfully to {filename}"

    except OSError as error:
        return f"Error: could not save report - {error}"