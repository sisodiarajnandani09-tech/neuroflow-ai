from typing import List, Dict, Any
from pydantic import BaseModel, Field


class ResearchState(BaseModel):
    
    research_id: str = ""

    topic: str

    pdf_context: str = ""

    search_results: List[Dict[str, Any]] = Field(
        default_factory=list
    )

    analysis_brief: str = ""

    draft_report: str = ""

    final_verified_report: str = ""

    current_step: str = "initialized"

    logs: List[str] = Field(
        default_factory=list
    )

    def append_log(
        self,
        message: str
    ):
        self.logs.append(message)

    def update_step(
        self,
        step: str
    ):
        self.current_step = step
        self.append_log(
            f"Step Updated → {step}"
        )

    def to_dict(self):

        return self.model_dump()

    @classmethod
    def from_dict(
        cls,
        data: dict
    ):
        return cls(**data)