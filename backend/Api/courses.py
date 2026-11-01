from fastapi import FastAPI
from Assistant.tools import COURSES , get_sem_credit_hours , calculate_semester_gpa , marks_to_grade_points,total_grade_points,COURSES,get_remaining_credit_hours,required_gpa_for_target
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from Schemas.Gpa import GPARequest
from Schemas.assistant import ChatRequest
from Schemas.gpa_planner import CGPAPlanRequest
from Assistant.llm import model


from uuid import uuid4
from langchain_core.messages import HumanMessage

from Assistant.agent import run_assistant

import json
from pathlib import Path
from fastapi.staticfiles import StaticFiles

import logging

logger = logging.getLogger(__name__)

app = FastAPI()


@app.get("/courses")
def get_courses():
    return COURSES


@app.post("/GPA")
def cal_gpa(data : GPARequest):

    if data.sem not in COURSES:
        raise HTTPException(status_code=422, detail="Semester must be between 1 and 8.")

    credits_hrs = get_sem_credit_hours(data.sem)
    if len(data.marks) != len(credits_hrs):
        raise HTTPException(status_code=422, detail=f"Expected {len(credits_hrs)} marks.")

    grade_points = [marks_to_grade_points(m) for m in data.marks]
    if any(isinstance(g, str) for g in grade_points):
        raise HTTPException(status_code=422, detail="Marks must be between 0 and 100.")

    gpa = calculate_semester_gpa(grade_points , credits_hrs)
    total_gp = total_grade_points(grade_points , credits_hrs)
    
    course_count = len(credits_hrs)
    total_chs = sum(credits_hrs)
    

    return {
        "gpa" : gpa,
        "total_chs" : total_chs,
        "grade_points" : total_gp,
        "course_count" : course_count
    }





conversation_histories = {}
MAX_CONVERSATIONS = 500   # how many chats the server remembers at once
MAX_MESSAGES = 200      # length limit for one chat

@app.post("/assistant/chat")
def assistant_chat(data: ChatRequest):
    message = data.message.strip()

    if not message:
        raise HTTPException(
            status_code=422,
            detail="Message cannot be empty."
        )

    # conversation_id = data.conversation_id or str(uuid4())
    # history = conversation_histories.setdefault(conversation_id, [])

    conversation_id = data.conversation_id or str(uuid4())

# If the server is full and this is a new chat, forget the oldest chat.
# (A dict remembers insertion order, so next(iter(...)) is the oldest key.)
    if (
        len(conversation_histories) >= MAX_CONVERSATIONS
        and conversation_id not in conversation_histories
    ):
        oldest_id = next(iter(conversation_histories))
        del conversation_histories[oldest_id]

    history = conversation_histories.setdefault(conversation_id, [])

    # One chat can't grow without limit
    if len(history) >= MAX_MESSAGES:
        raise HTTPException(
            status_code=400,
            detail="This conversation is too long. Start a new conversation."
        )

    # Remember where this request's new messages begin.
    previous_length = len(history)
    history.append(HumanMessage(content=message))

    try:
        result_messages = run_assistant(history)

        new_messages = result_messages[previous_length:]
        saved_report = None

        # Detect a report returned by the save_report tool.
        for msg in new_messages:
            if getattr(msg, "name", None) != "save_report":
                continue

            try:
                tool_result = json.loads(msg.content)

                if tool_result.get("type") == "report_to_save":
                    saved_report = {
                        "filename": tool_result["filename"],
                        "content": tool_result["content"]
                    }
                    break
            except (json.JSONDecodeError, TypeError, KeyError, AttributeError):
                continue

        conversation_histories[conversation_id] = result_messages

        reply = result_messages[-1].content
        if not isinstance(reply, str):
            reply = str(reply)

        return {
            "conversation_id": conversation_id,
            "reply": reply,
            "saved_report": saved_report
        }

    except Exception:
        logger.exception("Assistant chat failed")

        conversation_histories[conversation_id] = history[:previous_length]

        raise HTTPException(
            status_code=500,
            detail="The assistant could not process your message. Please try again."
        )




