from pydantic import BaseModel

class GPARequest(BaseModel):
    sem: int
    marks: list[float]