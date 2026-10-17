from pydantic import  BaseModel , Field


class CGPAPlanRequest(BaseModel):
    current_cgpa: float = Field(ge=0, le=4)
    completed_credit_hours: float = Field(ge=0, le=134)
    current_semester: int = Field(ge=1, le=8)
    target_cgpa: float = Field(ge=0, le=4)