@app.post("/cgpa-plan")
def create_cgpa_plan(data: CGPAPlanRequest):
    current_cgpa = data.current_cgpa
    completed_ch = data.completed_credit_hours
    current_semester = data.current_semester
    target_cgpa = data.target_cgpa

    # Validate the completed credit hours against earlier semesters.
    expected_completed_ch = sum(
        sum(get_sem_credit_hours(semester))
        for semester in range(1, current_semester)
    )

    if completed_ch > expected_completed_ch:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Semester {current_semester} has approximately "
                f"{expected_completed_ch:.2f} credit hours in "
                "the preceding semesters. Check your completed "
                "credit hours."
            ),
        )

    horizons = []
    cumulative_remaining = 0.0

    for semester in range(current_semester, 9):
        semester_credits = sum(get_sem_credit_hours(semester))
        cumulative_remaining += semester_credits

        if cumulative_remaining <= 0:
            continue

        raw_required_gpa = required_gpa_for_target(
            target_cgpa=target_cgpa,
            current_cgpa=current_cgpa,
            completed_ch=completed_ch,
            remaining_ch=cumulative_remaining,
        )

        if isinstance(raw_required_gpa, str):
            raise HTTPException(
                status_code=400,
                detail=raw_required_gpa,
            )

        achievable = raw_required_gpa <= 4.0

        horizons.append({
            "label": (
                f"Semester {semester}"
                if semester == current_semester
                else f"Semesters {current_semester}–{semester}"
            ),
            "remaining_credit_hours": round(
                cumulative_remaining, 2
            ),
            "required_gpa": round(
                max(0.0, raw_required_gpa), 2
            ),
            "achievable": achievable,
        })

    total_remaining = get_remaining_credit_hours(current_semester)

    if isinstance(total_remaining, str):
        raise HTTPException(
            status_code=400,
            detail=total_remaining,
        )

    first_achievable = next(
        (horizon for horizon in horizons if horizon["achievable"]),
        None,
    )

    achievable_by_graduation = (
        horizons[-1]["achievable"] if horizons else False
    )

    # Prepare verified data for the AI model.
    calculation_result = {
        "current_cgpa": current_cgpa,
        "target_cgpa": target_cgpa,
        "current_semester": current_semester,
        "completed_credit_hours": completed_ch,
        "total_remaining_credit_hours": round(total_remaining, 2),
        "horizons": horizons,
        "first_achievable_horizon": first_achievable,
        "target_achievable_by_graduation": achievable_by_graduation,
    }

    prompt = f"""
You are a helpful PUCIT GPA planning assistant.

Explain the following pre-calculated CGPA plan in clear,
student-friendly language.

Rules:
- Treat the supplied calculations as authoritative.
- Do not recalculate or invent any numbers.
- A required GPA above 4.00 is impossible under a 4.00 grading scale.
- Explain the first achievable horizon, if one exists.
- If no horizon is achievable, explain that the target cannot
  be reached under the supplied assumptions.
- If the target is already achievable, explain that a required
  GPA of 0.00 means no additional GPA is mathematically required
  to reach that target; it does not mean the student should aim
  for zero.
- Give practical, realistic guidance.
- Keep the response concise.
- Do not claim the target is impossible by graduation if the
  provided horizon data does not support that conclusion.

Verified calculation data:
{calculation_result}
"""

    try:
        ai_response = model.invoke(prompt)
        explanation = (
            ai_response.content
            if isinstance(ai_response.content, str)
            else str(ai_response.content)
        )
    except Exception:
        logger.exception("CGPA planner AI explanation failed")
        explanation = (
            "Your calculations are available above, but the AI "
            "explanation could not be generated. Please review "
            "the required GPA for each semester horizon."
        )

    return {
        **calculation_result,
        "ai_explanation": explanation,
    }


@app.get("/health")
def health():
    return {"status": "ok"}

FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "Frontend"
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")