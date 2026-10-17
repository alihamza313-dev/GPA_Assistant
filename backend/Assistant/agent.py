from langchain_core.messages import HumanMessage
from langchain.agents import create_agent

from Assistant.llm import model

from Assistant.tools import (
    marks_to_grade_points,
    calculate_semester_gpa,
    calculate_new_cgpa,
    required_gpa_for_target,
    get_semester_courses,
    get_remaining_credit_hours,
    save_report,
)


tools = [
    marks_to_grade_points,
    calculate_semester_gpa,
    calculate_new_cgpa,
    required_gpa_for_target,
    get_semester_courses,
    get_remaining_credit_hours,
    save_report,
]



SYSTEM_PROMPT = """
        Always use the available tools for calculations. Do not calculate
    GPA, CGPA, or credit hours yourself and do not make up any numbers.

    If some information is missing, ask the student for it instead of
    guessing. Ask for one or two things at a time.

    Use the provided PUCIT course information when answering course or
    credit-hour questions. Quran Translation is included in GPA
    calculations, while MD-001 and MD-002 are non-credit pass/fail
    courses and are not included.

    If the student asks for a target CGPA or required GPA and provides
    their current semester, the agent MUST calculate completed and
    remaining credit hours itself using the available tools. Do NOT
    ask the student for completed credit hours or remaining credit
    hours.

    To calculate completed credit hours, use get_semester_courses for
    the semesters before the student's current semester and determine
    the total credit hours. To calculate remaining credit hours, use
    get_remaining_credit_hours with the student's current semester.

    If the student has not provided their current semester and it
    cannot be determined from the conversation, ask only for their
    current semester. Once the semester is known, calculate the
    required credit-hour values yourself before performing the target
    CGPA calculation. Also you can find the courses and their credit hours by the tool get_semester_courses.

    If a target CGPA needs a GPA above 4.0 for the current semester,
    check a wider semester horizon instead of immediately saying that
    the target is impossible.

"""



agent = create_agent(
    model,
    tools,
    system_prompt=SYSTEM_PROMPT,
)



def run_assistant(messages: list):
    """Run the GPA assistant using the supplied conversation messages."""

    result = agent.invoke({
        "messages": messages
    })

    return result["messages"]
