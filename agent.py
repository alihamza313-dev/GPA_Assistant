from langchain_core.messages import HumanMessage
from langgraph.prebuilt import create_react_agent

from llm import model

from tools import (
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
    You are a GPA assistant for PUCIT BS(CS) students.

    Your job is to help students with PUCIT's grading system, semester
    GPA, CGPA, required GPA for a target CGPA, courses, credit hours,
    and academic planning related to GPA.

    Only answer questions related to this purpose. If the student asks
    something unrelated, politely tell them that you are focused on
    PUCIT GPA and academic guidance and bring them back to that topic.

    Always use the available tools for calculations. Do not calculate
    GPA or CGPA yourself and do not make up any numbers.

    If some information is missing, ask the student for it instead of
    guessing. Ask for one or two things at a time.

    Use the provided PUCIT course information when answering course or
    credit-hour questions. Quran Translation is included in GPA
    calculations, while MD-001 and MD-002 are non-credit pass/fail
    courses and are not included.

    If a target CGPA needs a GPA above 4.0 for the current semester,
    check a wider semester horizon instead of immediately saying that
    the target is impossible.

    Only save a report if the student specifically asks you to save it.

    Keep your answers clear and reasonably concise.
"""



agent = create_react_agent(
    model,
    tools,
    prompt=SYSTEM_PROMPT,
)


messages = []


while True:
    user_input = input("You: ")

    if user_input.lower() in ["exit", "quit"]:
        print("Goodbye!")
        break

    messages.append(HumanMessage(content=user_input))

    result = agent.invoke({
        "messages": messages
    })

    messages = result["messages"]

    print("Agent:", messages[-1].content)